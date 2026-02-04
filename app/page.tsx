// #region agent log
'use client';
if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:1',message:'Page component import start',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{}); }
// #endregion



import Header from '@/components/Header';
// #region agent log
if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:5',message:'Header imported',data:{headerExists:!!Header},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{}); }
// #endregion

import TabNavigation from '@/components/TabNavigation';
// #region agent log
if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:8',message:'TabNavigation imported',data:{tabNavExists:!!TabNavigation},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{}); }
// #endregion

import PostCard from '@/components/PostCard';
// #region agent log
if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:11',message:'PostCard imported',data:{postCardExists:!!PostCard},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{}); }
// #endregion

import Sidebar from '@/components/Sidebar';
// #region agent log
if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:14',message:'Sidebar imported',data:{sidebarExists:!!Sidebar},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{}); }
// #endregion

import { useState } from 'react';

export default function Home() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // #region agent log
  if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:20',message:'Home component render start',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{}); }
  // #endregion
  const posts = [
    {
      name: 'Alex Mitchell',
      role: 'Musician',
      timeAgo: '2h ago',
      rating: 4.5,
      location: 'New York, NY, Virtual',
      skills: ['Guitar', 'Music Theory'],
      content: 'organize a study group for fench learning',
      hashtags: ['Music', 'Guitar'],
      likes: 24,
      type: 'community' as const,
    },
    {
      name: 'Chef Marcus',
      role: 'Executive Chef',
      timeAgo: '45m ago',
      rating: 4.5,
      location: 'Austin, TX',
      skills: ['Cooking', 'Meal Prep', 'Fine Dining'],
      content: "Chef's Weekly Reflections: The Art of Seasoning Just wrapped up a fantastic week of private lessons. I've compiled some notes and photos from our plating session on how visual balance affects taste...",
      hashtags: ['CookingTips', 'CulinaryArts', 'FoodPhotography'],
      likes: 42,
      type: 'experience' as const,
      images: ['img1', 'img2', 'img3', 'img4', 'img5', 'img6'],
    },
    {
      name: 'Sarah Jenkins',
      role: 'Senior Product Designer',
      timeAgo: '5h ago',
      rating: 4.5,
      location: 'San Francisco, CA',
      needs: ['React Developer', 'Frontend'],
      content: "I'm looking for a frontend developer to help me build out a portfolio site. In exchange, I can offer comprehensive UX mentoring, portfolio reviews, and career advice for designers. Let's swap skills!",
      hashtags: ['UXDesign', 'Mentorship', 'Barter'],
      likes: 156,
      type: 'learner' as const,
    },
  ];

  // #region agent log
  if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:30',message:'Before render return',data:{postsCount:posts.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{}); }
  // #endregion

  // #region agent log
  if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app/page.tsx:34',message:'Rendering Header',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{}); }
  // #endregion

  const handleApplyFilters = async (selectedLocations: string[], selectedSkills: string[]) => {
    setIsLoading(true);
    // Simulate search/API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    // Here you would filter the posts based on selectedLocations and selectedSkills
    console.log('Applied filters:', { selectedLocations, selectedSkills });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <TabNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Toggle Button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className="lg:hidden mb-4 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 text-sm">Searching...</p>
                </div>
              </div>
            )}
            {posts.map((post, idx) => (
              <PostCard key={idx} {...post} />
            ))}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block w-auto">
            <Sidebar onApply={handleApplyFilters} />
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isFilterOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)}>
          <div 
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close filters"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <Sidebar isMobile={true} onApply={handleApplyFilters} onClose={() => setIsFilterOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
