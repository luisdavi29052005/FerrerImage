/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, ChangeEvent, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDecadeImage } from './services/geminiService';
import PolaroidCard from './components/PolaroidCard';
import { createAlbumPage } from './lib/albumUtils';
import Footer from './components/Footer';
import FullscreenModal from './components/FullscreenModal';
import PaymentModal from './components/PaymentModal';
import LandingPage from './components/LandingPage';
import NewLandingPage from './components/NewLandingPage';
import PrivacyPolicy from './components/PrivacyPolicy';
import { sendSingleImageByEmail, sendAlbumByEmail } from './services/emailService';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { captureReferralFromURL } from './lib/affiliateUtils';


const DECADES = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s'];

type ImageStatus = 'pending' | 'done' | 'error';

// Capturar referência na inicialização
if (typeof window !== 'undefined') {
  captureReferralFromURL();
}
interface GeneratedImage {
    status: ImageStatus;
    url?: string;
    error?: string;
}

export interface PaymentRequest {
    type: 'single' | 'album';
    decade?: string;
}

const primaryButtonClasses = "font-body text-lg text-center text-vintage-paper bg-brand-brown py-3 px-8 rounded-md transition-all duration-300 shadow-md hover:shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-orange/50";
const secondaryButtonClasses = "font-body text-lg text-center text-brand-brown bg-transparent border-2 border-brand-blue py-3 px-8 rounded-md transition-all duration-300 hover:bg-brand-blue hover:text-vintage-paper focus:outline-none focus:ring-2 focus:ring-brand-blue/50";

const PAYPAL_CLIENT_ID = "AYucRh_ucyNSFRytjKrlIVxnPcW0RB5ORyRi6Vzb_9JEurBauAWQTDDd7_fXp0Yl-7MvHCg2fV4G9MTd";

const useMediaQuery = (query: string) => {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, [matches, query]);
    return matches;
};

