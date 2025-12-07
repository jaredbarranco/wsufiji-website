create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  content text not null,
  word_count integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);