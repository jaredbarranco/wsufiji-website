-- Add reviewer_field_visibility column to scholarships table
ALTER TABLE scholarships
ADD COLUMN reviewer_field_visibility JSONB DEFAULT '{"mode": "denylist", "fields": []}'::jsonb;