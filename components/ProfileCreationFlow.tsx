'use client';

import React from 'react';

interface ProfileCreationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onStartManual?: () => void;
  onStartAI?: () => void;
}

export default function ProfileCreationFlow({
  isOpen,
  onClose,
  onComplete,
  onStartManual,
  onStartAI,
}: ProfileCreationFlowProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 sm:p-10 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Ready to share your talent?
        </h2>
        <p className="text-gray-500 mb-8">
          Choose how you&apos;d like to begin your journey with us.
        </p>

        {/* Two option cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Option 1: Manual */}
          <button
            onClick={() => {
              onComplete();
              onStartManual?.();
            }}
            className="group text-left border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              I know exactly what to offer
            </h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Skip the discovery and go straight to listing your services.
            </p>
            <span className="inline-flex items-center text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all gap-1">
              Get started
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </button>

          {/* Option 2: AI Guide */}
          <button
            onClick={() => {
              onComplete();
              onStartAI?.();
            }}
            className="group text-left border border-gray-200 rounded-xl p-6 hover:border-purple-300 hover:shadow-md transition-all relative"
          >
            {/* POWERED BY AI badge */}
            <span className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full">
              Powered by AI
            </span>
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              Help me discover my skills
            </h3>
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
              Not sure where to start? Let our AI help uncover your hidden talents.
            </p>
            <span className="inline-flex items-center text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all gap-1">
              Start AI Guide
              <span className="text-base">🪄</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
