create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  essay text,
  created_at timestamptz not null default now()
);

