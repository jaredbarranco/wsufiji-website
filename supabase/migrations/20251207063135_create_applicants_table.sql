create table if not exists public.applicants (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  gender text,
  high_school_name text not null,
  anticipated_gpa numeric,
  verified_gpa numeric,
  transcript_url text, -- Supabase storage reference
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);