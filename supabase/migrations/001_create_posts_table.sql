-- =============================================
-- Location Groups (e.g. Toronto Downtown, Waterloo Tech Hub)
-- =============================================
CREATE TABLE IF NOT EXISTS location_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  -- 🗺️ Future: group center point for map view
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Locations (belong to a group)
-- =============================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES location_groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  -- 🗺️ Future: exact coordinates for map pin
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  address TEXT,                -- full address string (e.g. from Google Places API)
  place_id TEXT,               -- Google Places ID for deduplication
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Skill Categories (e.g. Wellness & Self-Care, Sports)
-- =============================================
CREATE TABLE IF NOT EXISTS skill_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Skills (belong to a category)
-- =============================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES skill_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),  -- NULL = system seed, UUID = user-created
  is_approved BOOLEAN DEFAULT true,            -- for future moderation
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Posts table: supports all 4 post types
-- community  = Organize a Group
-- learner    = Seek Assistance
-- experience = Share Insights
-- service    = Provide Service
-- =============================================

CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Author info (denormalized for fast reads)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_picture TEXT,

  -- Post type
  type TEXT NOT NULL CHECK (type IN ('community', 'learner', 'experience', 'service')),

  -- Shared fields (used by most types)
  locations TEXT[] DEFAULT '{}',              -- selected location names (current: checkbox)
  skill_category TEXT,                        -- selected skill/topic

  -- 🗺️ Future: map-based location (when switching from checkbox to map search)
  latitude DOUBLE PRECISION,                  -- map pin latitude
  longitude DOUBLE PRECISION,                 -- map pin longitude
  address TEXT,                               -- full address from map search
  place_id TEXT,                              -- Google Places ID

  -- community / learner / service: purpose, expectations, or description
  purpose_expectations TEXT,

  -- experience (Share Insights): main content body
  content TEXT,

  -- experience (Share Insights): media image URLs
  media_urls TEXT[] DEFAULT '{}',

  -- Engagement
  likes INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Row Level Security
-- =============================================
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Anyone (including non-logged-in users) can read
CREATE POLICY "Anyone can read posts"
  ON posts FOR SELECT
  USING (true);

-- Only logged-in users can create (must match their own user_id)
CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only the author can update
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Only the author can delete
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS for location_groups, locations, skill_categories, skills
-- (Everyone can read, only admin/service_role can write)
-- =============================================
ALTER TABLE location_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read location_groups" ON location_groups FOR SELECT USING (true);
CREATE POLICY "Anyone can read locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Anyone can read skill_categories" ON skill_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read skills" ON skills FOR SELECT USING (true);

-- Authenticated users can create new skills (user-generated)
CREATE POLICY "Authenticated users can create skills"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================
-- Indexes
-- =============================================
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_type ON posts(type);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_locations_group_id ON locations(group_id);
CREATE INDEX idx_skills_category_id ON skills(category_id);

-- =============================================
-- Seed Data: Location Groups & Locations
-- =============================================
INSERT INTO location_groups (name, sort_order, latitude, longitude) VALUES
  ('Toronto Downtown', 1, 43.6532, -79.3832),
  ('Waterloo Tech Hub', 2, 43.4643, -80.5204),
  ('London/Ivey Hub', 3, 42.9849, -81.2453),
  ('Virtual', 99, NULL, NULL);

