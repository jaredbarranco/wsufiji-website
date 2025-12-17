-- Add description and verbose_description columns to scholarships table
-- Note: The table already uses 'title' column instead of 'name'
-- description: brief description for /apply page (varchar)
-- verbose_description: detailed markdown description for application page (text)

ALTER TABLE public.scholarships 
ADD COLUMN description varchar(255),
ADD COLUMN verbose_description text;