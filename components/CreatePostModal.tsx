'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPost, updatePost, createUserSkill, uploadPostImage, deletePostImage, fetchSkillCategories, fetchLocationGroups, type DbPost, type SkillCategoryWithSkills, type LocationGroupWithLocations } from '@/lib/database';

export type PostType = 'community' | 'learner' | 'experience' | 'service';

export interface EditPostData {
  id: string;
  type: PostType;
  locations: string[];
  skill_category: string | null;
  purpose_expectations: string | null;
  content: string | null;
  media_urls?: string[];
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
  onPostCreated?: () => void;
  editPost?: EditPostData | null;  // If provided, modal is in edit mode
}

const postTypes = [
  {
    id: 'community' as PostType,
    title: 'Organize a group',
    description: 'Create a group to connect with others',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    id: 'learner' as PostType,
    title: 'Seek Assistance',
    description: 'Ask others to help you learn',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'experience' as PostType,
    title: 'Share Insights',
    description: 'Share your knowledge & experience',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: 'service' as PostType,
    title: 'Provide Service',
    description: 'Offer your skills to the community',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
];

const fallbackLocations: LocationGroupWithLocations[] = [
  { name: 'Toronto Downtown', locations: ['St.George Campus', 'Bay Street/Financial District', 'Toronto Downtown in general'] },
  { name: 'Waterloo Tech Hub', locations: ['University of Waterloo Campus', 'Wilfrid Laurier University', 'Uptown Waterloo', 'Waterloo in general'] },
  { name: 'London/Ivey Hub', locations: ['Western University Main Campus', 'Ivey Business School Area', 'Richmond Row(Dt. London)', 'London in general'] },
];

const fallbackSkills: SkillCategoryWithSkills[] = [
  { name: 'Languages', skills: ['EnglishSpeaking', 'French', 'Spanish', 'Japanese', 'BusinessWriting'] },
  { name: 'Lifestyle & Hobbies', skills: ['FortuneTelling', 'TarotReading', 'MealPrep', 'TravelPlanning', 'HomeOrganization'] },
  { name: 'Wellness & Self-Care', skills: ['Skincare', 'StrengthTraining', 'RunTraining', 'NutritionBasics', 'Mindfulness'] },
  { name: 'Pet Care/Pet Services', skills: ['Care & Sitting', 'Grooming', 'Training', 'Health & Wellness', 'Pet Creative', 'Pet Psychology'] },
  { name: 'Sports', skills: ['Snowboarding', 'Swimming', 'Tennis', 'CyclingTraining', 'HikingSkills'] },
  { name: 'Practical Pro Skills', skills: ['AIProductivity', 'PresentationStorytelling', 'MockInterview', 'Networking', 'ProjectManagement'] },
  { name: 'Money & Strategy', skills: ['Budgeting', 'ETFInvesting', 'TaxBasics', 'CreditCardPoints', 'SideHustlePricing'] },
  { name: 'Creative & Hobbies', skills: ['ShortFormVideoEditing', 'PhotographyBasics', 'FigmaDesign', 'Copywriting', 'AI'] },
];

export default function CreatePostModal({ isOpen, onClose, onSubmit, onPostCreated, editPost }: CreatePostModalProps) {
  const isEditMode = !!editPost;
  const [selectedType, setSelectedType] = useState<PostType | null>(
    editPost ? editPost.type : null
  );
  const [formData, setFormData] = useState({
    preferredLocation: editPost ? (editPost.locations || []).join(', ') : '',
    skillCategory: editPost?.skill_category || '',
    purposeExpectations: editPost?.purpose_expectations || '',
    content: editPost?.content || '',
    location: editPost ? (editPost.locations || []).join(', ') : '',
    skillCategories: editPost?.skill_category || '',
  });
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isTopicsDialogOpen, setIsTopicsDialogOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(
    new Set(editPost?.locations || [])
  );
  const [selectedSkill, setSelectedSkill] = useState<string>(editPost?.skill_category || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(editPost?.media_urls?.[0] || null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic data from Supabase (fallbacks used until API responds)
  const [allLocations, setAllLocations] = useState<LocationGroupWithLocations[]>(fallbackLocations);
  const [allSkillCategories, setAllSkillCategories] = useState<SkillCategoryWithSkills[]>(fallbackSkills);

  useEffect(() => {
    fetchLocationGroups().then(data => {
      if (data.length > 0) setAllLocations(data);
    });
    fetchSkillCategories().then(data => {
      if (data.length > 0) setAllSkillCategories(data);
    });
  }, []);

  // Re-sync form when editPost changes (e.g. opening a different post to edit)
  const editPostId = editPost?.id;
  useEffect(() => {
    if (editPost && isOpen) {
      setSelectedType(editPost.type);
      setSelectedLocations(new Set(editPost.locations || []));
      setSelectedSkill(editPost.skill_category || '');
      setFormData({
        preferredLocation: (editPost.locations || []).join(', '),
        skillCategory: editPost.skill_category || '',
        purposeExpectations: editPost.purpose_expectations || '',
        content: editPost.content || '',
        location: (editPost.locations || []).join(', '),
        skillCategories: editPost.skill_category || '',
      });
      setImagePreview(editPost.media_urls?.[0] || null);
      setSelectedImage(null);
    }
  }, [editPostId]); // eslint-disable-line react-hooks/exhaustive-deps

  const VIRTUAL_LOCATION = 'Virtual';

  // Count only non-Virtual locations towards the 3-location limit
  const physicalLocationCount = (set: Set<string>) => {
    let count = 0;
    set.forEach(loc => { if (loc !== VIRTUAL_LOCATION) count++; });
    return count;
  };

  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(location)) {
        newSet.delete(location);
      } else {
        // Virtual doesn't count towards the 3-location limit
        if (location === VIRTUAL_LOCATION || physicalLocationCount(newSet) < 3) {
          newSet.add(location);
        }
      }
      return newSet;
    });
  };

  const handleSkillClick = (skill: string) => {
    setSelectedSkill(skill);
    setFormData({ ...formData, skillCategory: skill, skillCategories: skill });
    setIsTopicsDialogOpen(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be under 2MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed');
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleLocationApply = () => {
    const locations = Array.from(selectedLocations);
    if (locations.length > 0) {
      setFormData({ ...formData, preferredLocation: locations.join(', '), location: locations.join(', ') });
    }
    setIsLocationDialogOpen(false);
  };

  const handleLocationCancel = () => {
    setIsLocationDialogOpen(false);
  };

  // Only show skills that belong to a named category (exclude "Other" / uncategorized)
  const categorizedSkills = allSkillCategories.filter(cat => cat.name !== 'Other');

  // Filter skills by search query
  const filteredSkillCategories = skillSearchQuery.trim()
    ? categorizedSkills
        .map(cat => ({
          ...cat,
          skills: cat.skills.filter(s =>
            s.toLowerCase().includes(skillSearchQuery.toLowerCase())
          ),
        }))
        .filter(cat => cat.skills.length > 0)
    : categorizedSkills;

    // Check if search query matches any existing skill
  const hasExactMatch = categorizedSkills.some(cat =>
    cat.skills.some(s => s.toLowerCase() === skillSearchQuery.trim().toLowerCase())
  );

  const handleCreateNewSkill = async () => {
    if (!skillSearchQuery.trim()) return;
    setIsCreatingSkill(true);
    try {
      const skillName = await createUserSkill(skillSearchQuery.trim());
      handleSkillClick(skillName);
      setSkillSearchQuery('');
    } catch (err: any) {
      console.error('Error creating skill:', err);
      alert(err?.message || 'Failed to create skill');
    } finally {
      setIsCreatingSkill(false);
    }
  };

  if (!isOpen) return null;

  const handleTypeSelect = (type: PostType) => {
    setSelectedType(type);
    // Only reset form data when creating new post, not when editing
    if (!isEditMode) {
      setFormData({
        preferredLocation: '',
        skillCategory: '',
        purposeExpectations: '',
        content: '',
        location: '',
        skillCategories: '',
      });
      setSelectedLocations(new Set());
      setSelectedSkill('');
    }
  };

  // Validate all required fields are filled based on post type
  const isFormValid = (): boolean => {
    if (!selectedType) return false;
    const hasLocation = selectedLocations.size > 0;

    switch (selectedType) {
      case 'community':
        return !!(formData.preferredLocation.trim() && formData.skillCategory.trim() && formData.purposeExpectations.trim());
      case 'learner':
        return !!(formData.preferredLocation.trim() && formData.skillCategories.trim() && formData.purposeExpectations.trim());
      case 'experience':
        return !!(formData.content.trim() && formData.preferredLocation.trim() && formData.skillCategories.trim());
      case 'service':
        return !!(formData.preferredLocation.trim() && formData.skillCategories.trim() && formData.purposeExpectations.trim());
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !isFormValid()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Upload image if selected
      let mediaUrls: string[] = [];
      if (selectedImage) {
        setIsUploadingImage(true);
        try {
          const url = await uploadPostImage(selectedImage);
          mediaUrls = [url];
        } finally {
          setIsUploadingImage(false);
        }
      } else if (imagePreview && !selectedImage) {
        // Keep existing image URL in edit mode
        mediaUrls = [imagePreview];
      }

      const postInput = {
        type: selectedType,
        content: formData.content || formData.purposeExpectations || '',
        locations: Array.from(selectedLocations),
        skill_category: formData.skillCategory || formData.skillCategories || undefined,
        purpose_expectations: formData.purposeExpectations || undefined,
        media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
      };

      let result;
      if (isEditMode && editPost) {
        // If image was removed or replaced, delete old one from storage
        if (editPost.media_urls?.[0] && editPost.media_urls[0] !== imagePreview) {
          await deletePostImage(editPost.media_urls[0]).catch(() => {});
        }
        result = await updatePost(editPost.id, postInput);
      } else {
        result = await createPost(postInput);
      }

      onSubmit(result);

      // Show success state
      setIsSuccess(true);
      setIsSubmitting(false);

      // Notify parent to refresh posts list
      if (onPostCreated) onPostCreated();

      // Auto close after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting post:', error);
      setSubmitError(error?.message || `Failed to ${isEditMode ? 'update' : 'publish'} post. Please try again.`);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedType(null);
    setFormData({
      preferredLocation: '',
      skillCategory: '',
      purposeExpectations: '',
      content: '',
      location: '',
      skillCategories: '',
    });
    setSelectedLocations(new Set());
    setSelectedSkill('');
    setIsLocationDialogOpen(false);
    setIsTopicsDialogOpen(false);
    setIsSubmitting(false);
    setIsSuccess(false);
    setSubmitError(null);
    setSelectedImage(null);
    setImagePreview(null);
    setIsUploadingImage(false);
    onClose();
  };

  const renderFormFields = () => {
    if (!selectedType) return null;

    switch (selectedType) {
      case 'community':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.preferredLocation}
                  readOnly
                  onClick={() => setIsLocationDialogOpen(true)}
                  placeholder="Select location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsLocationDialogOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.skillCategory}
                  readOnly
                  onClick={() => setIsTopicsDialogOpen(true)}
                  placeholder="Select skill"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsTopicsDialogOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose & Expectations <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.purposeExpectations}
                onChange={(e) => setFormData({ ...formData, purposeExpectations: e.target.value })}
                placeholder="Describe the purpose of the group and what you expect from members..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        );

      case 'learner':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.preferredLocation}
                  readOnly
                  onClick={() => setIsLocationDialogOpen(true)}
                  placeholder="Select location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsLocationDialogOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Categories <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.skillCategories}
                  readOnly
                  onClick={() => setIsTopicsDialogOpen(true)}
                  placeholder="Select skill"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsTopicsDialogOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose & Expectations <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.purposeExpectations}
                onChange={(e) => setFormData({ ...formData, purposeExpectations: e.target.value })}
                placeholder="Describe what you want to learn and what kind of help you need..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="What's new today..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.preferredLocation}
                  readOnly
                  onClick={() => setIsLocationDialogOpen(true)}
                  placeholder="Select location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsLocationDialogOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Categories <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.skillCategories}
                  readOnly
                  onClick={() => setIsTopicsDialogOpen(true)}
                  placeholder="Select skill"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsTopicsDialogOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Add Image <span className="text-xs text-gray-400">(max 1 photo, under 2MB)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative w-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="text-center">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500">Click to add an image</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'service':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.preferredLocation}
                  readOnly
                  onClick={() => setIsLocationDialogOpen(true)}
                  placeholder="Select location"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsLocationDialogOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Categories <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.skillCategories}
                  readOnly
                  onClick={() => setIsTopicsDialogOpen(true)}
                  placeholder="Select skill"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsTopicsDialogOpen(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.purposeExpectations}
                onChange={(e) => setFormData({ ...formData, purposeExpectations: e.target.value })}
                placeholder="Describe the service you're offering..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">{isEditMode ? 'Edit Post' : 'Create a New Post'}</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{isEditMode ? 'Post Updated Successfully!' : 'Post Published Successfully!'}</h3>
              <p className="text-gray-600 text-center">Your post has been published and will appear in the feed shortly.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-6">Choose how would you like to connect with the community</p>

              {!selectedType ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {postTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left relative"
                >
                  <div className="flex items-start space-x-3">
                    <div className="text-blue-600">{type.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{type.title}</h3>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-4">
                  {postTypes.find(t => t.id === selectedType)?.icon}
                  <h3 className="font-semibold text-gray-900">
                    {postTypes.find(t => t.id === selectedType)?.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Change type
                </button>
              </div>

              {renderFormFields()}

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid()}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isUploadingImage ? 'Uploading image...' : isEditMode ? 'Saving...' : 'Publishing...'}</span>
                    </>
                  ) : (
                    <span>{isEditMode ? 'Save Changes' : 'Publish Post'}</span>
                  )}
                </button>
              </div>
            </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Location Dialog */}
      {isLocationDialogOpen && (
        <div className="fixed inset-0 z-[110] bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={handleLocationCancel}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-gray-900">All Locations</h2>
              <button
                onClick={handleLocationCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allLocations.map((group) => (
                  <div key={group.name}>
                    <h3 className="font-semibold text-gray-900 mb-3">{group.name}</h3>
                    <div className="space-y-2">
                      {group.locations.map((location) => (
                        <label 
                          key={location} 
                          className={`flex items-center space-x-2 cursor-pointer p-1.5 rounded ${
                            !selectedLocations.has(location) && physicalLocationCount(selectedLocations) >= 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLocations.has(location)}
                            onChange={() => handleLocationToggle(location)}
                            disabled={!selectedLocations.has(location) && physicalLocationCount(selectedLocations) >= 3}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                          />
                          <span className="text-sm text-gray-700">{location}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {/* Virtual option */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                  <input
                    type="checkbox"
                    checked={selectedLocations.has(VIRTUAL_LOCATION)}
                    onChange={() => handleLocationToggle(VIRTUAL_LOCATION)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Virtual
                    <span className="text-xs text-gray-400 ml-1">(doesn&apos;t count towards limit)</span>
                  </span>
                </label>
              </div>
              {selectedLocations.size > 0 && (
                <div className="mt-4 text-sm text-gray-600">
                  Selected: {physicalLocationCount(selectedLocations)}/3{selectedLocations.has(VIRTUAL_LOCATION) ? ' + Virtual' : ''}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={handleLocationCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLocationApply}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topics/Skills Dialog */}
      {isTopicsDialogOpen && (
        <div className="fixed inset-0 z-[110] bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={() => { setIsTopicsDialogOpen(false); setSkillSearchQuery(''); }}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-gray-900">All Topics</h2>
                <button
                  onClick={() => { setIsTopicsDialogOpen(false); setSkillSearchQuery(''); }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Search input */}
              <div className="relative">
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={skillSearchQuery}
                  onChange={(e) => setSkillSearchQuery(e.target.value)}
                  placeholder="Search skills or type to create new..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="p-6">
              {/* "Create new" button when no exact match */}
              {skillSearchQuery.trim() && !hasExactMatch && (
                <button
                  type="button"
                  onClick={handleCreateNewSkill}
                  disabled={isCreatingSkill}
                  className="w-full mb-4 flex items-center justify-between px-4 py-3 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-sm font-medium text-blue-700">
                      Create &quot;{skillSearchQuery.trim()}&quot; as a new skill
                    </span>
                  </div>
                  {isCreatingSkill && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>
              )}

              {filteredSkillCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredSkillCategories.map((category) => (
                    <div key={category.name}>
                      <h3 className="font-semibold text-gray-900 mb-3">{category.name}</h3>
                      <div className="space-y-2">
                        {category.skills.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => { handleSkillClick(skill); setSkillSearchQuery(''); }}
                            className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                              selectedSkill === skill
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-700 hover:bg-blue-50'
                            }`}
                          >
                            #{skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No matching skills found.</p>
                  <p className="text-sm mt-1">Click the button above to create a new one!</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => { setIsTopicsDialogOpen(false); setSkillSearchQuery(''); }}
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
