-- Update scholarships table to support JSON Schema form definitions
-- First rename existing scholarships table
alter table if exists public.scholarships rename to scholarships_old;

-- Create new scholarships table with stateless architecture
create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, -- e.g. "fall-2023-grant"
  title text not null,
  active boolean default true,
  
  -- The JSON Schema (Questions, Types, Validation rules)
  form_schema jsonb not null, 
  
  -- The UI Schema (Layout hints, widgets, placeholder text)
  ui_schema jsonb default '{}'::jsonb,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Copy data from old table if it exists (mapping old fields to new structure)
-- This is a basic migration - you may need to adjust the form_schema manually
-- insert into public.scholarships (title, active, form_schema, ui_schema)
-- select 
--   name,
--   is_active,
--   '{
--     "title": "' || name || '",
--     "type": "object",
--     "required": ["fullName", "email", "essay"],
--     "properties": {
--       "fullName": { "type": "string", "title": "Full Name" },
--       "email": { "type": "string", "format": "email", "title": "Email Address" },
--       "essay": { "type": "string", "title": "Why do you deserve this scholarship?", "minLength": 100 }
--     }
--   }'::jsonb,
--   '{
--     "essay": { "ui:widget": "textarea", "ui:options": { "rows": 10 } }
--   }'::jsonb
-- from public.scholarships_old;
