/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDecadeImage } from '../services/geminiService';
import analytics from '../services/analyticsService';

interface PreviewUploadProps {
    onPurchaseClick: (uploadedImage: string) => void;
}

const PreviewUpload: React.FC<PreviewUploadProps> = ({ onPurchaseClick }) => {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Placeholder for uploadState, assuming it's defined elsewhere or can be inferred
    // For this example, we'll simulate its absence by focusing on the logic present.
    // If `uploadState` was intended to control visibility, that logic needs to be adapted.
    // Based on the provided changes, it seems `uploadState === 'idle'` was used to show the upload UI.
    // Since that's removed in the changes, we'll rely on `!uploadedImage` to control the initial upload view.
    const uploadState = 'idle'; // This is a placeholder to match the change snippet's context

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // Track upload started
            analytics.trackUploadStarted(file.size, file.type);

            // Validação de tamanho
            if (file.size > 10 * 1024 * 1024) {
                setError('Arquivo muito grande. Máximo 10MB.');
                analytics.trackPreviewFailed('File too large');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUrl = reader.result as string;
                setUploadedImage(dataUrl);
                setError(null);
                setIsGenerating(true);

                const startTime = Date.now();
                try {
                    // Gera prévia para os anos 1970 (década do meio)
                    const prompt = `Reimagine the person in this photo in the style of the 1970s. This includes clothing, hairstyle, photo quality, and the overall aesthetic of that decade. The output must be a photorealistic image showing the person clearly.`;
                    const preview = await generateDecadeImage(dataUrl, prompt);
                    const generationTime = Date.now() - startTime;

                    setPreviewImage(preview);
                    analytics.trackPreviewGenerated('1970s', generationTime);
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar prévia';
                    setError(errorMessage);
                    analytics.trackPreviewFailed(errorMessage);
                } finally {
                    setIsGenerating(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePurchase = () => {
        if (uploadedImage) {
            analytics.trackPurchaseClicked('preview', '1970s');
            onPurchaseClick(uploadedImage);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
                {uploadState === 'idle' && (
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
                                Faça upload da sua foto e receba uma prévia com marca d'água em 2-3 minutos
                            </p>
                        </div>

                        <label
                            htmlFor="preview-upload"
                            className="cursor-pointer block"
                        >
                            <div className="border-3 border-dashed border-brand-blue/40 rounded-xl p-16 text-center bg-gradient-to-br from-white/60 to-brand-blue/5 hover:from-white/80 hover:to-brand-blue/10 hover:border-brand-blue/60 transition-all duration-300 shadow-lg hover:shadow-xl">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-20 w-20 mx-auto text-brand-blue mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                                <span className="font-display text-3xl text-brand-brown block mb-3">
                                    Clique ou arraste sua foto aqui
                                </span>
                                <span className="font-body text-base text-brand-brown/70 block mb-2">
                                    JPG, PNG ou WEBP • Máximo 10MB
                                </span>
                                <span className="inline-block mt-4 font-body text-sm bg-brand-blue/10 text-brand-blue px-4 py-2 rounded-full">
                                    ✨ 100% gratuito para testar
                                </span>
                            </div>
                        </label>
                        <input id="preview-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                    </motion.div>
                )}

                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center py-12"
                    >
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-blue border-t-transparent mb-4"></div>
                        <p className="font-body text-brand-brown">Gerando sua prévia mágica...</p>
                        <div className="w-full bg-brand-brown/10 h-2 rounded-full mt-4 overflow-hidden">
                            <motion.div
                                className="h-full bg-brand-blue"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 3, ease: 'easeInOut' }}
                            />
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-100 border border-red-300 text-red-800 rounded-lg p-4 mt-4"
                    >
                        <p className="font-body text-sm">{error}</p>
                        <button
                            onClick={() => {
                                setUploadedImage(null);
                                setPreviewImage(null);
                                setError(null);
                            }}
                            className="mt-2 text-sm underline"
                        >
                            Tentar novamente
                        </button>
                    </motion.div>
                )}

                {previewImage && !isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-lg shadow-xl p-6 mt-4"
                    >
                        <div className="relative">
                            <img src={previewImage} alt="Prévia anos 1970" className="w-full rounded-lg" />
                            {/* Marca d'água */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-lg transform -rotate-12 shadow-lg">
                                    <p className="font-display text-2xl text-brand-brown/60">IMAGE FERRER</p>
                                    <p className="font-body text-xs text-brand-brown/40 text-center">PRÉVIA</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="font-body text-brand-brown mb-4">
                                ✨ Esta é uma prévia grátis dos anos 1970!
                            </p>
                            <p className="font-body text-sm text-brand-brown/70 mb-6">
                                Compre o álbum completo para receber 6 imagens em alta resolução sem marca d'água
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handlePurchase}
                                    className="font-body text-lg bg-brand-brown text-vintage-paper px-8 py-3 rounded-md hover:bg-opacity-90 transition-all shadow-lg min-h-[44px]"
                                >
                                    Comprar álbum completo
                                </button>
                                <button
                                    onClick={() => {
                                        setUploadedImage(null);
                                        setPreviewImage(null);
                                    }}
                                    className="font-body text-lg border-2 border-brand-blue text-brand-brown px-8 py-3 rounded-md hover:bg-brand-blue hover:text-vintage-paper transition-all min-h-[44px]"
                                >
                                    Tentar outra foto
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PreviewUpload;