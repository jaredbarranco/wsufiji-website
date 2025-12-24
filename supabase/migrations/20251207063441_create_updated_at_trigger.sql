-- Updated_at triggers for relevant tables
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for tables with updated_at columns
create trigger handle_applications_updated_at
  before update on public.applications
  for each row execute function handle_updated_at();

create trigger handle_applicants_updated_at
  before update on public.applicants
  for each row execute function handle_updated_at();

create trigger handle_scholarships_updated_at
  before update on public.scholarships
  for each row execute function handle_updated_at();

create trigger handle_essays_updated_at
  before update on public.essays
  for each row execute function handle_updated_at();

create trigger handle_reviews_updated_at
  before update on public.reviews
  for each row execute function handle_updated_at();