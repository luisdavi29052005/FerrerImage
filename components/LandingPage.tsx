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
// Removendo a importação de '../lib/affiliateUtils' e adicionando um mock simples
// O getRefGroupName real dependeria do contexto da sua URL.
const getRefGroupName = () => {
    // Mock simples para manter o código funcional e a lógica de desconto
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : '');
    return params.get('ref') || null;
};

import PreviewUpload from "./PreviewUpload";
// Importando componentes para o efeito 3D/draggable na prévia
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
        // evergreen 15min por sessão
        const k = "ferrer-countdown-deadline";
        const saved = typeof window !== "undefined" ? sessionStorage.getItem(k) : null;
        if (saved) return Number(saved);
        const d = Date.now() + 15 * 60 * 1000;
        if (typeof window !== "undefined") sessionStorage.setItem(k, String(d));
        return d;
    });
    const [now, setNow] = useState<number>(Date.now());
    const reduceMotion = useReducedMotion();

    // Scroll reference para o Parallax no Hero
    const scrollRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: scrollRef, offset: ["start start", "end start"] });

    // Efeito Parallax: movimento sutil do texto do cabeçalho em relação à rolagem
    const headerParallax = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

    // timer
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(t);
    }, []);

    // recomeça o timer quando a pessoa clicar para ver preço (opcional)
    const resetCountdownOnce = useRef(false);
    const restartCountdown = () => {
        if (resetCountdownOnce.current) return;
        resetCountdownOnce.current = true;
        const d = Date.now() + 15 * 60 * 1000;
        setDeadline(d);
        sessionStorage.setItem("ferrer-countdown-deadline", String(d));
    };

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

    const handlePreviewPurchase = (uploadedImage: string) => {
        if (onPreviewPurchase) onPreviewPurchase(uploadedImage);
        else onGetStarted();
    };

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    // Variações de animação base para entrada de elementos
    const fadeUp = (delay = 0) =>
        reduceMotion
            ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0 } }
            : { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.6, type: 'spring', stiffness: 100 } };

    // Variações de animação para listas e grids (staggered effect)
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

    // JSON-LD de Product (SEO) - Mantido da versão original
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Álbum com 6 imagens — Ferrer Image",
        description:
            "Transforme 1 foto em 6 versões de épocas (1950s–2000s). Prévia grátis, entrega em minutos.",
        image: [
            "/assets/image/1950s.jpg",
            "/assets/image/1960s.jpg",
            "/assets/image/1970s.jpg",
            "/assets/image/1980s.jpg",
            "/assets/image/1990s.jpg",
            "/assets/image/2000s.jpg",
        ],
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

            {/* Top banner de desconto / urgência (Sticky) */}
            {(refGroupName || remaining > 0) && (
                <motion.div
                    {...fadeUp(0)}
                    className="bg-brand-blue text-vintage-paper text-center text-sm md:text-base py-2 px-3 sticky top-0 z-[60] shadow-md"
                    role="status"
                    aria-live="polite"
                >
                    {refGroupName ? (
                        <span>
                            🎉 Desconto exclusivo do grupo <b>{refGroupName}</b> aplicado automaticamente.
                        </span>
                    ) : (
                        <span>🎁 Teste com prévia gratuita — sem risco.</span>
                    )}
                    <span className="ml-3 inline-flex items-center gap-1 font-semibold">
                        ⏳ Oferta expira em {mm}:{ss}
                    </span>
                </motion.div>
            )}

            {/* Header Fixo - Animação de botão mais chamativa */}
            <header className="sticky top-0 z-50 bg-vintage-paper/95 backdrop-blur border-b border-brand-brown/10 h-16 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    <button
                        onClick={() => scrollToSection("top")}
                        className="font-display text-xl md:text-2xl text-brand-brown hover:text-brand-blue transition-colors"
                        aria-label="Ir para o topo"
                    >
                        Ferrer Image
                    </button>

                    <nav className="hidden md:flex items-center gap-6" aria-label="Navegação principal">
                        {["examples", "pricing", "faq"].map((id) => (
                            <button
                                key={id}
                                onClick={() => {
                                    if (id === "pricing") restartCountdown();
                                    scrollToSection(id);
                                }}
                                className="font-body text-brand-brown hover:text-brand-blue transition-colors"
                            >
                                {id.charAt(0).toUpperCase() + id.slice(1)}
                            </button>
                        ))}
                        <motion.button
                            data-cta="header"
                            onClick={onGetStarted}
                            // Efeito de pulso e sombra no hover
                            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px rgba(109, 93, 75, 0.3)" }}
                            whileTap={{ scale: 0.95 }}
                            className="font-body bg-brand-brown text-vintage-paper px-5 py-2 rounded-full hover:bg-opacity-90 shadow-lg min-h-[44px] transition-all"
                        >
                            Gerar minhas 6 eras {discountPercent ? <span className="ml-1">• {discountPercent}%</span> : null}
                        </motion.button>
                    </nav>
                </div>
            </header>

            <div ref={scrollRef as any}>
                {/* Hero com Parallax e Destaque Visual */}
                <section id="top" className="relative overflow-hidden bg-vintage-paper pb-16 md:pb-28">
                    {/* Efeito Parallax no Texto */}
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 md:pt-20">
                        <motion.div style={{ y: headerParallax }} className="text-center max-w-5xl mx-auto">
                            <motion.h1
                                {...fadeUp(0.05)}
                                className="font-display text-5xl md:text-8xl text-brand-brown mb-5 leading-tight"
                            >
                                Viaje no tempo com
                                <span className="block text-brand-blue font-handwriting mt-2">1 foto</span>
                            </motion.h1>

                            {/* âncora de preço logo no topo - Animação de Pop */}
                            <motion.div {...fadeUp(0.1)} className="mb-4 flex items-center justify-center gap-3">
                                <motion.span
                                    className="font-display text-3xl md:text-4xl text-brand-brown"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                                >
                                    {discountPercent ? (
                                        <span className="text-brand-brown/60 line-through mr-2 font-body text-xl">{currency(BASE_PRICE)}</span>
                                    ) : null}
                                    {currency(priceNet)}
                                </motion.span>
                                {discountPercent ? (
                                    <motion.span
                                        className="px-2 py-1 rounded-full bg-brand-orange text-vintage-paper text-xs font-bold"
                                        initial={{ rotate: -10, scale: 0 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                                    >
                                        {discountPercent}% OFF
                                    </motion.span>
                                ) : null}
                            </motion.div>

                            <motion.p
                                {...fadeUp(0.15)}
                                className="font-body text-lg md:text-xl text-brand-brown/80 mb-8 md:mb-12"
                            >
                                6 imagens em alta, prévia gratuita antes de pagar • Entrega em 2–3 min • Sua privacidade garantida
                            </motion.p>
                        </motion.div>

                        {/* Upload com Prévia - Wrapper com Efeito 3D/Draggable */}
                        <DraggableCardContainer className="mt-8">
                            <DraggableCardBody
                                className="w-full max-w-lg p-3 bg-white/70 shadow-2xl backdrop-blur-sm hover:shadow-brand-blue/50"
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.6, duration: 0.8 }}
                                >
                                    <h2 className="font-display text-2xl text-brand-brown text-center mb-4">Comece sua viagem no tempo</h2>
                                    <PreviewUpload onPurchaseClick={handlePreviewPurchase} />
                                </motion.div>
                            </DraggableCardBody>
                        </DraggableCardContainer>

                        {/* Contador e Botões */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                            className="flex flex-col items-center justify-center gap-4 mt-12"
                        >
                            <motion.div
                                variants={itemVariants}
                                className="inline-flex items-center gap-2 text-brand-red font-body text-sm bg-vintage-paper rounded-full px-4 py-1 shadow-lg animate-pulse"
                                aria-live="polite"
                            >
                                🚨 DESCONTO EXPIRANDO: {mm}:{ss}
                            </motion.div>
                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-3">
                                <motion.button
                                    data-cta="hero-primary"
                                    onClick={onGetStarted}
                                    whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 20px rgba(217, 119, 6, 0.4)" }}
                                    whileTap={{ scale: 0.95 }}
                                    className="font-body bg-brand-orange text-white px-8 py-4 rounded-full text-xl font-bold hover:bg-opacity-95 shadow-xl min-h-[50px] transition-all"
                                >
                                    Quero Minhas 6 Eras Agora!
                                </motion.button>
                                <motion.button
                                    onClick={() => scrollToSection("examples")}
                                    variants={itemVariants}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="font-body border-2 border-brand-blue text-brand-brown px-6 py-3 rounded-full hover:bg-brand-blue hover:text-vintage-paper transition-all min-h-[50px]"
                                >
                                    Ver Exemplos
                                </motion.button>
                            </motion.div>
                        </motion.div>

                        {/* Trust row */}
                        <motion.div
                            {...fadeUp(0.8)}
                            className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8 text-sm text-brand-brown/70 font-body"
                        >
                            <div className="flex items-center gap-2">🔒 Privacidade & LGPD</div>
                            <div className="flex items-center gap-2">✅ Checkout seguro</div>
                            <div className="flex items-center gap-2">🧠 Não treinamos IA com suas fotos</div>
                        </motion.div>
                    </div>
                </section>

                {/* Exemplos - Staggered Grid Reveal e Efeito Hover */}
                <section id="examples" className="bg-brand-blue/5 py-16 md:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={containerVariants}
                            className="text-center"
                        >
                            <motion.h2 variants={itemVariants} className="font-display text-4xl md:text-5xl text-brand-brown mb-3">
                                A Galeria do Tempo
                            </motion.h2>
                            <motion.p variants={itemVariants} className="font-body text-brand-brown/70 text-lg mb-10">
                                1950s, 60s, 70s, 80s, 90s, 2000s — estilos fiéis, qualidade de fotografia de estúdio.
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
                                    // Efeito de balanço suave no hover
                                    whileHover={{ scale: 1.05, rotate: [0, 1.5, -1.5, 0], transition: { duration: 0.4 } }}
                                    className="group bg-white p-3 shadow-xl rounded-xl cursor-pointer"
                                    onClick={() => scrollToSection("pricing")}
                                >
                                    <div className="aspect-square overflow-hidden rounded-md">
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

                        <motion.div variants={itemVariants} className="text-center mt-12">
                            <motion.button
                                data-cta="examples-cta"
                                onClick={onGetStarted}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="font-body bg-brand-brown text-vintage-paper px-8 py-3 rounded-full text-lg shadow-lg hover:bg-opacity-90 transition-all"
                            >
                                Crie as Suas Agora
                            </motion.button>
                        </motion.div>
                    </div>
                </section>

                {/* Números rápidos - Animação de entrada */}
                <section className="bg-brand-blue/10 py-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={containerVariants}
                            className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center"
                        >
                            <motion.div variants={itemVariants}>
                                <div className="font-display text-4xl text-brand-brown">+3.200</div>
                                <div className="font-body text-brand-brown/70 mt-1">Álbuns gerados</div>
                            </motion.div>
                            <motion.div variants={itemVariants}>
                                <div className="font-display text-4xl text-brand-brown">4,9 ★</div>
                                <div className="font-body text-brand-brown/70 mt-1">Avaliação média</div>
                            </motion.div>
                            <motion.div variants={itemVariants} className="col-span-2 md:col-span-1">
                                <div className="font-display text-4xl text-brand-brown">2–3 min</div>
                                <div className="font-body text-brand-brown/70 mt-1">Tempo de entrega</div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Como funciona - Steps com Linha de Conexão Animada */}
                <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                    <motion.h2
                        {...fadeUp(0)}
                        viewport={{ once: true, amount: 0.5 }}
                        className="font-display text-4xl md:text-5xl text-brand-brown text-center mb-10"
                    >
                        Fluxo Simples, Resultado Mágico
                    </motion.h2>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={containerVariants}
                        className="grid md:grid-cols-3 gap-8 relative"
                    >
                        {/* Linha de conexão animada - Efeito moderno */}
                        <motion.div
                            className="absolute hidden md:block top-[20%] left-1/2 w-full h-[5px] bg-brand-blue/20 -translate-x-1/2 -translate-y-1/2"
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            style={{ originX: 0 }}
                        />

                        {[
                            { n: "1. Envie sua foto", d: "Upload rápido e seguro da sua melhor foto. Foco no rosto para melhor resultado." },
                            { n: "2. Prévia Grátis", d: "A IA gera as 6 imagens. Você vê a prévia com marca d'água antes de qualquer pagamento." },
                            { n: "3. Receba o Álbum", d: "Após o pagamento, o álbum completo em alta resolução é enviado em 2-3 minutos para seu e-mail." },
                        ].map((s, index) => (
                            <motion.div
                                key={s.n}
                                variants={itemVariants}
                                className="text-center bg-white rounded-xl p-6 shadow-md border border-brand-brown/10 z-10"
                            >
                                <div className="w-16 h-16 bg-brand-blue rounded-full mx-auto mb-4 grid place-items-center text-vintage-paper text-2xl font-body font-bold shadow-lg">
                                    {index + 1}
                                </div>
                                <h3 className="font-display text-2xl text-brand-brown mb-2">{s.n}</h3>
                                <p className="font-body text-brand-brown/70">{s.d}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>

                {/* Pricing - Foco no CTA com Pulse Effect */}
                <section id="pricing" className="bg-brand-brown/5 py-16 md:py-24">
                    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={containerVariants}
                            className="bg-white rounded-lg shadow-2xl p-8 border-4 border-brand-blue relative"
                        >
                            {discountPercent ? (
                                <motion.div
                                    variants={itemVariants}
                                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                                >
                                    <div className="bg-brand-orange text-vintage-paper px-4 py-2 rounded-full text-base font-bold shadow-lg animate-bounce-slow">
                                        OFERTA RELÂMPAGO: {discountPercent}% OFF
                                    </div>
                                </motion.div>
                            ) : null}

                            <motion.h2 variants={itemVariants} className="font-display text-4xl text-brand-brown text-center mb-4 pt-4">
                                Pacote Premium: Álbum Completo
                            </motion.h2>

                            <motion.div variants={itemVariants} className="text-center mb-6">
                                {discountPercent ? (
                                    <>
                                        <div className="text-xl text-brand-brown/50 line-through font-body">{currency(BASE_PRICE)}</div>
                                        <div className="font-display text-6xl text-brand-brown leading-none">{currency(priceNet)}</div>
                                        <div className="text-sm text-brand-blue/80 font-body mt-1">Único pagamento por todas as 6 imagens</div>
                                    </>
                                ) : (
                                    <div className="font-display text-6xl text-brand-brown leading-none">{currency(BASE_PRICE)}</div>
                                )}
                            </motion.div>

                            <motion.ul variants={containerVariants} className="space-y-3 mb-8">
                                {[
                                    "Entrega Imediata no seu e-mail (2–3 minutos)",
                                    "6 Imagens em Alta Resolução (prontas para impressão e redes)",
                                    "Uso Comercial e Pessoal livre em todas as redes sociais",
                                    "Garantia: 1 ajuste gratuito na sua imagem em até 24 horas",
                                ].map((li) => (
                                    <motion.li variants={itemVariants} key={li} className="flex items-start gap-3 font-body text-brand-brown">
                                        <motion.span
                                            className="text-brand-blue mt-0.5"
                                            initial={{ rotate: -90, opacity: 0 }}
                                            animate={{ rotate: 0, opacity: 1 }}
                                            transition={{ type: 'spring', stiffness: 200 }}
                                        >
                                            ✔
                                        </motion.span>
                                        {li}
                                    </motion.li>
                                ))}
                            </motion.ul>

                            <motion.button
                                data-cta="pricing"
                                onClick={onGetStarted}
                                variants={itemVariants}
                                // Efeito de levantamento no hover
                                whileHover={{ scale: 1.02, y: -3, boxShadow: "0 10px 20px rgba(90, 125, 154, 0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full font-body text-xl bg-brand-blue text-vintage-paper px-8 py-4 rounded-full font-bold transition-all shadow-xl"
                            >
                                Garanta Seu Álbum Por {currency(priceNet)}
                            </motion.button>

                            <motion.div variants={itemVariants} className="flex justify-center mt-4">
                                <img
                                    src="/assets/payments-br.svg"
                                    alt="Pix, Cartão, Apple Pay, Google Pay"
                                    className="h-6 md:h-7 opacity-80"
                                    loading="lazy"
                                />
                            </motion.div>

                            <motion.div variants={itemVariants} className="mt-6 grid grid-cols-2 gap-3 text-xs text-brand-brown/70 font-body">
                                <div className="bg-brand-blue/5 rounded p-3 text-center">🔐 Dados 100% criptografados</div>
                                <div className="bg-brand-blue/5 rounded p-3 text-center">⏱️ Oferta de {discountPercent}% expira em {mm}:{ss}</div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Depoimentos - Staggered Cards */}
                <section className="bg-vintage-paper/90 py-14">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.h2 variants={itemVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            className="font-display text-4xl md:text-5xl text-brand-brown text-center mb-10"
                        >
                            As Histórias que Criamos
                        </motion.h2>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={containerVariants}
                            className="grid md:grid-cols-3 gap-6"
                        >
                            {[
                                { name: "Maria Silva", text: "Ver minha avó nos anos 60 foi emocionante. O presente de família mais criativo que já fiz!" },
                                { name: "João Pedro", text: "Eu não acreditei na qualidade. Parecia que eu tinha viajado no tempo. Usei as 6 fotos no meu feed e viralizei!" },
                                { name: "Ana Costa", text: "Achei a qualidade absurda e a entrega super rápida. O suporte foi atencioso. Recomendo 100%." },
                            ].map((t) => (
                                <motion.figure
                                    variants={itemVariants}
                                    key={t.name}
                                    className="bg-white rounded-lg p-6 shadow-xl border-t-4 border-brand-orange/50"
                                >
                                    <div className="text-amber-500 mb-2 text-xl" aria-hidden>★★★★★</div>
                                    <blockquote className="font-body text-brand-brown/80 italic text-lg">“{t.text}”</blockquote>
                                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-brand-brown/10">
                                        <div className="w-10 h-10 rounded-full bg-brand-blue/20 grid place-items-center font-display text-brand-brown/70 text-lg">
                                            {t.name[0]}
                                        </div>
                                        <figcaption className="font-body font-bold text-brand-brown">{t.name}</figcaption>
                                    </div>
                                </motion.figure>
                            ))}
                        </motion.div>
                    </div>
                </section>


                {/* FAQ (accordion nativo) - Animação de entrada nas perguntas */}
                <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <motion.h2
                        {...fadeUp(0)}
                        viewport={{ once: true, amount: 0.5 }}
                        className="font-display text-4xl md:text-5xl text-brand-brown text-center mb-10"
                    >
                        Perguntas que mais ouvimos
                    </motion.h2>
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={containerVariants}
                        className="space-y-3"
                    >
                        {[
                            ["Quanto tempo leva para gerar as imagens?", "Geralmente 2 a 3 minutos após o pagamento. Você recebe um link de download por e-mail imediatamente."],
                            ["Como funciona a privacidade dos meus dados?", "Sua privacidade é prioridade. Não armazenamos suas fotos permanentemente e não treinamos nossa IA com elas. Você pode apagar todos os dados com 1 clique."],
                            ["Quais os requisitos de foto?", "Aceitamos JPG e PNG. A foto deve ter no mínimo 1024 px e o rosto deve estar visível e bem iluminado para a IA gerar o melhor resultado."],
                            ["Quais são as formas de pagamento?", "Aceitamos Pix, Cartão de Crédito, Apple Pay e Google Pay. Checkout 100% seguro."],
                            ["Se eu não gostar do resultado, tenho garantia?", "Sim. Oferecemos 1 ajuste gratuito na imagem que você desejar em até 24 horas após a entrega do álbum."],
                        ].map(([q, a]) => (
                            <motion.details variants={itemVariants} key={q} className="bg-white rounded-lg p-5 shadow-md group border border-brand-blue/10">
                                <summary className="font-body font-bold text-brand-brown cursor-pointer list-none flex items-center justify-between">
                                    {q}
                                    <motion.span
                                        className="text-brand-blue transition-transform"
                                        animate={{ rotate: "group-open" ? 45 : 0 }}
                                    >
                                        ＋
                                    </motion.span>
                                </summary>
                                <motion.div
                                    className="mt-3 font-body text-brand-brown/75 prose max-w-none"
                                >
                                    {a}
                                </motion.div>
                            </motion.details>
                        ))}
                    </motion.div>
                </section>

                {/* Afiliados - Retained logic, slightly enhanced design */}
                <section className="bg-brand-blue py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-vintage-paper">
                        <motion.h2 {...fadeUp(0)} whileInView={{ scale: 1 }} viewport={{ once: true }} className="font-display text-4xl md:text-5xl mb-4">
                            Parceria para Grupos
                        </motion.h2>
                        <motion.p {...fadeUp(0.2)} whileInView={{ scale: 1 }} viewport={{ once: true }} className="font-body text-lg mb-8">
                            Tem uma comunidade, grupo de amigos ou rede? Ganhe comissões indicando a Ferrer Image.
                        </motion.p>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.5 }}
                            variants={containerVariants}
                            className="bg-vintage-paper/10 rounded-xl p-6 max-w-md mx-auto mb-8 shadow-inner"
                        >
                            <div className="font-display text-4xl mb-1 text-brand-orange">R$ 638,40</div>
                            <p className="font-body text-sm/relaxed opacity-80 mb-4">Exemplo de comissão com apenas 100 vendas (40% de comissão)</p>

                            <motion.ul variants={containerVariants} className="text-left max-w-xs mx-auto space-y-2 font-body">
                                <motion.li variants={itemVariants}>✓ Link exclusivo e rastreável</motion.li>
                                <motion.li variants={itemVariants}>✓ 20% off automático para seus membros</motion.li>
                                <motion.li variants={itemVariants}>✓ Comissões de até 40%</motion.li>
                                <motion.li variants={itemVariants}>✓ Painel com cliques e vendas em tempo real</motion.li>
                            </motion.ul>
                        </motion.div>

                        <motion.a
                            {...fadeUp(0.6)}
                            href="https://wa.me/555198030797?text=Quero%20ser%20parceiro%20Ferrer%20Image"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block font-body text-lg bg-vintage-paper text-brand-blue px-7 py-3 rounded-full font-bold shadow-lg"
                        >
                            Fale com a Parceria no WhatsApp
                        </motion.a>
                    </div>
                </section>
            </div>


            {/* CTA Fixo Mobile */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-vintage-paper border-t border-brand-brown/20 p-4 shadow-2xl">
                <motion.button
                    data-cta="mobile-sticky"
                    onClick={onGetStarted}
                    whileTap={{ scale: 0.98 }}
                    className="w-full font-body text-lg bg-brand-brown text-vintage-paper px-6 py-3 rounded-full hover:bg-opacity-90 transition-all shadow-lg"
                >
                    Gerar minhas 6 eras {discountPercent ? <span className="ml-1">• {discountPercent}%</span> : null}
                </motion.button>
            </div>

            {/* Footer */}
            <footer className="bg-brand-brown text-vintage-paper py-12 mb-16 md:mb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <motion.div {...fadeUp(0)} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
                            <h3 className="font-display text-xl mb-3">Ferrer Image</h3>
                            <p className="font-body text-sm opacity-70">
                                Transforme suas fotos em viagens no tempo com a magia da IA.
                            </p>
                        </motion.div>
                        <motion.div {...fadeUp(0.1)} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
                            <h4 className="font-body font-bold mb-3">Legal</h4>
                            <ul className="space-y-2 font-body text-sm">
                                <li><a href="#" className="opacity-70 hover:opacity-100 transition-opacity">Política de privacidade</a></li>
                                <li><a href="#" className="opacity-70 hover:opacity-100 transition-opacity">Termos de uso</a></li>
                                <li><a href="#" className="opacity-70 hover:opacity-100 transition-opacity">LGPD & Proteção de Dados</a></li>
                            </ul>
                        </motion.div>
                        <motion.div {...fadeUp(0.2)} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}>
                            <h4 className="font-body font-bold mb-3">Contato</h4>
                            <ul className="space-y-2 font-body text-sm">
                                <li className="opacity-70">ferrerrstudio@gmail.com</li>
                                <li><a href="https://wa.me/555198030797" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">Suporte WhatsApp</a></li>
                                <li><a href="https://www.instagram.com/duda.ferrer/" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">Instagram Oficial</a></li>
                            </ul>
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