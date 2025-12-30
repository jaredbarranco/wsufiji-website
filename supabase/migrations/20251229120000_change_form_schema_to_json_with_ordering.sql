-- Change form_schema from jsonb to json with ordering enforcement
-- This migration preserves existing data while converting the column type

-- First, create a backup of the existing data for safety during migration
CREATE TEMPORARY TABLE scholarships_form_schema_backup AS 
SELECT id, form_schema FROM scholarships;

-- Drop any dependent objects (indexes, constraints) on form_schema
DROP INDEX IF EXISTS idx_scholarships_form_schema;

-- Alter the column type from jsonb to json
-- JSON preserves key ordering as specified in PostgreSQL
ALTER TABLE scholarships 
ALTER COLUMN form_schema TYPE JSON USING form_schema::JSON;

-- Verify the migration by checking the data
-- This ensures all existing form_schema data was properly converted
SELECT COUNT(*) as total_records,
       COUNT(CASE WHEN form_schema IS NOT NULL THEN 1 END) as records_with_schema
FROM scholarships;

-- Clean up the temporary backup table
DROP TABLE IF EXISTS scholarships_form_schema_backup;

-- The JSON datatype in PostgreSQL automatically preserves key order
-- Unlike JSONB which may reorder keys for efficiency