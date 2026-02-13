'use client';

import React, { useState, useEffect } from 'react';
import { type AIGuidePayload, saveAIGuideResult, confirmAIProfileGeneration } from '@/lib/database';

interface AIService {
    title: string;
    description: string;
    price: number | string;
    price_unit: string;
    duration: number | string;
    category: string;
    blueprint: { title: string; content: string }[];
}

interface AIGeneratedData {
    heading: string;
    story: string;
    services: AIService[];
}

interface AIGeneratedProfileProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userName: string;
    userAvatar: string | null;
    userBanner?: string | null;
    payload: AIGuidePayload;
    existingHeading?: string | null;
    existingStory?: string | null;
    onComplete: () => void;
}

const AutoResizeTextarea = ({ value, onChange, className, placeholder, rows = 1 }: {
    value: string;
    onChange: (val: string) => void;
    className?: string;
    placeholder?: string;
    rows?: number;
}) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [value]);

    return (
        <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${className} overflow-hidden transition-all duration-75`}
            placeholder={placeholder}
            rows={rows}
        />
    );
};

export default function AIGeneratedProfile({
    isOpen,
    onClose,
    userId,
    userName,
    userAvatar,
    userBanner,
    payload,
    existingHeading,
    existingStory,
    onComplete,
}: AIGeneratedProfileProps) {
    const [loading, setLoading] = useState(true);
    const [aiData, setAiData] = useState<AIGeneratedData | null>(null);
    const [heading, setHeading] = useState('');
    const [story, setStory] = useState('');
    const [bannerUrl, setBannerUrl] = useState<string | null>(userBanner || null);
    const [editableServices, setEditableServices] = useState<AIService[]>([]);
    const [selectedServices, setSelectedServices] = useState<number[]>([0, 1, 2]);
    const [showStory, setShowStory] = useState(true);
    const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen && !aiData) {
            generateProfile();
        }
    }, [isOpen]);

    const generateProfile = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, payload }),
            });

            if (!res.ok) {
                throw new Error(`API error: ${res.status}`);
            }

            const data = await res.json();
            setAiData(data);
            setEditableServices(data.services || []);

            // Never overwrite if not empty
            setHeading(existingHeading || data.heading || '');
            setStory(existingStory || data.story || '');
            setBannerUrl(userBanner || null);
        } catch (err) {
            console.error('Failed to generate AI profile:', err);
            alert('Failed to generate profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleService = (index: number) => {
        if (selectedServices.includes(index)) {
            setSelectedServices(selectedServices.filter((i) => i !== index));
        } else {
            setSelectedServices([...selectedServices, index]);
        }
    };

    const handleConfirm = async () => {
        if (!userId || !aiData) return;
        setLoading(true);
        try {
            const finalServices = editableServices.filter((_, idx) => selectedServices.includes(idx));
            setLoading(true);
            await confirmAIProfileGeneration(userId, { heading, story: showStory ? story : '' }, finalServices);

            // Also update banner if changed
            if (bannerUrl !== userBanner) {
                const { supabase } = await import('@/lib/supabase');
                await supabase.from('profiles').update({ banner_url: bannerUrl }).eq('user_id', userId);
            }

            onComplete();
        } catch (err) {
            console.error('Failed to confirm profile:', err);
            alert('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateService = (index: number, field: keyof AIService, value: any) => {
        const updated = [...editableServices];
        updated[index] = { ...updated[index], [field]: value };
        setEditableServices(updated);
    };

    const updateBlueprint = (svcIndex: number, blueprintIndex: number, field: 'title' | 'content', value: string) => {
        const updated = [...editableServices];
        const updatedBlueprint = [...updated[svcIndex].blueprint];
        updatedBlueprint[blueprintIndex] = { ...updatedBlueprint[blueprintIndex], [field]: value };
        updated[svcIndex] = { ...updated[svcIndex], blueprint: updatedBlueprint };
        setEditableServices(updated);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] bg-gray-50 overflow-y-auto">
            {/* Header Bar */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="font-bold text-gray-900">AI Profile Preview</span>
                </div>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {loading && !aiData ? (
                <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Gemini is crafting your professional profile...</p>
                </div>
            ) : (
                <div className="max-w-4xl mx-auto pb-24">
                    {/* Profile Header (Mimicking actual profile page) */}
                    <div className="bg-white rounded-b-3xl shadow-sm overflow-hidden mb-8">
                        <div className="h-40 relative group">
                            {bannerUrl ? (
                                <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100"></div>
                            )}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <label className="cursor-pointer bg-white/90 px-4 py-2 rounded-full shadow-sm flex items-center gap-2 hover:bg-white transition-colors">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-sm font-bold text-blue-600">Change Banner</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                try {
                                                    const { uploadPostImage } = await import('@/lib/database');
                                                    const url = await uploadPostImage(file);
                                                    setBannerUrl(url);
                                                } catch (err) {
                                                    alert('Upload failed');
                                                }
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="px-6 pb-6 relative">
                            <div className="absolute -top-12 left-6">
                                <div className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden bg-white shadow-md">
                                    {userAvatar ? (
                                        <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-500 text-3xl font-bold">
                                            {userName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="pt-14">
                                <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
                                <div className="mt-2">
                                    <textarea
                                        value={heading}
                                        onChange={(e) => setHeading(e.target.value)}
                                        rows={2}
                                        className="w-full text-lg font-medium text-gray-700 bg-blue-50 border-none rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 resize-none leading-snug"
                                        placeholder="AI generating heading..."
                                    />
                                    {!existingHeading && (
                                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.582 3.954H18a1 1 0 110 2h-1.464l-1.582 3.954-3.954 1.582V17a1 1 0 11-2 0v-1.323l-3.954-1.582-1.582-3.954H2a1 1 0 110-2h1.464l1.582-3.954 3.954-1.582V3a1 1 0 011-1z" />
                                            </svg>
                                            AI Generated
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Story Section */}
                    <div className="px-4 mb-8 space-y-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider">The Slash Story</h2>
                            <div className="h-px flex-1 bg-blue-100"></div>
                            <button
                                onClick={() => setShowStory(!showStory)}
                                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md transition-all ${showStory ? 'text-red-500 hover:bg-red-50' : 'text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                {showStory ? 'Remove' : 'Add Back'}
                            </button>
                        </div>
                        {showStory ? (
                            <>
                                <AutoResizeTextarea
                                    value={story}
                                    onChange={setStory}
                                    className="w-full text-gray-600 italic leading-relaxed bg-white border border-gray-200 rounded-2xl p-6 shadow-sm focus:ring-2 focus:ring-blue-500"
                                    placeholder="AI generating story..."
                                    rows={3}
                                />
                                {!existingStory && (
                                    <p className="text-xs text-blue-600 mt-2 flex items-center justify-end gap-1">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.582 3.954H18a1 1 0 110 2h-1.464l-1.582 3.954-3.954 1.582V17a1 1 0 11-2 0v-1.323l-3.954-1.582-1.582-3.954H2a1 1 0 110-2h1.464l1.582-3.954 3.954-1.582V3a1 1 0 011-1z" />
                                        </svg>
                                        Generated by Gemini Pro
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center">
                                <p className="text-sm text-gray-400 italic">Story will not be added to your profile.</p>
                            </div>
                        )}
                    </div>


                    {/* My Services Section */}
                    <div className="px-4 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Suggested Services</h2>
                            <span className="text-xs text-gray-500">Pick which ones to add</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(editableServices || []).map((svc, idx) => (
                                <div
                                    key={idx}
                                    className={`relative transition-all duration-300 transform group hover:scale-[1.02] ${selectedServices.includes(idx)
                                        ? 'ring-2 ring-blue-500 bg-white'
                                        : 'bg-gray-50 opacity-60'
                                        } rounded-2xl border border-gray-200 p-5 shadow-sm cursor-pointer`}
                                    onClick={() => setEditingServiceIndex(idx)}
                                >
                                    {/* Selection Toggle */}
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleService(idx);
                                        }}
                                        className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer z-10 ${selectedServices.includes(idx) ? 'bg-blue-500 text-white shadow-sm' : 'bg-gray-200 text-transparent'
                                            }`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>

                                    {/* Edit Indicator Overlay */}
                                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                                        <div className="bg-white/90 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                                            <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Click to Edit</span>
                                        </div>
                                    </div>

                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>

                                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{svc.category}</p>
                                    <h3 className="font-bold text-gray-900 text-sm mb-2 leading-tight">{svc.title}</h3>
                                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">{svc.description}</p>

                                    <div className="flex items-center justify-between text-xs font-bold pt-3 border-t border-gray-100 mt-auto">
                                        <span className="text-blue-600">${svc.price}/{svc.price_unit || 'session'}</span>
                                        <span className="text-gray-400">{svc.duration} min</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Service Edit Modal */}
            {editingServiceIndex !== null && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-bold text-gray-900">Edit Service Details</h3>
                            <button
                                onClick={() => setEditingServiceIndex(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Service Title</label>
                                        <input
                                            type="text"
                                            value={editableServices[editingServiceIndex].title}
                                            onChange={(e) => updateService(editingServiceIndex, 'title', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Description</label>
                                        <textarea
                                            value={editableServices[editingServiceIndex].description}
                                            onChange={(e) => updateService(editingServiceIndex, 'description', e.target.value)}
                                            rows={3}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Price</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold">$</span>
                                                <input
                                                    type="number"
                                                    value={editableServices[editingServiceIndex].price}
                                                    onChange={(e) => updateService(editingServiceIndex, 'price', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-8 pr-4 py-3 text-blue-600 font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                                    placeholder="100"
                                                />
                                            </div>
                                            <div className="w-1/2">
                                                <select
                                                    value={editableServices[editingServiceIndex].price_unit || 'session'}
                                                    onChange={(e) => updateService(editingServiceIndex, 'price_unit', e.target.value)}
                                                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-3 text-gray-600 text-sm font-bold focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                                >
                                                    <option value="session">/ session</option>
                                                    <option value="hr">/ hr</option>
                                                    <option value="word">/ word</option>
                                                    <option value="project">/ project</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Duration (Min)</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={editableServices[editingServiceIndex].duration}
                                                onChange={(e) => updateService(editingServiceIndex, 'duration', e.target.value)}
                                                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                                                placeholder="60"
                                            />
                                            <span className="text-gray-400 text-sm font-bold">min</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Blueprint Section */}
                                <div className="pt-4 mt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-2 mb-4">
                                        <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h4 className="font-bold text-gray-900">The Service Blueprint</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {editableServices[editingServiceIndex].blueprint.map((step, bIdx) => (
                                            <div key={bIdx} className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                                                <input
                                                    type="text"
                                                    value={step.title}
                                                    onChange={(e) => updateBlueprint(editingServiceIndex, bIdx, 'title', e.target.value)}
                                                    className="w-full bg-transparent border-none p-0 mb-1 font-bold text-blue-900 text-sm focus:ring-0"
                                                    placeholder={`Unit ${bIdx + 1} Title`}
                                                />
                                                <textarea
                                                    value={step.content}
                                                    onChange={(e) => updateBlueprint(editingServiceIndex, bIdx, 'content', e.target.value)}
                                                    rows={2}
                                                    className="w-full bg-transparent border-none p-0 text-xs text-blue-700/70 focus:ring-0 resize-none leading-relaxed"
                                                    placeholder="Describe what happens in this step..."
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setEditingServiceIndex(null)}
                                className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 hover:shadow-blue-200 transform active:scale-95"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-[160]">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="hidden sm:block">
                        <p className="text-sm font-bold text-gray-900">Ready to launch?</p>
                        <p className="text-xs text-gray-500">You can still edit these later.</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading || !aiData}
                            className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Confirm & Go to My Profile'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