INSERT INTO locations (group_id, name, sort_order, latitude, longitude, address) VALUES
  ((SELECT id FROM location_groups WHERE name = 'Toronto Downtown'), 'St.George Campus', 1, 43.6629, -79.3957, '27 King''s College Cir, Toronto, ON'),
  ((SELECT id FROM location_groups WHERE name = 'Toronto Downtown'), 'Bay Street/Financial District', 2, 43.6488, -79.3815, 'Bay St, Toronto, ON'),
  ((SELECT id FROM location_groups WHERE name = 'Toronto Downtown'), 'Toronto Downtown in general', 3, 43.6532, -79.3832, 'Downtown Toronto, ON'),
  ((SELECT id FROM location_groups WHERE name = 'Waterloo Tech Hub'), 'University of Waterloo Campus', 1, 43.4723, -80.5449, '200 University Ave W, Waterloo, ON'),
  ((SELECT id FROM location_groups WHERE name = 'Waterloo Tech Hub'), 'Wilfrid Laurier University', 2, 43.4738, -80.5275, '75 University Ave W, Waterloo, ON'),
  ((SELECT id FROM location_groups WHERE name = 'Waterloo Tech Hub'), 'Uptown Waterloo', 3, 43.4668, -80.5164, 'Uptown Waterloo, ON'),
  ((SELECT id FROM location_groups WHERE name = 'Waterloo Tech Hub'), 'Waterloo in general', 4, 43.4643, -80.5204, 'Waterloo, ON'),
  ((SELECT id FROM location_groups WHERE name = 'London/Ivey Hub'), 'Western University Main Campus', 1, 43.0096, -81.2737, '1151 Richmond St, London, ON'),
  ((SELECT id FROM location_groups WHERE name = 'London/Ivey Hub'), 'Ivey Business School Area', 2, 43.0054, -81.2764, '1255 Western Rd, London, ON'),
  ((SELECT id FROM location_groups WHERE name = 'London/Ivey Hub'), 'Richmond Row(Dt. London)', 3, 42.9881, -81.2519, 'Richmond St, London, ON'),
  ((SELECT id FROM location_groups WHERE name = 'London/Ivey Hub'), 'London in general', 4, 42.9849, -81.2453, 'London, ON'),
  ((SELECT id FROM location_groups WHERE name = 'Virtual'), 'Virtual', 1, NULL, NULL, NULL);

-- =============================================
-- Seed Data: Skill Categories & Skills
-- =============================================
INSERT INTO skill_categories (name, sort_order) VALUES
  ('Languages', 1),
  ('Lifestyle & Hobbies', 2),
  ('Wellness & Self-Care', 3),
  ('Pet Care/Pet Services', 4),
  ('Sports', 5),
  ('Practical Pro Skills', 6),
  ('Money & Strategy', 7),
  ('Creative & Hobbies', 8),
  ('Other', 99);  -- for user-created skills that don't fit existing categories

