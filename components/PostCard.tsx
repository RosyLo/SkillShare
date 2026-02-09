'use client';

import React, { useState, useRef, useEffect } from 'react';

interface PostCardProps {
  id?: string;
  userId?: string;
  name: string;
  role: string;
  timeAgo: string;
  rating: number;
  location: string;
  skills?: string[];
  needs?: string[];
  content: string;
  hashtags?: string[];
  likes: number;
  type: 'community' | 'learner' | 'experience' | 'service';
  images?: string[];
  userPicture?: string | null;
  onInteractionClick?: () => void;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onLike?: () => Promise<{ liked: boolean; newCount: number } | void>;
  initialHasLiked?: boolean;
}

export default function PostCard({
  userId,
  name,
  role,
  timeAgo,
  rating,
  location,
  skills,
  needs,
  content,
  hashtags,
  likes,
  type,
  images,
  userPicture,
  onInteractionClick,
  isOwner,
  onEdit,
  onDelete,
  onLike,
  initialHasLiked = false,
}: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [isLiking, setIsLiking] = useState(false);
  const contentRef = useRef<HTMLParagraphElement>(null);
  const [isClamped, setIsClamped] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Detect if content is clamped (overflowing)
  // Must check when NOT expanded (line-clamp applied)
  useEffect(() => {
    if (!expanded) {
      // Use rAF to wait for layout after line-clamp is applied
      requestAnimationFrame(() => {
        const el = contentRef.current;
        if (el) {
          setIsClamped(el.scrollHeight > el.clientHeight + 1);
        }
      });
    }
  }, [content, expanded]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'community':
        return 'bg-green-100 text-green-800';
      case 'learner':
        return 'bg-blue-100 text-blue-800';
      case 'experience':
        return 'bg-purple-100 text-purple-800';
      case 'service':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <a href={userId ? `/profile/${userId}` : '#'} className="flex-shrink-0">
            {userPicture ? (
              <img src={userPicture} alt={name} className="w-12 h-12 rounded-full flex-shrink-0 object-cover hover:ring-2 hover:ring-blue-300 transition-all" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-blue-300 transition-all">
                <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </a>
          <div>
            <div className="flex items-center space-x-2">
              <a href={userId ? `/profile/${userId}` : '#'} className="font-semibold text-gray-900 hover:text-blue-600 hover:underline transition-colors">{name}</a>
              {rating > 0 && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm text-gray-600">{rating}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">{role} • {timeAgo}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
            {type}
          </span>
          {isOwner && (onEdit || onDelete) && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="More options"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onEdit();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                        onDelete();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mb-3 space-y-2">
        {location && (
          <div className="flex items-start gap-2">
            <span className="font-medium text-sm text-gray-600 shrink-0 pt-0.5">LOCATION</span>
            <div className="flex flex-wrap gap-1.5">
              {location.split(',').map((loc, idx) => {
                const trimmed = loc.trim();
                const isVirtual = trimmed === 'Virtual';
                return (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      isVirtual
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {isVirtual && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    {trimmed}
                  </span>
                );
              })}
            </div>
          </div>
        )}
        {skills && skills.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="font-medium text-sm text-gray-600 shrink-0 pt-0.5">SKILLS</span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {needs && needs.length > 0 && (
          <div className="flex items-start gap-2">
            <span className="font-medium text-sm text-gray-600 shrink-0 pt-0.5">NEEDS</span>
            <div className="flex flex-wrap gap-1.5">
              {needs.map((need, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                  {need}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <p
        ref={contentRef}
        className={`text-gray-900 whitespace-pre-line ${expanded ? '' : 'line-clamp-4'}`}
      >
        {content}
      </p>
      {(isClamped || expanded) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium mb-3"
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
      {!isClamped && !expanded && <div className="mb-3" />}

      {images && images.length > 0 && (
        <div className="mb-3">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Post image ${idx + 1}`}
              className="w-full max-h-80 object-cover rounded-lg border border-gray-200"
            />
          ))}
        </div>
      )}

      {hashtags && hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {hashtags.map((tag, idx) => (
            <span key={idx} className="text-blue-600 text-sm hover:underline cursor-pointer">#{tag}</span>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (onInteractionClick) onInteractionClick();
          }}
          className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
        <button 
          onClick={async (e) => {
            e.stopPropagation();
            if (isLiking) return;
            if (onLike) {
              // Optimistic update — instant UI feedback
              const prevLiked = hasLiked;
              const prevCount = likeCount;
              setHasLiked(!prevLiked);
              setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);
              setIsLiking(true);
              try {
                const result = await onLike();
                // Sync with actual server result
                if (result && typeof result === 'object') {
                  setHasLiked(result.liked);
                  setLikeCount(result.newCount);
                }
              } catch {
                // Revert on failure
                setHasLiked(prevLiked);
                setLikeCount(prevCount);
              } finally {
                setIsLiking(false);
              }
            } else if (onInteractionClick) {
              onInteractionClick();
            }
          }}
          className={`flex items-center space-x-1 transition-colors ${
            hasLiked
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <svg className="w-5 h-5" fill={hasLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span className="text-sm">{likeCount}</span>
        </button>
        {type === 'community' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onInteractionClick) onInteractionClick();
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            saved
          </button>
        )}
      </div>
    </div>
  );
}
