create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  reviewer_id uuid not null references public.reviewers(id) on delete cascade,
  status text not null check (status in ('assigned', 'in_progress', 'completed')),
  overall_score numeric,
  recommendation text check (recommendation in ('strong_reject', 'reject', 'neutral', 'accept', 'strong_accept')),
  general_comments text,
  assigned_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(application_id, reviewer_id)
);