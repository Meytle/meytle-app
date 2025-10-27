# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Meytle is a social companion platform connecting clients with verified companions for activities. The platform uses a monorepo structure with three main packages: backend (Node.js/Express), frontend (React/TypeScript/Vite), and shared utilities.

## Development Commands

### Setup and Installation
```bash
# Install all dependencies (monorepo)
npm install

# Backend-specific setup
cd backend && npm install

# Frontend-specific setup
cd frontend && npm install

# Create admin user with test data
cd backend && node utils/scripts/setup-admin.js
```

### Running the Application
```bash
# Run both backend and frontend concurrently (from root)
npm run dev

# Run backend only (port 5000)
npm run dev:backend
# OR
cd backend && npm run dev

# Run frontend only (port 5173)
npm run dev:frontend
# OR
cd frontend && npm run dev
```

### Building for Production
```bash
# Build entire application (from root)
npm run build

# Build frontend only
npm run build:frontend
# OR
cd frontend && npm run build

# Railway deployment commands
npm run railway:build
npm run railway:start
```

### Testing and Linting
```bash
# Run all tests
npm test

# Lint entire codebase
npm run lint

# Frontend-specific linting
cd frontend && npm run lint
```

## Architecture Overview

### Authentication & Role System
The platform implements a **dual-role system** where users can simultaneously be both clients and companions:

1. **Role Architecture**:
   - Users have a primary role stored in `users.role`
   - Additional roles tracked in `user_roles` table
   - JWT tokens include all active user roles
   - Role switching happens via `/api/auth/switch-role` without re-authentication

2. **Self-Booking Prevention**:
   - Backend validates that `client_id !== companion_id` in all booking operations
   - Frontend hides booking options when viewing own companion profile

3. **Permission Flow**:
   - Authentication middleware (`authMiddleware.js`) validates JWT and attaches user to request
   - Role authorization middleware (`roleMiddleware.js`) checks if user has required role
   - Routes protected by combining both middlewares

### Backend Architecture (Node.js/Express)

**Core Structure:**
- `server.js` - Entry point, middleware setup, route registration
- `config/database.js` - MySQL connection pooling and database initialization
- `middleware/` - Auth, validation, rate limiting, and security middlewares
- `controllers/` - Business logic separated by domain (auth, companion, booking, admin, notification, etc.)
- `routes/` - Express route definitions mapping to controllers
- `services/` - External service integrations (notifications, email)
- `utils/` - Utility functions and setup scripts

**Security Implementation:**
- Rate limiting per endpoint type (auth: 5/15min, API: 100/15min, search: 20/15min)
- Input sanitization via express-validator
- HTTPS enforcement in production
- Security headers (HSTS, CSP, XSS protection)
- SQL injection prevention via parameterized queries

**File Upload System:**
- Uses Multer for handling multipart/form-data
- Storage paths: `uploads/profiles/` for photos, `uploads/documents/` for IDs
- File validation: size limits (5MB), type checking (images only)
- .gitkeep files maintain directory structure in git

**Cookie-Based Authentication:**
- HTTP-only cookies for secure JWT storage
- Two cookies set: `authToken` (httpOnly) and `userData` (readable)
- Cookies set with `httpOnly: true, secure: true` (production), `sameSite: 'strict'`
- Bearer token support maintained for backwards compatibility
- Frontend `AuthContext` initializes synchronously from cookies
- Auto-logout on 401 responses via axios interceptor

### Frontend Architecture (React/TypeScript/Vite)

**Core Structure:**
- `src/App.tsx` - Root component with router outlet
- `src/routes/index.tsx` - React Router configuration with protected routes
- `src/contexts/AuthContext.tsx` - Global auth state management
- `src/api/` - Axios-based API client modules for each domain (including notifications)
- `src/components/` - Reusable UI components organized by feature
- `src/pages/` - Page-level components mapped to routes (including Notifications page)
- `src/styles/theme.ts` - Centralized theming and design tokens

**Component Organization:**
- `common/` - Shared UI components (Button, Card, PhoneNumberInput, DashboardNav)
- `companion/` - Companion-specific (AvailabilityManager, BookingsManager, LanguageSelector, ServicesSelector)
- `client/` - Client-specific (ReviewModal)
- `calendar/` - Scheduling components (CalendarPro, TimeSlotPickerPro, WeeklyScheduleView)
- `auth/` - Authentication components (ProtectedRoute)
- `booking/` - Booking components (TimeSlotGroup)
- `redirects/` - Redirect components for dashboard and profile routing

**TypeScript Configuration:**
- `tsconfig.json`: Root config for IDE support
- `tsconfig.app.json`: Actual build configuration with strict mode
- `tsconfig.node.json`: For Vite config files
- Build uses `tsc -b` which respects `tsconfig.app.json`

**Build Configuration (Vite):**
- Code splitting with manual chunks for optimization
- Default esbuild minification (terser removed for compatibility)
- Proxy configuration for `/api` routes to backend
- Chunk size warning limit: 500KB

### Database Schema Highlights

**Key Relationships:**
- Users can have multiple roles via `user_roles` junction table
- Companions have interests via `companion_interests` junction table
- Bookings link clients to companions with status tracking
- Applications track companion verification workflow
- Notifications track system-wide user notifications

**Important Tables:**
- `users` - Core user data with primary role
- `user_roles` - Dual role support
- `companion_applications` - Verification workflow
- `companion_profiles` - Extended companion data
- `bookings` - Booking management with status
- `companion_interests` - Interest/topic associations
- `notifications` - User notification system

