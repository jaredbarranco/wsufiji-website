-- Seed data for WSU Fiji Scholarship Application System (Stateless Architecture)

-- Insert sample scholarships with JSON Schema form definitions
INSERT INTO public.scholarships (slug, title, active, form_schema, ui_schema) VALUES
('wsu-fiji-chapter-scholarship-2025', 'WSU Fiji Chapter Scholarship 2025', true, 
'{
  "title": "WSU Fiji Chapter Scholarship Application 2025",
  "description": "Annual scholarship for active WSU Fiji chapter members demonstrating leadership and academic excellence",
  "type": "object",
  "required": ["fullName", "email", "phone", "highSchool", "gpa", "transcript", "essay"],
  "properties": {
    "fullName": {
      "type": "string",
      "title": "Full Name",
      "minLength": 2,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email Address",
      "description": "Your WSU or personal email address"
    },
    "phone": {
      "type": "string",
      "title": "Phone Number",
      "pattern": "^\\d{3}-\\d{3}-\\d{4}$",
      "description": "Format: 555-123-4567"
    },
    "highSchool": {
      "type": "string",
      "title": "High School Name",
      "minLength": 2,
      "maxLength": 100
    },
    "gpa": {
      "type": "number",
      "title": "Current GPA",
      "minimum": 0.0,
      "maximum": 4.0,
      "multipleOf": 0.01,
      "description": "Your current cumulative GPA on a 4.0 scale"
    },
    "leadershipExperience": {
      "type": "array",
      "title": "Leadership Experience",
      "description": "List any leadership positions you have held",
      "items": {
        "type": "object",
        "properties": {
          "organization": {
            "type": "string",
            "title": "Organization Name"
          },
          "position": {
            "type": "string",
            "title": "Position/Role"
          },
          "startDate": {
            "type": "string",
            "format": "date",
            "title": "Start Date"
          },
          "endDate": {
            "type": "string",
            "format": "date",
            "title": "End Date (or current)"
          },
          "description": {
            "type": "string",
            "title": "Responsibilities & Achievements"
          }
        }
      }
    },
    "communityService": {
      "type": "string",
      "title": "Community Service Involvement",
      "description": "Describe your community service activities and hours volunteered",
      "minLength": 50
    },
    "transcript": {
      "type": "string",
      "title": "Academic Transcript",
      "description": "Upload your current academic transcript (PDF format preferred)",
      "default": null
    },
    "essay": {
      "type": "string",
      "title": "Personal Statement",
      "description": "Why do you deserve this scholarship? How has your involvement with WSU Fiji shaped your college experience? (500-1000 words)",
      "minLength": 500,
      "maxLength": 2000
    }
  }
}'::jsonb, 
'{
  "fullName": {
    "ui:autofocus": true,
    "ui:placeholder": "Enter your full legal name"
  },
  "email": {
    "ui:placeholder": "your.email@wsu.edu"
  },
  "phone": {
    "ui:placeholder": "555-123-4567"
  },
  "gpa": {
    "ui:help": "Enter your GPA as a decimal (e.g., 3.75)"
  },
  "leadershipExperience": {
    "ui:options": {
      "orderable": false
    },
    "items": {
      "description": {
        "ui:widget": "textarea",
        "ui:options": {
          "rows": 3
        }
      }
    }
  },
  "communityService": {
    "ui:widget": "textarea",
    "ui:options": {
      "rows": 4
    }
  },
  "transcript": {
    "ui:widget": "file",
    "ui:help": "Please upload your most recent academic transcript. PDF format is preferred."
  },
  "essay": {
    "ui:widget": "textarea",
    "ui:options": {
      "rows": 12
    },
    "ui:help": "Take your time to write a thoughtful response. This is the most important part of your application."
  }
}'::jsonb),

('wsu-fiji-leadership-award-2025', 'WSU Fiji Leadership Award 2025', true,
'{
  "title": "WSU Fiji Leadership Award Application 2025",
  "description": "Recognition award for outstanding leadership within the fraternity and community",
  "type": "object",
  "required": ["fullName", "email", "phone", "leadershipRoles", "leadershipEssay"],
  "properties": {
    "fullName": {
      "type": "string",
      "title": "Full Name",
      "minLength": 2,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email Address"
    },
    "phone": {
      "type": "string",
      "title": "Phone Number",
      "pattern": "^\\d{3}-\\d{3}-\\d{4}$"
    },
    "leadershipRoles": {
      "type": "array",
      "title": "Leadership Positions",
      "description": "List all leadership positions you have held (minimum 2 required)",
      "minItems": 2,
      "items": {
        "type": "object",
        "required": ["organization", "position", "startDate"],
        "properties": {
          "organization": {
            "type": "string",
            "title": "Organization"
          },
          "position": {
            "type": "string",
            "title": "Position/Role"
          },
          "startDate": {
            "type": "string",
            "format": "date",
            "title": "Start Date"
          },
          "endDate": {
            "type": "string",
            "format": "date",
            "title": "End Date (leave blank if current)"
          },
          "achievements": {
            "type": "string",
            "title": "Key Achievements",
            "description": "What did you accomplish in this role?"
          }
        }
      }
    },
    "leadershipEssay": {
      "type": "string",
      "title": "Leadership Philosophy Essay",
      "description": "Describe your leadership philosophy and provide specific examples of how you have demonstrated leadership within WSU Fiji and the broader community. (750-1500 words)",
      "minLength": 750,
      "maxLength": 3000
    }
  }
}'::jsonb,
'{
  "leadershipRoles": {
    "items": {
      "achievements": {
        "ui:widget": "textarea",
        "ui:options": {
          "rows": 3
        }
      }
    },
    "ui:options": {
      "addable": true,
      "removable": true,
      "orderable": false
    }
  },
  "leadershipEssay": {
    "ui:widget": "textarea",
    "ui:options": {
      "rows": 15
    }
  }
}'::jsonb),

