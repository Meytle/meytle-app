# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Meytle** is a social companion platform connecting clients with verified companions for various activities. Built with Node.js/Express backend and React/TypeScript frontend, supporting dual roles (users can be both clients and companions), with comprehensive booking system and admin approval workflow.

## Current State Notes

**⚠️ Stripe Payment Integration:** Currently removed with intention to reimplement later. Database schema and some configuration still contain Stripe-related fields. Comments throughout codebase indicate "Payment functions removed - will be implemented later".

## Documentation Structure

- **CLAUDE.md** (this file): Architecture, patterns, and development guidance
- **README.md**: Project overview and features list
- **QUICK_SETUP.md**: Getting started guide for developers
- **PROJECT_DOCUMENTATION.md**: 960-line comprehensive technical documentation
- **UI_DESIGN_SYSTEM.md**: 1800+ line design system specification

## Architecture

### Critical Architectural Decisions

**Multi-Role Architecture:** Users can simultaneously be both clients and companions:
- `user_roles` junction table for many-to-many relationship
- `activeRole` field in JWT for current context
- `roles` array in JWT contains all user roles
- Role switching without re-authentication via `/api/auth/switch-role`
- Separate dashboards with shared authentication

**Database Schema Auto-Migration:** Tables created/migrated automatically on server startup via `initializeDatabase()` in `backend/config/database.js` (1277 lines). Uses conditional ALTER TABLE for MySQL 5.7 compatibility by checking `information_schema.COLUMNS` before schema changes.

**Cookie-Based Authentication:** HTTP-only cookies for secure JWT storage:
- Two cookies set: `authToken` (httpOnly) and `userData` (readable)
- Cookies set with `httpOnly: true, secure: true` (production), `sameSite: 'strict'`
- Bearer token support maintained for backwards compatibility
- Frontend `AuthContext` initializes synchronously from cookies
- Auto-logout on 401 responses via axios interceptor dispatching 'auth-expired' event

**TypeScript Triple Configuration Strategy:**
- `tsconfig.json`: `"strict": false` - root config for IDE support (ES2020 target)
- `tsconfig.app.json`: `"strict": true` - **actual build configuration** (ES2022 target)
- `tsconfig.node.json`: `"strict": true` - for Vite config files (ES2023 target)
- Build command uses `tsc -b` which respects `tsconfig.app.json` settings

**Frontend Folder Naming:** Directory is named `frontend` (previously had typo as `frontendf`, now corrected).

