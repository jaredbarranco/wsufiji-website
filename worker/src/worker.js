import { createClient } from '@supabase/supabase-js'

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Debug logging
    console.log('Request received:', {
      method: request.method,
      pathname: url.pathname,
      url: request.url
    });

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
          .select('form_schema, ui_schema, id, title, description, verbose_description')
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
    // Strictly validated with file movement
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

        // 6. Check for duplicate application BEFORE processing files
        const { data: existingApplication, error: checkError } = await supabaseAdmin
          .from('applications')
          .select('id')
          .eq('scholarship_id', scholarship.id)
          .eq('email', userEmail)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Duplicate check error:', checkError);
          return new Response('Database error during duplicate check', { 
            status: 500,
            headers: corsHeaders
          });
        }

        if (existingApplication) {
          return new Response('You have already applied to this scholarship.', { 
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // 7. Process file movement from temp to permanent storage
        const processedSubmission = { ...submission };
        
        // Find all file paths in the submission
        const findFilePaths = (obj, paths = []) => {
          if (typeof obj === 'string' && obj.startsWith('temp/')) {
            paths.push(obj);
          } else if (typeof obj === 'object' && obj !== null) {
            Object.values(obj).forEach(value => findFilePaths(value, paths));
          }
          return paths;
        };

        const tempFilePaths = findFilePaths(submission);
        
        // Move each file from temp to permanent storage
        for (const tempPath of tempFilePaths) {
          try {
            const finalPath = tempPath.replace('temp/', `applications/${scholarship.id}/`);
            
            // Move file from temp-uploads to scholarship-applications bucket
            const { error: moveError } = await supabaseAdmin.storage
              .from('temp-uploads')
              .move(tempPath, finalPath, { destinationBucket: 'scholarship-applications' });

            if (moveError) {
              console.error('File move error:', moveError);
              throw new Error(`Failed to move file: ${tempPath}`);
            }

            // Update the submission with the new path
            const updatePath = (obj, oldPath, newPath) => {
              if (obj === oldPath) return newPath;
              if (typeof obj === 'object' && obj !== null) {
                return Object.fromEntries(
                  Object.entries(obj).map(([key, value]) => [key, updatePath(value, oldPath, newPath)])
                );
              }
              return obj;
            };

            processedSubmission.submission_data = updatePath(processedSubmission.submission_data, tempPath, finalPath);
            
          } catch (error) {
            console.error('Error moving file:', error);
            return new Response('Failed to process file uploads', { 
              status: 500,
              headers: corsHeaders
            });
          }
        }

        // 8. Insert Application
        const { error: insertError } = await supabaseAdmin
          .from('applications')
          .insert({
            scholarship_id: scholarship.id,
            email: userEmail,
            submission_data: processedSubmission.submission_data || processedSubmission
          });

        if (insertError) {
          console.error('Application insert error:', insertError);
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

    // Endpoint 3: POST /api/sign-upload
    if (request.method === 'POST' && url.pathname === '/api/sign-upload') {
      console.log('Processing sign-upload request');
      try {
        const body = await request.json();
        console.log('Request body:', body);
        const { filename, fileType, fileSize, token } = body;

        // Validate required fields
        if (!filename || !fileType || !fileSize || !token) {
          return new Response('Missing required fields: filename, fileType, fileSize, token', { 
            status: 400,
            headers: corsHeaders
          });
        }

        // 1. Validate Turnstile (Anti-Spam)
        console.log('Validating Turnstile token...');
        console.log('Environment vars available:', {
          TURNSTILE_SECRET_KEY: env.TURNSTILE_SECRET_KEY ? 'present' : 'missing',
          token: token ? token.substring(0, 20) + '...' : 'missing'
        });
        
        const turnstileForm = new FormData();
        turnstileForm.append('secret', env.TURNSTILE_SECRET_KEY);
        turnstileForm.append('response', token);
        turnstileForm.append('remoteip', request.headers.get('CF-Connecting-IP'));

        const turnstileResult = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          body: turnstileForm,
          method: 'POST',
        });
        
        const outcome = await turnstileResult.json();
        console.log('Turnstile verification response:', outcome);
        
        if (!outcome.success) {
          console.error('Turnstile validation failed:', outcome);
          return new Response(`Invalid captcha: ${outcome['error-codes']?.[0] || 'Unknown error'}`, { 
            status: 403,
            headers: corsHeaders
          });
        }

        // 2. File validation
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(fileType)) {
          return new Response('Invalid file type. Only PDF, DOCX, JPG, and PNG are allowed.', { 
            status: 400,
            headers: corsHeaders
          });
        }

        if (fileSize > maxSize) {
          return new Response('File size exceeds 10MB limit.', { 
            status: 400,
            headers: corsHeaders
          });
        }

        // 3. Rate limiting (simple implementation - would need KV store for production)
        const clientIP = request.headers.get('CF-Connecting-IP');
        // Note: In production, you'd use KV store or D1 database for rate limiting
        // For now, we'll skip this but log the IP for monitoring

        // 4. Initialize Supabase Admin Client
        const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        // 5. Generate unique file path
        const fileUuid = crypto.randomUUID();
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `temp/${fileUuid}/${sanitizedFilename}`;

        // 6. Generate signed upload URL
        const { data, error } = await supabaseAdmin.storage
          .from('temp-uploads')
          .createSignedUploadUrl(filePath, {
            expiresIn: 3600, // 1 hour
            contentType: fileType,
            upsert: false
          });

        if (error) {
          console.error('Signed URL generation error:', error);
          return new Response('Failed to generate upload URL', { 
            status: 500,
            headers: corsHeaders
          });
        }

        // 7. Log to audit table
        await supabaseAdmin
          .from('upload_audit_log')
          .insert({
            ip_address: clientIP,
            file_size: fileSize,
            mime_type: fileType,
            file_path: filePath
          });

        return new Response(JSON.stringify({ 
          uploadUrl: data.signedUrl, 
          path: filePath,
          fileUuid: fileUuid
        }), { 
          status: 200,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        });

      } catch (error) {
        console.error('Sign upload error:', error);
        return new Response('Invalid request format', { 
          status: 400,
          headers: corsHeaders
        });
      }
    }

    // Endpoint 4: GET /scholarships (optional - for listing available scholarships)
    if (request.method === 'GET' && url.pathname === '/scholarships') {
      try {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
        const { data, error } = await supabase
          .from('scholarships')
          .select('id, title, slug, active, description')
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

    // Debug endpoint - log all unhandled requests
    console.log('Unhandled request:', {
      method: request.method,
      pathname: url.pathname,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });

    return new Response(`Method Not Allowed or Endpoint Not Found: ${request.method} ${url.pathname}`, { 
      status: 405,
      headers: corsHeaders
    });
  }
}