('wsu-fiji-academic-achievement-2025', 'WSU Fiji Academic Achievement Scholarship 2025', true,
'{
  "title": "WSU Fiji Academic Achievement Scholarship 2025",
  "description": "Scholarship for members with exceptional academic performance",
  "type": "object",
  "required": ["fullName", "email", "phone", "currentGPA", "major", "academicHonors", "academicEssay"],
  "properties": {
    "fullName": {
      "type": "string",
      "title": "Full Name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email Address"
    },
    "phone": {
      "type": "string",
      "title": "Phone Number"
    },
    "currentGPA": {
      "type": "number",
      "title": "Current Cumulative GPA",
      "minimum": 3.0,
      "maximum": 4.0,
      "multipleOf": 0.01,
      "description": "Minimum 3.0 GPA required"
    },
    "major": {
      "type": "string",
      "title": "Major/Field of Study",
      "enum": ["Accounting", "Business Administration", "Computer Science", "Engineering", "Finance", "Marketing", "Other"],
      "description": "Select your primary field of study"
    },
    "academicHonors": {
      "type": "array",
      "title": "Academic Honors and Awards",
      "description": "List any academic honors, dean''s list achievements, or awards",
      "items": {
        "type": "object",
        "properties": {
          "honor": {
            "type": "string",
            "title": "Honor/Award Name"
          },
          "date": {
            "type": "string",
            "title": "Date Received"
          },
          "description": {
            "type": "string",
            "title": "Description"
          }
        }
      }
    },
    "academicEssay": {
      "type": "string",
      "title": "Academic Goals Essay",
      "description": "Describe your academic achievements and future career goals. How will this scholarship help you achieve your academic objectives? (600-1200 words)",
      "minLength": 600,
      "maxLength": 2400
    }
  }
}'::jsonb,
'{
  "currentGPA": {
    "ui:help": "Applicants must have a minimum 3.0 GPA to be eligible"
  },
  "academicHonors": {
    "items": {
      "description": {
        "ui:widget": "textarea",
        "ui:options": {
          "rows": 2
        }
      }
    }
  },
  "academicEssay": {
    "ui:widget": "textarea",
    "ui:options": {
      "rows": 12
    }
  }
}'::jsonb),

('test-scholarship-simple', 'Simple Test Scholarship', true,
'{
  "title": "Simple Test Application",
  "type": "object",
  "required": ["fullName", "email", "essay"],
  "properties": {
    "fullName": {
      "type": "string",
      "title": "Full Name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email Address"
    },
    "essay": {
      "type": "string",
      "title": "Why do you deserve this scholarship?",
      "minLength": 100
    }
  }
}'::jsonb,
'{
  "essay": {
    "ui:widget": "textarea",
    "ui:options": {
      "rows": 6
    }
  }
}'::jsonb);

-- Insert some sample applications to test the system
INSERT INTO public.applications (scholarship_id, email, submission_data) VALUES
((SELECT id FROM public.scholarships WHERE slug = 'test-scholarship-simple'), 
 'test.user@example.com', 
 '{"fullName": "Test User", "email": "test.user@example.com", "essay": "I believe I deserve this scholarship because I am committed to my education and have demonstrated strong academic performance throughout my college career. I have maintained a 3.8 GPA while working part-time to support my studies and participating in various community service activities."}'::jsonb),

((SELECT id FROM public.scholarships WHERE slug = 'wsu-fiji-chapter-scholarship-2025'), 
 'james.anderson@wsu.edu', 
 '{"fullName": "James Anderson", "email": "james.anderson@wsu.edu", "phone": "509-555-0101", "highSchool": "Pullman High School", "gpa": 3.8, "leadershipExperience": [{"organization": "WSU Fiji", "position": "Treasurer", "startDate": "2023-08-15", "endDate": "2024-12-15", "description": "Managed chapter finances and organized fundraising events"}], "communityService": "Volunteered at local food bank for 50 hours, organized campus cleanup events", "essay": "As a dedicated member of the WSU Fiji chapter, I have demonstrated strong leadership skills through my role as treasurer. I have maintained a 3.8 GPA while actively participating in community service projects and fraternity events. My academic achievements reflect my commitment to excellence both in and out of the classroom."}'::jsonb),

((SELECT id FROM public.scholarships WHERE slug = 'wsu-fiji-leadership-award-2025'), 
 'sarah.johnson@wsu.edu', 
 '{"fullName": "Sarah Johnson", "email": "sarah.johnson@wsu.edu", "phone": "509-555-0102", "leadershipRoles": [{"organization": "WSU Fiji", "position": "President", "startDate": "2023-08-15", "achievements": "Led chapter to win Chapter of the Year award, increased membership by 25%"}, {"organization": "Student Government", "position": "Senator", "startDate": "2022-09-01", "endDate": "2023-05-15", "achievements": "Authored legislation for improved campus parking"}], "leadershipEssay": "My leadership philosophy is centered on servant leadership and leading by example. Through my role as WSU Fiji chapter president, I learned that true leadership is about empowering others to reach their full potential rather than seeking personal recognition."}'::jsonb);