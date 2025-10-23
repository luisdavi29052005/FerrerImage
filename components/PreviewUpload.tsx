/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateDecadeImage } from "../services/geminiService";
import analytics from "../services/analyticsService";

interface PreviewUploadProps {
    onPurchaseClick: (uploadedImage: string) => void;
}

type Decade =
    | "1950s"
    | "1960s"
    | "1970s"
    | "1980s"
    | "1990s"
    | "2000s";

const DECADES: Decade[] = ["1950s", "1960s", "1970s", "1980s", "1990s", "2000s"];
const DEFAULT_DECADE: Decade = "1970s";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_DIM = 2048; // max lado px para upload/preview (performance)
const TARGET_PREVIEW_BYTES = 2 * 1024 * 1024; // alvo ~2MB pro backend
const GEN_TIMEOUT_MS = 45_000; // timeout de geração (ms)
const GEN_RETRIES = 1; // total de tentativas extras (1 retry)

const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    // "image/heic", "image/heif", // não suportado nativo -> mostrar mensagem
];

const decadePrompt = (d: Decade) =>
    `Reimagine the person in this photo in the style of the ${d}. Include clothing, hairstyle, color palette, lens look, film grain and overall decade aesthetics. Keep the same face and identity. Output a photorealistic portrait with clear facial features.`;

