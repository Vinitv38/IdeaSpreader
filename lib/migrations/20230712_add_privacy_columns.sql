-- Add is_public and is_featured columns to idea table
ALTER TABLE idea
ADD COLUMN is_public BOOLEAN DEFAULT false,
ADD COLUMN is_featured BOOLEAN DEFAULT false;
