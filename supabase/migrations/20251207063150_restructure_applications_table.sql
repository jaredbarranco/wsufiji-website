-- First, rename the existing applications table to applications_old
alter table if exists public.applications rename to applications_old;

-- Create the new applications table structure
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid not null references public.applicants(id) on delete cascade,
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  status text not null check (status in ('draft', 'submitted', 'under_review', 'accepted', 'rejected')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(applicant_id, scholarship_id) -- one application per scholarship per applicant
);