const PreviewUpload: React.FC<PreviewUploadProps> = ({ onPurchaseClick }) => {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null); // original (base64)
    const [workingImage, setWorkingImage] = useState<string | null>(null); // comprimida/rotacionada
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [decade, setDecade] = useState<Decade>(DEFAULT_DECADE);

    const [isGenerating, setIsGenerating] = useState(false);
    const [progressFake, setProgressFake] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const controllerRef = useRef<AbortController | null>(null);
    const progressTimer = useRef<number | null>(null);

    /** ======= Utils ======= **/
    const isHeic = (type: string) =>
        type.toLowerCase().includes("heic") || type.toLowerCase().includes("heif");

    const readAsDataURL = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        });

    // cria um <canvas> com rotação/resize e retorna dataURL (JPEG/WebP)
    const compressAndOrient = async (
        dataUrl: string,
        mime: "image/jpeg" | "image/webp" = "image/jpeg"
    ): Promise<string> => {
        // Tenta usar createImageBitmap (aplica orientação EXIF automaticamente)
        const blob = await (await fetch(dataUrl)).blob();

        let bitmap: ImageBitmap | null = null;
        try {
            // @ts-expect-error: imageOrientation é suportado em navegadores modernos
            bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });
        } catch {
            bitmap = null;
        }

        const img: HTMLImageElement = bitmap
            ? // @ts-expect-error: TS não sabe criar <img> a partir de ImageBitmap em canvas diretamente
            (null as any)
            : new Image();

        if (!bitmap) {
            await new Promise<void>((res, rej) => {
                img.onload = () => res();
                img.onerror = () => rej(new Error("Falha ao carregar imagem"));
                img.src = dataUrl;
            });
        }

        const srcW = bitmap ? bitmap.width : img.naturalWidth;
        const srcH = bitmap ? bitmap.height : img.naturalHeight;

        const scale = Math.min(1, MAX_DIM / Math.max(srcW, srcH));
        const outW = Math.max(1, Math.round(srcW * scale));
        const outH = Math.max(1, Math.round(srcH * scale));

        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas não suportado");

        if (bitmap) {
            // desenha o bitmap já orientado
            // @ts-expect-error drawImage aceita ImageBitmap
            ctx.drawImage(bitmap, 0, 0, outW, outH);
            bitmap.close?.();
        } else {
            ctx.drawImage(img, 0, 0, outW, outH);
        }

        // Qualidade adaptativa para tentar ficar <= TARGET_PREVIEW_BYTES
        let quality = 0.9;
        let out = canvas.toDataURL(mime, quality);
        let iter = 0;

        while (iter < 4 && atob(out.split(",")[1] || "").length > TARGET_PREVIEW_BYTES) {
            quality = Math.max(0.5, quality - 0.1);
            out = canvas.toDataURL(mime, quality);
            iter++;
        }

        return out;
    };

    const withTimeout = <T,>(p: Promise<T>, ms = GEN_TIMEOUT_MS) =>
        new Promise<T>((resolve, reject) => {
            const t = setTimeout(() => reject(new Error("Tempo esgotado na geração")), ms);
            p.then((v) => {
                clearTimeout(t);
                resolve(v);
            }).catch((e) => {
                clearTimeout(t);
                reject(e);
            });
        });

    const startProgressFake = () => {
        stopProgressFake();
        setProgressFake(0);
        const step = () => {
            setProgressFake((prev) => {
                const next = prev + Math.random() * 12; // curva “orgânica”
                return Math.min(next, 92); // não fecha 100% até concluir
            });
            progressTimer.current = window.setTimeout(step, 500);
        };
        step();
    };

    const stopProgressFake = () => {
        if (progressTimer.current) {
            clearTimeout(progressTimer.current);
            progressTimer.current = null;
        }
        setProgressFake(0);
    };

    /** ======= Core flow ======= **/
    const resetAll = () => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        stopProgressFake();
        setUploadedImage(null);
        setWorkingImage(null);
        setPreviewImage(null);
        setError(null);
        setIsGenerating(false);
    };

    const setErrorUI = (msg: string, analyticsReason?: string) => {
        setError(msg);
        analytics.trackPreviewFailed(analyticsReason || msg);
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files || !files[0]) return;
        const file = files[0];

        // Métricas
        analytics.trackUploadStarted(file.size, file.type);

        // Validações
        if (isHeic(file.type)) {
            setErrorUI(
                "Formato HEIC/HEIF detectado. Converta para JPG/PNG/WebP ou tire um print da foto antes de enviar.",
                "HEIC not supported"
            );
            return;
        }
        if (!ACCEPTED_TYPES.includes(file.type)) {
            setErrorUI("Formato não suportado. Envie JPG, PNG ou WEBP.", "Unsupported format");
            return;
        }
        if (file.size > MAX_FILE_BYTES) {
            setErrorUI("Arquivo muito grande. Máximo 10MB.", "File too large");
            return;
        }

        try {
            setError(null);

            // Lê para dataURL original
            const dataUrl = await readAsDataURL(file);
            setUploadedImage(dataUrl);

            // Comprime/rotaciona (usa JPEG por compatibilidade)
            const compressed = await compressAndOrient(dataUrl, "image/jpeg");
            setWorkingImage(compressed);

            // Dispara geração inicial
            await generatePreview(compressed, decade);
        } catch (e: any) {
            setErrorUI(e?.message || "Erro ao processar a imagem");
        }
    };

    const generatePreview = async (imgDataUrl: string, d: Decade) => {
        controllerRef.current?.abort();
        controllerRef.current = new AbortController();

        setPreviewImage(null);
        setIsGenerating(true);
        startProgressFake();

        const prompt = decadePrompt(d);
        const startedAt = Date.now();

        let lastErr: unknown = null;
        for (let attempt = 0; attempt <= GEN_RETRIES; attempt++) {
            try {
                // se seu generateDecadeImage aceitar signal, passe aqui:
                // const out = await withTimeout(generateDecadeImage(imgDataUrl, prompt, { signal: controllerRef.current.signal }), GEN_TIMEOUT_MS);
                const out = await withTimeout(generateDecadeImage(imgDataUrl, prompt), GEN_TIMEOUT_MS);

                const took = Date.now() - startedAt;
                setPreviewImage(out);
                analytics.trackPreviewGenerated(d, took, attempt);
                setIsGenerating(false);
                stopProgressFake();
                setProgressFake(100);
                return;
            } catch (err) {
                lastErr = err;
                if (attempt < GEN_RETRIES) {
                    analytics.trackPreviewRetry(d, attempt + 1);
                    await new Promise((r) => setTimeout(r, 600)); // pequeno backoff
                    continue;
                }
            }
        }

        setIsGenerating(false);
        stopProgressFake();
        const message =
            (lastErr as Error)?.message ||
            "Não foi possível gerar a prévia agora. Tente novamente em instantes.";
        setErrorUI(message, "Generation failed after retries");
    };

    /** ======= Handlers UI ======= **/
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) handleFiles(e.target.files);
    };

    const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
    };
    const onDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);
    };
    const onDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    // Colar do clipboard (Ctrl/Cmd+V com imagem)
    const onPaste = useCallback(async (e: ClipboardEvent) => {
        if (!e.clipboardData) return;
        const item = Array.from(e.clipboardData.items).find((i) =>
            i.type.startsWith("image/")
        );
        if (!item) return;
        const file = item.getAsFile();
        if (file) {
            await handleFiles({
                0: file,
                length: 1,
                item: (i: number) => (i === 0 ? file : null),
            } as unknown as FileList);
        }
    }, []);

    useEffect(() => {
        window.addEventListener("paste", onPaste);
        return () => window.removeEventListener("paste", onPaste);
    }, [onPaste]);

    const handlePurchase = () => {
        if (!uploadedImage) return;
        analytics.trackPurchaseClicked("preview", decade);
        onPurchaseClick(uploadedImage); // mantém contrato atual
    };

    const cancelGeneration = () => {
        controllerRef.current?.abort();
        controllerRef.current = null;
        analytics.trackPreviewCancelled(decade);
        setIsGenerating(false);
        stopProgressFake();
    };

    const regenerate = async () => {
        if (!workingImage) return;
        analytics.trackPreviewRegenerate(decade);
        await generatePreview(workingImage, decade);
    };

    const changeDecade = async (d: Decade) => {
        setDecade(d);
        if (workingImage) {
            analytics.trackDecadeChanged(d);
            await generatePreview(workingImage, d);
        }
    };

    /** ======= UI ======= **/
    return (
        <div className="w-full max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
                {!uploadedImage && (
                    <motion.div
                        key="upload-idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="mb-6 text-center">
                            <h3 className="font-display text-3xl md:text-4xl text-brand-brown mb-3">
                                🎁 Teste grátis: veja sua prévia antes de comprar
                            </h3>
                            <p className="font-body text-lg text-brand-brown/70 max-w-2xl mx-auto">
                                Faça upload, arraste/solte ou cole uma imagem. Prévia com marca d&apos;água em ~2–3 minutos.
                            </p>
                        </div>

                        <label
                            htmlFor="preview-upload"
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            className={`cursor-pointer block outline-none focus:ring-2 focus:ring-brand-blue/50 rounded-xl ${dragging ? "ring-2 ring-brand-blue/50" : ""
                                }`}
                        >
                            <div className={`border-3 border-dashed ${dragging ? "border-brand-blue/70" : "border-brand-blue/40"
                                } rounded-xl p-16 text-center bg-gradient-to-br from-white/60 to-brand-blue/5 hover:from-white/80 hover:to-brand-blue/10 transition-all duration-300 shadow-lg hover:shadow-xl`}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-20 w-20 mx-auto text-brand-blue mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                    aria-hidden
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                                <span className="font-display text-3xl text-brand-brown block mb-3">
                                    Clique, arraste ou cole sua foto
                                </span>
                                <span className="font-body text-base text-brand-brown/70 block mb-2">
                                    JPG, PNG ou WEBP • Máximo 10MB
                                </span>
                                <span className="inline-block mt-4 font-body text-sm bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full">
                                    ✨ 100% gratuito para testar
                                </span>
                            </div>
                        </label>

                        <input
                            id="preview-upload"
                            type="file"
                            className="hidden"
                            accept="image/png, image/jpeg, image/webp"
                            capture="environment"
                            onChange={onInputChange}
                        />

                        <p className="mt-3 text-center text-xs font-body text-brand-brown/60">
                            Dica: você também pode <b>colar</b> uma imagem (Ctrl/Cmd + V). Nós não usamos suas fotos para treinar IA.
                        </p>
                    </motion.div>
                )}

                {uploadedImage && !previewImage && isGenerating && (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="text-center py-10"
                        aria-busy="true"
                        aria-live="polite"
                    >
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent mb-4" />
                        <p className="font-body text-brand-brown mb-2">
                            Gerando sua prévia {decade}…
                        </p>
                        <div className="w-full bg-brand-brown/10 h-2 rounded-full mt-3 overflow-hidden">
                            <motion.div
                                className="h-full bg-brand-blue"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progressFake}%` }}
                                transition={{ ease: "easeInOut" }}
                            />
                        </div>
                        <button
                            onClick={cancelGeneration}
                            className="mt-4 text-sm underline"
                        >
                            Cancelar
                        </button>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 mt-4"
                        role="alert"
                    >
                        <p className="font-body text-sm">{error}</p>
                        <div className="mt-2 flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setError(null);
                                    if (workingImage && uploadedImage && !previewImage) {
                                        // tentar gerar novamente
                                        generatePreview(workingImage, decade);
                                    }
                                }}
                                className="text-sm underline"
                            >
                                Tentar novamente
                            </button>
                            <button
                                onClick={resetAll}
                                className="text-sm underline"
                            >
                                Enviar outra foto
                            </button>
                        </div>
                    </motion.div>
                )}

                {previewImage && !isGenerating && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -14 }}
                        className="bg-white rounded-lg shadow-xl p-6 mt-4"
                    >
                        {/* seletor de década */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                            <span className="text-sm font-body text-brand-brown/70 mr-1">
                                Prévia da década:
                            </span>
                            {DECADES.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => changeDecade(d)}
                                    className={`px-3 py-1 rounded-full text-sm font-body border ${decade === d
                                            ? "bg-brand-blue text-white border-brand-blue"
                                            : "border-brand-blue/40 text-brand-brown hover:bg-brand-blue/10"
                                        }`}
                                >
                                    {d}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <img
                                src={previewImage}
                                alt={`Prévia ${decade}`}
                                className="w-full rounded-lg"
                                loading="eager"
                                decoding="async"
                            />
                            {/* Marca d'água */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                aria-hidden
                                style={{
                                    backgroundImage:
                                        "repeating-linear-gradient(45deg, rgba(255,255,255,0.45) 0 40px, rgba(255,255,255,0.55) 40px 80px)",
                                    mixBlendMode: "overlay",
                                }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg -rotate-12 shadow-lg">
                                    <p className="font-display text-2xl text-brand-brown/60">
                                        IMAGE FERRER
                                    </p>
                                    <p className="font-body text-xs text-brand-brown/40 text-center">
                                        PRÉVIA
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="font-body text-brand-brown mb-2">
                                ✨ Esta é uma prévia gratuita dos <b>{decade}</b>.
                            </p>
                            <p className="font-body text-sm text-brand-brown/70 mb-6">
                                Compre o álbum completo para receber <b>6 imagens</b> em alta, <b>sem marca d’água</b> (uma por década).
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handlePurchase}
                                    className="font-body text-lg bg-brand-brown text-vintage-paper px-8 py-3 rounded-md hover:bg-opacity-90 transition-all shadow-lg min-h-[44px]"
                                >
                                    Comprar álbum completo
                                </button>
                                <button
                                    onClick={regenerate}
                                    className="font-body text-lg border-2 border-brand-blue text-brand-brown px-8 py-3 rounded-md hover:bg-brand-blue hover:text-vintage-paper transition-all min-h-[44px]"
                                >
                                    Regerar esta década
                                </button>
                                <button
                                    onClick={resetAll}
                                    className="font-body text-lg border-2 border-brand-blue/40 text-brand-brown/80 px-8 py-3 rounded-md hover:bg-brand-blue/5 transition-all min-h-[44px]"
                                >
                                    Enviar outra foto
                                </button>
                            </div>

                            <p className="mt-4 text-xs font-body text-brand-brown/60">
                                Privacidade: suas imagens são usadas somente para gerar a prévia e podem ser apagadas com 1 clique.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PreviewUpload;
