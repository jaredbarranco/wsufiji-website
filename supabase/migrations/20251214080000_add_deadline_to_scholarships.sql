-- Add deadline column to scholarships table
alter table public.scholarships 
add column deadline timestamptz default now() + interval '90 days';