# WSU Fiji Reviewer Portal Implementation Plan

## Executive Summary

This document outlines the implementation of a comprehensive reviewer portal for the WSU Fiji scholarship application system. The portal will support a two-phase review process where reviewers initially screen applications (Phase 1) and then conduct detailed reviews of top candidates (Phase 2). The system will use weighted scoring, allow review editing until deadlines, and provide admin capabilities for progress monitoring and deadline management.

## Architecture Overview

### System Components
- **Separate React App**: `reviewer-portal/` directory in same repository
- **Extended Worker API**: New reviewer-specific endpoints in existing Cloudflare Worker
- **Database Extensions**: New tables and columns to support two-phase review workflow
- **Authentication**: Cloudflare Zero Trust header-based authentication with development bypass

### Security Model
- **Primary**: Cloudflare Zero Trust headers for authentication
- **Secondary**: Database role verification
- **Tertiary**: CORS restrictions and origin validation
- **Development**: IP bypass for localhost (127.0.0.1)

## Database Schema Extensions

### New Migration: 20251217000000_reviewer_portal_extensions.sql

```sql
-- Phase 1 decision tracking
CREATE TABLE phase1_decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  reviewer_id uuid not null references public.reviewers(id) on delete cascade,
  decision text not null check (decision in ('yes', 'no', 'maybe', 'skipped')),
  comments text,
  decision_time timestamptz default now(),
  last_edited_at timestamptz default now(),
  edit_count integer default 0,
  unique(application_id, reviewer_id)
);

-- Application scoring and Phase 2 eligibility
CREATE TABLE application_scores (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  yes_count integer default 0,
  no_count integer default 0,
  maybe_count integer default 0,
  skipped_count integer default 0,
  weighted_score numeric default 0, -- yes=+1, maybe=0, no=-1, skipped=0
  total_reviewers integer default 0,
  phase2_eligible boolean default false,
  phase2_rank integer,
  last_calculated timestamptz default now(),
  unique(application_id)
);

-- Review deadline management
CREATE TABLE review_deadlines (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  phase1_deadline timestamptz,
  phase2_deadline timestamptz,
  phase2_enabled boolean default false,
  phase2_enabled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(scholarship_id)
);

-- Review edit tracking
ALTER TABLE reviews ADD COLUMN last_edited_at timestamptz;
ALTER TABLE reviews ADD COLUMN edit_count integer default 0;

-- Reviewer progress tracking
CREATE TABLE reviewer_progress (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.reviewers(id) on delete cascade,
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  phase1_total integer not null default 0,
  phase1_completed integer not null default 0,
  phase1_skipped integer not null default 0,
  phase2_total integer not null default 0,
  phase2_completed integer not null default 0,
  last_activity_at timestamptz default now(),
  unique(reviewer_id, scholarship_id)
);

-- Phase 2 eligibility calculation cache
CREATE TABLE phase2_calculations (
  id uuid primary key default gen_random_uuid(),
  scholarship_id uuid not null references public.scholarships(id) on delete cascade,
  calculation_date timestamptz default now(),
  total_applications integer,
  eligible_count integer,
  cutoff_score numeric,
  calculated_by uuid references public.reviewers(id),
  notes text
);

-- Indexes for performance
CREATE INDEX idx_phase1_decisions_reviewer_application ON phase1_decisions(reviewer_id, application_id);
CREATE INDEX idx_application_scores_phase2_eligible ON application_scores(phase2_eligible, weighted_score DESC);
CREATE INDEX idx_reviewer_progress_scholarship ON reviewer_progress(scholarship_id, reviewer_id);
CREATE INDEX idx_reviews_phase ON reviews(review_phase, reviewer_id, status);
```

## Cloudflare Worker API Extensions

### Authentication & Security Middleware

```javascript
// Development bypass for localhost
function isDevelopmentRequest(request) {
  const clientIP = request.headers.get('CF-Connecting-IP');
  return clientIP === '127.0.0.1' || clientIP === '::1';
}

// Enhanced authentication with development bypass
function authenticateFromHeaders(request, env) {
  // Development bypass
  if (isDevelopmentRequest(request)) {
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
```

### New API Endpoints

#### 1. POST /api/reviewer/auth
Authenticate reviewer and return profile
```javascript
// Returns: reviewer info, role, available scholarships
```

