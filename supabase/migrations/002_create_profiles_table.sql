-- =============================================
-- Profiles table
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Display info
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  
  -- Profile heading (bio)
  heading TEXT,  -- e.g. "Healing sensitive skin on a student budget..."
  
  -- The Slash Story
  slash_story TEXT,  -- personal story/quote
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles
CREATE POLICY "Profiles are publicly readable"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- =============================================
-- Profile services table (My Services section)
-- =============================================
CREATE TABLE IF NOT EXISTS profile_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,             -- e.g. "1-on-1 Skin Diagnostic Room"
  description TEXT,                -- short description
  category TEXT,                   -- e.g. "SKINCARE"
  price TEXT,                      -- e.g. "$45/session"
  service_type TEXT,               -- e.g. "1-on-1", "Group Sharing Event", "Consultation"
  icon_color TEXT DEFAULT 'blue',  -- icon background color
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profile_services ENABLE ROW LEVEL SECURITY;

-- Anyone can read services
CREATE POLICY "Services are publicly readable"
  ON profile_services FOR SELECT
  USING (true);

-- Users can manage their own services
CREATE POLICY "Users can create their own services"
  ON profile_services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own services"
  ON profile_services FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own services"
  ON profile_services FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_profile_services_user_id ON profile_services(user_id);
