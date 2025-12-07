import { createClient } from '@supabase/supabase-js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/scholarship" && request.method === "GET") {
      try {
        const scholarshipName = url.searchParams.get('scholarshipName');

        // Supabase client using service role key
        const supabase = createClient(
          env.SUPABASE_URL,
          env.SUPABASE_SERVICE_ROLE_KEY
        );

        if (scholarshipName) {
          // Get specific scholarship by name
          const { data: scholarship, error: scholarshipError } = await supabase
            .from('scholarships')
            .select('*')
            .eq('name', scholarshipName)
            .eq('is_active', true)
            .single();

          if (scholarshipError) {
            console.error('Scholarship fetch error:', scholarshipError);
            return new Response(
              JSON.stringify({ error: `No active scholarship found with name: ${scholarshipName}` }), 
              { 
                status: 404, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          return new Response(
            JSON.stringify(scholarship), 
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        } else {
          // Get all active scholarships
          const { data: scholarships, error: scholarshipsError } = await supabase
            .from('scholarships')
            .select('*')
            .eq('is_active', true)
            .order('name');

          if (scholarshipsError) {
            console.error('Scholarships fetch error:', scholarshipsError);
            return new Response(
              JSON.stringify({ error: "Failed to fetch scholarships" }), 
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }

          return new Response(
            JSON.stringify(scholarships), 
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      } catch (error) {
        console.error('Request error:', error);
        return new Response(
          JSON.stringify({ error: "Invalid request format" }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    if (url.pathname === "/scholarship/submit" && request.method === "POST") {
      try {
        const body = await request.json();
        const scholarshipName = url.searchParams.get('scholarshipName');

        // Basic validation
        if (!body.full_name || !body.email || !body.high_school_name) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: full_name, email, high_school_name" }), 
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        if (!scholarshipName) {
          return new Response(
            JSON.stringify({ error: "Missing required query parameter: scholarshipName" }), 
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Supabase client using service role key
        const supabase = createClient(
          env.SUPABASE_URL,
          env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Check if applicant already exists by email
        let applicant;
        const { data: existingApplicant, error: fetchError } = await supabase
          .from('applicants')
          .select('*')
          .eq('email', body.email)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Applicant fetch error:', JSON.stringify(fetchError));
          return new Response(
            JSON.stringify({ error: "Failed to check existing applicant" }), 
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        if (existingApplicant) {
          applicant = existingApplicant;
        } else {
          // Create new applicant if doesn't exist
          const { data: newApplicant, error: applicantError } = await supabase
            .from('applicants')
            .insert({
              full_name: body.full_name,
              email: body.email,
              phone: body.phone || null,
              gender: body.gender || null,
              high_school_name: body.high_school_name,
              anticipated_gpa: body.anticipated_gpa || null,
            })
            .select()
            .single();

          if (applicantError) {
            console.error('Applicant insert error:', applicantError);
            return new Response(
              JSON.stringify({ error: "Failed to create applicant record" }), 
              { 
                status: 500, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
          applicant = newApplicant;
        }

        // Get scholarship by name from query parameter
        const { data: scholarship, error: scholarshipError } = await supabase
          .from('scholarships')
          .select('*')
          .eq('name', scholarshipName)
          .eq('is_active', true)
          .single();

        if (scholarshipError) {
          console.error('Scholarship fetch error:', scholarshipError);
          return new Response(
            JSON.stringify({ error: `No active scholarship found with name: ${scholarshipName}` }), 
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Check if application already exists for this applicant and scholarship
        const { data: existingApplication, error: existingAppError } = await supabase
          .from('applications')
          .select('*')
          .eq('applicant_id', applicant.id)
          .eq('scholarship_id', scholarship.id)
          .single();

        if (existingApplication) {
          return new Response(
            JSON.stringify({ error: "You have already submitted an application for this scholarship" }), 
            { 
              status: 409, // Conflict
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Create the application
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .insert({
            applicant_id: applicant.id,
            scholarship_id: scholarship.id,
            status: 'submitted',
            submitted_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (applicationError) {
          console.error('Application insert error:', applicationError);
          // Check if it's a unique constraint violation
          if (applicationError.code === '23505') {
            return new Response(
              JSON.stringify({ error: "You have already submitted an application for this scholarship" }), 
              { 
                status: 409, // Conflict
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
          return new Response(
            JSON.stringify({ error: "Failed to create application record" }), 
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        // Insert essay if provided
        if (body.essay) {
          const { error: essayError } = await supabase
            .from('essays')
            .insert({
              application_id: application.id,
              content: body.essay,
              word_count: body.essay.split(/\s+/).length,
            });

          if (essayError) {
            console.error('Essay insert error:', essayError);
            // Continue even if essay fails - application is already created
          }
        }

        // Insert leadership roles if provided
        if (body.leadership_roles && Array.isArray(body.leadership_roles)) {
          const leadershipRolesData = body.leadership_roles.map(role => ({
            application_id: application.id,
            organization_name: role.organization_name,
            role_title: role.role_title,
            start_date: role.start_date || null,
            end_date: role.end_date || null,
            responsibilities: role.responsibilities || null,
          }));

          const { error: leadershipError } = await supabase
            .from('leadership_roles')
            .insert(leadershipRolesData);

          if (leadershipError) {
            console.error('Leadership roles insert error:', leadershipError);
            // Continue even if leadership roles fail - application is already created
          }
        }

        return new Response(
          JSON.stringify({ 
            message: "Application submitted successfully",
            application_id: application.id
          }), 
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (error) {
        console.error('Request error:', error);
        return new Response(
          JSON.stringify({ error: "Invalid request format" }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Not found" }), 
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}