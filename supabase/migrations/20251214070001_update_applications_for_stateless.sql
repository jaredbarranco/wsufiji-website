-- Update applications table to support stateless submissions
-- First rename existing applications and applicants tables
alter table if exists public.applications rename to applications_old;
-- drop table if exists public.applicants; -- We don't need the complex applicant structure anymore

-- Create new simplified applications table for stateless architecture
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid references public.scholarships(id) on delete cascade,
  
  -- We use email as the primary identifier since there is no Auth
  email text not null,
  
  -- The actual answers stored as JSON
  submission_data jsonb not null,
  
  created_at timestamptz not null default now(),
  
  -- Prevent spamming: One entry per email per scholarship
  unique (scholarship_id, email)
);

-- Add indexes for performance
create index idx_applications_scholarship_id on public.applications(scholarship_id);
create index idx_applications_email on public.applications(email);