#### 2. GET /api/reviewer/progress/:scholarshipId
Get reviewer's progress for specific scholarship
```javascript
// Returns: phase1_total/completed/skipped, phase2_total/completed
```

#### 3. GET /api/reviewer/phase1/applications/:scholarshipId
Get Phase 1 applications with skip tracking
```javascript
// Returns: applications without reviewer's decision, with deadline info
```

#### 4. POST /api/reviewer/phase1/:applicationId
Submit/edit Phase 1 decision (yes/no/maybe/skipped)
```javascript
// Body: { decision, comments }
// Updates phase1_decisions and application_scores
```

#### 5. GET /api/reviewer/phase2/applications/:scholarshipId
Get Phase 2 eligible applications
```javascript
// Returns: Only phase2_eligible applications, sorted by rank
// Includes reviewer's own Phase 1 decision
```

#### 6. GET /api/reviewer/applications/:applicationId/details
Get full application details (no files)
```javascript
// Returns: application data, essays, leadership, reviewer's previous decisions
```

#### 7. POST /api/reviewer/phase2/:applicationId
Submit/edit Phase 2 review with category ratings
```javascript
// Body: { categoryRatings: [{categoryId, score, comments}], overallRecommendation, generalComments }
```

#### 8. GET /api/reviewer/editable-reviews/:scholarshipId
Get all reviews current reviewer can edit
```javascript
// Returns: Phase 1 decisions until deadline, Phase 2 reviews until deadline
```

#### 9. GET /api/admin/deadlines/:scholarshipId
Get and update review deadlines (admin only)
```javascript
// GET: Returns current deadlines
// POST: { phase1_deadline, phase2_deadline }
```

#### 10. POST /api/admin/enable-phase2/:scholarshipId
Trigger Phase 2 calculation and enable Phase 2 reviews (admin only)
```javascript
// Body: { topN: number, notes: string }
// Calculates top N + ties, creates review entries, sets phase2_enabled=true
```

#### 11. GET /api/admin/progress/:scholarshipId
Get all reviewer progress overview (admin only)
```javascript
// Returns: Progress table, completion rates, decision distributions
```

### CORS Configuration

```javascript
const reviewerCorsHeaders = {
  'Access-Control-Allow-Origin': 'https://reviewer.wsufiji.org',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, CF-Access-Authenticated-User-Email, CF-Access-Authenticated-User-Name, CF-Access-Domain',
  'Access-Control-Allow-Credentials': 'true'
};

const adminCorsHeaders = {
  ...reviewerCorsHeaders,
  'Access-Control-Allow-Origin': 'https://reviewer.wsufiji.org' // Same domain, different role-based access
};
```

## React Portal Architecture

### Project Structure
```
reviewer-portal/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   └── DeadlineTimer.jsx
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── AuthProvider.jsx
│   │   ├── phase1/
│   │   │   ├── Phase1Dashboard.jsx
│   │   │   ├── ApplicationCard.jsx
│   │   │   ├── DecisionButtons.jsx
│   │   │   └── SkipModal.jsx
│   │   ├── phase2/
│   │   │   ├── Phase2Dashboard.jsx
│   │   │   ├── ApplicationReview.jsx
│   │   │   ├── CategoryRating.jsx
│   │   │   └── OverallRecommendation.jsx
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── ProgressTable.jsx
│   │   │   ├── DeadlineManager.jsx
│   │   │   └── Phase2Control.jsx
│   │   └── shared/
│   │       ├── ReviewHistory.jsx
│   │       ├── ApplicationPreview.jsx
│   │       └── ErrorBoundary.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useProgress.js
│   │   ├── useReviews.js
│   │   ├── useDeadlines.js
│   │   └── useLocalStorage.js
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.js
│   │   └── storage.js
│   ├── utils/
│   │   ├── dateUtils.js
│   │   ├── validation.js
│   │   └── constants.js
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   ├── ReviewContext.jsx
│   │   └── DeadlineContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── .env.example
```

### Core Components Specifications

#### Phase1Dashboard.jsx
- **Features**: Progress bar, deadline countdown, application queue
- **Card Display**: Basic applicant info + essay preview
- **Swipe Interface**: Left/right navigation with decision buttons
- **Skip Functionality**: Skip button with modal for return reminder
- **Auto-save**: Draft decisions saved to localStorage

