-- Add chain_stopped column to idea table
ALTER TABLE idea 
ADD COLUMN IF NOT EXISTS chain_stopped BOOLEAN NOT NULL DEFAULT FALSE;

-- Add a comment to explain the column
COMMENT ON COLUMN idea.chain_stopped IS 'Indicates whether the spreading chain for this idea has been stopped by the owner';
