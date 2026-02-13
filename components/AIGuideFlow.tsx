'use client';

import React, { useState, useEffect } from 'react';
import { fetchSkillCategories, createUserSkill, type SkillCategoryWithSkills, type AIGuidePayload } from '@/lib/database';

interface AIGuideFlowProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional: parent can capture the filled data later
  onComplete?: (data: AIGuidePayload) => void;
}

// Reuse the same fallback list as search / create-post
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

const MAX_SKILLS = 5;

export default function AIGuideFlow({ isOpen, onClose, onComplete }: AIGuideFlowProps) {
  const [step, setStep] = useState(1);
  const [skillCategories, setSkillCategories] = useState<SkillCategoryWithSkills[]>(fallbackSkills);
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [primarySkill, setPrimarySkill] = useState<string | null>(null);
  const [experienceYears, setExperienceYears] = useState<string | null>(null);
  const [hasTaught, setHasTaught] = useState<'yes' | 'no' | null>(null);
  const [teachingStory, setTeachingStory] = useState('');
  const [confidenceSkill, setConfidenceSkill] = useState(0);
  const [confidenceDesign, setConfidenceDesign] = useState(0);
  const [micDropTopic, setMicDropTopic] = useState('');
  const [micDropDetails, setMicDropDetails] = useState('');
  const [sosProblem, setSosProblem] = useState('');
  const [sosSetup, setSosSetup] = useState('');
  const [sosAction, setSosAction] = useState('');
  const [sosResult, setSosResult] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    // Reset when opened
    setStep(1);
    setSelectedSkills([]);
    setPrimarySkill(null);
    setExperienceYears(null);
    setHasTaught(null);
    setTeachingStory('');
    setConfidenceSkill(0);
    setConfidenceDesign(0);
    setMicDropTopic('');
    setMicDropDetails('');
    setSosProblem('');
    setSosSetup('');
    setSosAction('');
    setSosResult('');

    setSkillSearchQuery('');
    setIsCreatingSkill(false);

    fetchSkillCategories().then(data => {
      if (data.length > 0) {
        // Exclude "Other" to match search behaviour
        setSkillCategories(data.filter(cat => cat.name !== 'Other'));
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const percentage = (step / 4) * 100;

  const categorizedSkills = skillCategories;

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

  const hasExactMatch = categorizedSkills.some(cat =>
    cat.skills.some(s => s.toLowerCase() === skillSearchQuery.trim().toLowerCase())
  );

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => {
      const exists = prev.includes(skill);
      if (exists) {
        const next = prev.filter(s => s !== skill);
        if (primarySkill === skill) {
          setPrimarySkill(next[0] ?? null);
        }
        return next;
      }
      if (prev.length >= MAX_SKILLS) return prev;
      return [...prev, skill];
    });
  };

  const handleCreateNewSkill = async () => {
    if (!skillSearchQuery.trim()) return;
    setIsCreatingSkill(true);
    try {
      const skillName = await createUserSkill(skillSearchQuery.trim());

      // Add to a local "My Skills" category so it appears in the list
      setSkillCategories(prev => {
        const next = [...prev];
        const idx = next.findIndex(cat => cat.name === 'My Skills');
        if (idx >= 0) {
          if (!next[idx].skills.includes(skillName)) {
            next[idx] = {
              ...next[idx],
              skills: [...next[idx].skills, skillName],
            };
          }
          return next;
        }
        return [
          { name: 'My Skills', skills: [skillName] },
          ...next,
        ];
      });

      toggleSkill(skillName);
      setSkillSearchQuery('');
    } catch (err) {
      console.error('Error creating skill from AI guide:', err);
    } finally {
      setIsCreatingSkill(false);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = () => {
    const result: AIGuidePayload = {
      selectedSkills,
      primarySkill,
      experienceYears,
      hasTaught,
      teachingStory,
      confidenceSkill,
      confidenceDesign,
      micDropTopic,
      micDropDetails,
      sosProblem,
      sosSetup,
      sosAction,
      sosResult,
    };
    if (onComplete) onComplete(result);
    onClose();
  };

  const renderStep1 = () => (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-xs font-semibold text-orange-500 uppercase tracking-[0.2em] mb-2">
          Life Spectrum &amp; Hobbies
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Your Interest &amp; Profession
        </h2>
        <p className="text-sm text-gray-600 max-w-xl">
          Tag your talents! From lifestyle hobbies to career wisdom, even those personal projects you bring.
          Let&apos;s find your slash potential.
        </p>
      </div>

      {/* Skill search & create (same behaviour as search sidebar) */}
      <div className="space-y-2">
        <div className="relative">
          <svg
            className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={skillSearchQuery}
            onChange={(e) => setSkillSearchQuery(e.target.value)}
            placeholder="Search skills or type to create new..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        {skillSearchQuery.trim() && !hasExactMatch && (
          <button
            type="button"
            onClick={handleCreateNewSkill}
            disabled={isCreatingSkill}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 text-xs text-orange-700 hover:bg-orange-100 disabled:opacity-60"
          >
            <span>
              Create &quot;{skillSearchQuery.trim()}&quot; as a new skill
            </span>
            {isCreatingSkill && (
              <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            )}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm font-medium text-gray-600">
        <span className="text-gray-500">
          {selectedSkills.length}/{MAX_SKILLS}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1">
        {filteredSkillCategories.map(category => (
          <div key={category.name} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">{category.name}</h3>
            <div className="flex flex-wrap gap-2">
              {category.skills.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                const disabled = !isSelected && selectedSkills.length >= MAX_SKILLS;
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => !disabled && toggleSkill(skill)}
                    className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : disabled
                        ? 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300'
                    }`}
                  >
                    #{skill}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={selectedSkills.length === 0}
          className="inline-flex items-center justify-center px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-xs font-semibold text-orange-500 uppercase tracking-[0.2em] mb-2">
          Life Spectrum &amp; Hobbies
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Know more about your talent
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Among {MAX_SKILLS} skills you had chosen, pick one that you are most interested in diving in
          </label>
          <select
            value={primarySkill ?? ''}
            onChange={(e) => setPrimarySkill(e.target.value || null)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select a skill</option>
            {selectedSkills.map(skill => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            How long have you been doing ({primarySkill || 'this skill'})?
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            {['0-1 yr', '2-3 yr', '4-6 yr', '> 6 yr'].map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setExperienceYears(option)}
                className={`px-3 py-1.5 rounded-full border ${
                  experienceYears === option
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">
            Have you ever teach/advice/help people with({primarySkill || 'this skill'})? Can you tell me more about that?
          </p>
          <div className="flex items-center gap-4 mb-2 text-sm">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name="hasTaught"
                className="w-4 h-4 text-orange-500 border-gray-300"
                checked={hasTaught === 'yes'}
                onChange={() => setHasTaught('yes')}
              />
              <span>Yes</span>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="radio"
                name="hasTaught"
                className="w-4 h-4 text-orange-500 border-gray-300"
                checked={hasTaught === 'no'}
                onChange={() => setHasTaught('no')}
              />
              <span>No</span>
            </label>
          </div>
          <textarea
            value={teachingStory}
            onChange={(e) => setTeachingStory(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g. People ask me what workout they should start with to become more fit..."
          />
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              How confident you are in ({primarySkill || 'this skill'}) in terms of designing an event or course for others?
            </p>
            <div className="space-y-2">
              <RatingRow
                label="Confidence in skill"
                value={confidenceSkill}
                onChange={setConfidenceSkill}
              />
              <RatingRow
                label="Confidence in designing the event or course to share"
                value={confidenceDesign}
                onChange={setConfidenceDesign}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!primarySkill}
          className="inline-flex items-center justify-center px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          The Microphone Killer
        </h2>
        <p className="text-sm text-gray-600 max-w-xl">
          Imagine you are on stage with no slides. What will you like to talk about {primarySkill || 'your skill'} for 10 minutes straight?
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Mic Drop Topic
          </label>
          <input
            type="text"
            value={micDropTopic}
            onChange={(e) => setMicDropTopic(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. How I built a fitness routine from scratch..."
          />
        </div>
        <div>
          <textarea
            value={micDropDetails}
            onChange={(e) => setMicDropDetails(e.target.value)}
            rows={5}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Share a quick outline or the key points you would walk through on stage..."
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center justify-center px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="flex flex-col gap-6">
      <div>
        <div className="text-xs font-semibold text-blue-600 uppercase tracking-[0.2em] mb-2">
          Onboarding
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          The 3-Step Rescue SOS
        </h2>
        <p className="text-sm text-gray-600 max-w-xl">
          Your friend is stuck on ({primarySkill || 'your skill'}). They text: &quot;Help! I&apos;m lost, what do I do?&quot;
          Pull them out in 3 simple steps.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-red-500 uppercase tracking-[0.2em] mb-1">
            The S.O.S
          </p>
          <textarea
            value={sosProblem}
            onChange={(e) => setSosProblem(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What’s their problem? (e.g., Squatting hurts my back)"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-[0.2em] mb-1">
            Step 1: Setup
          </p>
          <textarea
            value={sosSetup}
            onChange={(e) => setSosSetup(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What should they check first? (e.g., Stance width)"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-[0.2em] mb-1">
            Step 2: Action
          </p>
          <textarea
            value={sosAction}
            onChange={(e) => setSosAction(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What’s your secret move? (e.g., Sit your hips back)"
          />
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-[0.2em] mb-1">
            Step 3: Result
          </p>
          <textarea
            value={sosResult}
            onChange={(e) => setSosResult(e.target.value)}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What’s the win? (e.g., Lift heavy, no pain!)"
          />
        </div>

        <p className="text-[11px] text-gray-400 italic">
          “Simple is hard, but simple is scalable.” — Slash Skill AI
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleFinish}
          className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-yellow-400 hover:bg-yellow-500"
        >
          Generate My Slasher DNA
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[120] bg-black bg-opacity-50 flex items-center justify-center px-4 py-6">
      <div className="relative max-w-4xl w-full">
        {/* Background card to mimic onboarding board */}
        <div className="bg-gradient-to-br from-orange-50 via-white to-orange-100 rounded-3xl shadow-2xl border border-orange-100 px-6 sm:px-10 py-6 sm:py-8">
          {/* Header with progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-gray-700">
              Step {step} of 4
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-orange-500">
              <span>{Math.round(percentage)}% complete</span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-orange-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Steps */}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-4 -right-2 sm:-right-4 bg-white rounded-full shadow-md p-1.5 text-gray-400 hover:text-gray-600 hover:shadow-lg"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function RatingRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-1">
        {stars.map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5"
          >
            <svg
              className={`w-5 h-5 ${value >= star ? 'text-yellow-400' : 'text-gray-300'}`}
              fill={value >= star ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.89a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.54 1.118l-3.976-2.89a1 1 0 00-1.176 0l-3.976 2.89c-.784.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.976-2.89c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.518-4.674z"
              />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

