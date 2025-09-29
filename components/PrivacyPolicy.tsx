/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';

interface PrivacyPolicyProps {
    onBack: () => void;
}

const secondaryButtonClasses = "font-body text-lg text-center text-brand-brown bg-transparent border-2 border-brand-blue py-3 px-8 rounded-md transition-all duration-300 hover:bg-brand-blue hover:text-vintage-paper focus:outline-none focus:ring-2 focus:ring-brand-blue/50";

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="w-full max-w-3xl mx-auto p-8 sm:p-12 bg-vintage-paper/80 rounded-lg shadow-xl border border-brand-brown/10 font-body text-brand-brown">
            <header className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-display text-brand-brown">Privacy Policy</h1>
                <p className="text-brand-blue mt-2 text-md">Last updated: {currentDate}</p>
            </header>

            <div className="space-y-6 prose prose-lg max-w-none text-brand-brown/90">
                <p>
                    Welcome to <strong>Image Ferrer</strong>. Your privacy is critically important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
                </p>

                <h2 className="font-display text-2xl text-brand-brown pt-4">1. Information We Collect</h2>
                <p>
                    We collect the following personal information when you voluntarily provide it through our initial form:
                </p>
                <ul>
                    <li><strong>Name:</strong> To personalize your experience.</li>
                    <li><strong>Email Address:</strong> We collect your email address to establish a session for your creation. After you've generated and purchased your images or album, we will use this email address to send the final files directly to your inbox.</li>
                </ul>

                <h2 className="font-display text-2xl text-brand-brown pt-4">2. How We Use Your Information</h2>
                <p>
                    We use the information we collect for the following purposes:
                </p>
                <ul>
                    <li><strong>To Deliver Your Creations:</strong> The main reason we ask for your email is to send you the final, high-quality generated image(s) or the complete album directly to your inbox. This ensures you have a permanent copy for safekeeping.</li>
                    <li>To provide, operate, and maintain our service.</li>
                    <li>To improve and personalize your experience.</li>
                    <li>To understand how our service is used, which helps us make it better.</li>
                    <li>To communicate with you for customer service purposes and to provide you with updates relating to the service.</li>
                </ul>
                
                <h2 className="font-display text-2xl text-brand-brown pt-4">3. Data Storage and Security</h2>
                <p>
                    Your information (name and email) is stored securely in our database, managed by the <strong>Supabase</strong> platform. Supabase employs robust security measures to protect your data from unauthorized access, alteration, or destruction. The images you upload are processed to generate results and are not permanently stored on our servers.
                </p>

                <h2 className="font-display text-2xl text-brand-brown pt-4">4. Information Sharing</h2>
                <p>
                    We do not sell, trade, or rent your personally identifiable information to others. Your name and email are used exclusively for the purposes described in this policy.
                </p>

                <h2 className="font-display text-2xl text-brand-brown pt-4">5. Your Rights</h2>
                <p>
                    You have the right to request access to, correction of, or deletion of your personal information. If you wish to exercise any of these rights, please contact us using the information provided below.
                </p>

                <h2 className="font-display text-2xl text-brand-brown pt-4">6. Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us via our Email:{' '}
                    <a 
                        href="mailto:ferrerrstudio@gmail.com"
                        className="text-brand-blue hover:underline"
                    >
                        ferrerrstudio@gmail.com
                    </a>.
                </p>
            </div>

            <div className="mt-12 text-center">
                <button onClick={onBack} className={secondaryButtonClasses}>
                    Back
                </button>
            </div>
        </div>
    );
};

export default PrivacyPolicy;