function App() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<Record<string, GeneratedImage>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [appState, setAppState] = useState<'new-landing' | 'landing' | 'privacy-policy' | 'idle' | 'image-uploaded' | 'generating' | 'results-shown'>('new-landing');
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [confirmationMessage, setConfirmationMessage] = useState<string>('');
    const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

    const isMobile = useMediaQuery('(max-width: 768px)');


    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setAppState('image-uploaded');
                setGeneratedImages({}); // Clear previous results
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateClick = async () => {
        if (!uploadedImage) return;

        setIsLoading(true);
        setAppState('generating');
        
        const initialImages: Record<string, GeneratedImage> = {};
        DECADES.forEach(decade => {
            initialImages[decade] = { status: 'pending' };
        });
        setGeneratedImages(initialImages);

        const concurrencyLimit = 2; // Process two decades at a time
        const decadesQueue = [...DECADES];

        const processDecade = async (decade: string) => {
            try {
                const prompt = `Reimagine the person in this photo in the style of the ${decade}. This includes clothing, hairstyle, photo quality, and the overall aesthetic of that decade. The output must be a photorealistic image showing the person clearly.`;
                const resultUrl = await generateDecadeImage(uploadedImage, prompt);
                setGeneratedImages(prev => ({
                    ...prev,
                    [decade]: { status: 'done', url: resultUrl },
                }));
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
                setGeneratedImages(prev => ({
                    ...prev,
                    [decade]: { status: 'error', error: errorMessage },
                }));
                console.error(`Failed to generate image for ${decade}:`, err);
            }
        };

        const workers = Array(concurrencyLimit).fill(null).map(async () => {
            while (decadesQueue.length > 0) {
                const decade = decadesQueue.shift();
                if (decade) {
                    await processDecade(decade);
                }
            }
        });

        await Promise.all(workers);

        setIsLoading(false);
        setAppState('results-shown');
    };

    const handleRegenerateDecade = async (decade: string) => {
        if (!uploadedImage) return;

        if (generatedImages[decade]?.status === 'pending') {
            return;
        }
        
        console.log(`Regenerating image for ${decade}...`);

        setGeneratedImages(prev => ({
            ...prev,
            [decade]: { status: 'pending' },
        }));

        try {
            const prompt = `Reimagine the person in this photo in the style of the ${decade}. This includes clothing, hairstyle, photo quality, and the overall aesthetic of that decade. The output must be a photorealistic image showing the person clearly.`;
            const resultUrl = await generateDecadeImage(uploadedImage, prompt);
            setGeneratedImages(prev => ({
                ...prev,
                [decade]: { status: 'done', url: resultUrl },
            }));
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setGeneratedImages(prev => ({
                ...prev,
                [decade]: { status: 'error', error: errorMessage },
            }));
            console.error(`Failed to regenerate image for ${decade}:`, err);
        }
    };
    
    const handleReset = () => {
        setUploadedImage(null);
        setGeneratedImages({});
        setAppState('idle');
    };

    const handleDownloadIndividualImage = (decade: string) => {
        const image = generatedImages[decade];
        if (image?.status === 'done' && image.url) {
            setPaymentRequest({ type: 'single', decade });
        }
    };

    const handleDownloadAlbum = () => {
        // FIX: Explicitly type `img` as `GeneratedImage` to resolve an issue where it was inferred as `unknown`.
        const generatedCount = Object.values(generatedImages).filter((img: GeneratedImage) => img.status === 'done').length;
        if (generatedCount > 0) {
            setPaymentRequest({ type: 'album' });
        } else {
            alert("Please wait for at least one image to finish generating.");
        }
    };
    
    const handlePaymentSuccess = useCallback(async () => {
        if (!paymentRequest) return;
        if (!userEmail) {
            alert("Error: User email not found. Please start over.");
            setPaymentRequest(null);
            handleReset(); 
            return;
        }

        setPaymentRequest(null); // Close modal immediately
        setConfirmationMessage('Processing your images and sending them to your email...');
        setShowConfirmation(true);

        // Hide processing message after a bit to show success message
        setTimeout(() => setShowConfirmation(false), 4000);

        try {
            if (paymentRequest.type === 'single' && paymentRequest.decade) {
                const decade = paymentRequest.decade;
                const image = generatedImages[decade];
                if (image?.status === 'done' && image.url) {
                    await sendSingleImageByEmail(userEmail, image.url, decade);
                    setConfirmationMessage(`Success! Your ${decade} image has been sent to ${userEmail}.`);
                } else {
                    throw new Error("Could not find the generated image to send.");
                }
            } else if (paymentRequest.type === 'album') {
                const imageData = Object.entries(generatedImages)
                    .filter(([, image]: [string, GeneratedImage]) => image.status === 'done' && image.url)
                    .reduce((acc, [decade, image]: [string, GeneratedImage]) => {
                        if (image.url) {
                          acc[decade] = image.url;
                        }
                        return acc;
                    }, {} as Record<string, string>);

                if (Object.keys(imageData).length === 0) {
                    throw new Error("No images were generated successfully to create an album.");
                }

                const albumDataUrl = await createAlbumPage(imageData);
                await sendAlbumByEmail(userEmail, albumDataUrl);
                setConfirmationMessage(`Success! Your album has been sent to ${userEmail}.`);
            }
            setShowConfirmation(true); // Show success message
        } catch (error) {
            console.error("Failed to process and send images:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            setConfirmationMessage(`Error: ${errorMessage}`);
            setShowConfirmation(true);
        } finally {
            // Hide final message after a longer delay
            setTimeout(() => setShowConfirmation(false), 10000);
        }
    }, [paymentRequest, generatedImages, userEmail]);

    const handleClosePaymentModal = useCallback(() => {
        setPaymentRequest(null);
    }, []);


    const handleOpenFullscreen = (imageUrl: string) => {
        setFullscreenImage(imageUrl);
    };

    const handleCloseFullscreen = () => {
        setFullscreenImage(null);
    };

    const handleLandingSubmit = (email: string) => {
        setUserEmail(email);
        setAppState('idle');
    };

    const handleShowPrivacyPolicy = () => {
        setAppState('privacy-policy');
    };

    const handleBackToLanding = () => {
        setAppState('landing');
    }

    const handleGetStarted = () => {
        setAppState('landing');
    }
    
    if (!PAYPAL_CLIENT_ID) {
        return (
            <main className="bg-vintage-paper text-brand-brown min-h-screen w-full flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-4xl font-display text-brand-red">Configuration Error</h1>
                    <p className="mt-4 font-body text-lg">
                        The payment system is not configured correctly.
                    </p>
                </div>
            </main>
        );
    }

    return (
        <PayPalScriptProvider options={{ 'client-id': PAYPAL_CLIENT_ID, currency: "USD", intent: "capture" }}>
            <main className="bg-vintage-paper bg-paper-texture text-brand-brown min-h-screen w-full flex flex-col items-center justify-center p-4 pb-24 overflow-x-hidden relative">
                <AnimatePresence>
                    {showConfirmation && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: -50, x: '-50%' }}
                            transition={{ type: 'spring' }}
                            className="fixed top-4 left-1/2 z-[100] bg-brand-blue text-vintage-paper font-body text-lg py-3 px-6 rounded-md shadow-lg"
                        >
                            {confirmationMessage}
                        </motion.div>
                    )}
                </AnimatePresence>
                <div className="z-10 flex flex-col items-center justify-center w-full h-full flex-1 min-h-0 container mx-auto">
                    <AnimatePresence mode="wait">
                        {appState === 'new-landing' && (
                             <motion.div
                                key="new-landing"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5 }}
                                className="w-full"
                             >
                                <NewLandingPage onGetStarted={handleGetStarted} />
                             </motion.div>
                        )}
                        {appState === 'landing' && (
                             <motion.div
                                key="landing"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5 }}
                             >
                                <LandingPage onSubmitSuccess={handleLandingSubmit} onShowPrivacyPolicy={handleShowPrivacyPolicy} />
                             </motion.div>
                        )}
                         {appState === 'privacy-policy' && (
                             <motion.div
                                key="privacy"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.5 }}
                                className="w-full"
                             >
                                <PrivacyPolicy onBack={handleBackToLanding} />
                             </motion.div>
                        )}
                        {appState !== 'landing' && appState !== 'privacy-policy' && (
                            <motion.div
                                key="app-content"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="w-full h-full flex flex-col items-center justify-center"
                            >
                                <header className="text-center mb-12">
                                    <h1 className="text-6xl md:text-8xl font-display">Image Ferrer</h1>
                                    <p className="text-brand-blue mt-2 text-xl tracking-wider uppercase font-body">Travel through time with a single photo.</p>
                                </header>

                                <AnimatePresence mode="wait">
                                    {appState === 'idle' && (
                                        <motion.div
                                            key="idle"
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.5, type: 'spring' }}
                                            className="flex flex-col items-center w-full max-w-md"
                                        >
                                            <label htmlFor="file-upload" className="w-full cursor-pointer group transition-transform duration-300">
                                                <div className="border-2 border-dashed border-brand-brown/50 rounded-lg p-8 text-center bg-vintage-paper/50 hover:bg-white/50 hover:border-brand-brown transition-colors duration-300 flex flex-col items-center justify-center aspect-square">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-brand-brown/70 group-hover:text-brand-brown transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2m-4-2h8m4 14v2m-4-2h8" />
                                                    </svg>
                                                    <span className="font-display text-2xl mt-4 text-brand-brown">Upload a Photo</span>
                                                    <p className="mt-2 font-body text-brand-brown/70">Click or drag your image here to begin.</p>
                                                </div>
                                            </label>
                                            <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} />
                                             <p className="mt-8 font-body text-brand-brown/80 text-center max-w-xs text-lg">
                                                Choose a clear, well-lit photo of a face for the best results.
                                            </p>
                                        </motion.div>
                                    )}

                                    {appState === 'image-uploaded' && uploadedImage && (
                                        <motion.div
                                            key="uploaded"
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -50 }}
                                            transition={{ duration: 0.5 }}
                                            className="flex flex-col items-center gap-6"
                                        >
                                             <PolaroidCard 
                                                imageUrl={uploadedImage} 
                                                caption="Your Photo" 
                                                status="done"
                                             />
                                             <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                                                <button onClick={handleReset} className={secondaryButtonClasses}>
                                                    Different Photo
                                                </button>
                                                <button onClick={handleGenerateClick} className={primaryButtonClasses}>
                                                    Generate
                                                </button>
                                             </div>
                                        </motion.div>
                                    )}

                                    {(appState === 'generating' || appState === 'results-shown') && (
                                        <motion.div
                                            key="results"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="w-full"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
                                                {DECADES.map((decade, index) => (
                                                     <motion.div
                                                        key={decade}
                                                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: index * 0.1 }}
                                                     >
                                                         <PolaroidCard
                                                            caption={decade}
                                                            status={generatedImages[decade]?.status || 'pending'}
                                                            imageUrl={generatedImages[decade]?.url}
                                                            error={generatedImages[decade]?.error}
                                                            onRegenerate={handleRegenerateDecade}
                                                            onDownload={handleDownloadIndividualImage}
                                                            onView={handleOpenFullscreen}
                                                            isMobile={isMobile}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </div>
                                             <div className="h-20 mt-8 flex items-center justify-center">
                                                {appState === 'results-shown' && (
                                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                                        <button 
                                                            onClick={handleDownloadAlbum} 
                                                            className={`${primaryButtonClasses} disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        >
                                                            Get Album by Email
                                                        </button>
                                                        <button onClick={handleReset} className={secondaryButtonClasses}>
                                                            Start Over
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {appState !== 'new-landing' && appState !== 'landing' && appState !== 'privacy-policy' && <Footer />}
                <FullscreenModal imageUrl={fullscreenImage} onClose={handleCloseFullscreen} />
                <PaymentModal 
                    request={paymentRequest}
                    onClose={handleClosePaymentModal}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            </main>
        </PayPalScriptProvider>
    );
}

export default App;