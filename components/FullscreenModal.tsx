/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
// FIX: Import Variants type from framer-motion to correctly type animation variants.
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface FullscreenModalProps {
    imageUrl: string | null;
    onClose: () => void;
}

const backdropVariants: Variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
};

const modalVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { delay: 0.1, type: 'spring', stiffness: 200, damping: 25 },
    },
    exit: {
        scale: 0.8,
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

const FullscreenModal: React.FC<FullscreenModalProps> = ({ imageUrl, onClose }) => {
    return (
        <AnimatePresence>
            {imageUrl && (
                <motion.div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={backdropVariants}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="relative max-w-[90vw] max-h-[90vh] flex"
                        onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking on image
                        variants={modalVariants}
                        exit="exit"
                    >
                        <img
                            src={imageUrl}
                            alt="Fullscreen view"
                            className="object-contain max-w-full max-h-full rounded-md shadow-2xl"
                        />
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-md flex items-center justify-center">
                            <div className="absolute inset-[-100%] flex flex-wrap gap-x-16 gap-y-12 opacity-20 transform -rotate-45 items-center justify-center">
                                {Array.from({ length: 40 }).map((_, i) => (
                                    <span key={i} className="font-audiowide text-4xl text-white/80 whitespace-nowrap select-none">
                                        Image Ferrer
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                     <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-transform duration-300 hover:scale-125 z-50"
                        aria-label="Close fullscreen view"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default FullscreenModal;