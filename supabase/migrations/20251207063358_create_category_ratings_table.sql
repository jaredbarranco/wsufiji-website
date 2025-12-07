create table if not exists public.category_ratings (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  category_id uuid not null references public.review_categories(id) on delete cascade,
  score integer not null check (score >= 1 and score <= 5),
  comments text,
  created_at timestamptz not null default now(),
  unique(review_id, category_id)
);