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

    // Endpoint 1: GET /schema/:slug
    // Publicly accessible, read-only
    if (request.method === 'GET' && url.pathname.startsWith('/schema/')) {
      const slug = url.pathname.split('/').pop();
      
      try {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
        const { data, error } = await supabase
          .from('scholarships')
          .select('form_schema, ui_schema, id')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (error || !data) {
          console.error('Schema fetch error:', error);
          return new Response('Scholarship not found', { 
            status: 404,
            headers: corsHeaders
          });
        }

        return new Response(JSON.stringify(data), { 
          status: 200,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        });
      } catch (error) {
        console.error('Request error:', error);
        return new Response('Internal server error', { 
          status: 500,
          headers: corsHeaders
        });
      }
    }

    // Endpoint 2: POST /submit
    // Strictly validated
    if (request.method === 'POST' && url.pathname === '/submit') {
      try {
        // 1. Parse Data
        const body = await request.json();
        const { slug, submission, token } = body;

        // Validate required fields
        if (!slug || !submission || !token) {
          return new Response('Missing required fields: slug, submission, token', { 
            status: 400,
            headers: corsHeaders
          });
        }

        // 2. Validate Turnstile (Anti-Spam)
        const turnstileForm = new FormData();
        turnstileForm.append('secret', env.TURNSTILE_SECRET_KEY);
        turnstileForm.append('response', token);
        turnstileForm.append('remoteip', request.headers.get('CF-Connecting-IP'));

        const turnstileResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          body: turnstileForm,
          method: 'POST',
        });
        
        const outcome = await turnstileResult.json();
        
        if (!outcome.success) {
          console.error('Turnstile validation failed:', outcome);
          return new Response('Invalid captcha', { 
            status: 403,
            headers: corsHeaders
          });
        }

        // 3. Initialize Admin Supabase Client
        // We use the SERVICE_ROLE_KEY to bypass RLS since users are anonymous
        const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        // 4. Get Scholarship ID
        const { data: scholarship, error: scholarshipError } = await supabaseAdmin
          .from('scholarships')
          .select('id')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (scholarshipError || !scholarship) {
          console.error('Scholarship fetch error:', scholarshipError);
          return new Response('Scholarship not found', { 
            status: 404,
            headers: corsHeaders
          });
        }

        // 5. Extract Email for the Unique Constraint
        // Assumes your JSON schema has a field named "email"
        const userEmail = submission.email; 
        if (!userEmail) {
          return new Response('Email field is required', { 
            status: 400,
            headers: corsHeaders
          });
        }

        // 6. Insert Application
        const { error: insertError } = await supabaseAdmin
          .from('applications')
          .insert({
            scholarship_id: scholarship.id,
            email: userEmail,
            submission_data: submission
          });

        if (insertError) {
          console.error('Application insert error:', insertError);
          // Handle unique constraint violation (User applied twice)
          if (insertError.code === '23505') {
            return new Response('You have already applied to this scholarship.', { 
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          return new Response('Database error', { 
            status: 500,
            headers: corsHeaders
          });
        }

        return new Response(JSON.stringify({ success: true }), { 
          status: 200,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        });
      } catch (error) {
        console.error('Submit error:', error);
        return new Response('Invalid request format', { 
          status: 400,
          headers: corsHeaders
        });
      }
    }

    // Endpoint 3: GET /scholarships (optional - for listing available scholarships)
    if (request.method === 'GET' && url.pathname === '/scholarships') {
      try {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
        const { data, error } = await supabase
          .from('scholarships')
          .select('id, title, slug, active, deadline')
          .eq('active', true)
          .order('title');

        if (error) {
          console.error('Scholarships fetch error:', error);
          return new Response('Failed to fetch scholarships', { 
            status: 500,
            headers: corsHeaders
          });
        }

        return new Response(JSON.stringify(data), { 
          status: 200,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        });
      } catch (error) {
        console.error('Request error:', error);
        return new Response('Internal server error', { 
          status: 500,
          headers: corsHeaders
        });
      }
    }

    return new Response('Method Not Allowed', { 
      status: 405,
      headers: corsHeaders
    });
  }
}