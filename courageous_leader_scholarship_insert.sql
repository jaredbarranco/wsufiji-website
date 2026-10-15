INSERT INTO scholarships (
    id, 
    slug, 
    title, 
    active, 
    form_schema, 
    ui_schema, 
    deadline,
    description,
    verbose_description,
    created_at
) VALUES (
    gen_random_uuid(),
    'courageous-leader-scholarship',
    'A Courageous Leader Scholarship',
    true,
    '{
        "type": "object",
        "title": "A Courageous Leader Scholarship Application",
        "required": [
            "fullName", 
            "email", 
            "gender", 
            "greekLifeInterest", 
            "courageousLeaderEssay", 
            "leadershipRoles", 
            "gpa", 
            "transcript", 
            "highSchoolName", 
            "highSchoolCityState"
        ],
        "properties": {
            "fullName": {
                "type": "string", 
                "title": "Full Name", 
                "maxLength": 100, 
                "minLength": 2
            },
            "email": {
                "type": "string", 
                "title": "Email Address", 
                "format": "email"
            },
            "gender": {
                "type": "string", 
                "title": "Gender", 
                "enum": ["Male", "Female", "Non-binary", "Prefer not to say"]
            },
            "greekLifeInterest": {
                "type": "string", 
                "title": "I would like to hear more about Greek Life at Washington State University", 
                "enum": ["Yes", "No"]
            },
            "courageousLeaderEssay": {
                "type": "string", 
                "title": "Short Essay Question", 
                "maxLength": 2000, 
                "minLength": 300, 
                "description": "Describe a scenario where you exhibited the qualities of a courageous leader, and how you plan on growing your skills in the future. (300-1000 words)"
            },
            "leadershipRoles": {
                "type": "array", 
                "items": {
                    "type": "object", 
                    "required": ["organization", "position"], 
                    "properties": {
                        "organization": {"type": "string", "title": "Organization"}, 
                        "position": {"type": "string", "title": "Position/Role"}
                    }
                }, 
                "title": "Leadership Positions", 
                "minItems": 1, 
                "description": "List of Leadership roles (at least one required)"
            },
            "gpa": {
                "type": "string", 
                "title": "GPA", 
                "description": "Please enter your cumulative high school GPA"
            },
            "transcript": {
                "type": "string", 
                "title": "PDF Copy of Transcript", 
                "description": "Please upload your high school transcript in PDF format"
            },
            "highSchoolName": {
                "type": "string", 
                "title": "Name of High School", 
                "maxLength": 100, 
                "minLength": 2
            },
            "highSchoolCityState": {
                "type": "string", 
                "title": "City/State of High School", 
                "maxLength": 100, 
                "minLength": 2
            }
        }
    }',
    '{
        "courageousLeaderEssay": {
            "ui:widget": "textarea", 
            "ui:options": {"rows": 10}
        },
        "leadershipRoles": {
            "items": {
                "ui:options": {
                    "inline": true
                }
            }
        },
        "transcript": {
            "ui:widget": "file"
        },
        "greekLifeInterest": {
            "ui:widget": "radio"
        }
    }',
    '2025-06-01 23:59:59-07',
    'Scholarship for high-achieving incoming freshmen at WSU Pullman.',
    '# A Courageous Leader Scholarship

## Purpose
The purpose of this proposal is to establish a Washington State Courageous Leader Scholarship designed to recognize and attract high-achieving, leadership-oriented incoming freshmen to Washington State University''s Pullman campus. This scholarship is offered by the Pi Mu Chapter of Phi Gamma Delta in an effort to reward high caliber students attending Washington State University.

## Eligibility Criteria
Applicants must meet all of the following requirements:

- Be a student enrolling full-time at Washington State University – Pullman for the upcoming Fall semester
- Hold a minimum cumulative high school GPA of 3.75 or higher
- Demonstrate leadership experience by serving in a formal role such as:
    - Team Captain
    - ASB or Club Officer
    - Leadership position within a recognized organization or community group
- Exhibit strong character, academic ambition, and an interest in personal and professional development

## Application Requirements
- Complete application form with personal and academic information
- Submit PDF copy of high school transcript
- Provide leadership roles and experience
- Write short essay describing a scenario where you exhibited courageous leadership qualities
- Indicate interest in learning more about Greek Life at Washington State University

It is recommended to work on the short essay prompts separately, then come back to the application page and complete your form and submit in a brief amount of time.',
    NOW()
);
