/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    motion,
    useReducedMotion,
    useScroll,
    useTransform,
} from "framer-motion";
// Mock de função para manter o código funcional.
const getRefGroupName = () => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : '');
    return params.get('ref') || null;
};

// Importe o PreviewUpload e os componentes DraggableCard para o Hero
import PreviewUpload from "./PreviewUpload";
import { DraggableCardBody, DraggableCardContainer } from "./ui/draggable-card";

interface NewLandingPageProps {
    onGetStarted: () => void;
    onPreviewPurchase?: (uploadedImage: string) => void;
}

const BASE_PRICE = 19.9; // R$ 19,90

const currency = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
        Math.round(v * 100) / 100
    );

const NewLandingPage: React.FC<NewLandingPageProps> = ({
    onGetStarted,
    onPreviewPurchase,
}) => {
    const [refGroupName, setRefGroupName] = useState<string | null>(null);
    const [deadline, setDeadline] = useState<number>(() => {
        // Lógica de Urgência: Timer de 15 minutos por sessão
        const k = "ferrer-countdown-deadline";
        const saved = typeof window !== "undefined" ? sessionStorage.getItem(k) : null;
        if (saved) return Number(saved);
        const d = Date.now() + 15 * 60 * 1000;
        if (typeof window !== "undefined") sessionStorage.setItem(k, String(d));
        return d;
    });
    const [now, setNow] = useState<number>(Date.now());
    const reduceMotion = useReducedMotion();

    // --- Configurações de Motion ---
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });

    // Animação Parallax Sutil no "Fundo" do Hero para criar profundidade
    const heroParallax = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);

    // Variações de animação base para entrada de elementos
    const fadeUp = (delay = 0) =>
        reduceMotion
            ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0 } }
            : { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.6, type: 'spring', stiffness: 100 } };

    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
    };
    // --------------------------------

    // --- Lógica de Preço e Timer ---
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    const remaining = Math.max(0, deadline - now);
    const mm = String(Math.floor(remaining / 60000)).padStart(2, "0");
    const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

    useEffect(() => {
        setRefGroupName(getRefGroupName());
    }, []);

    const discountPercent = refGroupName ? 20 : 0;
    const priceNet = useMemo(
        () => BASE_PRICE * (1 - discountPercent / 100),
        [discountPercent]
    );
    // --------------------------------

    const handlePreviewPurchase = (uploadedImage: string) => {
        if (onPreviewPurchase) onPreviewPurchase(uploadedImage);
        else onGetStarted();
    };

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // JSON-LD (Mantido para SEO)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Álbum com 6 imagens — Ferrer Image",
        description:
            "Transforme 1 foto em 6 versões de épocas (1950s–2000s). Prévia grátis, entrega em minutos.",
        offers: {
            "@type": "Offer",
            priceCurrency: "BRL",
            price: priceNet.toFixed(2),
            url: "https://ferrer-image.vercel.app/",
            availability: "https://schema.org/InStock",
            priceValidUntil: new Date(Date.now() + 24 * 3600e3).toISOString(),
        },
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.9",
            reviewCount: "3200",
        },
        brand: { "@type": "Brand", name: "Ferrer Image" },
    };

    return (
        <div className="w-full bg-vintage-paper min-h-screen" data-page="landing">
            {/* JSON-LD */}
            <script
                type="application/ld+json"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Banner de Urgência Fixo (Z-Index alto para visibilidade máxima) */}
            <motion.div
                className="bg-brand-orange text-vintage-paper text-center text-sm md:text-base py-2 px-3 sticky top-0 z-[60] shadow-xl"
                role="status"
                aria-live="polite"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {discountPercent ? (
                    <span>
                        ⭐ DESCONTO EXCLUSIVO {discountPercent}% OFF! Seu álbum de {currency(BASE_PRICE)} por apenas <b>{currency(priceNet)}</b>.
                    </span>
                ) : (
                    <span>⏳ PRÉVIA GRATUITA! Veja o resultado antes de pagar.</span>
                )}
                <span className="ml-3 inline-flex items-center gap-1 font-semibold bg-white/20 px-2 py-0.5 rounded">
                    OFERTA EXPIRA EM {mm}:{ss}
                </span>
            </motion.div>

            {/* Header Fixo de Navegação */}
            <header className="sticky top-[38px] md:top-[38px] z-50 bg-vintage-paper/95 backdrop-blur-md border-b border-brand-brown/10 h-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    <button
                        onClick={() => scrollToSection("top")}
                        className="font-display text-2xl text-brand-brown hover:text-brand-blue transition-colors"
                        aria-label="Ir para o topo"
                    >
                        Ferrer Image
                    </button>

                    <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
                        {["examples", "how-it-works", "faq"].map((id) => (
                            <button
                                key={id}
                                onClick={() => scrollToSection(id)}
                                className="font-body text-brand-brown hover:text-brand-blue transition-colors"
                            >
                                {id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </button>
                        ))}
                        <motion.button
                            data-cta="header"
                            onClick={() => scrollToSection("pricing-final")}
                            whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(90, 125, 154, 0.4)" }}
                            whileTap={{ scale: 0.95 }}
                            className="font-body bg-brand-blue text-vintage-paper px-5 py-2 rounded-full shadow-lg min-h-[44px] transition-all"
                        >
                            Comprar Agora • {currency(priceNet)}
                        </motion.button>
                    </nav>
                </div>
            </header>

            <div ref={sectionRef as any}>
                {/* Hero com Máximo Impacto e CTA Principal */}
                <section id="top" className="relative overflow-hidden bg-vintage-paper pb-16 md:pb-28 pt-10">
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-5xl mx-auto">
                            <motion.h1
                                {...fadeUp(0.2)}
                                className="font-display text-5xl md:text-8xl text-brand-brown mb-4 leading-tight"
                            >
                                Transforme 1 Foto em <span className="block text-brand-blue">6 Eras Históricas</span>
                            </motion.h1>

                            <motion.h2
                                {...fadeUp(0.4)}
                                className="font-body text-2xl md:text-3xl text-brand-brown/80 mb-8"
                            >
                                Prévia Gratuita • Entrega em 2 Minutos • Qualidade IA Gemini Flash
                            </motion.h2>

                            {/* Área de Upload / CTA Principal */}
                            <DraggableCardContainer className="mt-8">
                                <DraggableCardBody
                                    className="w-full max-w-lg p-5 bg-white/80 border-4 border-dashed border-brand-blue/50 shadow-2xl backdrop-blur-sm"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.6, duration: 0.8 }}
                                    >
                                        <h3 className="font-display text-3xl text-brand-brown text-center mb-4">Veja a Prévia Grátis Agora!</h3>
                                        {/* Componente principal de interação: Upload */}
                                        <PreviewUpload onPurchaseClick={handlePreviewPurchase} />
                                    </motion.div>
                                </DraggableCardBody>
                            </DraggableCardContainer>

                            {/* Botões de Reforço de Vendas e Urgência */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={containerVariants}
                                className="flex flex-col items-center justify-center gap-4 mt-12"
                            >
                                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-3">
                                    <motion.button
                                        data-cta="hero-primary"
                                        onClick={onGetStarted}
                                        whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 20px rgba(217, 119, 6, 0.5)" }}
                                        whileTap={{ scale: 0.95 }}
                                        className="font-body bg-brand-orange text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-opacity-95 shadow-xl min-h-[50px] transition-all whitespace-nowrap"
                                    >
                                        GERAR PRÉVIA GRÁTIS!
                                    </motion.button>
                                </motion.div>

                                {/* Reforço da Oferta e Timer */}
                                <motion.div
                                    variants={itemVariants}
                                    className="inline-flex items-center gap-2 text-brand-red font-body text-lg bg-vintage-paper rounded-full px-4 py-1.5 shadow-lg border-2 border-brand-red"
                                    aria-live="polite"
                                >
                                    OFERTA EXCLUSIVA: {currency(priceNet)} expira em {mm}:{ss}
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Seção de Confiança (Social Proof & Garantias) */}
                <section className="bg-brand-blue/5 py-12 md:py-16 border-t border-brand-brown/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={containerVariants}
                            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
                        >
                            <motion.div variants={itemVariants}>
                                <div className="font-display text-4xl text-brand-brown">4,9 ★</div>
                                <div className="font-body text-brand-brown/70 mt-1">Avaliação Média (3.200+)</div>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <div className="font-display text-4xl text-brand-brown">2–3 min</div>
                                <div className="font-body text-brand-brown/70 mt-1">Entrega via E-mail</div>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <div className="font-display text-4xl text-brand-blue">100%</div>
                                <div className="font-body text-brand-blue/80 mt-1">Privacidade Garantida (LGPD)</div>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <div className="font-display text-4xl text-brand-orange">Livre</div>
                                <div className="font-body text-brand-orange/80 mt-1">Uso em Todas as Redes</div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Como Funciona (Foco em Velocidade e Simplicidade) */}
                <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <motion.h2
                        {...fadeUp(0)}
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        className="font-display text-4xl md:text-5xl text-brand-brown text-center mb-16"
                    >
                        Em Apenas 3 Passos Rápidos
                    </motion.h2>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={containerVariants}
                        className="grid md:grid-cols-3 gap-12 relative"
                    >
                        {/* Linhas de Conexão (Animação de Transição) */}
                        <motion.div
                            className="absolute hidden md:block top-10 left-1/4 w-[1px] h-[calc(100%-80px)] bg-brand-blue/20 -translate-x-1/2"
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            transition={{ duration: 1.5, delay: 0.8 }}
                            style={{ originY: 0 }}
                        />
                        <motion.div
                            className="absolute hidden md:block top-10 right-1/4 w-[1px] h-[calc(100%-80px)] bg-brand-blue/20 translate-x-1/2"
                            initial={{ scaleY: 0 }}
                            whileInView={{ scaleY: 1 }}
                            transition={{ duration: 1.5, delay: 0.8 }}
                            style={{ originY: 0 }}
                        />

                        {[
                            { n: "1. Upload Inteligente", icon: "📷", d: "Selecione sua foto (rosto visível). O sistema da IA fará a leitura para manter suas características." },
                            { n: "2. Gerar Prévia Grátis", icon: "✨", d: "Nossa IA (Gemini Flash) cria as 6 imagens. Você confere o resultado com marca d'água em 90 segundos." },
                            { n: "3. Download Imediato", icon: "✉️", d: "Pague com Pix/Cartão/Apple Pay e receba o link para download em Alta Resolução no seu e-mail." },
                        ].map((s, index) => (
                            <motion.div
                                key={s.n}
                                variants={itemVariants}
                                className="text-center bg-white rounded-xl p-6 shadow-2xl border-t-8 border-brand-blue/80 z-10 hover:shadow-brand-blue/40 transition-shadow"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="w-16 h-16 bg-brand-blue rounded-full mx-auto mb-4 grid place-items-center text-vintage-paper text-3xl shadow-md">
                                    {s.icon}
                                </div>
                                <h3 className="font-display text-2xl text-brand-brown mb-2 font-bold">{s.n}</h3>
                                <p className="font-body text-brand-brown/70">{s.d}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                    <motion.div variants={itemVariants} className="text-center mt-16">
                        <motion.button
                            data-cta="center-cta"
                            onClick={onGetStarted}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className="font-body bg-brand-brown text-vintage-paper px-10 py-4 rounded-full text-xl font-bold shadow-2xl hover:bg-opacity-90 transition-all"
                        >
                            Quero Ver Minha Prévia Agora!
                        </motion.button>
                    </motion.div>
                </section>

                {/* Galeria de Exemplos (para criar desejo) */}
                <section id="examples" className="bg-vintage-paper/90 py-16 md:py-24 border-t border-brand-brown/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={containerVariants}
                            className="text-center"
                        >
                            <motion.h2 variants={itemVariants} className="font-display text-4xl md:text-5xl text-brand-brown mb-3">
                                Viralize suas Redes
                            </motion.h2>
                            <motion.p variants={itemVariants} className="font-body text-brand-blue text-lg mb-10">
                                Conteúdo único para seus posts, perfis ou presentes inesquecíveis.
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={containerVariants}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                        >
                            {[
                                { decade: "1950s", img: "/assets/image/1950s.jpg" },
                                { decade: "1960s", img: "/assets/image/1960s.jpg" },
                                { decade: "1970s", img: "/assets/image/1970s.jpg" },
                                { decade: "1980s", img: "/assets/image/1980s.jpg" },
                                { decade: "1990s", img: "/assets/image/1990s.jpg" },
                                { decade: "2000s", img: "/assets/image/2000s.jpg" },
                            ].map(({ decade, img }) => (
                                <motion.div
                                    variants={itemVariants}
                                    key={decade}
                                    whileHover={{ scale: 1.05, rotate: [0, 1.5, -1.5, 0], transition: { duration: 0.4 } }}
                                    className="group bg-white p-3 shadow-xl rounded-xl cursor-pointer"
                                    onClick={onGetStarted}
                                >
                                    <div className="aspect-square overflow-hidden rounded-md">
                                        {/* As imagens aqui são mockups, o path deve ser adaptado no seu projeto. */}
                                        <img
                                            src={img}
                                            alt={`Exemplo de foto estilo ${decade}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            loading="lazy"
                                        />
                                    </div>
                                    <p className="mt-2 font-handwriting text-center text-brand-brown text-xl">{decade}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* Pricing Final (Último CTA antes do Footer) */}
                <section id="pricing-final" className="bg-brand-blue py-16 md:py-24">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={containerVariants}
                            className="bg-vintage-paper rounded-xl shadow-2xl p-8 border-4 border-brand-orange relative"
                        >
                            <motion.div variants={itemVariants} className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <div className="bg-brand-red text-vintage-paper px-4 py-2 rounded-full text-base font-bold shadow-lg animate-pulse-slow">
                                    ÚLTIMA CHANCE: OFERTA EXPIRA!
                                </div>
                            </motion.div>
                            <motion.h2 variants={itemVariants} className="font-display text-4xl text-brand-brown text-center mb-4 pt-4">
                                Leve o Álbum Completo Agora!
                            </motion.h2>

                            <motion.div variants={itemVariants} className="text-center mb-8">
                                <div className="text-2xl text-brand-brown/50 line-through font-body">{currency(BASE_PRICE)}</div>
                                <div className="font-display text-7xl text-brand-brown leading-none">{currency(priceNet)}</div>
                                <div className="text-base text-brand-blue/90 font-body mt-2">Pagamento Único. Download Imediato.</div>
                                <div className="text-brand-red font-body text-lg mt-2">Tempo Restante: {mm}:{ss}</div>
                            </motion.div>

                            <motion.button
                                data-cta="pricing-final"
                                onClick={onGetStarted}
                                variants={itemVariants}
                                whileHover={{ scale: 1.05, y: -3 }}
                                whileTap={{ scale: 0.95 }}
                                className="w-full font-body text-2xl bg-brand-orange text-white px-8 py-5 rounded-full font-bold transition-all shadow-xl hover:bg-opacity-95"
                            >
                                Garanta Suas 6 Eras por {currency(priceNet)}
                            </motion.button>

                            <motion.div variants={itemVariants} className="mt-6 flex justify-center items-center gap-4 text-sm font-body text-brand-brown/80">
                                <span>🔒 Checkout Seguro</span> |
                                <span>1 Ajuste Grátis em 24h</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* FAQ (Abordando Objeções Finais) */}
                <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.h2
                        {...fadeUp(0)}
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        className="font-display text-4xl md:text-5xl text-brand-brown text-center mb-10"
                    >
                        Tire Suas Dúvidas Finais
                    </motion.h2>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={containerVariants}
                        className="space-y-3"
                    >
                        {[
                            ["Quanto tempo leva para gerar as imagens?", "Geralmente 2 a 3 minutos após o pagamento. Você recebe um link de download por e-mail imediatamente. O processo é quase instantâneo."],
                            ["Como funciona a privacidade dos meus dados? (LGPD)", "Sua privacidade é prioridade. Não armazenamos suas fotos permanentemente e não treinamos nossa IA com elas. Seus dados são usados apenas para gerar as imagens e podem ser apagados com 1 clique."],
                            ["Se eu não gostar do resultado, tenho garantia?", "Sim. Oferecemos 1 ajuste gratuito na imagem que você desejar em até 24 horas após a entrega do álbum, garantindo sua satisfação."],
                            ["Quais os requisitos da minha foto?", "Aceitamos JPG e PNG. O rosto deve estar visível e bem iluminado. Evite óculos escuros, bonés e fotos muito escuras para o melhor resultado."],
                            ["O preço é por foto ou pelo álbum completo?", `O valor de ${currency(priceNet)} é pelo álbum completo de 6 imagens, incluindo todas as eras e o direito de uso.`],
                        ].map(([q, a]) => (
                            <motion.details variants={itemVariants} key={q} className="bg-white rounded-lg p-5 shadow-lg group border-2 border-brand-blue/10 hover:border-brand-blue transition-colors">
                                <summary className="font-body font-bold text-brand-brown cursor-pointer list-none flex items-center justify-between">
                                    {q}
                                    <span className="text-brand-blue transition-transform group-open:rotate-45">＋</span>
                                </summary>
                                <motion.div
                                    className="mt-3 font-body text-brand-brown/75"
                                >
                                    {a}
                                </motion.div>
                            </motion.details>
                        ))}
                    </motion.div>
                </section>

                {/* Seção Afiliados - Mantida com foco em Valor */}
                <section className="bg-brand-brown py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-vintage-paper">
                        <motion.h2 {...fadeUp(0)} whileInView="visible" viewport={{ once: true }} className="font-display text-4xl md:text-5xl mb-4">
                            Você tem uma comunidade?
                        </motion.h2>
                        <motion.p {...fadeUp(0.2)} whileInView="visible" viewport={{ once: true }} className="font-body text-xl mb-8">
                            Torne-se parceiro e ofereça desconto de 20% + ganhe comissões de até 40%.
                        </motion.p>

                        <motion.a
                            {...fadeUp(0.4)}
                            href="https://wa.me/555198030797?text=Quero%20ser%20parceiro%20Ferrer%20Image"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block font-body text-lg bg-brand-orange text-white px-7 py-3 rounded-full font-bold shadow-lg"
                        >
                            Fale com a Parceria no WhatsApp
                        </motion.a>
                    </div>
                </section>
            </div>


            {/* CTA Fixo Mobile (Rodapé) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-vintage-paper border-t border-brand-brown/20 p-4 shadow-2xl">
                <motion.button
                    data-cta="mobile-sticky"
                    onClick={onGetStarted}
                    whileTap={{ scale: 0.98 }}
                    className="w-full font-body text-xl bg-brand-orange text-white px-6 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg"
                >
                    COMPRAR AGORA • {currency(priceNet)}
                </motion.button>
            </div>

            {/* Footer Profissional */}
            <footer className="bg-brand-brown text-vintage-paper py-12 mb-16 md:mb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <motion.div {...fadeUp(0)} whileInView="visible" viewport={{ once: true }}>
                            <h3 className="font-display text-xl mb-3">Ferrer Image</h3>
                            <p className="font-body text-sm opacity-70">
                                Uma experiência digital de viagem no tempo, powered by IA.
                            </p>
                        </motion.div>
                        <motion.div {...fadeUp(0.1)} whileInView="visible" viewport={{ once: true }}>
                            <h4 className="font-body font-bold mb-3">Legal</h4>
                            <ul className="space-y-2 font-body text-sm">
                                <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection("faq"); }} className="opacity-70 hover:opacity-100 transition-opacity">Privacidade & LGPD</a></li>
                                <li><a href="#" className="opacity-70 hover:opacity-100 transition-opacity">Termos de Uso</a></li>
                                <li><a href="mailto:ferrerrstudio@gmail.com" className="opacity-70 hover:opacity-100 transition-opacity">Solicitar Exclusão de Dados</a></li>
                            </ul>
                        </motion.div>
                        <motion.div {...fadeUp(0.2)} whileInView="visible" viewport={{ once: true }}>
                            <h4 className="font-body font-bold mb-3">Contato</h4>
                            <ul className="space-y-2 font-body text-sm">
                                <li className="opacity-70">Email: ferrerrstudio@gmail.com</li>
                                <li><a href="https://wa.me/555198030797" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">Suporte ao Cliente (WhatsApp)</a></li>
                                <li><a href="https://www.instagram.com/duda.ferrer/" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">Instagram Oficial</a></li>
                            </ul>
                            <div className="mt-4">
                                <img
                                    src="/assets/payments-br.svg"
                                    alt="Pix, Cartão, Apple Pay, Google Pay"
                                    className="h-6 opacity-90 mx-auto md:mx-0"
                                    loading="lazy"
                                />
                            </div>
                        </motion.div>
                    </div>
                    <div className="border-t border-white/20 pt-6 text-center font-body text-sm opacity-70">
                        © {new Date().getFullYear()} Ferrer Image. Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NewLandingPage;