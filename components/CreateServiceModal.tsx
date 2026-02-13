import React, { useState } from 'react';

interface BlueprintStep {
    title: string;
    content: string;
}

interface CreateServiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (service: any) => Promise<void>;
    initialData?: any;
}

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({ isOpen, onClose, onConfirm, initialData }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [category, setCategory] = useState(initialData?.category_badge || '1-on-1 Mentorship');
    const [price, setPrice] = useState<number | string>(initialData?.price || 0);
    const [priceUnit, setPriceUnit] = useState(initialData?.price_unit || 'session');
    const [duration, setDuration] = useState<number | string>(initialData?.duration_min || 60);
    const [description, setDescription] = useState(initialData?.description || '');
    const [blueprint, setBlueprint] = useState<BlueprintStep[]>(() => {
        if (initialData?.blueprint_steps?.steps) {
            const steps = initialData.blueprint_steps.steps;
            const fullSteps = [...steps];
            while (fullSteps.length < 3) fullSteps.push({ title: '', content: '' });
            return fullSteps.slice(0, 3);
        }
        return [
            { title: '', content: '' },
            { title: '', content: '' },
            { title: '', content: '' }
        ];
    });
    const [isSaving, setIsSaving] = useState(false);

    // Update state when initialData changes (for reuse of same modal instance)
    React.useEffect(() => {
        if (isOpen) {
            setTitle(initialData?.title || '');
            setCategory(initialData?.category_badge || '1-on-1 Mentorship');
            setPrice(initialData?.price || 0);
            setPriceUnit(initialData?.price_unit || 'session');
            setDuration(initialData?.duration_min || 60);
            setDescription(initialData?.description || '');
            if (initialData?.blueprint_steps?.steps) {
                const steps = initialData.blueprint_steps.steps;
                const fullSteps = [...steps];
                while (fullSteps.length < 3) fullSteps.push({ title: '', content: '' });
                setBlueprint(fullSteps.slice(0, 3));
            } else {
                setBlueprint([
                    { title: '', content: '' },
                    { title: '', content: '' },
                    { title: '', content: '' }
                ]);
            }
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (!title.trim()) {
            alert('Please enter a service title');
            return;
        }
        setIsSaving(true);
        try {
            await onConfirm({
                title,
                category,
                price,
                price_unit: priceUnit,
                duration,
                description,
                blueprint: blueprint.filter(step => step.title.trim() !== '')
            });
            onClose();
        } catch (error) {
            console.error('Failed to save service:', error);
            alert('Failed to save service. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const updateBlueprint = (index: number, field: keyof BlueprintStep, value: string) => {
        const updated = [...blueprint];
        updated[index] = { ...updated[index], [field]: value };
        setBlueprint(updated);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl my-8 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-gray-50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">{initialData ? 'Edit Service' : 'Create New Service'}</h2>
                        <p className="text-sm text-gray-400 font-medium">{initialData ? 'Update your professional skill-sharing session details.' : 'Define your professional skill-sharing session details.'}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    {/* Basic Info Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Service Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all placeholder:text-gray-300"
                                placeholder="e.g., Advanced Brand Strategy for High-Growth Startups"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Service Type</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3.5 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option>1-on-1 Mentorship</option>
                                <option>Consultation</option>
                                <option>Group Workshop</option>
                                <option>Group Sharing Event</option>
                                <option>Multi-week Bootcamp</option>
                                <option>Step-by-step Program</option>
                            </select>
                        </div>
                    </div>

                    {/* Pricing & Logistics Card */}
                    <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-extrabold text-gray-900">Pricing & Logistics</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Pricing</label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full bg-white border border-gray-100 rounded-xl pl-8 pr-4 py-3 text-blue-600 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <select
                                        value={priceUnit}
                                        onChange={(e) => setPriceUnit(e.target.value)}
                                        className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-gray-500 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all min-w-[120px]"
                                    >
                                        <option value="session">/ session</option>
                                        <option value="hr">/ hr</option>
                                        <option value="word">/ word</option>
                                        <option value="project">/ project</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Duration</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full bg-white border border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                                        placeholder="60"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold pointer-events-none">min</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Service Summary</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-gray-600 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all resize-none min-h-[120px]"
                            placeholder="Write a compelling overview of what clients will learn and achieve..."
                        />
                    </div>

                    {/* Blueprint Section */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="font-extrabold text-gray-900">The 3-Unit Blueprint <span className="text-gray-400 font-medium text-sm ml-1">(optional)</span></h3>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            {blueprint.map((step, idx) => (
                                <div key={idx} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
                                    <div className="inline-block px-2 py-0.5 bg-blue-50 text-[9px] font-black text-blue-600 rounded-md uppercase tracking-wider mb-1">
                                        UNIT 0{idx + 1}
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">UNIT TITLE</label>
                                        <input
                                            type="text"
                                            value={step.title}
                                            onChange={(e) => updateBlueprint(idx, 'title', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="e.g. Discovery & Audit"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">LEARNING OBJECTIVES</label>
                                        <textarea
                                            value={step.content}
                                            onChange={(e) => updateBlueprint(idx, 'content', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-[10px] text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none min-h-[80px]"
                                            placeholder="What's the core outcome?"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-8 py-6 border-t border-gray-50 flex items-center justify-end gap-3 bg-gray-50/30 rounded-b-[32px]">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 px-6 h-[48px] rounded-full text-xs font-bold text-gray-400 hover:text-gray-600 hover:bg-white transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isSaving}
                        className={`px-10 h-[48px] rounded-full text-xs font-bold text-white shadow-lg shadow-blue-200/50 transition-all ${isSaving ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#00A3FF] hover:bg-[#0082CC] active:scale-95'
                            }`}
                    >
                        {isSaving ? 'Saving...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateServiceModal;
