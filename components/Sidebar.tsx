'use client';

import React, { useState } from 'react';

interface SidebarProps {
  isMobile?: boolean;
  onApply?: (selectedLocations: string[], selectedSkills: string[]) => void;
  onClose?: () => void;
}

interface LocationGroup {
  name: string;
  locations: string[];
}

interface SkillCategory {
  name: string;
  skills: string[];
}

export default function Sidebar({ isMobile = false, onApply, onClose }: SidebarProps) {
  const popularTopics = ['English', 'Python', 'Piano', 'DigitalMarketing', 'Fitness', 'Javascript'];
  const [isSkillsOpen, setIsSkillsOpen] = useState(true);
  const [isLocationsOpen, setIsLocationsOpen] = useState(true);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isTopicsDialogOpen, setIsTopicsDialogOpen] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [skillSearchInput, setSkillSearchInput] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('');

  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(location)) {
        newSet.delete(location);
      } else {
        // Maximum 3 locations
        if (newSet.size < 3) {
          newSet.add(location);
        }
      }
      return newSet;
    });
  };

  const handleSkillSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only trigger search on Enter for web, not mobile
    if (e.key === 'Enter' && skillSearchInput.trim() && !isMobile) {
      handleApply();
    }
  };

  const handleSkillClick = (skill: string) => {
    // On both web and mobile, set the input value and selected skill
    setSkillSearchInput(skill);
    setSelectedSkill(skill);
    setIsTopicsDialogOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkillSearchInput(e.target.value);
    // Clear selected skill if user types something different
    if (e.target.value !== selectedSkill) {
      setSelectedSkill('');
    }
  };

  const handleApply = () => {
    if (onApply) {
      const skills = skillSearchInput.trim() ? [skillSearchInput.trim()] : [];
      onApply(Array.from(selectedLocations), skills);
    }
    setIsLocationDialogOpen(false);
    setIsTopicsDialogOpen(false);
    // Close mobile sidebar after applying
    if (isMobile && onClose) {
      onClose();
    }
  };

  const clearSelectedSkill = () => {
    setSkillSearchInput('');
    setSelectedSkill('');
  };

  const allLocations: LocationGroup[] = [
    {
      name: 'Toronto Downtown',
      locations: ['St.George Campus', 'Bay Street/Financial District', 'Toronto Downtown in general']
    },
    {
      name: 'Waterloo Tech Hub',
      locations: ['University of Waterloo Campus', 'Wilfrid Laurier University', 'Uptown Waterloo', 'Waterloo in general']
    },
    {
      name: 'London/Ivey Hub',
      locations: ['Western University Main Campus', 'Ivey Business School Area', 'Richmond Row(Dt. London)', 'London in general']
    }
  ];

  const defaultLocations = allLocations[0].locations; // Toronto Downtown as default

  // For mobile, show all locations immediately; for web, show default and use dialog
  const displayLocations = isMobile ? allLocations.flatMap(group => group.locations) : defaultLocations;
  const showAllLocations = isMobile ? true : false;

  const allSkillCategories: SkillCategory[] = [
    {
      name: 'Wellness & Self-Care',
      skills: ['StrengthTraining', 'RunTraining', 'NutritionBasics', 'SleepOptimization', 'Mindfulness']
    },
    {
      name: 'Lifestyle & Hobbies',
      skills: ['CoffeeBrewing', 'MealPrep', 'TravelPlanning', 'HomeOrganization', 'IndoorPlants']
    },
    {
      name: 'Lifestyle & Culture',
      skills: ['PodcastCuration', 'PersonalStyle', 'SkincareBasics', 'HomeStyling', 'SustainableLiving']
    },
    {
      name: 'Sports',
      skills: ['Pickleball', 'SwimmingBasics', 'TennisBasics', 'CyclingTraining', 'HikingSkills']
    },
    {
      name: 'Practical Pro Skills',
      skills: ['AIProductivity', 'PresentationStorytelling', 'MockInterview', 'Networking', 'ProjectManagement']
    },
    {
      name: 'Money & Strategy',
      skills: ['Budgeting', 'ETFInvesting', 'TaxBasics', 'CreditCardPoints', 'SideHustlePricing']
    },
    {
      name: 'Creative & Hobbies',
      skills: ['ShortFormVideoEditing', 'PhotographyBasics', 'FigmaDesign', 'Copywriting', 'AIGeneratedContent']
    },
    {
      name: 'Languages',
      skills: ['EnglishSpeaking', 'FrenchBasics', 'SpanishBasics', 'JapaneseBasics', 'BusinessWriting']
    }
  ];

  return (
    <div className={`${isMobile ? 'w-full' : 'w-full lg:w-80'} space-y-6 flex-shrink-0`}>
      {/* Find Locations - First */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={() => setIsLocationsOpen(!isLocationsOpen)}
          className="w-full flex items-center justify-between mb-3 lg:mb-3"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-gray-900">FIND LOCATIONS</h2>
            {selectedLocations.size > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {selectedLocations.size}/3
              </span>
            )}
            {!isMobile && selectedLocations.size > 0 && (
              <div className="flex flex-wrap gap-1">
                {Array.from(selectedLocations).map((location) => (
                  <span
                    key={location}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium"
                  >
                    <span className="max-w-[80px] truncate">{location}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLocationToggle(location);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={`Remove ${location}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${isMobile ? '' : 'lg:hidden'} ${
              isLocationsOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className={`${isLocationsOpen ? 'block' : 'hidden'} ${isMobile ? '' : 'lg:block'}`}>
          {showAllLocations ? (
            // Mobile: Show all locations grouped
            <div className="space-y-4">
              {allLocations.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">{group.name}</h3>
                    <div className="space-y-2">
                      {group.locations.map((location, locIdx) => (
                        <label 
                          key={locIdx} 
                          className={`flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded ${
                            !selectedLocations.has(location) && selectedLocations.size >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLocations.has(location)}
                            onChange={() => handleLocationToggle(location)}
                            disabled={!selectedLocations.has(location) && selectedLocations.size >= 3}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3 disabled:cursor-not-allowed"
                          />
                          <span className="text-sm text-gray-700">{location}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            // Web: Show default locations (Toronto Downtown) with "See more..." button
            <div>
              <div className="space-y-2">
                {defaultLocations.map((location, idx) => (
                  <label 
                    key={idx} 
                    className={`flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded ${
                      !selectedLocations.has(location) && selectedLocations.size >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLocations.has(location)}
                      onChange={() => handleLocationToggle(location)}
                      disabled={!selectedLocations.has(location) && selectedLocations.size >= 3}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => setIsLocationDialogOpen(true)}
                className="text-blue-600 text-sm mt-3 hover:underline"
              >
                See more...
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Find Skills - Second */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <button
          onClick={() => setIsSkillsOpen(!isSkillsOpen)}
          className="w-full flex items-center justify-between mb-3 lg:mb-3"
        >
          <h2 className="font-semibold text-gray-900">FIND SKILLS</h2>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${isMobile ? '' : 'lg:hidden'} ${
              isSkillsOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className={`${isSkillsOpen ? 'block' : 'hidden'} ${isMobile ? '' : 'lg:block'}`}>
          {selectedSkill && (
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                #{selectedSkill}
              </span>
              <button
                onClick={clearSelectedSkill}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Clear selected skill"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              value={skillSearchInput}
              onChange={handleInputChange}
              onKeyDown={handleSkillSearchKeyDown}
              placeholder="e.g. Graphic Design"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Popular Topics */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Popular Topics</h2>
        <div className="flex flex-wrap gap-2">
          {popularTopics.map((topic, idx) => (
            <button
              key={idx}
              onClick={() => handleSkillClick(topic)}
              className={`text-sm cursor-pointer transition-colors ${
                selectedSkill === topic
                  ? 'bg-blue-600 text-white px-2 py-1 rounded-full font-medium'
                  : 'text-blue-600 hover:underline'
              }`}
            >
              #{topic}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setIsTopicsDialogOpen(true)}
          className="text-blue-600 text-sm mt-2 hover:underline"
        >
          See more...
        </button>
      </div>

      {/* Apply Button */}
      <div className={isMobile ? 'sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-4' : ''}>
        <button
          onClick={handleApply}
          disabled={selectedLocations.size === 0 && !skillSearchInput.trim()}
          className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
        >
          Apply
        </button>
      </div>


      {/* Footer Links */}
      <div className="text-xs text-gray-500 space-y-1">
        <div className="flex flex-wrap gap-3">
          <a href="#" className="hover:text-gray-700">About</a>
          <a href="#" className="hover:text-gray-700">Accessibility</a>
          <a href="#" className="hover:text-gray-700">Help Center</a>
          <a href="#" className="hover:text-gray-700">Privacy & Terms</a>
        </div>
        <p className="mt-2">© 2024 Slash Skill</p>
      </div>

      {/* Location Dialog for Web */}
      {isLocationDialogOpen && !isMobile && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4 m-0" onClick={() => setIsLocationDialogOpen(false)} style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}>
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">All Locations</h2>
                {selectedLocations.size > 0 && (
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {selectedLocations.size}/3
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsLocationDialogOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close dialog"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allLocations.map((group, groupIdx) => (
                  <div key={groupIdx}>
                    <h3 className="font-semibold text-gray-900 mb-3">{group.name}</h3>
                    <div className="space-y-2">
                      {group.locations.map((location, locIdx) => (
                        <label 
                          key={locIdx} 
                          className={`flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded ${
                            !selectedLocations.has(location) && selectedLocations.size >= 3 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedLocations.has(location)}
                            onChange={() => handleLocationToggle(location)}
                            disabled={!selectedLocations.has(location) && selectedLocations.size >= 3}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-3 disabled:cursor-not-allowed"
                          />
                          <span className="text-sm text-gray-700">{location}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setIsLocationDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topics Dialog */}
      {isTopicsDialogOpen && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4 m-0" onClick={() => setIsTopicsDialogOpen(false)} style={{ top: 0, left: 0, right: 0, bottom: 0, margin: 0 }}>
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-gray-900">All Topics</h2>
              <button
                onClick={() => setIsTopicsDialogOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close dialog"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {allSkillCategories.map((category, categoryIdx) => (
                  <div key={categoryIdx} className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {category.name}
                    </h3>
                    <div className="space-y-1">
                      {category.skills.map((skill, skillIdx) => (
                        <button
                          key={skillIdx}
                          onClick={() => handleSkillClick(skill)}
                          className={`w-full text-left flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded transition-colors text-sm ${
                            selectedSkill === skill
                              ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200'
                              : 'text-gray-700'
                          }`}
                        >
                          <span>#{skill}</span>
                          {selectedSkill === skill && (
                            <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setIsTopicsDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
