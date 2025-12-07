-- Seed data for WSU Fiji Scholarship Application System

-- Insert sample scholarships
INSERT INTO public.scholarships (name, description, year, application_deadline, award_amount, max_recipients, is_active) VALUES
('WSU Fiji Chapter Scholarship', 'Annual scholarship for active WSU Fiji chapter members demonstrating leadership and academic excellence', 2025, '2025-03-15 23:59:59+00', 1000.00, 3, true),
('WSU Fiji Leadership Award', 'Recognition award for outstanding leadership within the fraternity and community', 2025, '2025-03-15 23:59:59+00', 500.00, 2, true),
('WSU Fiji Academic Achievement', 'Scholarship for members with exceptional academic performance', 2025, '2025-03-15 23:59:59+00', 750.00, 2, true),
('WSU Fiji Community Service Award', 'Award for members who demonstrate exceptional commitment to community service', 2024, '2024-03-15 23:59:59+00', 400.00, 1, false);

-- Insert sample reviewers
INSERT INTO public.reviewers (name, email, role, is_active) VALUES
('John Smith', 'john.smith@wsufiji.org', 'admin', true),
('Sarah Johnson', 'sarah.johnson@wsufiji.org', 'committee_member', true),
('Michael Davis', 'michael.davis@wsufiji.org', 'reviewer', true),
('Emily Wilson', 'emily.wilson@wsufiji.org', 'reviewer', true),
('Robert Brown', 'robert.brown@wsufiji.org', 'committee_member', true);

-- Insert review categories for each scholarship
INSERT INTO public.review_categories (scholarship_id, name, description, weight, max_score, display_order, is_active) 
SELECT 
  s.id,
  rc.name,
  rc.description,
  rc.weight,
  rc.max_score,
  rc.display_order,
  true
FROM public.scholarships s
CROSS JOIN (VALUES 
  ('Academic Achievement', 'Overall academic performance and GPA', 1.0, 5, 1),
  ('Leadership Experience', 'Leadership roles and responsibilities', 1.0, 5, 2),
  ('Community Involvement', 'Community service and extracurricular activities', 1.0, 5, 3),
  ('Essay Quality', 'Quality of written essay and communication skills', 1.0, 5, 4),
  ('Financial Need', 'Demonstrated financial need (if applicable)', 0.5, 5, 5)
) AS rc(name, description, weight, max_score, display_order)
WHERE s.is_active = true;

-- Insert sample applicants
INSERT INTO public.applicants (full_name, email, phone, gender, high_school_name, anticipated_gpa) VALUES
('James Anderson', 'james.anderson@wsu.edu', '509-555-0101', 'Male', 'Pullman High School', 3.8),
('Maria Garcia', 'maria.garcia@wsu.edu', '509-555-0102', 'Female', 'Moscow High School', 3.9),
('David Chen', 'david.chen@wsu.edu', '509-555-0103', 'Male', 'Seattle Prep', 3.7),
('Sophie Martin', 'sophie.martin@wsu.edu', '509-555-0104', 'Female', 'Gonzaga Prep', 4.0),
('Tyler Johnson', 'tyler.johnson@wsu.edu', '509-555-0105', 'Male', 'North Central High School', 3.6);

-- Create sample applications for active scholarships
INSERT INTO public.applications (applicant_id, scholarship_id, status, submitted_at)
SELECT 
  a.id as applicant_id,
  s.id as scholarship_id,
  'submitted' as status,
  now() - interval '1 day' * floor(random() * 30) as submitted_at
FROM public.applicants a
CROSS JOIN public.scholarships s
WHERE s.is_active = true
  AND random() > 0.3; -- Not all applicants apply to all scholarships

-- Insert sample essays for applications
INSERT INTO public.essays (application_id, content, word_count)
SELECT 
  app.id,
  CASE 
    WHEN random() < 0.2 THEN 'As a dedicated member of the WSU Fiji chapter, I have demonstrated strong leadership skills through my role as treasurer. I have maintained a 3.8 GPA while actively participating in community service projects and fraternity events. My academic achievements reflect my commitment to excellence both in and out of the classroom.'
    WHEN random() < 0.4 THEN 'My experience as WSU Fiji chapter president has taught me invaluable lessons in leadership and teamwork. I have organized multiple philanthropic events that raised over $5000 for local charities. My academic performance has remained strong with a 3.9 GPA, and I am passionate about continuing my education while serving others.'
    WHEN random() < 0.6 THEN 'Being part of WSU Fiji has shaped me into a well-rounded individual. I have served as community service chair, coordinating volunteer opportunities for our members. With a 3.7 GPA and extensive involvement in campus organizations, I believe I exemplify the values of scholarship, leadership, and service that our fraternity represents.'
    WHEN random() < 0.8 THEN 'My journey with WSU Fiji has been transformative. As academic chair, I have helped our chapter achieve its highest collective GPA in five years. I maintain a 4.0 GPA while working part-time and participating in various leadership roles. This scholarship would enable me to continue my academic pursuits while contributing to our fraternity''s mission.'
    ELSE 'Leadership and service have been the cornerstones of my college experience. Through my involvement with WSU Fiji, I have developed strong organizational skills and a deep commitment to helping others. With a 3.6 GPA and extensive experience in coordinating fraternity events, I am confident in my ability to represent our values and make a positive impact on campus.'
  END,
  CASE 
    WHEN random() < 0.2 THEN 85
    WHEN random() < 0.4 THEN 92
    WHEN random() < 0.6 THEN 88
    WHEN random() < 0.8 THEN 95
    ELSE 82
  END
