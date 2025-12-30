import { createClient } from '@supabase/supabase-js'

// Development bypass for localhost
function isDevelopmentRequest(request) {
  const clientIP = request.headers.get('CF-Connecting-IP');
  return clientIP === '127.0.0.1' || clientIP === '::1';
}

// Enhanced authentication with development bypass
function authenticateFromHeaders(request, env) {
  // Development bypass - check for local headers first
  if (isDevelopmentRequest(request)) {
    const devEmail = request.headers.get('CF-Access-Client-Id');
    const devName = request.headers.get('X-Dev-Name') || 'Development User';
    
    if (devEmail) {
      return { 
        email: devEmail, 
        name: devName, 
        authenticated: true,
        isDevelopment: true 
      };
    }
    
    // Fallback if no dev email provided
    return { 
      email: 'dev@localhost', 
      name: 'Development User', 
      authenticated: true,
      isDevelopment: true 
    };
  }
  
  const email = request.headers.get('CF-Access-Authenticated-User-Email');
  const name = request.headers.get('CF-Access-Authenticated-User-Name');
  const teamDomain = request.headers.get('CF-Access-Domain');
  
  if (!email || !teamDomain) {
    return { error: 'Unauthorized - Missing Zero Trust headers' };
  }
  
  return { email, name, authenticated: true, isDevelopment: false };
}

// Field visibility configuration validation and filtering
function validateFieldVisibilityConfig(config) {
  if (!config || typeof config !== 'object') {
    return { mode: 'denylist', fields: [] };
  }

  const { mode, fields } = config;

  // Only denylist mode is supported initially
  if (mode !== 'denylist') {
    return { mode: 'denylist', fields: [] };
  }

  // Ensure fields is an array
  if (!Array.isArray(fields)) {
    return { mode: 'denylist', fields: [] };
  }

  // Filter out non-string fields and ensure they are top-level field names
  const validFields = fields.filter(field =>
    typeof field === 'string' &&
    field.length > 0 &&
    !field.includes('.') // No nested fields for now
  );

  return { mode: 'denylist', fields: validFields };
}

function filterSubmissionData(submissionData, visibilityConfig) {
  const config = validateFieldVisibilityConfig(visibilityConfig);
  const { mode, fields } = config;

  if (mode !== 'denylist' || !Array.isArray(fields) || fields.length === 0) {
    return submissionData; // No filtering needed
  }

  const filtered = { ...submissionData };
  fields.forEach(field => {
    delete filtered[field];
  });

  return filtered;
}

// Role verification with caching
async function verifyReviewerRole(supabase, email, requiredRole = 'reviewer') {
  const { data: reviewer, error } = await supabase
    .from('reviewers')
    .select('id, name, role, is_active')
    .eq('email', email)
    .eq('is_active', true)
    .single();
    
  if (error || !reviewer) {
    return { error: 'Reviewer not found or inactive' };
  }
  
  const roleHierarchy = { 'admin': 3, 'committee_member': 2, 'reviewer': 1 };
  if (roleHierarchy[reviewer.role] < roleHierarchy[requiredRole]) {
    return { error: 'Insufficient permissions' };
  }
  
  return { reviewer };
}

