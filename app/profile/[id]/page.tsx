'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  fetchProfile,
  upsertProfile,
  fetchPostsByUser,
  fetchProfileServices,
  deletePost,
  dbPostToCardProps,
  getTimeAgo,
  type DbProfile,
  type DbPost,
  type DbProfileService,
} from '@/lib/database';
import Header from '@/components/Header';
import LoginModal from '@/components/LoginModal';
import CreatePostModal, { type EditPostData } from '@/components/CreatePostModal';
import ProfileCreationFlow from '@/components/ProfileCreationFlow';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const isOwner = isAuthenticated && user?.id === userId;

  const [profile, setProfile] = useState<DbProfile | null>(null);
  const [posts, setPosts] = useState<DbPost[]>([]);
  const [services, setServices] = useState<DbProfileService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Edit states
  const [isEditingHeading, setIsEditingHeading] = useState(false);
  const [editHeading, setEditHeading] = useState('');
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editStory, setEditStory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Post edit/delete states
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [editingPost, setEditingPost] = useState<EditPostData | null>(null);

  // Welcome modal state
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

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
      loadData();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Scroll refs for carousel sections
  const recsScrollRef = useRef<HTMLDivElement>(null);
  const activityScrollRef = useRef<HTMLDivElement>(null);
  const servicesScrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (!ref.current) return;
    const scrollAmount = ref.current.clientWidth * 0.8;
    ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [profileData, postsData, servicesData] = await Promise.all([
        fetchProfile(userId),
        fetchPostsByUser(userId),
        fetchProfileServices(userId),
      ]);
      setProfile(profileData);
      setPosts(postsData);
      setServices(servicesData);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadData();
  }, [userId, loadData]);

  const handleSaveHeading = async () => {
    if (!isOwner) return;
    setIsSaving(true);
    try {
      const updated = await upsertProfile({
        display_name: profile?.display_name || user?.name || 'User',
        heading: editHeading,
        slash_story: profile?.slash_story || undefined,
      });
      setProfile(updated);
      setIsEditingHeading(false);
    } catch (err) {
      console.error('Error saving heading:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStory = async () => {
    if (!isOwner) return;
    setIsSaving(true);
    try {
      const updated = await upsertProfile({
        display_name: profile?.display_name || user?.name || 'User',
        heading: profile?.heading || undefined,
        slash_story: editStory,
      });
      setProfile(updated);
      setIsEditingStory(false);
    } catch (err) {
      console.error('Error saving story:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onLoginClick={() => setShowLoginModal(true)} />
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const displayName = profile?.display_name || posts[0]?.user_name || 'User';
  const avatarUrl = profile?.avatar_url || posts[0]?.user_picture || null;

  // Group posts by type for different sections
  const recentPosts = posts.filter(p => p.type === 'experience').slice(0, 6);
  const servicePosts = posts.filter(p => p.type === 'service');

  // Profile is incomplete if owner has no heading
  const isProfileIncomplete = !!(isOwner && !profile?.heading);
  const typeLabels: Record<string, string> = {
    community: 'Community',
    learner: 'Seek Assistance',
    experience: 'Share Insights',
    service: 'Provide Service',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={() => setShowLoginModal(true)}
        onCreatePostClick={() => router.push('/')}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Gradient Banner */}
          <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-100 via-pink-100 to-purple-100 relative">
            {isProfileIncomplete && (
              <button
                onClick={() => setShowWelcomeModal(true)}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-xl px-5 py-3 shadow-md hover:shadow-lg hover:bg-white transition-all flex items-center gap-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                  AI journey help you build your profile and service
                </span>
              </button>
            )}
          </div>

          {/* Avatar + Info */}
          <div className="px-6 pb-6 -mt-16 sm:-mt-20">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-orange-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-16 h-16 text-orange-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>

            {/* Name + Verified */}
            <div className="mt-4 flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{displayName}</h1>
              {profile?.is_verified && (
                <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>

            {/* Heading (bio) */}
            <div className="mt-3 group relative">
              {isEditingHeading ? (
                <div className="space-y-2">
                  <textarea
                    value={editHeading}
                    onChange={(e) => setEditHeading(e.target.value)}
                    placeholder="Write your profile heading... e.g. What you're passionate about, what you offer"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-700"
                    rows={3}
                    maxLength={300}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveHeading}
                      disabled={isSaving}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditingHeading(false)}
                      className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <span className="text-xs text-gray-400 ml-auto">{editHeading.length}/300</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <p className="text-gray-600 leading-relaxed">
                    {profile?.heading || (isOwner ? (
                      <span className="text-gray-400 italic">Click the pencil to add your profile heading...</span>
                    ) : (
                      <span className="text-gray-400">No bio yet</span>
                    ))}
                  </p>
                  {isOwner && (
                    <button
                      onClick={() => {
                        setEditHeading(profile?.heading || '');
                        setIsEditingHeading(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0"
                      title="Edit heading"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The Slash Story */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="group relative">
            <h2 className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-3">THE SLASH STORY</h2>
            {isEditingStory ? (
              <div className="space-y-2">
                <textarea
                  value={editStory}
                  onChange={(e) => setEditStory(e.target.value)}
                  placeholder="Share your personal story... What brought you here? What's your journey?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-600 italic"
                  rows={4}
                  maxLength={1000}
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveStory}
                    disabled={isSaving}
                    className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setIsEditingStory(false)}
                    className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <span className="text-xs text-gray-400 ml-auto">{editStory.length}/1000</span>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                {profile?.slash_story ? (
                  <p className="text-gray-600 italic leading-relaxed">&ldquo;{profile.slash_story}&rdquo;</p>
                ) : isOwner ? (
                  <p className="text-gray-400 italic">Click the pencil to share your story...</p>
                ) : (
                  <p className="text-gray-400 italic">No story yet</p>
                )}
                {isOwner && (
                  <button
                    onClick={() => {
                      setEditStory(profile?.slash_story || '');
                      setIsEditingStory(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded-lg flex-shrink-0"
                    title="Edit story"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-1 bg-blue-600 rounded"></div>
        </div>

        {/* Featured Recommendations */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Featured Recommendations</h2>
            {/* Arrows hidden — no recommendations to browse yet */}
          </div>
          <p className="text-gray-400 text-sm">No recommendations yet</p>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
            {recentPosts.length > 3 && (
              <div className="flex gap-2">
                <button
                  onClick={() => scrollBy(activityScrollRef, 'left')}
                  className="p-1.5 rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => scrollBy(activityScrollRef, 'right')}
                  className="p-1.5 rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          {recentPosts.length > 0 ? (
            <div
              ref={activityScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recentPosts.map((post) => {
                const hasImage = post.media_urls && post.media_urls.length > 0;
                return (
                  <ProfilePostCard
                    key={post.id}
                    post={post}
                    hasImage={hasImage}
                    typeLabel={typeLabels[post.type] || post.type}
                    isOwner={!!isOwner}
                    onEdit={() => handleEditPost(post)}
                    onDelete={() => handleDeletePost(post.id)}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No activity yet</p>
          )}
        </div>

        {/* My Services */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <h2 className="text-lg font-bold text-gray-900">My Services</h2>
            </div>
            <div className="flex items-center gap-3">
              {isOwner && (
                <button
                  onClick={() => router.push('/')}
                  className="text-blue-600 text-sm hover:underline font-medium"
                >
                  Add Service
                </button>
              )}
              {(servicePosts.length + services.length) > 3 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => scrollBy(servicesScrollRef, 'left')}
                    className="p-1.5 rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollBy(servicesScrollRef, 'right')}
                    className="p-1.5 rounded-full border border-gray-300 text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          {servicePosts.length > 0 || services.length > 0 ? (
            <div
              ref={servicesScrollRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Database services */}
              {services.map((svc) => (
                <div key={svc.id} className="bg-white rounded-xl border border-gray-200 p-5 flex-shrink-0 w-[calc(33.333%-11px)] min-w-[220px]">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    svc.icon_color === 'green' ? 'bg-green-50' : svc.icon_color === 'orange' ? 'bg-orange-50' : 'bg-blue-50'
                  }`}>
                    <svg className={`w-5 h-5 ${
                      svc.icon_color === 'green' ? 'text-green-600' : svc.icon_color === 'orange' ? 'text-orange-600' : 'text-blue-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  {svc.category && (
                    <p className="text-xs font-bold text-blue-600 tracking-wide uppercase mb-1">{svc.category}</p>
                  )}
                  <h3 className="font-bold text-gray-900 text-sm">{svc.title}</h3>
                  {svc.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{svc.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    {svc.price && <span className="text-sm font-bold text-blue-600">{svc.price}</span>}
                    {svc.service_type && <span className="text-xs text-gray-500">{svc.service_type}</span>}
                  </div>
                </div>
              ))}
              {/* Service type posts */}
              {servicePosts.map((post) => (
                <div key={post.id} className="bg-white rounded-xl border border-gray-200 p-5 flex-shrink-0 w-[calc(33.333%-11px)] min-w-[220px] relative group/svc">
                  {isOwner && (
                    <PostCardMenu
                      onEdit={() => handleEditPost(post)}
                      onDelete={() => handleDeletePost(post.id)}
                    />
                  )}
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  {post.skill_category && (
                    <p className="text-xs font-bold text-purple-600 tracking-wide uppercase mb-1">{post.skill_category}</p>
                  )}
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                    {post.content || post.purpose_expectations || 'Service'}
                  </h3>
                  {post.locations && post.locations.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">{post.locations.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No services yet</p>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 py-8 border-t border-gray-200">
          <div className="flex justify-center flex-wrap gap-4 mb-2">
            <a href="#" className="hover:text-gray-600">About</a>
            <a href="#" className="hover:text-gray-600">Accessibility</a>
            <a href="#" className="hover:text-gray-600">Help Center</a>
            <a href="/privacy" className="hover:text-gray-600">Privacy</a>
            <a href="/terms" target="_blank" className="hover:text-gray-600">Terms</a>
          </div>
          <p>© 2024 Slash Skill</p>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      )}

      {/* Create/Edit Post Modal */}
      <CreatePostModal
        key={showCreatePostModal ? (editingPost?.id || 'new-post') : 'closed'}
        isOpen={showCreatePostModal}
        onClose={() => {
          setShowCreatePostModal(false);
          setEditingPost(null);
        }}
        onPostCreated={() => loadData()}
        editPost={editingPost}
      />

      {/* Welcome / Profile Creation Modal */}
      <ProfileCreationFlow
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onComplete={() => {
          setShowWelcomeModal(false);
          localStorage.setItem('profileCompleted', 'true');
        }}
        onStartManual={() => {
          setShowCreatePostModal(true);
        }}
        onStartAI={() => {
          // AI guide — future feature
        }}
      />
    </div>
  );
}

/* ─── Small helper: three-dot menu for edit/delete on cards ─── */
function PostCardMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="absolute top-2 right-2 z-10" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-colors opacity-0 group-hover/svc:opacity-100"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Recent Activity card with edit/delete for owner ─── */
function ProfilePostCard({
  post,
  hasImage,
  typeLabel,
  isOwner,
  onEdit,
  onDelete,
}: {
  post: DbPost;
  hasImage: boolean;
  typeLabel: string;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex-shrink-0 w-[calc(33.333%-11px)] min-w-[220px] group/card relative">
      {/* Image or colored placeholder */}
      <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {hasImage ? (
          <img src={post.media_urls[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-3xl opacity-30">
              {post.type === 'community' ? '👥' : post.type === 'learner' ? '🎓' : post.type === 'experience' ? '💡' : '🛠️'}
            </span>
          </div>
        )}
        <span className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-0.5 rounded-full text-xs font-medium text-gray-700">
          {typeLabel}
        </span>
        {/* Owner menu */}
        {isOwner && (
          <div className="absolute top-2 right-2 z-10" ref={menuRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1 rounded-full bg-white/80 text-gray-500 hover:text-gray-700 hover:bg-white transition-colors opacity-0 group-hover/card:opacity-100"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
          {post.content || post.purpose_expectations || post.skill_category || 'Untitled'}
        </h3>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            {post.likes}
          </span>
          <span>{getTimeAgo(post.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
