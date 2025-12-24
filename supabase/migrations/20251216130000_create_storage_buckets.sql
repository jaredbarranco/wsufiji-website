-- Ensure storage buckets are persisted during database resets
-- This migration creates the required storage buckets for file uploads

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") 
VALUES 
('scholarship-applications', 'scholarship-applications', null, '2025-12-17 04:40:54.797553+00', '2025-12-17 04:40:54.797553+00', 'false', 'false', '10485760', null, null, 'STANDARD'), 
('temp-uploads', 'temp-uploads', null, '2025-12-17 04:40:46.050714+00', '2025-12-17 04:40:46.050714+00', 'false', 'false', '5242880', null, null, 'STANDARD')
ON CONFLICT (id) DO NOTHING;