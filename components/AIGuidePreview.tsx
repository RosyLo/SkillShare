'use client';

import React, { useState } from 'react';
import { type AIGuidePayload } from '@/lib/database';

interface AIGuidePreviewProps {
    isOpen: boolean;
    data: AIGuidePayload;
    onConfirm: (editedData: AIGuidePayload) => void;
    onCancel: () => void;
}

export default function AIGuidePreview({
    isOpen,
    data,
    onConfirm,
    onCancel,
}: AIGuidePreviewProps) {
    // Editable state initialized from AI-generated data
    const [heading, setHeading] = useState(
        data.micDropTopic ||
        (data.primarySkill ? `Share my skill in ${data.primarySkill}` : '')
    );

    const [story, setStory] = useState(() => {
        const parts = [
            data.teachingStory && `${data.teachingStory}`,
            data.micDropDetails && `${data.micDropDetails}`,
        ].filter(Boolean);
        return parts.join('\n\n');
    });

    const [skills, setSkills] = useState<string[]>(data.selectedSkills);
    const [skillInput, setSkillInput] = useState('');

    // Service preview (read-only for now, but could be editable)
    const serviceTitle = data.primarySkill
        ? `${data.primarySkill} – 3-Step Rescue`
        : 'My 3-Step Rescue Session';

    const handleAddSkill = () => {
        if (skillInput.trim() && !skills.includes(skillInput.trim())) {
            setSkills([...skills, skillInput.trim()]);
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setSkills(skills.filter((s) => s !== skill));
    };

    const handleConfirm = () => {
        const editedData: AIGuidePayload = {
            ...data,
            selectedSkills: skills,
            micDropTopic: heading,
            teachingStory: story,
        };
        onConfirm(editedData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[130] bg-black bg-opacity-50 flex items-center justify-center px-4 py-6 overflow-y-auto">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">
                        Preview Your Slasher Profile
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Review and edit before saving to your profile
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 py-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Heading */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Profile Heading
                        </label>
                        <input
                            type="text"
                            value={heading}
                            onChange={(e) => setHeading(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="e.g. Passionate about helping others with skincare..."
                        />
                    </div>

                    {/* Story */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Slash Story
                        </label>
                        <textarea
                            value={story}
                            onChange={(e) => setStory(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none"
                            placeholder="Share your journey and what makes you unique..."
                        />
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Your Skills
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                                >
                                    #{skill}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(skill)}
                                        className="hover:text-red-500 transition-colors"
                                    >
                                        <svg
                                            className="w-3.5 h-3.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                placeholder="Add a skill..."
                            />
                            <button
                                type="button"
                                onClick={handleAddSkill}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Service Preview */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Suggested Service
                        </label>
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                                    <svg
                                        className="w-6 h-6 text-purple-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                                        1-ON-1 SESSION
                                    </span>
                                    <h3 className="font-bold text-gray-900 mt-1">{serviceTitle}</h3>
                                    {data.teachingStory && (
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                            {data.teachingStory}
                                        </p>
                                    )}
                                    {/* 3-Step Preview */}
                                    {(data.sosSetup || data.sosAction || data.sosResult) && (
                                        <div className="mt-4 space-y-2">
                                            {data.sosSetup && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold">
                                                        1
                                                    </span>
                                                    <span className="text-gray-700">{data.sosSetup}</span>
                                                </div>
                                            )}
                                            {data.sosAction && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold">
                                                        2
                                                    </span>
                                                    <span className="text-gray-700">{data.sosAction}</span>
                                                </div>
                                            )}
                                            {data.sosResult && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold">
                                                        3
                                                    </span>
                                                    <span className="text-gray-700">{data.sosResult}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 italic">
                            This service will be added to your profile. You can edit it later.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-2xl">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Confirm & Go to My Profile
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                        </svg>
                    </button>
                </div>

                {/* Close button */}
                <button
                    type="button"
                    onClick={onCancel}
                    className="absolute -top-3 -right-3 bg-white rounded-full shadow-lg p-2 text-gray-400 hover:text-gray-600 hover:shadow-xl transition-all"
                    aria-label="Close"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