INSERT INTO skills (category_id, name, sort_order) VALUES
  -- Languages
  ((SELECT id FROM skill_categories WHERE name = 'Languages'), 'EnglishSpeaking', 1),
  ((SELECT id FROM skill_categories WHERE name = 'Languages'), 'French', 2),
  ((SELECT id FROM skill_categories WHERE name = 'Languages'), 'Spanish', 3),
  ((SELECT id FROM skill_categories WHERE name = 'Languages'), 'Japanese', 4),
  ((SELECT id FROM skill_categories WHERE name = 'Languages'), 'BusinessWriting', 5),
  -- Lifestyle & Hobbies
  ((SELECT id FROM skill_categories WHERE name = 'Lifestyle & Hobbies'), 'FortuneTelling', 1),
  ((SELECT id FROM skill_categories WHERE name = 'Lifestyle & Hobbies'), 'TarotReading', 2),
  ((SELECT id FROM skill_categories WHERE name = 'Lifestyle & Hobbies'), 'MealPrep', 3),
  ((SELECT id FROM skill_categories WHERE name = 'Lifestyle & Hobbies'), 'TravelPlanning', 4),
  ((SELECT id FROM skill_categories WHERE name = 'Lifestyle & Hobbies'), 'HomeOrganization', 5),
  -- Wellness & Self-Care
  ((SELECT id FROM skill_categories WHERE name = 'Wellness & Self-Care'), 'Skincare', 1),
  ((SELECT id FROM skill_categories WHERE name = 'Wellness & Self-Care'), 'StrengthTraining', 2),
  ((SELECT id FROM skill_categories WHERE name = 'Wellness & Self-Care'), 'RunTraining', 3),
  ((SELECT id FROM skill_categories WHERE name = 'Wellness & Self-Care'), 'NutritionBasics', 4),
  ((SELECT id FROM skill_categories WHERE name = 'Wellness & Self-Care'), 'Mindfulness', 5),
  -- Pet Care/Pet Services
  ((SELECT id FROM skill_categories WHERE name = 'Pet Care/Pet Services'), 'Care & Sitting', 1),
  ((SELECT id FROM skill_categories WHERE name = 'Pet Care/Pet Services'), 'Grooming', 2),
  ((SELECT id FROM skill_categories WHERE name = 'Pet Care/Pet Services'), 'Training', 3),
  ((SELECT id FROM skill_categories WHERE name = 'Pet Care/Pet Services'), 'Health & Wellness', 4),
  ((SELECT id FROM skill_categories WHERE name = 'Pet Care/Pet Services'), 'Pet Creative', 5),
  ((SELECT id FROM skill_categories WHERE name = 'Pet Care/Pet Services'), 'Pet Psychology', 6),
  -- Sports
  ((SELECT id FROM skill_categories WHERE name = 'Sports'), 'Snowboarding', 1),
  ((SELECT id FROM skill_categories WHERE name = 'Sports'), 'Swimming', 2),
  ((SELECT id FROM skill_categories WHERE name = 'Sports'), 'Tennis', 3),
  ((SELECT id FROM skill_categories WHERE name = 'Sports'), 'CyclingTraining', 4),
  ((SELECT id FROM skill_categories WHERE name = 'Sports'), 'HikingSkills', 5),
  -- Practical Pro Skills
  ((SELECT id FROM skill_categories WHERE name = 'Practical Pro Skills'), 'AIProductivity', 1),
  ((SELECT id FROM skill_categories WHERE name = 'Practical Pro Skills'), 'PresentationStorytelling', 2),
  ((SELECT id FROM skill_categories WHERE name = 'Practical Pro Skills'), 'MockInterview', 3),
  ((SELECT id FROM skill_categories WHERE name = 'Practical Pro Skills'), 'Networking', 4),
  ((SELECT id FROM skill_categories WHERE name = 'Practical Pro Skills'), 'ProjectManagement', 5),
  -- Money & Strategy
  ((SELECT id FROM skill_categories WHERE name = 'Money & Strategy'), 'Budgeting', 1),
  ((SELECT id FROM skill_categories WHERE name = 'Money & Strategy'), 'ETFInvesting', 2),
  ((SELECT id FROM skill_categories WHERE name = 'Money & Strategy'), 'TaxBasics', 3),
  ((SELECT id FROM skill_categories WHERE name = 'Money & Strategy'), 'CreditCardPoints', 4),
  ((SELECT id FROM skill_categories WHERE name = 'Money & Strategy'), 'SideHustlePricing', 5),
  -- Creative & Hobbies
  ((SELECT id FROM skill_categories WHERE name = 'Creative & Hobbies'), 'ShortFormVideoEditing', 1),
  ((SELECT id FROM skill_categories WHERE name = 'Creative & Hobbies'), 'PhotographyBasics', 2),
  ((SELECT id FROM skill_categories WHERE name = 'Creative & Hobbies'), 'FigmaDesign', 3),
  ((SELECT id FROM skill_categories WHERE name = 'Creative & Hobbies'), 'Copywriting', 4),
  ((SELECT id FROM skill_categories WHERE name = 'Creative & Hobbies'), 'AI', 5);

-- =============================================
-- Post Likes (one like per user per post)
-- =============================================
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can read likes (to check if user has liked)
CREATE POLICY "Anyone can read post likes" ON post_likes FOR SELECT TO public USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Users can like posts" ON post_likes FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Users can unlike posts" ON post_likes FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);

-- =============================================
-- Storage bucket for post images
-- =============================================
-- Run in Supabase SQL Editor:
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');

-- Allow anyone to view post images (public bucket)
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');

-- Allow users to delete their own images
CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text);
