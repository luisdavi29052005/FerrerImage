/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PayPalButtons } from "@paypal/react-paypal-js";
import type { PaymentRequest } from '../App';

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

interface PaymentModalProps {
    request: PaymentRequest | null;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

const PRICES = {
    single: '0.99',
    album: '3.99'
};

const PaymentModal: React.FC<PaymentModalProps> = ({ request, onClose, onPaymentSuccess }) => {
    
    const price = request ? PRICES[request.type] : '0.00';
    const description = request?.type === 'single'
        ? `Single Image Download - ${request.decade}`
        : 'Full Album Download';

    return (
        <AnimatePresence>
            {request && (
                <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={onClose}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={backdropVariants}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="relative w-full max-w-md bg-vintage-paper rounded-lg shadow-2xl p-8 flex flex-col items-center text-center font-body text-brand-brown"
                        onClick={(e) => e.stopPropagation()}
                        variants={modalVariants}
                        exit="exit"
                    >
                        <h2 className="font-display text-4xl mb-2">Confirm Purchase</h2>
                        <p className="text-brand-brown/70 mb-6">Complete your payment to download your image(s).</p>
                        
                        <div className="w-full bg-white/60 rounded-md p-4 mb-6 text-left">
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-bold">{description}</span>
                                <span className="font-bold">${price}</span>
                            </div>
                             <p className="text-sm text-brand-brown/60">One-time payment</p>
                        </div>
                        
                        <div className="w-full">
                            <PayPalButtons
                                style={{ layout: "vertical", shape: 'rect', label: 'pay' }}
                                createOrder={(data, actions) => {
                                    return actions.order.create({
                                        purchase_units: [{
                                            description: description,
                                            amount: {
                                                currency_code: "USD",
                                                value: price,
                                            }
                                        }]
                                    });
                                }}
                                onApprove={async (data, actions) => {
                                    try {
                                        const order = await actions.order.capture();
                                        console.log("Payment successful:", order);
                                        onPaymentSuccess();
                                    } catch (error) {
                                        console.error("Error capturing order: ", error);
                                        alert("There was an issue confirming your payment. Please try again.");
                                    } finally {
                                        onClose();
                                    }
                                }}
                                onError={(err) => {
                                    console.error("PayPal Error:", err);
                                    alert("An error occurred with your payment. Please try again or use a different payment method.");
                                    onClose();
                                }}
                                onCancel={() => {
                                    console.log("Payment cancelled by user.");
                                    onClose();
                                }}
                                key={request.type + (request.decade || '')} // Force re-render on request change
                            />
                        </div>

                         <button
                            onClick={onClose}
                            className="absolute top-2 right-2 text-brand-brown/50 hover:text-brand-brown transition-transform duration-300 hover:scale-125 z-50"
                            aria-label="Close payment modal"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PaymentModal;