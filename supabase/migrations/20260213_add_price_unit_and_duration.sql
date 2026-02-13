-- Add missing columns to slash_services table
ALTER TABLE slash_services ADD COLUMN IF NOT EXISTS price_unit TEXT DEFAULT 'session';
ALTER TABLE slash_services ADD COLUMN IF NOT EXISTS duration_min INTEGER DEFAULT 60;

-- Update status check constraint
ALTER TABLE slash_services DROP CONSTRAINT IF EXISTS slash_services_status_check;
ALTER TABLE slash_services ADD CONSTRAINT slash_services_status_check CHECK (status IN ('suggested', 'confirmed'));
