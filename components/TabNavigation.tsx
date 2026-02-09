import React from 'react';

export type PostTypeTab = 'All' | 'community' | 'learner' | 'experience' | 'service';

interface TabNavigationProps {
  activeTab: PostTypeTab;
  onTabChange: (tab: PostTypeTab) => void;
}

const tabLabels: Record<PostTypeTab, string> = {
  All: 'All',
  community: 'Community',
  learner: 'Seek Assistance',
  experience: 'Share Insights',
  service: 'Provide Service',
};

const tabs: PostTypeTab[] = ['All', 'community', 'learner', 'experience', 'service'];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
