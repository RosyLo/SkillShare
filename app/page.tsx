// #region agent log
'use client';
if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/page.tsx:1', message: 'Page component import start', data: { timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { }); }
// #endregion



import Header from '@/components/Header';
// #region agent log
if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/page.tsx:5', message: 'Header imported', data: { headerExists: !!Header }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { }); }
// #endregion

import TabNavigation, { type PostTypeTab } from '@/components/TabNavigation';
// #region agent log
if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/page.tsx:8', message: 'TabNavigation imported', data: { tabNavExists: !!TabNavigation }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { }); }
// #endregion

import PostCard from '@/components/PostCard';
// #region agent log
if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/page.tsx:11', message: 'PostCard imported', data: { postCardExists: !!PostCard }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { }); }
// #endregion

import Sidebar from '@/components/Sidebar';
// #region agent log
if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/page.tsx:14', message: 'Sidebar imported', data: { sidebarExists: !!Sidebar }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { }); }
// #endregion

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/LoginModal';
import ProfileCreationFlow from '@/components/ProfileCreationFlow';
import CreatePostModal, { type EditPostData } from '@/components/CreatePostModal';
import AIGuideFlow from '@/components/AIGuideFlow';
import AIGeneratedProfile from '@/components/AIGeneratedProfile';
import { fetchPosts, deletePost, toggleLike, fetchUserLikes, dbPostToCardProps, saveAIGuideResult, type DbPost, type AIGuidePayload } from '@/lib/database';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileFlow, setShowProfileFlow] = useState(false);
  const [hasCompletedProfile, setHasCompletedProfile] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<EditPostData | null>(null);
  const [dbPosts, setDbPosts] = useState<DbPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [userLikedPosts, setUserLikedPosts] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<{ locations: string[]; skills: string[] }>({ locations: [], skills: [] });
  const [activeTab, setActiveTab] = useState<PostTypeTab>('All');
  const [showAIGuide, setShowAIGuide] = useState(false);
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [aiGuideData, setAiGuideData] = useState<AIGuidePayload | null>(null);
  const router = useRouter();

  // Load posts from Supabase
  const loadPosts = useCallback(async () => {
    try {
      const data = await fetchPosts();
      setDbPosts(data);
      // Fetch which posts the current user has liked
      if (data.length > 0) {
        const likedSet = await fetchUserLikes(data.map(p => p.id));
        setUserLikedPosts(likedSet);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setPostsLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    // Check for auth success from OAuth callback
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const authStatus = urlParams.get('auth');
      if (authStatus === 'success') {
        // Clear the URL parameter
        window.history.replaceState({}, '', '/');
        // Trigger user data refresh from cookie (no page reload needed)
        const cookies = document.cookie.split(';');
        const userCookie = cookies.find(cookie => cookie.trim().startsWith('user='));
        if (userCookie) {
          try {
            const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]));
            // Update localStorage so AuthContext picks it up
            localStorage.setItem('user', JSON.stringify(userData));
            // Trigger auth success event for AuthContext to update
            window.dispatchEvent(new Event('auth-success'));
          } catch (e) {
            console.error('Error parsing user cookie:', e);
          }
        }
      }
    }

    // Check if user has completed profile
    const profileCompleted = localStorage.getItem('profileCompleted');
    if (profileCompleted === 'true') {
      setHasCompletedProfile(true);
    } else if (isAuthenticated && !authLoading) {
      // First login via OAuth redirect — show welcome modal
      setShowProfileFlow(true);
    }
  }, [isAuthenticated, authLoading]);

  const handleInteractionClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      // Handle interaction for authenticated users
      console.log('Interaction clicked by authenticated user');
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    // Show profile creation flow after successful login/signup
    if (!hasCompletedProfile) {
      setShowProfileFlow(true);
    }
  };

  const handleProfileComplete = () => {
    setHasCompletedProfile(true);
    localStorage.setItem('profileCompleted', 'true');
    setShowProfileFlow(false);
  };

  const handleCreatePost = (postData: any) => {
    console.log('Post saved:', postData);
  };

  const handlePostCreated = () => {
    loadPosts(); // Refresh posts from Supabase
  };

  const handleEditPost = (post: DbPost) => {
    setEditingPost({
      id: post.id,
      type: post.type,
      locations: post.locations || [],
      skill_category: post.skill_category,
      purpose_expectations: post.purpose_expectations,
      content: post.content,
      media_urls: post.media_urls || [],
    });
    setShowCreatePostModal(true);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      await deletePost(postId);
      loadPosts(); // Refresh the list
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // #region agent log
  if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/page.tsx:20', message: 'Home component render start', data: { timestamp: Date.now() }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { }); }
  // #endregion
  const demoPosts = [
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
  if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/page.tsx:30', message: 'Before render return', data: { postsCount: dbPosts.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { }); }
  // #endregion

  // #region agent log
  if (typeof window === 'undefined') { fetch('http://127.0.0.1:7242/ingest/4a827106-1332-4d1b-a7a1-7ea4514f6b81', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'app/page.tsx:34', message: 'Rendering Header', data: {}, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { }); }
  // #endregion

  const handleApplyFilters = async (selectedLocations: string[], selectedSkills: string[]) => {
    setIsLoading(true);
    // Brief loading animation
    await new Promise(resolve => setTimeout(resolve, 400));
    setActiveFilters({ locations: selectedLocations, skills: selectedSkills });
    setIsLoading(false);
  };

  // Filter posts based on active filters
  const filterPost = (postLocations: string[], postSkill: string | null) => {
    const { locations, skills } = activeFilters;
    const hasLocationFilter = locations.length > 0;
    const hasSkillFilter = skills.length > 0 && skills[0] !== '';

    if (!hasLocationFilter && !hasSkillFilter) return true; // No filters → show all

    let locationMatch = !hasLocationFilter; // If no location filter, auto-pass
    let skillMatch = !hasSkillFilter; // If no skill filter, auto-pass

    if (hasLocationFilter) {
      // Check if any selected filter location matches any post location
      locationMatch = locations.some(filterLoc =>
        postLocations.some(postLoc =>
          postLoc.toLowerCase().includes(filterLoc.toLowerCase()) ||
          filterLoc.toLowerCase().includes(postLoc.toLowerCase())
        )
      );
    }

    if (hasSkillFilter) {
      const filterSkill = skills[0].toLowerCase();
      skillMatch = postSkill
        ? postSkill.toLowerCase().includes(filterSkill) || filterSkill.includes(postSkill.toLowerCase())
        : false;
    }

    // Both filters must match (AND logic)
    return locationMatch && skillMatch;
  };

  const filteredDbPosts = dbPosts.filter(p => {
    if (activeTab !== 'All' && p.type !== activeTab) return false;
    return filterPost(p.locations || [], p.skill_category);
  });

  const filteredDemoPosts = activeTab !== 'All'
    ? [] // Demo posts don't have a real type, hide them when filtering by type
    : demoPosts.filter(p =>
      filterPost(
        p.location ? p.location.split(',').map(l => l.trim()) : [],
        p.skills?.[0] || null
      )
    );

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={() => setShowLoginModal(true)}
        onCreatePostClick={() => {
          if (!isAuthenticated) {
            setShowLoginModal(true);
          } else {
            setShowCreatePostModal(true);
          }
        }}
      />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

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
            {/* Active filter badges */}
            {(activeFilters.locations.length > 0 || (activeFilters.skills.length > 0 && activeFilters.skills[0] !== '')) && (
              <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <span className="text-xs font-medium text-blue-700 shrink-0">Active filters:</span>
                {activeFilters.locations.map(loc => (
                  <span
                    key={loc}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${loc === 'Virtual' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {loc === 'Virtual' && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    {loc}
                    <button
                      onClick={() => {
                        const newLocations = activeFilters.locations.filter(l => l !== loc);
                        setActiveFilters({ ...activeFilters, locations: newLocations });
                      }}
                      className="ml-0.5 hover:text-red-500"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                {activeFilters.skills.filter(s => s !== '').map(skill => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    #{skill}
                    <button
                      onClick={() => {
                        const newSkills = activeFilters.skills.filter(s => s !== skill);
                        setActiveFilters({ ...activeFilters, skills: newSkills });
                      }}
                      className="ml-0.5 hover:text-red-500"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setActiveFilters({ locations: [], skills: [] })}
                  className="text-xs text-red-500 hover:text-red-700 font-medium ml-1"
                >
                  Clear all
                </button>
              </div>
            )}
            {postsLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Database posts (newest first) */}
                {filteredDbPosts.map((dbPost) => {
                  const cardProps = dbPostToCardProps(dbPost);
                  return (
                    <PostCard
                      key={cardProps.id}
                      {...cardProps}
                      onInteractionClick={handleInteractionClick}
                      isOwner={!!user && user.id === dbPost.user_id}
                      onEdit={() => handleEditPost(dbPost)}
                      onDelete={() => handleDeletePost(dbPost.id)}
                      initialHasLiked={userLikedPosts.has(dbPost.id)}
                      onLike={async () => {
                        if (!isAuthenticated) { handleInteractionClick(); return; }
                        return await toggleLike(dbPost.id);
                      }}
                    />
                  );
                })}
                {/* Demo posts */}
                {filteredDemoPosts.map((post, idx) => (
                  <PostCard key={`demo-${idx}`} {...post} onInteractionClick={handleInteractionClick} />
                ))}
                {/* No results message */}
                {filteredDbPosts.length === 0 && filteredDemoPosts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-lg font-medium">No posts found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </>
            )}
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

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Profile Creation Flow */}
      <ProfileCreationFlow
        isOpen={showProfileFlow}
        onClose={() => setShowProfileFlow(false)}
        onComplete={handleProfileComplete}
        onStartManual={() => {
          // Go straight to creating a service post
          setShowCreatePostModal(true);
        }}
        onStartAI={() => {
          setShowAIGuide(true);
        }}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        key={showCreatePostModal ? (editingPost?.id || 'new-post') : 'closed'}
        isOpen={showCreatePostModal}
        onClose={() => {
          setShowCreatePostModal(false);
          setEditingPost(null);
        }}
        onSubmit={handleCreatePost}
        onPostCreated={handlePostCreated}
        editPost={editingPost}
      />

      {/* AI Onboarding Flow */}
      <AIGuideFlow
        isOpen={showAIGuide}
        onClose={() => setShowAIGuide(false)}
        onComplete={(data: AIGuidePayload) => {
          // Instead of saving immediately, show preview
          setAiGuideData(data);
          setShowAIGuide(false);
          setShowAIPreview(true);
        }}
      />

      {/* AI Guide Preview Modal */}
      {aiGuideData && (
        <AIGeneratedProfile
          isOpen={showAIPreview}
          onClose={() => {
            setShowAIPreview(false);
            setAiGuideData(null);
          }}
          userId={user?.id || ''}
          userName={user?.name || 'User'}
          userAvatar={user?.picture || null}
          payload={aiGuideData}
          onComplete={() => {
            setShowAIPreview(false);
            setAiGuideData(null);
            if (user?.id) {
              router.push(`/profile/${user.id}`);
            }
          }}
        />
      )}
    </div>
  );
}
