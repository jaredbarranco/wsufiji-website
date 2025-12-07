create table if not exists public.review_categories (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  name text not null,
  description text,
  weight numeric default 1.0,
  max_score integer default 5,
  display_order integer,
  is_active boolean default true,
  created_at timestamptz not null default now()
);