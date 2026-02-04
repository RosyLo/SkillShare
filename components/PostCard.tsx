import React from 'react';

interface PostCardProps {
  name: string;
  role: string;
  timeAgo: string;
  rating: number;
  location: string;
  skills?: string[];
  needs?: string[];
  content: string;
  hashtags: string[];
  likes: number;
  type: 'community' | 'learner' | 'experience' | 'service';
  images?: string[];
}

export default function PostCard({
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
}: PostCardProps) {
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
          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{name}</h3>
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm text-gray-600">{rating}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">{role} • {timeAgo}</p>
          </div>
        </div>
        <button className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
          {type}
        </button>
      </div>

      <div className="mb-3 space-y-1">
        <p className="text-sm text-gray-600">
          <span className="font-medium">LOCATION</span> {location}
        </p>
        {skills && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">SKILLS</span> {skills.join(' ')}
          </p>
        )}
        {needs && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">NEEDS</span> {needs.join(' ')}
          </p>
        )}
      </div>

      <p className="text-gray-900 mb-3">{content}</p>

      {images && images.length > 0 && (
        <div className="flex space-x-2 mb-3">
          {images.slice(0, 3).map((img, idx) => (
            <div key={idx} className="relative w-20 h-20 rounded-lg bg-gray-200 flex-shrink-0 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
              {idx === 2 && images.length > 3 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">+{images.length - 3}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {hashtags.map((tag, idx) => (
          <span key={idx} className="text-blue-600 text-sm hover:underline cursor-pointer">#{tag}</span>
        ))}
      </div>

      <div className="flex items-center space-x-4 pt-3 border-t border-gray-100">
        <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-900">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span className="text-sm">{likes}</span>
        </button>
        {type === 'community' && (
          <span className="text-sm text-gray-500">saved</span>
        )}
      </div>
    </div>
  );
}