#### ApplicationCard.jsx
- **Display**: Name, school, GPA, essay excerpt, leadership preview
- **Actions**: Yes/No/Maybe/Skip buttons with keyboard shortcuts
- **Status Indicators**: New, skipped, previously reviewed
- **Decision Comments**: Optional quick comment field

#### Phase2Dashboard.jsx
- **Eligibility Filter**: Only shows Phase 2 eligible applications
- **Ranking Display**: Application's Phase 2 rank and score
- **Reviewer's Phase 1 Decision**: Shows reviewer's previous decision
- **Progress Tracking**: Detailed Phase 2 completion status

#### ApplicationReview.jsx
- **Full Details**: Complete application information (no file access)
- **Category Ratings**: Dynamic form based on scholarship's review_categories
- **Auto-save**: Continuous saving of category ratings
- **Edit History**: Track changes with timestamps

#### AdminDashboard.jsx
- **Progress Overview**: Table of all reviewers with Phase 1/2 completion
- **Deadline Management**: Set/edit Phase 1 and Phase 2 deadlines
- **Phase 2 Control**: Enable Phase 2 with top-N calculation
- **Decision Analytics**: Distribution of yes/no/maybe decisions

### State Management Strategy

#### Authentication Context
```javascript
const AuthContext = createContext({
  user: null,
  reviewer: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  logout: () => {}
});
```

#### Review Context
```javascript
const ReviewContext = createContext({
  currentApplication: null,
  currentPhase: null,
  reviews: [],
  progress: {},
  setPhase: () => {},
  saveDecision: () => {},
  skipApplication: () => {}
});
```

#### Deadline Context
```javascript
const DeadlineContext = createContext({
  deadlines: {},
  timeRemaining: {},
  warnings: {},
  checkDeadlines: () => {}
});
```

## Review Workflow Implementation

### Phase 1: Initial Screening

