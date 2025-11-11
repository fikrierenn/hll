# Implementation Plan

## Phase 0: UI Prototype with Dummy Data

- [ ] 0. Set up Next.js project with dummy data structure
  - [x] 0.1 Initialize Next.js project and install dependencies



    - Create Next.js 14 project with TypeScript and App Router
    - Install TailwindCSS and configure theme
    - Install shadcn/ui CLI and initialize components
    - Install additional packages (lucide-react, recharts, react-hot-toast, date-fns)
    - Set up project folder structure
    - _Requirements: 10.1_

  - [x] 0.2 Create mock data files



    - Create lib/mock-data/users.json with sample users (representative, leader, super_leader)
    - Create lib/mock-data/leads.json with 20+ sample leads (different statuses, cities)
    - Create lib/mock-data/lead-events.json with event history for leads
    - Create lib/mock-data/performance.json with performance metrics
    - Create lib/mock-data/index.ts with helper functions to fetch mock data
    - _Requirements: 3.2, 6.2, 14.1_



  - [x] 0.3 Create TypeScript types and utilities

    - Define User, Lead, LeadEvent, PerformanceSummary types in types/index.ts
    - Create LeadStatus and EventType enums
    - Create utility functions (maskPhoneNumber, formatDate, calculateResponseTime)
    - Create mock API functions that simulate async data fetching with delays
    - _Requirements: 11.4_

- [ ] 1. Build authentication pages with mock login
  - [x] 1.1 Create login page


    - Design login form with email input
    - Add role selector for demo (Representative/Leader/Super Leader)
    - Implement mock authentication that stores selected role in localStorage
    - Add form validation and loading states
    - _Requirements: 11.5_



  - [ ] 1.2 Create layout components
    - Build Navbar component with user info and logout
    - Create Sidebar component with role-based navigation
    - Build NotificationBell component with mock notifications
    - Implement responsive mobile navigation (bottom tab bar)
    - _Requirements: 9.1, 9.2_

- [ ] 2. Build Representative Panel with dummy data
  - [ ] 2.1 Create lead list page
    - Build LeadCard component with lead info display
    - Implement lead list page that fetches from mock data
    - Add status badges with color coding
    - Sort leads by assigned_at (newest first)
    - Add loading skeleton and empty state
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 2.2 Create lead detail page
    - Build lead detail view with full information
    - Display lead event timeline from mock data
    - Show status badge prominently
    - Format dates and times in Turkish locale
    - Add back navigation button
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_

  - [ ] 2.3 Implement lead action buttons
    - Create "Ara" button that shows tel: link (mock call action)
    - Create "WhatsApp'tan Yaz" button with mock API call
    - Add status dropdown with update functionality (updates mock data in state)
    - Show toast notifications for all actions
    - Add loading states during mock async operations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 5.3_

  - [ ] 2.4 Build representative dashboard
    - Create KPICard component with icon, value, and trend
    - Display daily KPIs from mock performance data
    - Show recent leads list
    - Add quick action buttons
    - _Requirements: 6.2, 6.4_



- [ ] 3. Build Leader Panel with dummy data
  - [ ] 3.1 Create team management page
    - Build team member list with cards
    - Display representative info and active status


    - Add "Add Representative" button (opens modal)
    - Implement active/inactive toggle (updates mock data)
    - _Requirements: 7.1, 7.3_

  - [ ] 3.2 Create add representative modal
    - Build form with fields (name, email, phone, region)
    - Add form validation
    - Implement mock save that adds to users mock data
    - Show success toast after adding
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ] 3.3 Build leader dashboard
    - Create KPI cards for team totals
    - Display team performance table with mock data
    - Show individual representative metrics
    - Calculate and display sales ratios
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ] 3.4 Implement date range filtering
    - Add date range picker with presets (günlük, haftalık, aylık)
    - Filter mock performance data based on selection
    - Update all metrics and charts
    - Add loading state during filter change
    - _Requirements: 6.3_

  - [ ] 3.5 Create performance charts
    - Build LineChart component for daily lead trend using Recharts
    - Create DonutChart for lead status distribution
    - Build BarChart for representative comparison
    - Add responsive chart sizing
    - Ensure charts render smoothly
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ] 3.6 Build team leads overview page
    - Display all team leads from mock data
    - Show assigned representative name
    - Add filter by status, city, representative
    - Implement search functionality
    - _Requirements: 6.1_

