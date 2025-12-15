-- Performance indexes
create index idx_applications_applicant_id on applications(applicant_id);
create index idx_applications_status on applications(status);
create index idx_reviews_application_id on reviews(application_id);
create index idx_reviews_reviewer_id on reviews(reviewer_id);
create index idx_category_ratings_review_id on category_ratings(review_id);
create index idx_leadership_roles_application_id on leadership_roles(application_id);
create index idx_essays_application_id on essays(application_id);