FROM public.applications app
WHERE app.status = 'submitted'
  AND random() > 0.1; -- Most applications have essays

-- Insert sample leadership roles
INSERT INTO public.leadership_roles (application_id, organization_name, role_title, start_date, end_date, responsibilities)
SELECT 
  app.id,
  CASE 
    WHEN random() < 0.25 THEN 'WSU Fiji Chapter'
    WHEN random() < 0.5 THEN 'Student Government'
    WHEN random() < 0.75 THEN 'Community Service Club'
    ELSE 'Honors Society'
  END,
  CASE 
    WHEN random() < 0.2 THEN 'President'
    WHEN random() < 0.4 THEN 'Treasurer'
    WHEN random() < 0.6 THEN 'Secretary'
    WHEN random() < 0.8 THEN 'Community Service Chair'
    ELSE 'Academic Chair'
  END,
  now() - interval '1 year' - interval '1 month' * floor(random() * 6),
  now() - interval '1 month' * floor(random() * 3),
  CASE 
    WHEN random() < 0.25 THEN 'Led chapter meetings, coordinated events, managed budget, and represented the organization at university functions.'
    WHEN random() < 0.5 THEN 'Managed financial records, prepared budgets, collected dues, and oversaw fundraising activities.'
    WHEN random() < 0.75 THEN 'Organized community service projects, coordinated volunteer schedules, and maintained relationships with local charities.'
    ELSE 'Maintained academic records, organized study sessions, and promoted academic excellence among members.'
  END
FROM public.applications app
WHERE app.status = 'submitted'
  AND random() > 0.3; -- Most applicants have leadership experience

-- Insert sample reviews for some applications
INSERT INTO public.reviews (application_id, reviewer_id, status, overall_score, recommendation, general_comments, assigned_at, completed_at)
SELECT 
  app.id,
  rev.id,
  'completed' as status,
  (random() * 2 + 3)::numeric(2,1) as overall_score, -- Score between 3.0 and 5.0
  CASE 
    WHEN random() < 0.2 THEN 'strong_accept'
    WHEN random() < 0.4 THEN 'accept'
    WHEN random() < 0.6 THEN 'neutral'
    WHEN random() < 0.8 THEN 'reject'
    ELSE 'strong_reject'
  END as recommendation,
  CASE 
    WHEN random() < 0.25 THEN 'Strong candidate with excellent academic performance and leadership experience.'
    WHEN random() < 0.5 THEN 'Good candidate with solid academic record and community involvement.'
    WHEN random() < 0.75 THEN 'Average candidate with some leadership experience but room for improvement.'
    ELSE 'Candidate needs more development in leadership and academic areas.'
  END as general_comments,
  now() - interval '2 weeks' - interval '1 day' * floor(random() * 7) as assigned_at,
  now() - interval '1 week' - interval '1 day' * floor(random() * 5) as completed_at
FROM public.applications app
CROSS JOIN public.reviewers rev
WHERE app.status = 'submitted'
  AND rev.is_active = true
  AND random() > 0.6; -- Some applications have been reviewed

-- Insert sample category ratings for completed reviews
INSERT INTO public.category_ratings (review_id, category_id, score, comments)
SELECT 
  r.id as review_id,
  rc.id as category_id,
  score_value,
  CASE 
    WHEN score_value >= 5 THEN 'Exceptional performance in this area.'
    WHEN score_value >= 4 THEN 'Strong performance with minor areas for improvement.'
    ELSE 'Adequate performance with room for growth.'
  END as comments
FROM public.reviews r
JOIN public.review_categories rc ON rc.scholarship_id = (
  SELECT scholarship_id FROM public.applications WHERE id = r.application_id
),
LATERAL (SELECT floor(random() * 3 + 3) as score_value) AS scores
WHERE r.status = 'completed'
  AND rc.is_active = true;

-- Update some application statuses based on reviews
UPDATE public.applications 
SET status = CASE 
  WHEN EXISTS (
    SELECT 1 FROM public.reviews r 
    WHERE r.application_id = applications.id 
    AND r.recommendation IN ('strong_accept', 'accept')
    AND r.status = 'completed'
  ) THEN 'accepted'
  WHEN EXISTS (
    SELECT 1 FROM public.reviews r 
    WHERE r.application_id = applications.id 
    AND r.recommendation IN ('strong_reject', 'reject')
    AND r.status = 'completed'
  ) THEN 'rejected'
  ELSE 'under_review'
END,
reviewed_at = now() - interval '3 days'
WHERE status = 'submitted'
  AND EXISTS (SELECT 1 FROM public.reviews r WHERE r.application_id = applications.id AND r.status = 'completed');