#### Weighted Scoring System
- **Yes**: +1 point
- **Maybe**: 0 points  
- **No**: -1 point
- **Skipped**: 0 points (doesn't count toward completion)

#### Application Processing
1. **Load Queue**: Get all applications without reviewer's decision
2. **Display Card**: Show preview information
3. **Capture Decision**: Yes/No/Maybe/Skip with optional comments
4. **Update Scores**: Real-time recalculation of application weighted scores
5. **Progress Tracking**: Update reviewer_progress table

#### Skip Functionality
- Applications marked as "skipped" are moved to end of queue
- Skipped applications remain in reviewer's queue
- Reviewer can return to skipped applications at any time
- Skip count tracked separately from completion count

### Phase 2: Detailed Review

#### Eligibility Calculation (Admin Triggered)
1. **Calculate Weighted Scores**: Sum all Phase 1 decisions per application
2. **Rank Applications**: Sort by weighted_score DESC, then by yes_count DESC
3. **Determine Top N**: Select top N applications for available awards
4. **Include Ties**: Add all applications tied with the Nth score
5. **Create Reviews**: Auto-create review entries for all eligible reviewers
6. **Mark Eligible**: Set phase2_eligible=true and assign ranks

#### Review Process
1. **Load Eligible Applications**: Only Phase 2 eligible applications
2. **Show Reviewer's Phase 1 Decision**: For reviewer's reference only
3. **Category Rating**: Rate each category with scores 1-5
4. **Overall Recommendation**: Final accept/reject decision
5. **Edit Until Deadline**: Allow edits until Phase 2 deadline

### Deadline Management

#### Phase Deadlines
- **Phase 1 Deadline**: When Phase 1 decisions can no longer be edited
- **Phase 2 Deadline**: When Phase 2 reviews can no longer be edited
- **Grace Period**: Optional admin override for extensions

#### Deadline Enforcement
- **UI Warnings**: 24-hour and 1-hour deadline warnings
- **Read-only Mode**: Applications become read-only after deadline
- **Auto-submission**: Incomplete reviews remain incomplete (no auto-submission)
- **Admin Override**: Admin can extend deadlines if needed

## Integration Points

### With Existing System

#### Database Integration
- **Shared Database**: Use same Supabase instance
- **Existing Tables**: Leverage applications, applicants, scholarships, reviewers
- **Extended Tables**: Add new tables while maintaining compatibility
- **Data Migration**: Existing applications automatically included in review process

#### Worker API Integration
- **Shared Worker**: Extend existing Cloudflare Worker
- **Path-based Routing**: `/api/reviewer/*` and `/api/admin/*` routes
- **Security Separation**: Different authentication requirements for public vs reviewer endpoints
- **CORS Configuration**: Separate origins for main site vs reviewer portal

#### File Storage Separation
- **No File Access**: Reviewer portal cannot access uploaded files
- **Security Boundary**: Complete separation from applicant file storage
- **Data Privacy**: Applicant files remain private to administrators

### Development Integration

#### Shared Repository
- **Monorepo Structure**: Single repository with multiple applications
- **Shared Dependencies**: Common utilities and configurations
- **Independent Builds**: Separate build processes for main site and reviewer portal
- **Shared Database**: Single Supabase instance with proper RLS policies

#### Development Environment
```bash
# Root package.json scripts
{
  "scripts": {
    "dev:main": "cd frontend && npm run dev",
    "dev:reviewer": "cd reviewer-portal && npm run dev",
    "dev:worker": "cd worker && wrangler dev",
    "build:main": "cd frontend && npm run build",
    "build:reviewer": "cd reviewer-portal && npm run build",
    "deploy:main": "npm run build:main && wrangler pages deploy frontend/dist",
    "deploy:reviewer": "npm run build:reviewer && wrangler pages deploy reviewer-portal/dist",
    "deploy:worker": "cd worker && wrangler deploy"
  }
}
```

## Security Implementation Details

### Authentication Flow
```javascript
// Development bypass flow
if (isDevelopmentRequest(request)) {
  // Use development credentials
  const devEmail = 'dev@localhost';
  const reviewer = await verifyReviewerRole(supabase, devEmail, 'admin');
  // Proceed with elevated privileges for testing
}

// Production flow with Zero Trust
const auth = authenticateFromHeaders(request, env);
if (auth.error) {
  return new Response(auth.error, { 
    status: 401,
    headers: corsHeaders 
  });
}
```

### Role-Based Access Control
```javascript
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
```

### CORS and Origin Protection
```javascript
// Enhanced origin validation
const allowedOrigins = {
  'reviewer': 'https://reviewer.wsufiji.org',
  'admin': 'https://reviewer.wsufiji.org' // Same domain, role-based access
};

function getCorsHeaders(request, endpointType = 'reviewer') {
  const origin = request.headers.get('Origin');
  const allowedOrigin = allowedOrigins[endpointType];
  
  return {
    'Access-Control-Allow-Origin': origin === allowedOrigin ? origin : 'null',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, CF-Access-Authenticated-User-Email, CF-Access-Authenticated-User-Name',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };
}
```

## Testing Strategy

### Unit Testing
- **Component Testing**: React component testing with Jest and React Testing Library
- **Hook Testing**: Custom hook testing for auth, progress, and reviews
- **API Testing**: Worker endpoint testing with mock Supabase client
- **Utility Testing**: Date utilities and validation functions

### Integration Testing
- **Authentication Flow**: Test Zero Trust header validation and development bypass
- **Database Operations**: Test all database operations with real Supabase
- **End-to-End Workflow**: Test complete Phase 1 and Phase 2 review processes
- **Admin Functions**: Test Phase 2 enablement and deadline management

### Security Testing
- **Authentication Bypass**: Test development bypass and production authentication
- **Authorization Testing**: Verify role-based access control
- **Input Validation**: Test SQL injection and XSS protection
- **CORS Testing**: Verify origin validation and header security

### Performance Testing
- **Load Testing**: Multiple reviewers accessing system simultaneously
- **Database Performance**: Query optimization for large application sets
- **UI Performance**: Smooth swipe interface and rapid decision capture
- **Memory Usage**: Efficient state management for large datasets

## Deployment Strategy

### Production Deployment

#### Cloudflare Pages Configuration
- **Main Site**: `wsufiji.org` (existing)
- **Reviewer Portal**: `reviewer.wsufiji.org` (new)
- **Worker**: Single worker serving both applications
- **Custom Domains**: SSL certificates and DNS configuration

#### Environment Variables
```bash
# Worker Environment Variables
SUPABASE_URL=your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
TURNSTILE_SECRET_KEY=existing-turnstile-key
TURNSTILE_UPLOAD_SECRET_KEY=existing-upload-key

# Reviewer Portal Environment Variables
VITE_API_URL=https://your-worker.your-subdomain.workers.dev
VITE_APP_NAME=WSU Fiji Reviewer Portal
VITE_VERSION=1.0.0
```

#### Zero Trust Configuration
- **Application**: Reviewer Portal application in Cloudflare Access
- **Policy**: Email domain restriction or specific email list
- **Session Duration**: 8-hour sessions with re-authentication
- **Header Configuration**: Required headers for authentication

### Development Deployment

#### Local Development Setup
```bash
# Terminal 1: Worker development
cd worker && wrangler dev

# Terminal 2: Main site development
cd frontend && npm run dev

# Terminal 3: Reviewer portal development
cd reviewer-portal && npm run dev
```

#### Development Environment Variables
```bash
# Reviewer Portal Development (.env.local)
VITE_API_URL=http://localhost:8787
VITE_DEV_MODE=true
VITE_MOCK_AUTH=true
```

## Migration Strategy

### Phase 1: Database Setup
1. **Create Migration**: Apply new database schema
2. **Initial Data**: Populate reviewers table and set up review categories
3. **Deadlines**: Set initial Phase 1 and Phase 2 deadlines
4. **Testing Data**: Create test applications and reviewer accounts

### Phase 2: Backend Development
1. **Worker Extensions**: Add reviewer-specific API endpoints
2. **Authentication**: Implement Zero Trust header validation
3. **Testing**: Unit and integration testing for all endpoints
4. **Security Review**: Security testing and vulnerability assessment

### Phase 3: Frontend Development
1. **Scaffold App**: Create React app with routing and structure
2. **Authentication Flow**: Implement Zero Trust authentication
3. **Phase 1 Interface**: Build swipe interface and decision capture
4. **Phase 2 Interface**: Build detailed review interface
5. **Admin Interface**: Build progress monitoring and deadline management

### Phase 4: Integration Testing
1. **End-to-End Testing**: Complete workflow testing
2. **Performance Testing**: Load and stress testing
3. **Security Testing**: Penetration testing and security review
4. **User Acceptance Testing**: Reviewer testing and feedback

### Phase 5: Production Deployment
1. **Staging Deployment**: Deploy to staging environment
2. **Final Testing**: Comprehensive testing in staging
3. **Production Deployment**: Deploy to production
4. **Monitoring Setup**: Implement monitoring and alerting
5. **Training**: Reviewer training and documentation

## Monitoring and Maintenance

### Application Monitoring
- **Error Tracking**: Sentry or similar for error monitoring
- **Performance Monitoring**: Web Vitals and API response times
- **User Analytics**: Reviewer behavior and completion rates
- **Database Monitoring**: Query performance and connection pooling

### Security Monitoring
- **Access Logs**: Track all reviewer access and actions
- **Failed Authentication**: Monitor failed login attempts
- **Anomaly Detection**: Unusual behavior patterns
- **Audit Trail**: Complete audit log of all reviewer actions

### Backup and Recovery
- **Database Backups**: Daily automated backups with point-in-time recovery
- **Code Backup**: Git repository with proper branching strategy
- **Configuration Backup**: Environment variables and settings backup
- **Disaster Recovery**: Documented recovery procedures

## Future Enhancements

### Short-term Improvements
- **Mobile App**: React Native mobile app for on-the-go reviewing
- **Notifications**: Email notifications for new assignments and deadline reminders
- **Advanced Analytics**: More detailed review analytics and reporting
- **Review Templates**: Standardized comment templates for common feedback

### Long-term Enhancements
- **Machine Learning**: AI assistance for initial screening recommendations
- **Video Interviews**: Integration for video interview reviews
- **Collaborative Reviews**: Multi-reviewer collaboration on complex applications
- **Advanced Analytics**: Predictive analytics for scholarship success

## Conclusion

This comprehensive reviewer portal implementation plan provides a robust, secure, and user-friendly system for managing scholarship application reviews. The two-phase approach with weighted scoring, flexible deadline management, and comprehensive progress tracking will streamline the review process while maintaining data security and reviewer privacy.

The phased implementation approach ensures a smooth rollout with proper testing at each stage, while the security architecture protects against unauthorized access and maintains the integrity of the review process.

The system is designed to scale with growing application volumes while maintaining performance and user experience, with clear paths for future enhancements based on user feedback and evolving requirements.