- [ ] 4. Build Super Leader Panel with dummy data
  - [ ] 4.1 Create super leader dashboard
    - Display organization-wide KPI cards
    - Show total leads, conversion rate, avg response time
    - Display active teams and representatives count
    - Use mock data for all metrics
    - _Requirements: 8.1, 8.5_

  - [ ] 4.2 Build comparative analytics view
    - Create team comparison bar chart
    - Display top performers section (best team, fastest rep, best region)
    - Show regional performance breakdown
    - Add highlight badges for top performers
    - _Requirements: 8.2, 8.3_

  - [ ] 4.3 Implement advanced filtering
    - Add date range filter
    - Create region/city filter dropdown
    - Add team selector for drill-down
    - Update all charts based on filters
    - _Requirements: 8.4_

- [ ] 5. Add PWA configuration (basic)
  - [ ] 5.1 Create manifest.json and icons
    - Generate manifest.json with app metadata
    - Create placeholder app icons (192x192, 512x512)
    - Configure theme colors (green theme)
    - Add to public folder
    - _Requirements: 10.1, 10.3_

  - [ ] 5.2 Add basic service worker setup
    - Install next-pwa package
    - Configure next.config.js for PWA
    - Set up basic cache strategy
    - Test PWA installation on mobile
    - _Requirements: 10.2_

- [ ] 6. Polish UI/UX and responsive design
  - [ ] 6.1 Ensure mobile responsiveness
    - Test all pages on mobile (320px+), tablet (768px+), desktop (1024px+)
    - Adjust layouts for different screen sizes
    - Optimize touch targets for mobile
    - Test on real devices (iOS and Android)

  - [ ] 6.2 Add loading states and animations
    - Create skeleton loaders for all data components
    - Add smooth transitions between pages
    - Implement loading spinners for actions
    - Add micro-interactions (hover effects, button press)

  - [ ] 6.3 Implement toast notification system
    - Configure react-hot-toast with custom styling
    - Add Turkish language messages
    - Create toast for all user actions
    - Test toast positioning on mobile

  - [ ] 6.4 Add error states and empty states
    - Design empty state for no leads
    - Create error state for failed actions
    - Add retry buttons where appropriate
    - Test all edge cases

## Phase 1: Project Setup & Database Foundation

- [ ] 1. Initialize Next.js project with TypeScript and TailwindCSS
  - Create Next.js 14 project with App Router
  - Configure TypeScript with strict mode
  - Set up TailwindCSS and configure theme colors
  - Install and configure shadcn/ui components
  - Set up project folder structure (app, components, lib, types)
  - _Requirements: 10.1_

- [ ] 2. Set up Supabase project and database schema
  - [ ] 2.1 Create Supabase project and configure environment variables
    - Initialize Supabase project
    - Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local
    - Install @supabase/supabase-js and @supabase/ssr packages
    - _Requirements: 11.5_

  - [ ] 2.2 Create database tables with SQL migrations
    - Write SQL migration for users table with role enum and indexes
    - Write SQL migration for leads table with status enum and indexes
    - Write SQL migration for lead_events table with event_type enum and indexes
    - Write SQL migration for performance_summary table with unique constraint
    - _Requirements: 1.1, 2.1, 12.1, 13.2_

  - [ ] 2.3 Implement Row Level Security (RLS) policies
    - Create RLS policies for users table (representative, leader, super_leader views)
    - Create RLS policies for leads table (role-based access control)
    - Create RLS policies for lead_events table (representative access)
    - Create RLS policies for performance_summary table
    - Enable RLS on all tables
    - _Requirements: 11.1, 11.2, 11.3, 3.5, 6.5_

  - [ ] 2.4 Create database functions (RPC)
    - Write get_team_performance function with date range parameters
    - Write get_dashboard_kpis function with role-based filtering
    - Test functions with sample data
    - _Requirements: 6.2, 6.4, 8.1_

## Phase 2: Authentication & User Management

- [ ] 3. Implement Supabase authentication
  - [ ] 3.1 Create authentication utilities and middleware
    - Create Supabase client utilities (client-side and server-side)
    - Implement Next.js middleware for protected routes
    - Create auth helper functions (getUser, getSession)
    - _Requirements: 11.5_

  - [ ] 3.2 Build login and OTP verification pages
    - Create login page with email input form
    - Implement OTP verification page
    - Add form validation with Zod schema
    - Integrate Supabase Auth signInWithOtp
    - Add error handling and toast notifications
    - _Requirements: 11.5_

  - [ ] 3.3 Implement role-based route protection
    - Create route guards for representative, leader, super_leader roles
    - Implement automatic redirect based on user role after login
    - Add loading states during authentication checks
    - _Requirements: 11.2, 11.3_

