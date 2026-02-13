-- Add skills column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills text[];

-- Add comment for documentation
COMMENT ON COLUMN profiles.skills IS 'Array of skill names selected by user during onboarding';
