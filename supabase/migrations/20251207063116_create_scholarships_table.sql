create table if not exists public.scholarships (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  year integer not null,
  application_deadline timestamptz,
  award_amount numeric,
  max_recipients integer,
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);