### Monorepo Structure
- **backend/** - Node.js/Express REST API with MySQL database
- **frontend/** - React 19 + TypeScript frontend with Vite build system

### Backend Architecture

**Core Dependencies:**
- Express 4.18.2
- MySQL2 3.6.5 (with promise pool)
- Resend 3.5.0 (email service)
- express-rate-limit 8.1.0
- jsonwebtoken 9.0.2
- bcryptjs 2.4.3 (12 salt rounds)
- Multer 2.0.2 (file uploads - v2 with auto-directory creation)
- express-validator 7.2.1 (input validation)

**Database Layer:** `backend/config/database.js`:
- Connection pool: 10 connections, queueLimit: 50
- Session variables per connection: `time_zone='+00:00'`, `sql_mode='STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION'`
- `initializeDatabase()` creates tables with foreign key constraints
- Automatic schema migrations using `information_schema.COLUMNS` checks
- Pool health monitoring: `checkPoolHealth()` returns connection statistics
- Includes triggers for data validation and audit logging

**Route Organization:**
```
/api/auth               - Authentication (signup, login, verify-email, switch-role)
/api/client             - Client operations (profile, verification)
/api/companion          - Companion operations (application, browse, availability)
/api/admin              - Admin dashboard (applications, users, stats)
/api/booking            - Booking management (create, update status, reviews)
/api/service-categories - Service category CRUD
/api/favorites          - Favorites management (add, remove, list, check)
```

**Middleware Stack:**
- Authentication: JWT extraction from cookies first, Bearer token fallback
- Role-Based: `companionAuth.js`, `adminAuth.js` for role verification with ownership checks
- Security: HTTPS enforcement, security headers (CSP, HSTS), request size limiting, suspicious pattern detection
- Rate Limiting: Selective per endpoint - auth: 5/15min, api: 500/15min (signup rate limiting DISABLED in demo mode)
- Validation: express-validator for input validation and sanitization

### Frontend Architecture

**Core Dependencies:**
- React 19.1.1
- TypeScript ~5.8.3
- Vite 7.1.9 (build tool)
- Tailwind CSS 4.1.14 (uses new `@tailwindcss/postcss` plugin)
- React Router 7.9.3
- Axios 1.7.9
- Framer Motion (animations)
- React Hot Toast (notifications)
- @headlessui/react, @heroicons/react, lucide-react (UI components)

**Build Process:**
- Development: Vite dev server with `/api` proxy to `http://localhost:5000`
- Production: `tsc -b && vite build` outputs to `frontend/dist/` (two-step process)
- TypeScript check runs before build (using `tsconfig.app.json` with strict: true)
- ESLint v9+ flat config (`eslint.config.js`)

**State Management:**
- **AuthContext**: Synchronous initialization from cookies, no async delays
  - Helper methods: `hasRole()`, `canAccessRole()`, `switchRole()`
- **BookingContext**: Multi-step workflow (date/time, service, review)
  - Methods: `nextStep()`, `previousStep()`, `goToStep()`, `updateBookingData()`

**Caching Layer** (`frontend/src/services/cachedApi.ts` - 449 lines):
- Singleton with separate cache stores by type
- TTL-based expiration: companions (10min), availability (5min), bookings (1min), services (30min)
- Dependency tracking for batch invalidation
- Auto-warmup on page load (2sec delay)
- Methods: `getOrSet()`, `invalidateDependencies()`, `prefetch()`, `getStats()`

**Frontend Themes:** Multiple design themes implemented:
- Classic theme (`components/classic/`)
- Professional theme (`components/professional/`)
- Warm theme (`components/warm/`)
- Split-screen theme (`components/splitscreen/`)

## Development Commands

### Backend
```bash
cd backend
npm install
npm start            # Production mode (port 5000)
npm run dev          # Development with nodemon

# Utility scripts:
node utils/scripts/setup-admin.js   # Creates test users and data
node utils/scripts/test-email.js    # Tests Resend configuration
node utils/validateEnv.js           # Validates environment variables

# Health check:
curl http://localhost:5000/health
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Vite dev server (port 5173)
npm run build        # tsc -b && vite build (TypeScript check then build)
npm run lint         # ESLint v9+ flat config
npm run preview      # Preview production build
npm run type-check   # TypeScript validation only
```

### Quick Start
```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev

# Terminal 3 - Setup test data
cd backend && node utils/scripts/setup-admin.js
```

## Environment Variables

### Backend `.env` (required)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password  # Required
DB_NAME=meytle_db
DB_PORT=3306

# Auth
JWT_SECRET=your_jwt_secret_here  # Required, minimum 32 characters
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Email (Resend)
RESEND_API_KEY=your_resend_key  # Required
RESEND_FROM_EMAIL=onboarding@resend.dev
EMAIL_MODE=testing  # 'testing' redirects ALL emails
TEST_EMAIL_RECIPIENT=test@example.com

# Stripe (removed but fields remain in database)
STRIPE_SECRET_KEY=sk_test_xxx  # Not currently used
CURRENCY=usd
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # Not currently used
```

## Key Database Tables

```
users                    - Base user table (has deprecated 'role' field, use user_roles instead)
user_roles              - Many-to-many junction for multi-role support (UNIQUE on user_id, role)
companion_applications  - Companion approval workflow
companion_availability  - Weekly schedule with unique constraint (companion_id, day_of_week, time_slot)
bookings               - Main booking records with payment fields (mostly unused)
booking_requests       - Custom time requests when availability unavailable
booking_reviews        - Rating system (UNIQUE on booking_id, reviewer_id)
favorites              - Client's favorite companions
service_categories     - Predefined service categories
availability_audit_log - Tracks availability changes for compliance
```

## Important Implementation Patterns

### Database Migration Pattern (MySQL 5.7 Compatible)
```javascript
// Always check before ALTER TABLE
const [[{ count_column }]] = await pool.query(
  `SELECT COUNT(*) AS count_column FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
  [dbName, 'table_name', 'column_name']
);
if (Number(count_column) === 0) {
  await pool.query('ALTER TABLE ...');
}
```

### Cookie Authentication
```typescript
// Frontend API setup - REQUIRED for cookie auth
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  withCredentials: true,
  timeout: 10000
});

// Auto-logout on 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error);
  }
);
```

### Role-Based Access
```javascript
// Backend route protection
router.get('/dashboard',
  authMiddleware,        // Verify JWT
  companionAuth,         // Verify companion role
  controller.method
);
```

### API Response Format
```typescript
{
  status: 'success' | 'error',
  message?: string,
  data?: any,
  token?: string  // Auth endpoints only
}
```

### File Upload Configuration
```javascript
// Multer config (backend/config/multer.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'profiles');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File size limit: 5MB
// Allowed types: JPEG, PNG, GIF, WebP
```

### Frontend State Initialization
```typescript
// Synchronous auth state from cookies (no async delay)
const getInitialAuthState = () => {
  const userDataCookie = getCookie('userData');
  if (userDataCookie) {
    return {
      user: JSON.parse(decodeURIComponent(userDataCookie)),
      hasValidAuth: true
    };
  }
  return { user: null, hasValidAuth: false };
};
```

## Testing & Development

### Test Accounts (via setup-admin.js)
- Admin: admin@meytle.com / admin123
- Test Companions: sarah@test.com, mike@test.com, emma@test.com (all: test123)
- Test Client: john@test.com / test123

### URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

## Common Pitfalls & Solutions

### Frontend Issues
- **Folder Name**: Frontend folder is `frontend`
- **Build Failures**: Use `npm run type-check` to debug TypeScript errors
- **Cookie Auth**: Ensure `withCredentials: true` in axios config
- **401 Handling**: Listen for 'auth-expired' event for global logout

### Backend Issues
- **Database Migrations**: Always check column existence before ALTER TABLE
- **File Uploads**: Multer v2 auto-creates directories
- **Email Testing**: In `EMAIL_MODE=testing`, ALL emails redirect to TEST_EMAIL_RECIPIENT
- **Rate Limiting**: Signup rate limiting is DISABLED for demo mode
- **Password Requirements**: 8+ chars, uppercase, lowercase, number, special character

### Database Issues
- **Auto-Migration**: Tables created on server startup
- **Connection Pool**: Limited to 10 connections with queueLimit of 50
- **Timezone**: All connections use UTC
- **User Roles**: Many-to-many via `user_roles` junction table
- **Unique Constraints**: Check for duplicate key errors on availability, reviews

## Critical Notes

- **Payment Integration**: Currently removed, database schema still contains payment fields
- **TypeScript Build**: Uses `tsconfig.app.json` with `strict: true` (not root tsconfig)
- **ESLint v9**: Uses flat config format - not compatible with older versions
- **Build Process**: Two-step - TypeScript validation then Vite build
- **Error Suppression**: Automatically filters browser extension errors in development
- **Authentication Flow**: Password hashing with bcrypt (12 rounds), email verification (24hr expiry)
- **Security Headers**: CSP enabled in production with Stripe support

## Performance Optimizations

- **Connection Pooling**: 10 persistent MySQL connections
- **API Caching**: Multi-tiered TTL caching (1-30 minutes by endpoint type)
- **Cache Warmup**: Auto-preload on page load (2sec delay)
- **Database Indexes**: Foreign keys and frequently queried fields indexed
- **Static File Caching**: Uploads cached for 1 day with ETags

## Known Areas Requiring Attention

- No automated test suite configured
- No CI/CD pipeline or GitHub Actions workflows
- No Docker/containerization setup
- No API documentation (OpenAPI/Swagger)
- Payment integration needs to be reimplemented
- Some database columns related to Stripe remain but are unused
- TypeScript `noUnusedLocals` and `noUnusedParameters` temporarily disabled