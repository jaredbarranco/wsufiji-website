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

    if (url.pathname === "/submit" && request.method === "POST") {
      try {
        const body = await request.json();

        // Basic validation
        if (!body.full_name || !body.email) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: full_name, email" }), 
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

        const { error } = await supabase.from("applications").insert({
          full_name: body.full_name,
          email: body.email,
          phone: body.phone || null,
          essay: body.essay || null,
        });

        if (error) {
          console.error('Supabase error:', error);
          return new Response(
            JSON.stringify({ error: "Database insert failed" }), 
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }

        return new Response(
          JSON.stringify({ message: "Application submitted successfully" }), 
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