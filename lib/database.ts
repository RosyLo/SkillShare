import { supabase } from './supabase';

// =============================================
// Types
// =============================================
export interface DbPost {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string | null;
  user_picture: string | null;
  type: 'community' | 'learner' | 'experience' | 'service';
  content: string | null;
  locations: string[];
  skill_category: string | null;
  purpose_expectations: string | null;
  media_urls: string[];
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  type: 'community' | 'learner' | 'experience' | 'service';
  content?: string;
  locations?: string[];
  skill_category?: string;
  purpose_expectations?: string;
  media_urls?: string[];
}

// =============================================
// Posts CRUD
// =============================================

/** Fetch all posts, newest first */
export async function fetchPosts(): Promise<DbPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
  return data || [];
}

/** Create a new post (must be logged in) */
export async function createPost(input: CreatePostInput): Promise<DbPost> {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to create a post');
  }

  const row = {
    user_id: user.id,
    user_name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'User',
    user_email: user.email || null,
    user_picture:
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null,
    type: input.type,
    content: input.content || null,
    locations: input.locations || [],
    skill_category: input.skill_category || null,
    purpose_expectations: input.purpose_expectations || null,
    media_urls: input.media_urls || [],
    likes: 0,
  };

  const { data, error } = await supabase
    .from('posts')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }
  return data;
}

/** Update own post */
export async function updatePost(postId: string, input: Partial<CreatePostInput>): Promise<DbPost> {
  const updates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (input.type !== undefined) updates.type = input.type;
  if (input.content !== undefined) updates.content = input.content || null;
  if (input.locations !== undefined) updates.locations = input.locations;
  if (input.skill_category !== undefined) updates.skill_category = input.skill_category || null;
  if (input.purpose_expectations !== undefined) updates.purpose_expectations = input.purpose_expectations || null;
  if (input.media_urls !== undefined) updates.media_urls = input.media_urls;

  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select()
    .single();

  if (error) {
    console.error('Error updating post:', error);
    throw error;
  }
  return data;
}

/** Delete own post */
export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

/** Toggle like on a post. Returns { liked, newCount } */
export async function toggleLike(postId: string): Promise<{ liked: boolean; newCount: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to like a post');

  // Check if already liked
  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    // Unlike: remove the like
    await supabase.from('post_likes').delete().eq('id', existing.id);

    // Decrement likes count
    const { data: post } = await supabase.from('posts').select('likes').eq('id', postId).single();
    const newLikes = Math.max(0, (post?.likes || 1) - 1);
    await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);

    return { liked: false, newCount: newLikes };
  } else {
    // Like: add a like
    const { error } = await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    if (error) {
      console.error('Error liking post:', error);
      throw error;
    }

    // Increment likes count
    const { data: post } = await supabase.from('posts').select('likes').eq('id', postId).single();
    const newLikes = (post?.likes || 0) + 1;
    await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);

    return { liked: true, newCount: newLikes };
  }
}

/** Check which posts the current user has liked */
export async function fetchUserLikes(postIds: string[]): Promise<Set<string>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || postIds.length === 0) return new Set();

  const { data } = await supabase
    .from('post_likes')
    .select('post_id')
    .eq('user_id', user.id)
    .in('post_id', postIds);

  return new Set((data || []).map(row => row.post_id));
}

// =============================================
// Image Upload
// =============================================

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

/** Upload a single image to Supabase Storage and return the public URL */
export async function uploadPostImage(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to upload images');

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image must be under 2MB');
  }

  // Validate image type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('post-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw new Error('Failed to upload image. Please try again.');
  }

  const { data: urlData } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/** Delete an image from Supabase Storage */
export async function deletePostImage(imageUrl: string): Promise<void> {
  // Extract the path from the full URL
  const bucketUrl = '/post-images/';
  const idx = imageUrl.indexOf(bucketUrl);
  if (idx === -1) return;
  const filePath = imageUrl.substring(idx + bucketUrl.length);

  const { error } = await supabase.storage
    .from('post-images')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
  }
}

// =============================================
// Skills & Locations (dynamic fetch)
// =============================================

export interface SkillCategoryWithSkills {
  name: string;
  skills: string[];
}

export interface LocationGroupWithLocations {
  name: string;
  locations: string[];
}

/** Fetch all skill categories with their skills from Supabase */
export async function fetchSkillCategories(): Promise<SkillCategoryWithSkills[]> {
  const { data: categories, error: catError } = await supabase
    .from('skill_categories')
    .select('id, name, sort_order')
    .order('sort_order', { ascending: true });

  if (catError || !categories) {
    console.error('Error fetching skill categories:', catError);
    return [];
  }

  const { data: skills, error: skillError } = await supabase
    .from('skills')
    .select('name, category_id, sort_order')
    .order('sort_order', { ascending: true });

  if (skillError || !skills) {
    console.error('Error fetching skills:', skillError);
    return [];
  }

  // Group skills by category
  const skillMap = new Map<string, string[]>();
  for (const s of skills) {
    if (!skillMap.has(s.category_id)) skillMap.set(s.category_id, []);
    skillMap.get(s.category_id)!.push(s.name);
  }

  return categories.map(cat => ({
    name: cat.name,
    skills: skillMap.get(cat.id) || [],
  }));
}

