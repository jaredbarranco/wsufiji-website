create table if not exists public.leadership_roles (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  organization_name text not null,
  role_title text not null,
  start_date date,
  end_date date,
  responsibilities text,
  created_at timestamptz not null default now()
);