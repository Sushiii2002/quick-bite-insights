
-- Add daily_data JSONB column to the users table
ALTER TABLE "public"."users"
ADD COLUMN IF NOT EXISTS "daily_data" JSONB DEFAULT '{}'::jsonb;

COMMENT ON COLUMN "public"."users"."daily_data" IS 'Stores daily user data like water intake';
