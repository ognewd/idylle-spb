-- Add allowedAdminSections column to users table
-- This column stores an array of allowed admin sections for each admin user

-- First, check if the column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'allowedAdminSections'
  ) THEN
    -- Add the column with default empty array
    ALTER TABLE users ADD COLUMN "allowedAdminSections" TEXT[] DEFAULT ARRAY[]::TEXT[];
    
    -- Add comment to the column
    COMMENT ON COLUMN users."allowedAdminSections" IS 'Array of allowed admin sections for admin users';
    
    RAISE NOTICE 'Column allowedAdminSections added to users table';
  ELSE
    RAISE NOTICE 'Column allowedAdminSections already exists in users table';
  END IF;
END $$;