## Phase 3: Core Data Layer & API Integration

- [ ] 4. Create TypeScript types and interfaces
  - Define User, Lead, LeadEvent, PerformanceSummary types
  - Create LeadStatus and EventType enums
  - Define API response and error types
  - Create component prop interfaces
  - _Requirements: 1.1, 2.1, 5.2, 12.2_

- [ ] 5. Build API client and data fetching hooks
  - [ ] 5.1 Create Supabase API client wrapper
    - Implement error handling wrapper for Supabase queries
    - Create standardized API error types
    - Add retry logic for failed requests
    - _Requirements: 1.5_

  - [ ] 5.2 Implement React hooks for data fetching
    - Create useLeads hook for fetching lead list with RLS filtering
    - Create useLeadDetail hook for single lead with events
    - Create useTeamPerformance hook for leader dashboard
    - Create useDashboardKPIs hook with role-based data
    - Add loading and error states to all hooks
    - _Requirements: 3.1, 3.4, 6.1, 8.1_

## Phase 4: Representative Panel - Lead Management

- [ ] 6. Build representative lead list page
  - [ ] 6.1 Create LeadCard component
    - Design card layout with lead info (name, city, status, time)
    - Add masked phone number display (05xx *** 67 89)
    - Implement status badge with color coding
    - Add action buttons (Ara, WhatsApp)
    - _Requirements: 3.2, 11.4_

  - [ ] 6.2 Implement lead list page with filtering
    - Fetch leads using useLeads hook with RLS
    - Sort leads by assigned_at (newest first)
    - Add loading skeleton components
    - Implement empty state when no leads
    - Add pull-to-refresh for mobile
    - _Requirements: 3.1, 3.3, 3.4_

- [ ] 7. Build lead detail page with actions
  - [ ] 7.1 Create lead detail view
    - Display full lead information (name, phone, city, form_time)
    - Show lead status with prominent badge
    - Display lead event timeline (created, assigned, called, whatsapp, status_changed)
    - Format timestamps in readable format
    - _Requirements: 14.1, 14.2, 14.3, 14.5_

  - [ ] 7.2 Implement call and WhatsApp actions
    - Create "Ara" button that opens tel: link
    - Record "called" event to lead_events table on button click
    - Create "WhatsApp'tan Yaz" button that calls Edge Function
    - Record "whatsapp" event after successful message send
    - Add error handling with toast notifications
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 7.3 Implement status update functionality
    - Create status dropdown with options (new, contacted, converted, lost)
    - Update lead status in database
    - Record "status_changed" event to lead_events
    - Send notification to Team Leader when status is "converted"
    - Add optimistic UI updates
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 8. Create representative dashboard
  - Create KPICard component for metrics display
  - Fetch and display daily KPIs (total leads, avg response time, sales ratio)
  - Add trend indicators (up/down arrows with percentage)
  - Implement quick access to recent leads
  - _Requirements: 6.2, 6.4_

## Phase 5: Leader Panel - Team Management

- [ ] 9. Build team management interface
  - [ ] 9.1 Create team member list view
    - Fetch team members using RLS-filtered query
    - Display representative cards with basic info and status
    - Show active/inactive status toggle
    - Add "Add Representative" button
    - _Requirements: 7.3_

  - [ ] 9.2 Implement add representative form
    - Create form with fields (name, email, phone, region)
    - Validate input with Zod schema
    - Insert new user with role="representative" and leader_id
    - Send welcome notification to new representative
    - Add success/error toast notifications
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [ ] 9.3 Add representative activation/deactivation
    - Implement toggle switch for is_active field
    - Update user record in database
    - Show confirmation dialog before deactivation
    - _Requirements: 7.3_

- [ ] 10. Build leader dashboard with team performance
  - [ ] 10.1 Create performance metrics display
    - Fetch team performance using get_team_performance RPC
    - Display KPI cards for team totals
    - Show individual representative performance table
    - Calculate and display sales ratio percentages
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ] 10.2 Implement date range filtering
    - Add date range picker (günlük, haftalık, aylık presets)
    - Update performance data based on selected range
    - Add loading states during data refresh
    - _Requirements: 6.3_

  - [ ] 10.3 Create performance charts
    - Implement LineChart for daily lead count trend
    - Create DonutChart for lead status distribution
    - Build BarChart for representative comparison
    - Ensure charts render within 3 seconds
    - _Requirements: 15.2, 15.3, 15.4, 15.5_