**Database Auto-Migration:**
- Tables created/migrated automatically on server startup via `initializeDatabase()`
- Uses conditional ALTER TABLE for MySQL 5.7 compatibility
- Checks `information_schema.COLUMNS` before schema changes

### API Endpoint Patterns

All API routes follow RESTful conventions:
- `GET /api/{domain}` - List resources
- `GET /api/{domain}/:id` - Get single resource
- `POST /api/{domain}` - Create resource
- `PUT /api/{domain}/:id` - Update resource
- `DELETE /api/{domain}/:id` - Delete resource

Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

**Current API Routes:**
- `/api/auth` - Authentication endpoints
- `/api/companion` - Companion operations
- `/api/client` - Client operations
- `/api/admin` - Admin dashboard endpoints
- `/api/booking` - Booking management
- `/api/service-categories` - Service category CRUD
- `/api/favorites` - Favorites management
- `/api/notifications` - Notification system

### Environment Configuration

Required environment variables (backend `.env`):
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<password>
DB_NAME=meytle_db
DB_PORT=3306
JWT_SECRET=<secret>
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Frontend `.env` (if needed):
```
VITE_API_URL=http://localhost:5000
```

### Development Workflow

1. **Feature Development**:
   - Create feature branch from main
   - Implement backend API endpoints first
   - Add frontend API client methods
   - Build UI components and pages
   - Test integration end-to-end

2. **Database Changes**:
   - Modify schema in `backend/config/database.js`
   - Run database initialization to apply changes
   - Update relevant models/controllers

3. **Adding New Routes**:
   - Create controller in `backend/controllers/`
   - Define routes in `backend/routes/`
   - Register routes in `server.js`
   - Add API client in `frontend/src/api/`
   - Implement UI components

### Common Development Tasks

**Add a new API endpoint:**
1. Create controller method in `backend/controllers/`
2. Add route definition in `backend/routes/`
3. Apply appropriate middleware (auth, validation, rate limiting)
4. Add TypeScript types in `frontend/src/types/`
5. Create API client method in `frontend/src/api/`

**Implement a new page:**
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/routes/index.tsx`
3. Wrap with ProtectedRoute if authentication required
4. Add navigation link in relevant components

**Handle file uploads:**
1. Use `multerConfig` from `backend/config/multer.js`
2. Add upload middleware to route
3. Store file path in database
4. Serve via `/uploads` static route

### Setup Admin and Test Accounts

After running `setup-admin.js`:
- **Admin**: admin@meytle.com / admin123
- **Client**: john.doe@example.com / password123
- **Companion**: jane.smith@example.com / password123
- **Dual Role**: mike.wilson@example.com / password123 (both client and companion)

### Recent Updates & Maintenance

**Code Cleanup (Oct 27, 2024):**
- Removed test files: `test-notification.js`, `test-fetch-notifications.js`
- Removed outdated `backend/README.md`
- Added `.gitkeep` files to maintain upload directory structure
- Fixed `vite.config.ts` build configuration (removed terser options)
- Organized documentation in `docs/` folder

**Design System & Color Scheme (Oct 27, 2024):**
Complete color system transformation from purple/indigo to blue-pink theme:

**Primary Colors:**
- `#312E81` - Royal Blue (primary actions, buttons, links, headers)
- `#1E1B4B` - Deep Navy (dark accents, hover states, footers)
- `#4A47A3` - Light Blue (lighter accents, secondary elements)

**Accent Colors:**
- `#FFCCCB` - Pink (gradients, highlights, accent elements)
- `#FFF0F0` - Soft Pink (background gradients start)
- `#FF9F9F` - Deep Pink (hover states for pink elements)

**Effects & Shadows:**
- Pink glow: `shadow-[0_0_15px_rgba(255,204,203,0.3)]`
- Blue glow: `shadow-[0_0_15px_rgba(49,46,129,0.3)]`
- Premium gradients: `from-[#312E81] to-[#FFCCCB]`

**Key Components:**
- Button styles: `btn-premium` (dark backgrounds), `btn-premium-light` (white hover)
- Navigation: Gradient hover effects with pink glow
- Dashboards: Consistent blue-pink theming throughout
- Forms: Blue focus rings, pink hover shadows

**Color Constants File:**
- `frontend/src/constants/colors.ts` - Centralized color definitions
- Theme configuration in `frontend/src/styles/theme.ts`
- Base CSS in `frontend/src/styles/base/index.css`

**Current Dependencies:**
- **Backend**: Express 4.18.2, MySQL2 3.6.5, JWT 9.0.2, Multer 2.0.2
- **Frontend**: React 19.1.1, TypeScript 5.8.3, Vite 7.1.9, Tailwind CSS 4.1.14
- **Shared**: TypeScript 5.8.3

### Deployment Considerations

- Frontend builds to `frontend/dist/` with Vite
- Backend runs directly via Node.js (no build step)
- Static files served from `backend/uploads/`
- Database migrations handled by `initializeDatabase()`
- Environment-specific configs via `.env` files
- CORS origins configured per environment
- Railway deployment supported with specific scripts

### Notes for Development

1. **Monorepo Structure**: Use `npm run dev` from root to run both frontend and backend
2. **Database**: Ensure MySQL is running before starting backend
3. **Uploads**: Upload directories are gitignored but structure maintained with `.gitkeep`
4. **Build Warnings**: Frontend main chunk is ~793KB - can be optimized with code splitting
5. **Documentation**: This file (`docs/CLAUDE.md`) is the single source of truth for AI assistance