/** Fetch all location groups with their locations from Supabase */
export async function fetchLocationGroups(): Promise<LocationGroupWithLocations[]> {
  const { data: groups, error: grpError } = await supabase
    .from('location_groups')
    .select('id, name, sort_order')
    .order('sort_order', { ascending: true });

  if (grpError || !groups) {
    console.error('Error fetching location groups:', grpError);
    return [];
  }

  const { data: locations, error: locError } = await supabase
    .from('locations')
    .select('name, group_id, sort_order')
    .order('sort_order', { ascending: true });

  if (locError || !locations) {
    console.error('Error fetching locations:', locError);
    return [];
  }

  // Group locations by group
  const locMap = new Map<string, string[]>();
  for (const l of locations) {
    if (!locMap.has(l.group_id)) locMap.set(l.group_id, []);
    locMap.get(l.group_id)!.push(l.name);
  }

  return groups.map(g => ({
    name: g.name,
    locations: locMap.get(g.id) || [],
  }));
}

// =============================================
// Skills (user-created)
// =============================================

/** Create a new user-defined skill under the "Other" category */
export async function createUserSkill(skillName: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in to create a skill');

  // Find or use "Other" category
  let { data: otherCategory } = await supabase
    .from('skill_categories')
    .select('id')
    .eq('name', 'Other')
    .single();

  if (!otherCategory) {
    // Fallback: use first category
    const { data: firstCat } = await supabase
      .from('skill_categories')
      .select('id')
      .order('sort_order', { ascending: true })
      .limit(1)
      .single();
    otherCategory = firstCat;
  }

  if (!otherCategory) throw new Error('No skill category found');

  // Check if skill already exists (case-insensitive)
  const { data: existing } = await supabase
    .from('skills')
    .select('name')
    .ilike('name', skillName.trim())
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0].name; // Return existing name with original casing
  }

  // Insert the new skill
  const { data, error } = await supabase
    .from('skills')
    .insert({
      category_id: otherCategory.id,
      name: skillName.trim(),
      sort_order: 999,
      created_by: user.id,
    })
    .select('name')
    .single();

  if (error) {
    console.error('Error creating skill:', error);
    throw error;
  }

  return data.name;
}

// =============================================
// Profiles
// =============================================

export interface DbProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  is_verified: boolean;
  heading: string | null;
  slash_story: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProfileService {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  price: string | null;
  service_type: string | null;
  icon_color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Fetch a profile by user_id */
export async function fetchProfile(userId: string): Promise<DbProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

/** Create or update own profile (upsert) */
export async function upsertProfile(profile: {
  display_name?: string;
  heading?: string;
  slash_story?: string;
  avatar_url?: string;
}): Promise<DbProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be logged in');

  const row = {
    user_id: user.id,
    display_name:
      profile.display_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'User',
    heading: profile.heading ?? null,
    slash_story: profile.slash_story ?? null,
    avatar_url:
      profile.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(row, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error);
    throw error;
  }
  return data;
}

/** Fetch services for a user */
export async function fetchProfileServices(userId: string): Promise<DbProfileService[]> {
  const { data, error } = await supabase
    .from('profile_services')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching profile services:', error);
    return [];
  }
  return data || [];
}

/** Fetch posts by a specific user */
export async function fetchPostsByUser(userId: string): Promise<DbPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }
  return data || [];
}

// =============================================
// Helpers
// =============================================

/** Human-readable time-ago string */
export function getTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/** Map a DB post → PostCard props */
export function dbPostToCardProps(post: DbPost) {
  const typeLabels: Record<string, string> = {
    community: 'Community Organizer',
    learner: 'Learner',
    experience: 'Contributor',
    service: 'Service Provider',
  };

  return {
    id: post.id,
    userId: post.user_id,
    name: post.user_name,
    role: typeLabels[post.type] || post.type,
    timeAgo: getTimeAgo(post.created_at),
    rating: 0,
    location: post.locations?.join(', ') || '',
    locations: post.locations || [],
    skills: post.skill_category ? [post.skill_category] : [],
    skillCategory: post.skill_category,
    purposeExpectations: post.purpose_expectations,
    content: post.content || post.purpose_expectations || '',
    likes: post.likes,
    type: post.type as 'community' | 'learner' | 'experience' | 'service',
    userPicture: post.user_picture,
    images: post.media_urls || [],
    mediaUrls: post.media_urls || [],
  };
}
