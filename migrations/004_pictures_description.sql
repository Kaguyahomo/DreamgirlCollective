-- Add description column to pictures table
-- Description replaces title for the "postcard flip" feature
ALTER TABLE pictures ADD COLUMN description TEXT;

-- Copy existing title values to description
UPDATE pictures SET description = title WHERE description IS NULL;
