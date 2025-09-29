/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, FormEvent } from 'react';
import { addLead } from '../services/supabaseService';
import { motion } from 'framer-motion';

interface LandingPageProps {
    onSubmitSuccess: (email: string) => void;
    onShowPrivacyPolicy: () => void;
}

const inputClasses = "w-full px-4 py-3 rounded-md bg-white/80 font-body text-brand-brown placeholder-brand-brown/50 border-2 border-brand-brown/30 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all";
const buttonClasses = "w-full font-body text-lg text-center text-vintage-paper bg-brand-brown py-3 px-8 rounded-md transition-all duration-300 shadow-md hover:shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 disabled:opacity-50 disabled:cursor-not-allowed";

const LandingPage: React.FC<LandingPageProps> = ({ onSubmitSuccess, onShowPrivacyPolicy }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [acceptedPolicy, setAcceptedPolicy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!acceptedPolicy) {
            setError("You must accept the Privacy Policy to continue.");
            return;
        }

        setIsLoading(true);

        if (!name.trim() || !email.trim()) {
            setError("Please fill in your name and email.");
            setIsLoading(false);
            return;
        }

        try {
            await addLead({ name, email });
            // Wait a moment to show success before transitioning
            setTimeout(() => {
                onSubmitSuccess(email);
            }, 500);
        } catch (err) {
            setError("Something went wrong. Please try again later.");
            console.error(err);
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto p-8 bg-vintage-paper/70 rounded-lg shadow-xl border border-brand-brown/10">
            <header className="text-center mb-8">
                <h1 className="text-5xl md:text-6xl font-display text-brand-brown">Image Ferrer</h1>
                <p className="text-brand-blue mt-2 text-lg tracking-wider font-body">Step into the Time Machine</p>
            </header>
            <p className="text-center font-body text-brand-brown/80 mb-8 text-lg">
                Ready to see yourself in a different era? Enter your details below to start your journey through time!
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="name" className="sr-only">Name</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClasses}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="email" className="sr-only">Email</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Your Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClasses}
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <input
                        id="privacy"
                        type="checkbox"
                        checked={acceptedPolicy}
                        onChange={(e) => setAcceptedPolicy(e.target.checked)}
                        className="h-5 w-5 rounded border-gray-300 text-brand-blue focus:ring-brand-blue"
                        disabled={isLoading}
                    />
                    <label htmlFor="privacy" className="text-sm font-body text-brand-brown/80">
                        I have read and agree to the{' '}
                        <button type="button" onClick={onShowPrivacyPolicy} className="font-bold text-brand-blue hover:underline focus:outline-none">
                            Privacy Policy
                        </button>
                        .
                    </label>
                </div>


                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-brand-red font-body text-center"
                    >
                        {error}
                    </motion.p>
                )}

                <button type="submit" className={buttonClasses} disabled={isLoading || !acceptedPolicy}>
                    {isLoading ? 'Entering...' : 'Start My Journey'}
                </button>
            </form>
             <p className="mt-6 text-xs text-brand-brown/50 text-center font-body">
                We respect your privacy. Your email will only be used for this experience.
            </p>
        </div>
    );
};

export default LandingPage;