- [ ] 11. Build leader lead overview page
  - Display all team leads with filtering options
  - Show lead details with assigned representative name
  - Add search and filter by status, city, representative
  - Implement pagination for large datasets
  - _Requirements: 6.1_

## Phase 6: Super Leader Panel - Organization Analytics

- [ ] 12. Create super leader dashboard
  - [ ] 12.1 Build organization-wide KPI display
    - Fetch all leads and performance data (no RLS filtering for super_leader)
    - Display top-level KPI cards (total leads, overall conversion, avg response time)
    - Show active teams and representatives count
    - _Requirements: 8.1, 8.5_

  - [ ] 12.2 Implement comparative analytics
    - Create team comparison bar chart (sales ratio by team)
    - Display top performers (best team, fastest representative, best region)
    - Show regional performance breakdown
    - Add highlight badges for top performers
    - _Requirements: 8.2, 8.3_

  - [ ] 12.3 Add advanced filtering options
    - Implement date range filter
    - Add region/city filter dropdown
    - Create team selector for drill-down analysis
    - Update all charts based on filters
    - _Requirements: 8.4_

## Phase 7: Backend - Edge Functions & Webhooks

- [ ] 13. Implement Meta Lead Ads webhook handler
  - [ ] 13.1 Create handle-meta-webhook Edge Function
    - Set up Deno function with webhook signature verification
    - Parse Meta webhook payload (leadgen_id, form_id, field_data)
    - Extract lead data (name, phone, city, form_time)
    - Insert lead into leads table
    - Create "created" event in lead_events
    - Return 200 response within 3 seconds
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 13.2 Add error handling and logging
    - Implement try-catch with detailed error logging
    - Return appropriate HTTP status codes (400, 401, 500)
    - Log failed webhook attempts for debugging
    - _Requirements: 1.5_

  - [ ] 13.3 Trigger lead assignment after webhook
    - Call assign-lead function after successful lead creation
    - Handle async execution without blocking webhook response
    - _Requirements: 2.1_

- [ ] 14. Create lead assignment engine
  - [ ] 14.1 Build assign-lead Edge Function
    - Fetch active representatives (is_active = true)
    - Filter by region if lead has city information
    - Count active leads for each representative
    - Select representative with minimum active leads
    - Update lead assigned_to and assigned_at fields
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 14.2 Record assignment event and send notification
    - Create "assigned" event in lead_events
    - Call send-notification function with lead details
    - Handle notification failures gracefully
    - _Requirements: 2.4, 2.5_

- [ ] 15. Implement notification service
  - [ ] 15.1 Create send-notification Edge Function
    - Fetch user FCM token from users table
    - Build notification payload with title and body
    - Send push notification via Firebase Admin SDK
    - Implement retry logic (max 3 attempts with exponential backoff)
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ] 15.2 Handle notification click actions
    - Include lead_id in notification data payload
    - Configure deep link to lead detail page
    - _Requirements: 9.3_

  - [ ] 15.3 Add fallback for users without notification permission
    - Check if FCM token exists
    - Create in-app notification banner as fallback
    - _Requirements: 9.5_

- [ ] 16. Build WhatsApp messaging integration
  - [ ] 16.1 Create send-whatsapp-message Edge Function
    - Fetch lead and representative details
    - Build WhatsApp template message with variables
    - Send POST request to WhatsApp Cloud API
    - Handle API errors and rate limits
    - _Requirements: 4.3_

  - [ ] 16.2 Record WhatsApp event
    - Create "whatsapp" event in lead_events after successful send
    - Store message status in event metadata
    - Return success/error response to frontend
    - _Requirements: 4.4, 4.5_

- [ ] 17. Create performance aggregation cron job
  - [ ] 17.1 Build aggregate-performance Edge Function
    - Set up cron trigger for daily execution at 00:00
    - Fetch previous day's lead_events data
    - Calculate metrics per representative (total, contacted, converted, avg_response_time, sales_ratio)
    - Insert/update performance_summary records
    - _Requirements: 13.1, 13.2, 13.3_

  - [ ] 17.2 Add error handling and admin notification
    - Implement transaction rollback on failure
    - Send error notification to system admin
    - Log aggregation results for monitoring
    - _Requirements: 13.5_

## Phase 8: PWA Features & Offline Support

