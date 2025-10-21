/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { PayPalButtons } from "@paypal/react-paypal-js";
import type { PaymentRequest } from '../App';
import { calculateDiscount, getRefGroupName } from '../lib/affiliateUtils';
import analytics from '../services/analyticsService';

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
    onPaymentSuccess: (email: string) => void;
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

    const BASE_PRICE = parseFloat(price);
    const [pricing, setPricing] = useState(calculateDiscount(BASE_PRICE));
    const [refGroupName, setRefGroupName] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        if (emailError && validateEmail(value)) {
            setEmailError('');
        }
    };

    useEffect(() => {
      setPricing(calculateDiscount(BASE_PRICE));
      setRefGroupName(getRefGroupName());
    }, [BASE_PRICE]);

    // Prevent background scroll when modal is open
    useEffect(() => {
        if (request) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [request]);

    return (
        <AnimatePresence>
            {request && (
                <motion.div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
                    onClick={onClose}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={backdropVariants}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="relative w-full max-w-md bg-vintage-paper rounded-lg shadow-2xl p-8 flex flex-col items-center text-center font-body text-brand-brown my-auto"
                        onClick={(e) => e.stopPropagation()}
                        variants={modalVariants}
                        exit="exit"
                    >
                        <h2 className="font-display text-4xl mb-2">Confirm Purchase</h2>
                        <p className="text-brand-brown/70 mb-6">Complete your payment to download your image(s).</p>

                        <div className="space-y-4">
                          {pricing.hasDiscount && refGroupName && (
                            <div className="bg-brand-orange/10 border-2 border-brand-orange/30 rounded-lg p-3 text-center">
                              <div className="text-brand-orange font-heading text-lg font-bold">
                                🎉 {pricing.discountPercent}% OFF por {refGroupName}
                              </div>
                            </div>
                          )}

                          <div className="w-full bg-white/60 rounded-md p-4 mb-6 text-left">
                              <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold">{description}</span>
                                  <span className="font-bold">${price}</span>
                              </div>
                               <p className="text-sm text-brand-brown/60">One-time payment</p>
                          </div>
                        </div>

                        {/* Email Input */}
                        <div className="w-full mb-6">
                            <label htmlFor="email" className="block font-body font-bold text-brand-brown mb-2 text-left">
                                Email para receber suas imagens:
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={handleEmailChange}
                                placeholder="seu@email.com"
                                className="w-full px-4 py-3 rounded-md bg-white font-body text-brand-brown placeholder-brand-brown/40 border-2 border-brand-brown/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all"
                                required
                            />
                            {emailError && (
                                <p className="mt-2 text-sm text-brand-red font-body">{emailError}</p>
                            )}
                            <p className="mt-2 text-xs text-brand-brown/60 font-body">
                                📧 Suas imagens sem marca d'água serão enviadas para este email em até 5 minutos
                            </p>
                        </div>

                        <div className="w-full">
                            <PayPalButtons
                                style={{ layout: "vertical", shape: 'rect', label: 'pay' }}
                                createOrder={(data, actions) => {
                                    if (!email || !validateEmail(email)) {
                                        setEmailError('Por favor, insira um email válido para receber suas imagens.');
                                        return Promise.reject(new Error('Invalid email'));
                                    }
                                    setEmailError('');
                                    analytics.trackPaymentInitiated(pricing.discountedPrice.toFixed(2), 'USD');
                                    return actions.order.create({
                                        purchase_units: [{
                                            description: description,
                                            amount: {
                                                currency_code: "USD",
                                                value: pricing.discountedPrice.toFixed(2),
                                            }
                                        }]
                                    });
                                }}
                                onApprove={async (data, actions) => {
                                    try {
                                        const order = await actions.order.capture();
                                        if (order && order.status === 'COMPLETED') {
                                            analytics.trackPaymentCompleted(pricing.discountedPrice.toFixed(2), 'USD', data.orderID);
                                            onPaymentSuccess(email);
                                        }
                                    } catch (error) {
                                        console.error("Error capturing order: ", error);
                                        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                                        analytics.trackPaymentFailed(errorMsg);
                                        alert("There was an issue confirming your payment. Please try again.");
                                    } finally {
                                        onClose();
                                    }
                                }}
                                onError={(err) => {
                                    console.error("PayPal Checkout onError", err);
                                    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                                    analytics.trackPaymentFailed(errorMsg);
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

                        <div className="flex justify-between items-center text-brand-brown font-bold text-xl mt-4 pt-4 border-t border-brand-brown/20">
                          <span>Total:</span>
                          <div className="flex flex-col items-end">
                            {pricing.hasDiscount && (
                              <span className="text-sm text-brand-brown/50 line-through font-normal">
                                R$ {BASE_PRICE.toFixed(2)}
                              </span>
                            )}
                            <span className={pricing.hasDiscount ? 'text-brand-orange' : ''}>
                              R$ {pricing.discountedPrice.toFixed(2)}
                            </span>
                          </div>
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