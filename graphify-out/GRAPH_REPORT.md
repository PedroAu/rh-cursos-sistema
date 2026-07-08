# Graph Report - src  (2026-07-08)

## Corpus Check
- 230 files · ~86,220 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1134 nodes · 2674 edges · 61 communities (57 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Checkout Modal & Pagamento
- Admin Shell & Toaster
- Calendar & Class Cards
- Course Cards & Quote Modal
- Testimonials & Feature Cards
- Link, Progress & Session Secret
- Form Base Components
- App Store (State Management)
- Database Types & Mappers
- FAQ & Section Titles
- Admin Form Validation
- Public API Client & Schemas
- Error Fallback Boundary
- Admin Dashboard Activity
- Admin/Student Store Contexts
- Table Component
- Form Field Builders
- Seat Progress & Typography
- Card Component
- Tabs & Admin Settings
- API Validation & Retry
- Admin Resource Page (CRUD)
- Search & Input Components
- In-Company Page Form
- Select Component & Specialist Page
- Rate Limiting
- Class/Course Card & Status Badge
- Course Card & Badge Variants
- Contact Page & Test Utils
- Course Store Context & Mocks
- Loading & Skeleton States
- App Store Tests
- Checkbox Component
- Design Tokens (Storybook)
- Query Logging Middleware
- Array/MultiSelect Form Fields
- Error Boundary (Class Component)
- Sanitization & Blog Post Page
- User Cell Avatar
- DB Row Mappers Tests
- Switch Component
- Textarea Component
- Dashboard Metrics Builder
- About Page Content
- Session Token Decoding
- Keyboard Navigation & Focus
- Blog Card
- Status Badge Stories
- Monitoring & Sentry Status
- Logger Utility
- Security Headers
- Lead Mapping & Insert
- Motion Provider
- Supabase Channel Mocks
- Empty State Stories
- Blog Post Mapping
- Usage Guidelines Stories
- Auth Session Route Tests
- Test Setup Mocks
- Design Token Types

## God Nodes (most connected - your core abstractions)
1. `cn()` - 119 edges
2. `useAppStore()` - 43 edges
3. `Button` - 41 edges
4. `Card()` - 26 edges
5. `AppStoreProvider()` - 24 edges
6. `Badge()` - 22 edges
7. `CardContent()` - 20 edges
8. `Input` - 19 edges
9. `Course` - 17 edges
10. `Link()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `renderStore()` --indirect_call--> `AppStoreProvider()`  [INFERRED]
  __tests__/lib/app-store.test.ts → lib/app-store.tsx
- `PaymentSelector()` --calls--> `cn()`  [EXTRACTED]
  components/checkout/checkout-modal.tsx → lib/utils.ts
- `FileUploadField()` --calls--> `cn()`  [EXTRACTED]
  views/admin/AdminResourcePage.tsx → lib/utils.ts
- `IconButton()` --calls--> `cn()`  [EXTRACTED]
  views/admin/AdminResourcePage.tsx → lib/utils.ts
- `MultiSelectLite()` --calls--> `cn()`  [EXTRACTED]
  views/admin/AdminResourcePage.tsx → lib/utils.ts

## Import Cycles
- None detected.

## Communities (61 total, 4 thin omitted)

### Community 0 - "Checkout Modal & Pagamento"
Cohesion: 0.05
Nodes (61): CheckoutModal(), CheckoutModalProps, checkoutSteps, formatCPF(), formatPhone(), initialForm, PaymentMethod, paymentMethods (+53 more)

### Community 1 - "Admin Shell & Toaster"
Cohesion: 0.06
Nodes (45): AppToaster(), Playground, Story, AdminBottomNavigation(), AdminSidebar(), getRoleLabel(), AdminTopbar(), resolvePlaceholder() (+37 more)

### Community 2 - "Calendar & Class Cards"
Cohesion: 0.06
Nodes (38): CalendarView(), Default, Empty, Loading, Story, LowSeats, OpenEnrollment, Story (+30 more)

### Community 3 - "Course Cards & Quote Modal"
Cohesion: 0.07
Nodes (40): CourseCard(), QuoteTrigger(), useQuoteModal(), Chip, ChipProps, chipVariants, useHotkey(), useSimulatedLoading() (+32 more)

### Community 4 - "Testimonials & Feature Cards"
Cohesion: 0.07
Nodes (34): Default, FourStars, Story, TestimonialCard(), FeatureListItem(), FeatureListItemProps, PaperCard(), SectionHeading() (+26 more)

### Community 5 - "Link, Progress & Session Secret"
Cohesion: 0.12
Nodes (28): Link, LinkProps, linkVariants, Progress(), Complete, Default, Empty, Story (+20 more)

### Community 6 - "Form Base Components"
Cohesion: 0.08
Nodes (33): Checkbox, CheckboxProps, Form, FormActions, FormControl, FormControlProps, formControlVariants, FormError (+25 more)

### Community 7 - "App Store (State Management)"
Cohesion: 0.10
Nodes (31): AdminMutation, AppStoreProvider(), AppStoreValue, clearLegacyStoredState(), countConfirmedEnrollments(), createRealtimeSubscription(), deriveClassCapacity(), getFunctionErrorMessage() (+23 more)

### Community 8 - "Database Types & Mappers"
Cohesion: 0.09
Nodes (27): courseCoverByPath, Database, Json, asModules(), AssessmentRow, EnrollmentInsert, EnrollmentRow, enrollmentToInsert() (+19 more)

### Community 9 - "FAQ & Section Titles"
Cohesion: 0.11
Nodes (21): FAQAccordion(), items, Default, Story, SectionTitle(), SectionTitleProps, Centered, Left (+13 more)

### Community 10 - "Admin Form Validation"
Cohesion: 0.16
Nodes (27): addError(), getErrorMessage(), getErrorsForDisplay(), isValidDateInput(), isValidEmail(), validateBlogPost(), validateClass(), validateCourse() (+19 more)

### Community 11 - "Public API Client & Schemas"
Cohesion: 0.10
Nodes (27): mapInstructor(), mapTrainingPath(), fetchPublicBlogPostsFromSupabaseServer(), fetchPublicCatalog(), fetchPublicCatalogFromSupabaseServer(), RhCursosClient, assessmentWithCourseListSchema, assessmentWithCourseSchema (+19 more)

### Community 12 - "Error Fallback Boundary"
Cohesion: 0.08
Nodes (15): ErrorFallback(), Custom, Default, Story, WithReset, ErrorBoundary, ErrorBoundaryProps, ErrorBoundaryState (+7 more)

### Community 13 - "Admin Dashboard Activity"
Cohesion: 0.12
Nodes (20): AdminDashboardPage(), getActivityIcon(), getActivityTone(), pickMetric(), ActivityInput, ActivityKind, buildPerformanceStats(), buildRecentActivities() (+12 more)

### Community 14 - "Admin/Student Store Contexts"
Cohesion: 0.11
Nodes (23): AdminStoreContext, AdminStoreValue, useAdminStore(), AppState, EnrollmentPayload, LeadPayload, StudentStoreContext, StudentStoreValue (+15 more)

### Community 15 - "Table Component"
Cohesion: 0.16
Nodes (22): Default, rows, Story, Table(), TableBody(), TableCell(), TableHead(), TableHeader() (+14 more)

### Community 16 - "Form Field Builders"
Cohesion: 0.13
Nodes (18): ModulesBuilder(), ModuleValue, BaseFieldProps, FormField(), FormFieldMultiSelect, FormFieldMultiSelectProps, FormFieldProps, FormFieldRenderProps (+10 more)

### Community 17 - "Seat Progress & Typography"
Cohesion: 0.15
Nodes (18): SeatProgress(), SeatProgressProps, AlmostFull, Empty, Full, PartiallyFilled, Story, Caption() (+10 more)

### Community 18 - "Card Component"
Cohesion: 0.13
Nodes (17): CardDescription(), CardFooter(), CardHeader(), CardProps, CardTitle(), cardVariants, Base, Elevated (+9 more)

### Community 19 - "Tabs & Admin Settings"
Cohesion: 0.14
Nodes (13): Default, Story, TabsList(), TabsTrigger(), AdminSettings, AdminUser, getDefaultAdminSettings(), loadAdminSettings() (+5 more)

### Community 20 - "API Validation & Retry"
Cohesion: 0.15
Nodes (17): ApiValidationError, backoff(), describeShape(), extractStatus(), isTransientError(), logValidationError(), MaybeSupabaseResult, NON_TRANSIENT_STATUS (+9 more)

### Community 21 - "Admin Resource Page (CRUD)"
Cohesion: 0.13
Nodes (13): AdminResourcePage(), CsvColumn, exportToCSV(), FileUploadField(), getPageDescription(), getPageTitle(), getSearchPlaceholder(), IconButton() (+5 more)

### Community 22 - "Search & Input Components"
Cohesion: 0.13
Nodes (13): SearchInput, SearchInputProps, Default, Empty, Loading, Story, Input, InputProps (+5 more)

### Community 23 - "In-Company Page Form"
Cohesion: 0.12
Nodes (15): benefits, checklistItems, clientWordmarks, defaultValues, formatPhone(), heroPoints, InCompanyFormValues, InCompanyPage() (+7 more)

### Community 24 - "Select Component & Specialist Page"
Cohesion: 0.18
Nodes (13): SelectContent(), SelectItem(), SelectTrigger(), Default, Story, WithDefault, LeadOrigin, consultoriaHighlights (+5 more)

### Community 25 - "Rate Limiting"
Cohesion: 0.17
Nodes (12): checkFallback(), checkPostgres(), checkRateLimit(), clientIp(), Entry, fallbackCleanup, fallbackStore, RateLimitConfig (+4 more)

### Community 26 - "Class/Course Card & Status Badge"
Cohesion: 0.27
Nodes (10): ClassCard(), EmptyState(), EmptyStateProps, StatusBadge(), CourseCardProps, Card(), CardContent(), Link() (+2 more)

### Community 27 - "Course Card & Badge Variants"
Cohesion: 0.16
Nodes (12): CourseCard(), CourseCardProps, Badge(), BadgeProps, badgeVariants, AllVariants, Danger, Default (+4 more)

### Community 28 - "Contact Page & Test Utils"
Cohesion: 0.20
Nodes (9): AllTheProviders(), customRender(), mocks, ContactFormValues, contactItems, ContactPage(), contactSchema, defaultValues (+1 more)

### Community 29 - "Course Store Context & Mocks"
Cohesion: 0.16
Nodes (12): CourseStoreContext, CourseStoreValue, useCourseBySlug(), useCourseStore(), mockBlogPosts, mockCatalog, mockClasses, mockCourses (+4 more)

### Community 30 - "Loading & Skeleton States"
Cohesion: 0.19
Nodes (9): LoadingBlocks(), Default, Grid, Single, Story, Skeleton(), CardPlaceholder, Line (+1 more)

### Community 31 - "App Store Tests"
Cohesion: 0.18
Nodes (5): AppStoreModule, mocks, renderStore(), Store, StoreProbe()

### Community 32 - "Checkbox Component"
Cohesion: 0.20
Nodes (8): Checkbox, CheckboxProps, Checked, Disabled, Indeterminate, Interactive, Story, Unchecked

### Community 33 - "Design Tokens (Storybook)"
Cohesion: 0.20
Nodes (8): tokens, colorGroups, Colors, ComponentExamples, meta, Shadows, SpacingAndShape, Typography

### Community 34 - "Query Logging Middleware"
Cohesion: 0.29
Nodes (7): captureSlowQuery(), logQueryToConsole(), QueryLogConfig, QueryMetrics, recordQueryMetrics(), wrapSupabaseWithQueryLogging(), initializeQueryLogging()

### Community 35 - "Array/MultiSelect Form Fields"
Cohesion: 0.20
Nodes (6): ArrayInput(), MultiSelectField(), ArrayList, Modules, MultiSelect, Story

### Community 36 - "Error Boundary (Class Component)"
Cohesion: 0.20
Nodes (3): ErrorBoundaryProps, ErrorBoundaryRoot, ErrorBoundaryState

### Community 37 - "Sanitization & Blog Post Page"
Cohesion: 0.42
Nodes (7): useParams(), isSafeUrl(), sanitizeHtml(), sanitizeServerHtml(), sanitizeText(), SERVER_ALLOWED_TAGS, BlogPostPage()

### Community 38 - "User Cell Avatar"
Cohesion: 0.33
Nodes (5): Default, LongName, Story, UserCell(), getInitials()

### Community 39 - "DB Row Mappers Tests"
Cohesion: 0.22
Nodes (8): AssessmentWithCourseRow, BlogPostRow, ClassRow, CourseInstructorRow, CourseRow, classRow, courseInstructorRow, courseRow

### Community 40 - "Switch Component"
Cohesion: 0.29
Nodes (5): Disabled, On, Story, Switch, SwitchProps

### Community 41 - "Textarea Component"
Cohesion: 0.29
Nodes (6): Default, Disabled, Filled, Story, Textarea, TextareaProps

### Community 42 - "Dashboard Metrics Builder"
Cohesion: 0.29
Nodes (5): buildDashboardMetrics(), ChartSummaryItem, DashboardMetricInput, getConfirmedEnrollments(), DashboardMetric

### Community 43 - "About Page Content"
Cohesion: 0.29
Nodes (5): AboutPage(), institutionalStats, solutions, trackDefinitions, values

### Community 44 - "Session Token Decoding"
Cohesion: 0.36
Nodes (5): isSessionExpired(), DecodedSession, decodeSessionToken(), fromBase64Url(), SupabaseSessionTokens

### Community 45 - "Keyboard Navigation & Focus"
Cohesion: 0.39
Nodes (4): getFocusableElements(), isKeyboardFocusable(), restoreFocus(), useDialogFocus()

### Community 46 - "Blog Card"
Cohesion: 0.33
Nodes (5): BlogCard(), Default, Featured, Story, mockBlogPost

### Community 47 - "Status Badge Stories"
Cohesion: 0.29
Nodes (6): Danger, Neutral, Spectrum, Story, Success, Warning

### Community 48 - "Monitoring & Sentry Status"
Cohesion: 0.57
Nodes (6): getMonitoringStatus(), initializeMonitoringDiagnostics(), isQueryLoggingConfigured(), isSentryConfigured(), printMonitoringStatus(), testSentryConnection()

### Community 49 - "Logger Utility"
Cohesion: 0.40
Nodes (5): emit(), LogData, logger, LogLevel, serializeError()

### Community 50 - "Security Headers"
Cohesion: 0.33
Nodes (3): CSP_POLICIES, DEFAULT_SECURITY_HEADERS, SecurityHeadersConfig

### Community 51 - "Lead Mapping & Insert"
Cohesion: 0.33
Nodes (6): fromDbLeadStatus(), fromDbLeadType(), leadToInsert(), mapLead(), toDbLeadType(), createLeadInSupabase()

### Community 52 - "Motion Provider"
Cohesion: 0.50
Nodes (3): MotionProvider(), Default, Story

### Community 53 - "Supabase Channel Mocks"
Cohesion: 0.50
Nodes (4): createMockSupabaseChannel(), createMockSupabaseClient(), MockChannel, MockChannelCallback

### Community 54 - "Empty State Stories"
Cohesion: 0.50
Nodes (3): Default, Story, WithAction

### Community 55 - "Blog Post Mapping"
Cohesion: 0.50
Nodes (4): asStringArray(), fromDbBlogCategory(), mapBlogPost(), fetchPublicBlogPosts()

## Knowledge Gaps
- **384 isolated node(s):** `mocks`, `items`, `validCourse`, `sendGAEvent`, `mocks` (+379 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Seat Progress & Typography` to `Checkout Modal & Pagamento`, `Admin Shell & Toaster`, `Calendar & Class Cards`, `Course Cards & Quote Modal`, `Testimonials & Feature Cards`, `Link, Progress & Session Secret`, `Form Base Components`, `FAQ & Section Titles`, `Table Component`, `Form Field Builders`, `Card Component`, `Tabs & Admin Settings`, `Admin Resource Page (CRUD)`, `Search & Input Components`, `In-Company Page Form`, `Select Component & Specialist Page`, `Class/Course Card & Status Badge`, `Course Card & Badge Variants`, `Loading & Skeleton States`, `Checkbox Component`, `Switch Component`, `Textarea Component`, `About Page Content`, `Blog Card`?**
  _High betweenness centrality (0.184) - this node is a cross-community bridge._
- **Why does `Button` connect `Checkout Modal & Pagamento` to `Admin Shell & Toaster`, `Course Cards & Quote Modal`, `Testimonials & Feature Cards`, `Form Base Components`, `FAQ & Section Titles`, `Error Fallback Boundary`, `Admin Dashboard Activity`, `Form Field Builders`, `Card Component`, `Tabs & Admin Settings`, `Admin Resource Page (CRUD)`, `In-Company Page Form`, `Select Component & Specialist Page`, `Class/Course Card & Status Badge`, `Course Card & Badge Variants`, `Contact Page & Test Utils`, `Error Boundary (Class Component)`, `Sanitization & Blog Post Page`, `About Page Content`, `Blog Card`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Course Card & Badge Variants` to `Course Cards & Quote Modal`, `Testimonials & Feature Cards`, `Sanitization & Blog Post Page`, `FAQ & Section Titles`, `Admin Form Validation`, `About Page Content`, `Admin Dashboard Activity`, `Table Component`, `Form Field Builders`, `Seat Progress & Typography`, `Card Component`, `Tabs & Admin Settings`, `Admin Resource Page (CRUD)`, `In-Company Page Form`, `Class/Course Card & Status Badge`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `mocks`, `items`, `validCourse` to the rest of the system?**
  _384 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Checkout Modal & Pagamento` be split into smaller, more focused modules?**
  _Cohesion score 0.05088919288645691 - nodes in this community are weakly interconnected._
- **Should `Admin Shell & Toaster` be split into smaller, more focused modules?**
  _Cohesion score 0.062206572769953054 - nodes in this community are weakly interconnected._
- **Should `Calendar & Class Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.062409288824383166 - nodes in this community are weakly interconnected._