- [ ] 18. Configure Progressive Web App
  - [ ] 18.1 Create PWA manifest and icons
    - Generate manifest.json with app metadata
    - Create app icons (192x192, 512x512)
    - Configure theme colors and display mode
    - Add apple-touch-icon for iOS
    - _Requirements: 10.1, 10.3_

  - [ ] 18.2 Implement service worker
    - Set up next-pwa plugin
    - Configure cache strategies (cache-first for static, network-first for API)
    - Implement offline fallback page
    - Add background sync for failed API requests
    - _Requirements: 10.2, 10.4_

  - [ ] 18.3 Add offline detection and user feedback
    - Create useOnlineStatus hook
    - Display offline banner when connection lost
    - Show cached data with "offline" indicator
    - Queue actions for sync when back online
    - _Requirements: 10.5_

## Phase 9: UI/UX Polish & Responsive Design

- [ ] 19. Implement responsive layouts
  - Ensure all pages work on mobile (320px+), tablet (768px+), desktop (1024px+)
  - Create mobile-optimized navigation (bottom tab bar for representative)
  - Implement collapsible sidebar for leader/super_leader on mobile
  - Test touch interactions and gestures

- [ ] 20. Add loading states and skeletons
  - Create skeleton components for lead cards, charts, tables
  - Implement loading spinners for actions (call, WhatsApp, status update)
  - Add progress indicators for data fetching
  - Ensure smooth transitions between states

- [ ] 21. Implement error boundaries and error pages
  - Create global ErrorBoundary component
  - Design 404 and 500 error pages
  - Add error recovery actions (retry, go back)
  - Log errors to monitoring service

- [ ] 22. Add toast notifications system
  - Install and configure react-hot-toast
  - Create toast variants (success, error, warning, info)
  - Implement toast for all user actions (lead update, call, WhatsApp, etc.)
  - Add Turkish language messages

## Phase 10: Security & Data Protection

- [ ] 23. Implement phone number masking
  - Create maskPhoneNumber utility function (05xx *** 67 89)
  - Apply masking to all phone displays in UI
  - Store unmasked numbers in database
  - Only show full number on lead detail page for assigned representative
  - _Requirements: 11.4_

- [ ] 24. Add input validation and sanitization
  - Create Zod schemas for all forms (login, add representative, lead update)
  - Validate all user inputs on client and server
  - Sanitize inputs to prevent XSS attacks
  - Add rate limiting to API endpoints

- [ ] 25. Configure CORS and security headers
  - Set up CORS policy in Supabase Edge Functions
  - Add security headers (CSP, X-Frame-Options, etc.)
  - Configure allowed origins for production
  - Enable HTTPS-only in production

## Phase 11: Testing & Quality Assurance

- [ ]* 26. Write unit tests for utilities and hooks
  - Test maskPhoneNumber function
  - Test date formatting utilities
  - Test custom React hooks (useLeads, useTeamPerformance)
  - Test API client error handling
  - Achieve 70%+ code coverage

- [ ]* 27. Write integration tests for API flows
  - Test lead creation and assignment flow
  - Test RLS policies (representative can only see own leads)
  - Test status update and event creation
  - Test team performance calculation

- [ ]* 28. Perform E2E testing with Playwright
  - Test representative flow (login, view leads, call, update status)
  - Test leader flow (login, view team, add representative, view reports)
  - Test super leader flow (login, view analytics, filter data)
  - Test PWA installation and offline mode

## Phase 12: Deployment & Monitoring

- [ ] 29. Set up CI/CD pipeline
  - Create GitHub Actions workflow for automated testing
  - Configure Vercel deployment for frontend
  - Set up Supabase CLI for database migrations
  - Configure environment variables for production

- [ ] 30. Deploy to production
  - Deploy Next.js app to Vercel
  - Run database migrations on production Supabase
  - Deploy Edge Functions to Supabase
  - Configure custom domain and SSL

- [ ] 31. Set up monitoring and logging
  - Integrate Sentry for error tracking
  - Configure Vercel Analytics for performance monitoring
  - Set up Supabase logs monitoring
  - Create alerts for critical errors

- [ ]* 32. Perform load testing
  - Test webhook endpoint with k6 (100 req/s target)
  - Test dashboard load times under concurrent users
  - Verify database query performance
  - Optimize slow queries with indexes

## Phase 13: Documentation & Handoff

- [ ]* 33. Write technical documentation
  - Document API endpoints and parameters
  - Create database schema documentation
  - Write deployment guide
  - Document environment variables and secrets

- [ ]* 34. Create user guides
  - Write representative user guide (Turkish)
  - Write leader user guide (Turkish)
  - Create video tutorials for key workflows
  - Document troubleshooting steps
