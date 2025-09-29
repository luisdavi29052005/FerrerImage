/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

type ImageStatus = 'pending' | 'done' | 'error';

interface PolaroidCardProps {
    imageUrl?: string;
    caption: string;
    status: ImageStatus;
    error?: string;
    onRegenerate?: (caption: string) => void;
    onDownload?: (caption: string) => void;
    onView?: (imageUrl: string) => void;
    isMobile?: boolean;
}

const LoadingSpinner = () => (
    <div className="flex items-center justify-center h-full">
        <div className="loader"></div>
    </div>
);

const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-4">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-red mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-brand-red font-body text-sm">Generation Failed</p>
    </div>
);

const Placeholder = () => (
    <div className="flex flex-col items-center justify-center h-full text-brand-brown/30 group-hover:text-brand-brown/60 transition-colors duration-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-display text-xl">Upload Photo</span>
    </div>
);

const PolaroidCard: React.FC<PolaroidCardProps> = ({ imageUrl, caption, status, onRegenerate, onDownload, isMobile, onView }) => {
    
    const cardInnerContent = (
        <>
            <div className="w-full bg-black aspect-square flex-grow relative overflow-hidden group shadow-inner">
                {status === 'pending' && <LoadingSpinner />}
                {status === 'error' && <ErrorDisplay />}
                {status === 'done' && imageUrl && (
                    <>
                        <div className={cn(
                            "absolute top-2 right-2 z-20 flex flex-col gap-2 transition-opacity duration-300",
                            !isMobile && "opacity-0 group-hover:opacity-100",
                        )}>
                            {onDownload && (
                                <button
                                    onClick={() => onDownload(caption)}
                                    className="p-2 bg-black/60 rounded-full text-white hover:bg-brand-blue/80 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                                    aria-label={`Download image for ${caption}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            )}
                             {onRegenerate && (
                                <button
                                    onClick={() => onRegenerate(caption)}
                                    className="p-2 bg-black/60 rounded-full text-white hover:bg-brand-orange/80 focus:outline-none focus:ring-2 focus:ring-brand-orange"
                                    aria-label={`Regenerate image for ${caption}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.899 2.186l-1.42.71a5.002 5.002 0 00-8.479-1.554H10a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm12 14a1 1 0 01-1-1v-2.101a7.002 7.002 0 01-11.899-2.186l1.42-.71a5.002 5.002 0 008.479 1.554H10a1 1 0 110-2h6a1 1 0 011 1v6a1 1 0 01-1 1z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        
                        {onView && (
                            <button
                                onClick={() => onView(imageUrl)}
                                className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center z-10 cursor-pointer focus:outline-none"
                                aria-label={`View image for ${caption} in fullscreen`}
                            >
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform scale-75 group-hover:scale-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                </div>
                            </button>
                        )}
                        
                        <img
                            key={imageUrl}
                            src={imageUrl}
                            alt={caption}
                            className='w-full h-full object-cover'
                        />
                    </>
                )}
                {status === 'done' && !imageUrl && <Placeholder />}
            </div>
            <div className="text-center p-2 w-full mt-2">
                <p className="font-marker text-2xl tracking-wide text-brand-brown">
                    {caption}
                </p>
            </div>
        </>
    );

    return (
        <div className="bg-white rounded-md shadow-lg p-4 pb-2 flex flex-col items-center justify-start w-full max-w-sm mx-auto transform hover:scale-105 hover:shadow-2xl transition-all duration-300">
            {cardInnerContent}
        </div>
    );
};

export default PolaroidCard;