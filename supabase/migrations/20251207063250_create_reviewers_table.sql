create table if not exists public.reviewers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  role text not null check (role in ('admin', 'reviewer', 'committee_member')),
  is_active boolean default true,
  created_at timestamptz not null default now()
);