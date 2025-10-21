
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getRefGroupName } from '../lib/affiliateUtils';

interface NewLandingPageProps {
    onGetStarted: () => void;
}

const NewLandingPage: React.FC<NewLandingPageProps> = ({ onGetStarted }) => {
    const [refGroupName, setRefGroupName] = useState<string | null>(null);

    useEffect(() => {
        const groupName = getRefGroupName();
        setRefGroupName(groupName);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="w-full bg-vintage-paper">
            {/* Banner de Desconto */}
            {refGroupName && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-brand-orange text-vintage-paper py-2 px-4 text-center font-body text-sm"
                >
                    🎉 Você ganhou 20% de desconto, cortesia de {refGroupName}. Cupom auto aplicado!
                </motion.div>
            )}

            {/* Header Fixo */}
            <header className="sticky top-0 z-50 bg-vintage-paper/95 backdrop-blur-sm border-b border-brand-brown/10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="font-display text-2xl text-brand-brown">Image Ferrer</div>
                    <nav className="hidden md:flex items-center gap-6">
                        <button onClick={() => scrollToSection('examples')} className="font-body text-brand-brown hover:text-brand-blue transition-colors">
                            Ver exemplos
                        </button>
                        <button onClick={() => scrollToSection('pricing')} className="font-body text-brand-brown hover:text-brand-blue transition-colors">
                            Preço
                        </button>
                        <button onClick={() => scrollToSection('faq')} className="font-body text-brand-brown hover:text-brand-blue transition-colors">
                            FAQ
                        </button>
                        <button
                            onClick={onGetStarted}
                            className="font-body bg-brand-brown text-vintage-paper px-6 py-2 rounded-md hover:bg-opacity-90 transition-all shadow-md"
                        >
                            Gerar minhas 6 eras
                            {refGroupName && <span className="ml-2 text-xs">20% off</span>}
                        </button>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="text-center max-w-4xl mx-auto">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-display text-5xl md:text-7xl text-brand-brown mb-6"
                    >
                        Transforme 1 foto em 6 versões de épocas diferentes, em minutos
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-body text-xl md:text-2xl text-brand-brown/80 mb-8"
                    >
                        Pré-visualização gratuita, desconto automático no seu link, entrega segura.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <button
                            onClick={onGetStarted}
                            className="font-body text-lg bg-brand-brown text-vintage-paper px-8 py-4 rounded-md hover:bg-opacity-90 transition-all shadow-lg w-full sm:w-auto"
                        >
                            Gerar minhas 6 eras
                        </button>
                        <button
                            onClick={() => scrollToSection('examples')}
                            className="font-body text-lg border-2 border-brand-blue text-brand-brown px-8 py-4 rounded-md hover:bg-brand-blue hover:text-vintage-paper transition-all w-full sm:w-auto"
                        >
                            Ver exemplos reais
                        </button>
                    </motion.div>

                    {/* Microconfiança */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-brand-brown/70 font-body"
                    >
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Privacidade garantida
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Checkout seguro
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                            Suporte em português
                        </div>
                    </motion.div>
                </div>

                {/* Visual de Polaroids */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
                >
                    {['1950s', '1960s', '1970s', '1980s', '1990s', '2000s'].map((decade, i) => (
                        <div key={decade} className="bg-white p-3 shadow-lg transform rotate-1 hover:rotate-0 transition-transform">
                            <div className="bg-gray-200 aspect-square rounded flex items-center justify-center">
                                <span className="font-handwriting text-2xl text-gray-400">{decade}</span>
                            </div>
                            <div className="mt-2 font-handwriting text-center text-brand-brown">{decade}</div>
                        </div>
                    ))}
                </motion.div>
            </section>

            {/* Prova Social */}
            <section className="bg-brand-blue/5 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="font-display text-4xl text-brand-brown">+3.200</div>
                            <div className="font-body text-brand-brown/70 mt-1">Álbuns gerados</div>
                        </div>
                        <div>
                            <div className="font-display text-4xl text-brand-brown">4.9/5</div>
                            <div className="font-body text-brand-brown/70 mt-1">Avaliação média</div>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <div className="font-display text-4xl text-brand-brown">2-3min</div>
                            <div className="font-body text-brand-brown/70 mt-1">Tempo de entrega</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Como Funciona */}
            <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="font-display text-4xl md:text-5xl text-brand-brown text-center mb-12">
                    Como funciona
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-vintage-paper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <h3 className="font-display text-2xl text-brand-brown mb-2">1. Envie sua foto</h3>
                        <p className="font-body text-brand-brown/70">Upload rápido e seguro da sua melhor foto</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-vintage-paper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="font-display text-2xl text-brand-brown mb-2">2. Veja a prévia grátis</h3>
                        <p className="font-body text-brand-brown/70">Prévia com marca d'água antes de comprar</p>
                    </div>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-vintage-paper" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="font-display text-2xl text-brand-brown mb-2">3. Receba seu álbum</h3>
                        <p className="font-body text-brand-brown/70">6 imagens em alta qualidade no seu email</p>
                    </div>
                </div>
            </section>

            {/* Exemplos */}
            <section id="examples" className="bg-brand-blue/5 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-display text-4xl md:text-5xl text-brand-brown text-center mb-12">
                        Veja a mágica acontecer
                    </h2>
                    <div className="text-center text-brand-brown/60 font-body">
                        <p>Exemplos de transformações serão exibidos aqui</p>
                    </div>
                </div>
            </section>

            {/* Preço e Benefícios */}
            <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-xl p-8 border-2 border-brand-blue">
                        <h2 className="font-display text-3xl text-brand-brown text-center mb-6">
                            Álbum com 6 imagens
                        </h2>
                        <div className="text-center mb-8">
                            {refGroupName ? (
                                <>
                                    <div className="text-2xl text-brand-brown/50 line-through">R$ 19,90</div>
                                    <div className="font-display text-5xl text-brand-brown mb-2">R$ 15,92</div>
                                    <div className="inline-block bg-brand-orange text-vintage-paper px-3 py-1 rounded-full text-sm font-body">
                                        20% off de {refGroupName} aplicado
                                    </div>
                                </>
                            ) : (
                                <div className="font-display text-5xl text-brand-brown">R$ 19,90</div>
                            )}
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-brand-blue flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-body text-brand-brown">Entrega rápida em 2-3 minutos</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-brand-blue flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-body text-brand-brown">Imagens em alta resolução</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-brand-blue flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-body text-brand-brown">Uso livre em redes sociais</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <svg className="w-6 h-6 text-brand-blue flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="font-body text-brand-brown">1 ajuste gratuito em até 24 horas</span>
                            </li>
                        </ul>
                        <button
                            onClick={onGetStarted}
                            className="w-full font-body text-lg bg-brand-brown text-vintage-paper px-8 py-4 rounded-md hover:bg-opacity-90 transition-all shadow-lg"
                        >
                            Gerar minhas 6 eras agora
                        </button>
                        <p className="text-center text-sm text-brand-brown/60 mt-4 font-body">
                            Garantia: Se não estiver satisfeito, peça 1 revisão em até 24 horas
                        </p>
                    </div>
                </div>
            </section>

            {/* Depoimentos */}
            <section className="bg-brand-blue/5 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="font-display text-4xl md:text-5xl text-brand-brown text-center mb-12">
                        O que dizem nossos clientes
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { name: 'Maria Silva', text: 'Amei ver minha avó nos anos 60, ficou perfeito!' },
                            { name: 'João Pedro', text: 'Resultado incrível! Parece que viajei no tempo de verdade.' },
                            { name: 'Ana Costa', text: 'Qualidade surpreendente e entrega super rápida.' }
                        ].map((testimonial, i) => (
                            <div key={i} className="bg-white rounded-lg p-6 shadow-md">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-brand-blue/20 rounded-full flex items-center justify-center">
                                        <span className="font-display text-xl text-brand-brown">{testimonial.name[0]}</span>
                                    </div>
                                    <div className="font-body font-bold text-brand-brown">{testimonial.name}</div>
                                </div>
                                <p className="font-body text-brand-brown/80 italic">"{testimonial.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <h2 className="font-display text-4xl md:text-5xl text-brand-brown text-center mb-12">
                    Perguntas frequentes
                </h2>
                <div className="space-y-6">
                    {[
                        {
                            q: 'Quanto tempo leva?',
                            a: 'Geralmente 2 a 3 minutos após o pagamento.'
                        },
                        {
                            q: 'Como funciona a privacidade?',
                            a: 'Não treinamos IA com suas fotos sem consentimento. Você pode apagar com 1 clique.'
                        },
                        {
                            q: 'Quais tamanhos e formatos aceitos?',
                            a: 'Aceitamos JPG e PNG, mínimo 1024 px.'
                        },
                        {
                            q: 'Formas de pagamento?',
                            a: 'Pix, cartão, Apple Pay, Google Pay.'
                        },
                        {
                            q: 'Como funciona o suporte?',
                            a: 'Resposta em até 1 hora no horário comercial.'
                        }
                    ].map((faq, i) => (
                        <div key={i} className="bg-white rounded-lg p-6 shadow-md">
                            <h3 className="font-body font-bold text-lg text-brand-brown mb-2">{faq.q}</h3>
                            <p className="font-body text-brand-brown/70">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Chamada para Afiliados */}
            <section className="bg-brand-blue py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-display text-4xl md:text-5xl text-vintage-paper mb-6">
                        Tem grupo de fotos?
                    </h2>
                    <p className="font-body text-xl text-vintage-paper/90 mb-8">
                        Ganhe comissões indicando a Image Ferrer
                    </p>
                    <ul className="text-left max-w-md mx-auto mb-8 space-y-2 text-vintage-paper/90 font-body">
                        <li>✓ Link exclusivo para seu grupo</li>
                        <li>✓ 20% de desconto automático para membros</li>
                        <li>✓ Comissões até 40%</li>
                        <li>✓ Painel para acompanhar cliques e vendas</li>
                    </ul>
                    <button className="font-body text-lg bg-vintage-paper text-brand-blue px-8 py-4 rounded-md hover:bg-opacity-90 transition-all shadow-lg">
                        Quero ser parceiro
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-brand-brown text-vintage-paper py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="font-display text-xl mb-4">Image Ferrer</h3>
                            <p className="font-body text-sm text-vintage-paper/70">
                                Transforme suas fotos em viagens no tempo.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-body font-bold mb-4">Links</h4>
                            <ul className="space-y-2 font-body text-sm">
                                <li><a href="#" className="text-vintage-paper/70 hover:text-vintage-paper">Política de privacidade</a></li>
                                <li><a href="#" className="text-vintage-paper/70 hover:text-vintage-paper">Termos de uso</a></li>
                                <li><a href="#" className="text-vintage-paper/70 hover:text-vintage-paper">LGPD</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-body font-bold mb-4">Contato</h4>
                            <ul className="space-y-2 font-body text-sm">
                                <li className="text-vintage-paper/70">ferrerrstudio@gmail.com</li>
                                <li><a href="#" className="text-vintage-paper/70 hover:text-vintage-paper">Suporte WhatsApp</a></li>
                                <li><a href="#" className="text-vintage-paper/70 hover:text-vintage-paper">Instagram</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-vintage-paper/20 pt-8 text-center font-body text-sm text-vintage-paper/70">
                        <p>© 2024 Image Ferrer. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default NewLandingPage;