// Endpoint protection middleware
async function protectEndpoint(request, env, requiredRole = 'reviewer') {
  const auth = authenticateFromHeaders(request, env);
  if (auth.error) return { error: auth.error, status: 401 };
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const roleCheck = await verifyReviewerRole(supabase, auth.email, requiredRole);
  if (roleCheck.error) return { error: roleCheck.error, status: 403 };
  
  return { 
    reviewer: roleCheck.reviewer, 
    email: auth.email,
    isDevelopment: auth.isDevelopment 
  };
}

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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, CF-Access-Authenticated-User-Email, CF-Access-Authenticated-User-Name, CF-Access-Domain, CF-Access-Client-Id, X-Dev-Name, Authorization',
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
                const updated = {};
                for (const [key, value] of Object.entries(obj)) {
                  updated[key] = updatePath(value, oldPath, newPath);
                }
                return updated;
              }
              return obj;
            };

            // Update the processed submission directly
            const updatedSubmission = updatePath(processedSubmission, tempPath, finalPath);
            Object.assign(processedSubmission, updatedSubmission);

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
        turnstileForm.append('secret', env.TURNSTILE_UPLOAD_SECRET_KEY);
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

    // Endpoint 5: GET /apply/{applicationName}/{applicationUuid}
    if (request.method === 'GET' && url.pathname.startsWith('/apply/')) {
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      
      if (pathParts.length !== 3) {
        return new Response('Invalid URL format. Expected: /apply/{applicationName}/{applicationUuid}', {
          status: 400,
          headers: corsHeaders
        });
      }

      const [, applicationName, applicationUuid] = pathParts;

      try {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        // Get scholarship info first
        const { data: scholarship, error: scholarshipError } = await supabase
          .from('scholarships')
          .select('id, title, slug, form_schema, ui_schema, description')
          .eq('slug', applicationName)
          .eq('active', true)
          .single();

        if (scholarshipError || !scholarship) {
          console.error('Scholarship fetch error:', scholarshipError);
          return new Response('Scholarship not found', {
            status: 404,
            headers: corsHeaders
          });
        }

        // Get application data
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .select('id, email, submission_data, created_at')
          .eq('scholarship_id', scholarship.id)
          .eq('id', applicationUuid)
          .single();

        if (applicationError || !application) {
          console.error('Application fetch error:', applicationError);
          return new Response('Application not found', {
            status: 404,
            headers: corsHeaders
          });
        }

        // Return combined data
        const responseData = {
          scholarship: {
            id: scholarship.id,
            title: scholarship.title,
            slug: scholarship.slug,
            description: scholarship.description,
            form_schema: scholarship.form_schema,
            ui_schema: scholarship.ui_schema
          },
          application: {
            id: application.id,
            email: application.email,
            submission_data: application.submission_data,
            created_at: application.created_at
          }
        };

        return new Response(JSON.stringify(responseData), {
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

    // Endpoint 6: GET /api/admin/reviewers
    if (request.method === 'GET' && url.pathname === '/api/admin/reviewers') {
      const auth = await protectEndpoint(request, env, 'admin');
      if (auth.error) {
        return new Response(JSON.stringify({ success: false, error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
        const { data: reviewers, error } = await supabase
          .from('reviewers')
          .select('id, name, email, role, is_active, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Reviewers fetch error:', error);
          return new Response(JSON.stringify({ success: false, error: 'Failed to fetch reviewers' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, data: reviewers }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Reviewers endpoint error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 7: POST /api/admin/reviewers
    if (request.method === 'POST' && url.pathname === '/api/admin/reviewers') {
      const auth = await protectEndpoint(request, env, 'admin');
      if (auth.error) {
        return new Response(JSON.stringify({ success: false, error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const body = await request.json();
        const { name, email, role } = body;

        if (!name || !email || !role) {
          return new Response(JSON.stringify({ success: false, error: 'Name, email, and role are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (!['admin', 'reviewer', 'committee_member'].includes(role)) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid role. Must be admin, reviewer, or committee_member' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
        const { data: reviewer, error } = await supabase
          .from('reviewers')
          .insert({ name, email, role })
          .select('id, name, email, role, is_active, created_at')
          .single();

        if (error) {
          console.error('Reviewer creation error:', error);
          if (error.code === '23505') {
            return new Response(JSON.stringify({ success: false, error: 'A reviewer with this email already exists' }), {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          return new Response(JSON.stringify({ success: false, error: 'Failed to create reviewer' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, data: reviewer }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Reviewer creation endpoint error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Invalid request format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 8: PUT /api/admin/reviewers/:id
    if (request.method === 'PUT' && url.pathname.match(/^\/api\/admin\/reviewers\/[^\/]+$/)) {
      const auth = await protectEndpoint(request, env, 'admin');
      if (auth.error) {
        return new Response(JSON.stringify({ success: false, error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const reviewerId = url.pathname.split('/').pop();
        const body = await request.json();
        const { name, email, role, is_active } = body;

        if (!name || !email || !role) {
          return new Response(JSON.stringify({ success: false, error: 'Name, email, and role are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (!['admin', 'reviewer', 'committee_member'].includes(role)) {
          return new Response(JSON.stringify({ success: false, error: 'Invalid role. Must be admin, reviewer, or committee_member' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
        const { data: reviewer, error } = await supabase
          .from('reviewers')
          .update({ name, email, role, is_active })
          .eq('id', reviewerId)
          .select('id, name, email, role, is_active, created_at')
          .single();

        if (error) {
          console.error('Reviewer update error:', error);
          if (error.code === '23505') {
            return new Response(JSON.stringify({ success: false, error: 'A reviewer with this email already exists' }), {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          return new Response(JSON.stringify({ success: false, error: 'Failed to update reviewer' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (!reviewer) {
          return new Response(JSON.stringify({ success: false, error: 'Reviewer not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, data: reviewer }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Reviewer update endpoint error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Invalid request format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 9: DELETE /api/admin/reviewers/:id
    if (request.method === 'DELETE' && url.pathname.match(/^\/api\/admin\/reviewers\/[^\/]+$/)) {
      const auth = await protectEndpoint(request, env, 'admin');
      if (auth.error) {
        return new Response(JSON.stringify({ success: false, error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const reviewerId = url.pathname.split('/').pop();
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
        const { error } = await supabase
          .from('reviewers')
          .delete()
          .eq('id', reviewerId);

        if (error) {
          console.error('Reviewer deletion error:', error);
          return new Response(JSON.stringify({ success: false, error: 'Failed to delete reviewer' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Reviewer deletion endpoint error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Invalid request format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 10: POST /api/reviewer/auth
    if (request.method === 'POST' && url.pathname === '/api/reviewer/auth') {
      try {
        const auth = authenticateFromHeaders(request, env);
        if (auth.error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: auth.error 
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        const roleCheck = await verifyReviewerRole(supabase, auth.email, 'reviewer');
        
        if (roleCheck.error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: roleCheck.error 
          }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          data: {
            id: roleCheck.reviewer.id,
            name: roleCheck.reviewer.name,
            email: auth.email,
            role: roleCheck.reviewer.role
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('Auth endpoint error:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Authentication failed' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 11: GET /api/reviewer/scholarships
    if (request.method === 'GET' && url.pathname === '/api/reviewer/scholarships') {
      try {
        const auth = authenticateFromHeaders(request, env);
        if (auth.error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: auth.error 
          }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        const roleCheck = await verifyReviewerRole(supabase, auth.email, 'reviewer');
        
        if (roleCheck.error) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: roleCheck.error 
          }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { data: scholarships, error } = await supabase
          .from('scholarships')
          .select('id, title, description, deadline')
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Scholarships query error:', error);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Failed to fetch scholarships' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          data: scholarships || []
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      } catch (error) {
        console.error('Scholarships endpoint error:', error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch scholarships' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 12: GET /api/admin/scholarships
    if (request.method === 'GET' && url.pathname === '/api/admin/scholarships') {
      const auth = await protectEndpoint(request, env, 'admin');
      if (auth.error) {
        return new Response(JSON.stringify({ success: false, error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
        const { data: scholarships, error } = await supabase
          .from('scholarships')
          .select('id, slug, title, description, verbose_description, deadline, active, form_schema, ui_schema, reviewer_field_visibility, created_at, updated_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Scholarships fetch error:', error);
          return new Response(JSON.stringify({ success: false, error: 'Failed to fetch scholarships' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, data: scholarships || [] }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Scholarships endpoint error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 13: POST /api/admin/scholarships
    if (request.method === 'POST' && url.pathname === '/api/admin/scholarships') {
      const auth = await protectEndpoint(request, env, 'admin');
      if (auth.error) {
        return new Response(JSON.stringify({ success: false, error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

       try {
         const body = await request.json();
         const { slug, title, description, verbose_description, deadline, active, form_schema, ui_schema, reviewer_field_visibility } = body;

         if (!slug || !title) {
          return new Response(JSON.stringify({ success: false, error: 'Slug and title are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
         const { data: scholarship, error } = await supabase
          .from('scholarships')
          .insert({
            slug,
            title,
            description: description || null,
            verbose_description: verbose_description || null,
            deadline: deadline || null,
            active: active !== undefined ? active : true,
            form_schema: form_schema || {},
            ui_schema: ui_schema || {},
            reviewer_field_visibility: reviewer_field_visibility || { mode: 'denylist', fields: [] }
          })
          .select('id, slug, title, description, verbose_description, deadline, active, form_schema, ui_schema, reviewer_field_visibility, created_at, updated_at')
          .single();

        if (error) {
          console.error('Scholarship creation error:', error);
          if (error.code === '23505') {
            return new Response(JSON.stringify({ success: false, error: 'A scholarship with this slug already exists' }), {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          return new Response(JSON.stringify({ success: false, error: 'Failed to create scholarship' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, data: scholarship }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Scholarship creation endpoint error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Invalid request format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 14: PUT /api/admin/scholarships/:id
    if (request.method === 'PUT' && url.pathname.match(/^\/api\/admin\/scholarships\/[^\/]+$/)) {
      const auth = await protectEndpoint(request, env, 'admin');
      if (auth.error) {
        return new Response(JSON.stringify({ success: false, error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
         const scholarshipId = url.pathname.split('/').pop();
         const body = await request.json();
         const { slug, title, description, verbose_description, deadline, active, form_schema, ui_schema, reviewer_field_visibility } = body;

        if (!slug || !title) {
          return new Response(JSON.stringify({ success: false, error: 'Slug and title are required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
        
         const { data: scholarship, error } = await supabase
          .from('scholarships')
          .update({
            slug,
            title,
            description: description || null,
            verbose_description: verbose_description || null,
            deadline: deadline || null,
            active: active !== undefined ? active : true,
            form_schema: form_schema || {},
            ui_schema: ui_schema || {},
            reviewer_field_visibility: reviewer_field_visibility || { mode: 'denylist', fields: [] }
          })
          .eq('id', scholarshipId)
          .select('id, slug, title, description, verbose_description, deadline, active, form_schema, ui_schema, reviewer_field_visibility, created_at, updated_at')
          .single();

        if (error) {
          console.error('Scholarship update error:', error);
          if (error.code === '23505') {
            return new Response(JSON.stringify({ success: false, error: 'A scholarship with this slug already exists' }), {
              status: 409,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          return new Response(JSON.stringify({ success: false, error: 'Failed to update scholarship' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        if (!scholarship) {
          return new Response(JSON.stringify({ success: false, error: 'Scholarship not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, data: scholarship }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Scholarship update endpoint error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Invalid request format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 15: DELETE /api/admin/scholarships/:id
    if (request.method === 'DELETE' && url.pathname.match(/^\/api\/admin\/scholarships\/[^\/]+$/)) {
      const auth = await protectEndpoint(request, env, 'admin');
      if (auth.error) {
        return new Response(JSON.stringify({ success: false, error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const scholarshipId = url.pathname.split('/').pop();
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        const { error } = await supabase
          .from('scholarships')
          .delete()
          .eq('id', scholarshipId);

        if (error) {
          console.error('Scholarship deletion error:', error);
          return new Response(JSON.stringify({ success: false, error: 'Failed to delete scholarship' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Scholarship deletion endpoint error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Invalid request format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 16: GET /api/reviewer/applications/:scholarshipId
    if (request.method === 'GET' && url.pathname.match(/^\/api\/reviewer\/applications\/[^\/]+$/)) {
      const auth = await protectEndpoint(request, env, 'reviewer');
      if (auth.error) {
        return new Response(JSON.stringify({ success: false, error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const scholarshipId = url.pathname.split('/').pop();
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        // First, get the scholarship's field visibility config
        const { data: scholarship, error: scholarshipError } = await supabase
          .from('scholarships')
          .select('reviewer_field_visibility')
          .eq('id', scholarshipId)
          .single();

        if (scholarshipError) {
          console.error('Scholarship fetch error:', scholarshipError);
          return new Response(JSON.stringify({ success: false, error: 'Failed to fetch scholarship config' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const { data: applications, error } = await supabase
          .from('applications')
          .select(`
            id,
            email,
            submission_data,
            created_at,
            scholarships!inner(id, title)
          `)
          .eq('scholarship_id', scholarshipId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Applications fetch error:', error);
          return new Response(JSON.stringify({ success: false, error: 'Failed to fetch applications' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Transform the data to include review status with field filtering
        const transformedApplications = applications.map(app => {
          const filteredSubmissionData = filterSubmissionData(app.submission_data, scholarship.reviewer_field_visibility);
          return {
            id: app.id,
            email: app.email,
            submission_data: filteredSubmissionData,
            created_at: app.created_at,
            reviewed: app.submission_data?.review ? true : false,
            review: app.submission_data?.review || null
          };
        });

        return new Response(JSON.stringify({ success: true, data: transformedApplications }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Applications endpoint error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 17: GET /api/reviewer/application/:applicationId
    if (request.method === 'GET' && url.pathname.match(/^\/api\/reviewer\/application\/[^\/]+$/)) {
      const auth = await protectEndpoint(request, env, 'reviewer');
      if (auth.error) {
        return new Response(JSON.stringify({ success: false, error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const applicationId = url.pathname.split('/').pop();
        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        const { data: application, error } = await supabase
          .from('applications')
          .select(`
            id,
            email,
            submission_data,
            created_at,
            scholarships!inner(id, title, form_schema, reviewer_field_visibility)
          `)
          .eq('id', applicationId)
          .single();

        if (error) {
          console.error('Application fetch error:', error);
          return new Response(JSON.stringify({ success: false, error: 'Application not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Apply field visibility filtering
        const visibilityConfig = application.scholarships.reviewer_field_visibility;
        const filteredSubmissionData = filterSubmissionData(application.submission_data, visibilityConfig);

        // Transform the data to match frontend expectations
        const transformedApplication = {
          id: application.id,
          email: application.email,
          submission_data: filteredSubmissionData,
          submitted_at: application.created_at,
          reviewed: application.submission_data?.review ? true : false,
          review: application.submission_data?.review || null,
          // Add applicant info extracted from filtered submission_data
          applicant: {
            email: application.email,
            full_name: filteredSubmissionData?.fullName || filteredSubmissionData?.full_name || 'N/A',
            phone: filteredSubmissionData?.phone || 'N/A'
          },
          // Add scholarship info including visibility config
          scholarship: {
            id: application.scholarships.id,
            title: application.scholarships.title,
            form_schema: application.scholarships.form_schema,
            reviewer_field_visibility: application.scholarships.reviewer_field_visibility
          }
        };

        return new Response(JSON.stringify({ success: true, data: transformedApplication }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Application endpoint error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Endpoint 18: POST /api/reviewer/review/:applicationId
    if (request.method === 'POST' && url.pathname.match(/^\/api\/reviewer\/review\/[^\/]+$/)) {
      const auth = await protectEndpoint(request, env, 'reviewer');
      if (auth.error) {
        return new Response(JSON.stringify({ success: false, error: auth.error }), {
          status: auth.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      try {
        const applicationId = url.pathname.split('/').pop();
        const body = await request.json();
        const { overall_rating, academic_potential, leadership_potential, financial_need, comments } = body;

        // Validate required fields
        if (!overall_rating) {
          return new Response(JSON.stringify({ success: false, error: 'Overall rating is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

        // First, get the current application data
        const { data: application, error: fetchError } = await supabase
          .from('applications')
          .select('submission_data')
          .eq('id', applicationId)
          .single();

        if (fetchError || !application) {
          console.error('Application fetch error:', fetchError);
          return new Response(JSON.stringify({ success: false, error: 'Application not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Prepare the review data
        const reviewData = {
          overall_rating: parseInt(overall_rating),
          academic_potential: academic_potential ? parseInt(academic_potential) : null,
          leadership_potential: leadership_potential ? parseInt(leadership_potential) : null,
          financial_need: financial_need ? parseInt(financial_need) : null,
          comments: comments || null,
          reviewer_id: auth.reviewer.id,
          submitted_at: new Date().toISOString()
        };

        // Update the application with the review data
        const updatedSubmissionData = {
          ...application.submission_data,
          review: reviewData
        };

        const { error: updateError } = await supabase
          .from('applications')
          .update({ submission_data: updatedSubmissionData })
          .eq('id', applicationId);

        if (updateError) {
          console.error('Review submission error:', updateError);
          return new Response(JSON.stringify({ success: false, error: 'Failed to submit review' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true, data: reviewData }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Review submission endpoint error:', error);
        return new Response(JSON.stringify({ success: false, error: 'Invalid request format' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
