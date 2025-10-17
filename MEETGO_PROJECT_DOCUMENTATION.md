# MeetGo Platform - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Backend Architecture](#backend-architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Frontend Structure](#frontend-structure)
6. [User Flows](#user-flows)
7. [Key Features](#key-features)
8. [Authentication System](#authentication-system)
9. [Booking System](#booking-system)
10. [File Structure](#file-structure)

---

## 🎯 Project Overview

**MeetGo** is a companion booking platform that connects clients with verified companions for various activities and services. The platform includes user authentication, companion applications, booking management, and availability scheduling.

### Core User Types:
- **Clients** - Book companions for activities
- **Companions** - Provide services to clients
- **Admins** - Manage the platform and approve applications

---

## 🏗️ Backend Architecture

### Technology Stack:
- **Node.js** with Express.js
- **MySQL** database
- **JWT** authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **Nodemailer** for email services

### Server Structure:
```
backend/
├── config/
│   ├── config.js          # App configuration
│   ├── database.js        # Database connection & schema
│   └── multer.js          # File upload configuration
├── controllers/
│   ├── authController.js      # Authentication logic
│   ├── adminController.js     # Admin operations
│   ├── clientController.js    # Client profile management
│   ├── companionController.js # Companion applications
│   └── bookingController.js   # Booking system
├── middleware/
│   ├── auth.js            # JWT authentication
│   └── adminAuth.js       # Admin authorization
├── routes/
│   ├── authRoutes.js      # Authentication endpoints
│   ├── adminRoutes.js     # Admin endpoints
│   ├── clientRoutes.js    # Client endpoints
│   ├── companionRoutes.js # Companion endpoints
│   └── bookingRoutes.js   # Booking endpoints
├── services/
│   └── emailService.js    # Email functionality
└── server.js              # Main server file
```

---

## 🗄️ Database Schema

### Core Tables:

#### 1. **users**
```sql
- id (Primary Key)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- role (ENUM: 'client', 'companion', 'admin')
- email_verified (BOOLEAN)
- email_verification_token (VARCHAR)
- email_verification_expires (TIMESTAMP)
- created_at, updated_at
```

#### 2. **companion_applications**
```sql
- id (Primary Key)
- user_id (Foreign Key → users.id)
- profile_photo_url (VARCHAR)
- government_id_url (VARCHAR)
- date_of_birth (DATE)
- government_id_number (VARCHAR)
- status (ENUM: 'pending', 'approved', 'rejected')
- rejection_reason (TEXT)
- reviewed_at (TIMESTAMP)
- created_at, updated_at
```

#### 3. **client_verifications**
```sql
- id (Primary Key)
- user_id (Foreign Key → users.id)
- profile_photo_url (VARCHAR)
- id_document_url (VARCHAR)
- date_of_birth (DATE)
- government_id_number (VARCHAR)
- phone_number (VARCHAR)
- location (VARCHAR)
- bio (TEXT)
- verification_status (ENUM: 'not_submitted', 'pending', 'approved', 'rejected')
- verified_at (TIMESTAMP)
- created_at, updated_at
```

#### 4. **companion_availability**
```sql
- id (Primary Key)
- companion_id (Foreign Key → users.id)
- day_of_week (ENUM: 'monday' to 'sunday')
- start_time (TIME)
- end_time (TIME)
- is_available (BOOLEAN)
- created_at, updated_at
```

#### 5. **bookings**
```sql
- id (Primary Key)
- client_id (Foreign Key → users.id)
- companion_id (Foreign Key → users.id)
- booking_date (DATE)
- start_time (TIME)
- end_time (TIME)
- duration_hours (DECIMAL)
- total_amount (DECIMAL)
- status (ENUM: 'pending', 'confirmed', 'cancelled', 'completed', 'no_show')
- special_requests (TEXT)
- meeting_location (VARCHAR)
- created_at, updated_at
```

#### 6. **booking_reviews**
```sql
- id (Primary Key)
- booking_id (Foreign Key → bookings.id)
- reviewer_id (Foreign Key → users.id)
- reviewee_id (Foreign Key → users.id)
- rating (INT, 1-5)
- review_text (TEXT)
- created_at, updated_at
```

---

## 🔌 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /signup` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile (protected)
- `POST /verify-email` - Email verification
- `POST /resend-verification` - Resend verification email

### Client Routes (`/api/client`) - Protected
- `GET /profile` - Get client profile
- `PUT /profile` - Update client profile
- `POST /profile/photo` - Upload profile photo
- `POST /verify-identity` - Submit identity verification
- `GET /verification-status` - Get verification status

### Companion Routes (`/api/companion`)
- `GET /browse` - Get approved companions (public)
- `POST /application` - Submit companion application (protected)
- `GET /application/status` - Get application status (protected)
- `POST /profile/photo` - Update profile photo (protected)

### Admin Routes (`/api/admin`) - Protected
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /applications` - Get all applications
- `PUT /applications/:id/approve` - Approve application
- `PUT /applications/:id/reject` - Reject application
- `GET /users` - Get all users
- `DELETE /users/:id` - Delete user

### Booking Routes (`/api/booking`) - Protected
- `POST /create` - Create new booking
- `GET /my-bookings` - Get user's bookings
- `PUT /:bookingId/status` - Update booking status
- `GET /availability/:companionId` - Get companion availability
- `POST /availability` - Set companion availability
- `GET /availability/:companionId/slots` - Get available time slots

---

## 🎨 Frontend Structure

### Technology Stack:
- **React** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications
- **Axios** for API calls

### Project Structure:
```
frontendf/
├── src/
│   ├── api/
│   │   ├── auth.ts           # Authentication API
│   │   └── booking.ts        # Booking API
│   ├── components/
│   │   ├── common/           # Shared components
│   │   ├── calendar/         # Calendar components
│   │   ├── booking/          # Booking components
│   │   └── companion/        # Companion-specific components
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication context
│   ├── hooks/
│   │   ├── useAuth.ts        # Authentication hook
│   │   └── useProtectedRoute.ts
│   ├── pages/
│   │   ├── auth/             # Authentication pages
│   │   ├── ClientDashboard.tsx
│   │   ├── CompanionDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── BrowseCompanions.tsx
│   │   └── ...
│   ├── routes/
│   │   └── index.tsx         # Route configuration
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   └── utils/
│       ├── localStorage.ts   # Local storage utilities
│       └── validation.ts    # Form validation
```

---

## 🔄 User Flows

### 1. **Client Registration & Booking Flow**
```
1. Client visits website
2. Signs up with email/password
3. Verifies email
4. Browses companions at /browse-companions
5. Clicks "Book Now" on companion
6. Selects date from calendar
7. Chooses available time slot
8. Adds special requests & location
9. Creates booking
10. Receives confirmation
```

### 2. **Companion Application Flow**
```
1. User signs up as companion
2. Redirected to application form
3. Uploads profile photo & ID document
4. Fills personal information
5. Submits application (status: pending)
6. Admin reviews application
7. Admin approves/rejects
8. If approved: companion can set availability
9. If rejected: can reapply
```

### 3. **Companion Dashboard Flow**
```
1. Companion logs in
2. Redirected to dashboard
3. Three main tabs:
   - Overview: Application status & stats
   - Availability: Set weekly schedule
   - Bookings: Manage booking requests
4. Can update profile, set availability, manage bookings
```

### 4. **Admin Management Flow**
```
1. Admin logs in
2. Redirected to admin dashboard
3. Views pending applications
4. Reviews companion documents
5. Approves/rejects applications
6. Manages users and platform
```

---

## ✨ Key Features

### 1. **Authentication System**
- JWT-based authentication
- Email verification
- Role-based access control
- Protected routes
- Password hashing with bcrypt

### 2. **Companion Application System**
- Multi-step application form
- File upload for documents
- Admin approval workflow
- Status tracking
- Email notifications

### 3. **Booking System**
- Calendar-based date selection
- Real-time availability checking
- Conflict prevention
- Status management
- Pricing calculation

### 4. **Availability Management**
- Weekly schedule setup
- Multiple time slots per day
- Availability toggles
- Time range selection

### 5. **Browse & Discovery**
- Public companion listing
- Profile photos and information
- Search and filtering
- Booking integration

---

## 🔐 Authentication System

### JWT Token Structure:
```json
{
  "id": "user_id",
  "email": "user@example.com", 
  "role": "client|companion|admin",
  "iat": "issued_at",
  "exp": "expires_at"
}
```

### Protected Route Logic:
- Client routes: Only accessible to clients
- Companion routes: Only accessible to companions
- Admin routes: Only accessible to admins
- Public routes: Available to all users

### Authentication Flow:
1. User submits credentials
2. Server validates credentials
3. JWT token generated
4. Token stored in localStorage
5. Token sent with each request
6. Server validates token on protected routes

---

## 📅 Booking System

### Booking Lifecycle:
1. **Pending** - Initial booking request
2. **Confirmed** - Companion accepts booking
3. **Completed** - Service provided
4. **Cancelled** - Booking cancelled
5. **No Show** - Client didn't show up

### Availability Logic:
- Companions set weekly availability
- System checks for conflicts
- Only available slots shown to clients
- Real-time availability updates

### Pricing System:
- Fixed hourly rate ($35/hour)
- Automatic duration calculation
- Total amount computation
- Payment integration ready

---

## 📁 File Structure

### Backend Files:
```
backend/
├── config/
│   ├── config.js              # App configuration
│   ├── database.js            # Database setup & schema
│   └── multer.js              # File upload config
├── controllers/
│   ├── authController.js      # Login/signup logic
│   ├── adminController.js     # Admin operations
│   ├── clientController.js    # Client profile management
│   ├── companionController.js # Companion applications
│   └── bookingController.js   # Booking management
├── middleware/
│   ├── auth.js                # JWT authentication
│   └── adminAuth.js           # Admin authorization
├── routes/
│   ├── authRoutes.js          # Auth endpoints
│   ├── adminRoutes.js         # Admin endpoints
│   ├── clientRoutes.js        # Client endpoints
│   ├── companionRoutes.js     # Companion endpoints
│   └── bookingRoutes.js       # Booking endpoints
├── services/
│   └── emailService.js        # Email functionality
├── uploads/
│   ├── profiles/              # Profile photos
│   └── documents/             # ID documents
├── server.js                  # Main server
└── setup-admin.js             # Admin setup script
```

### Frontend Files:
```
frontendf/
├── src/
│   ├── api/
│   │   ├── auth.ts            # Authentication API
│   │   └── booking.ts          # Booking API
│   ├── components/
│   │   ├── common/
│   │   │   ├── DashboardNav.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   └── UserProfileCard.tsx
│   │   ├── calendar/
│   │   │   ├── Calendar.tsx
│   │   │   └── TimeSlotPicker.tsx
│   │   ├── booking/
│   │   │   ├── BookingForm.tsx
│   │   │   └── BookingModal.tsx
│   │   └── companion/
│   │       ├── AvailabilityManager.tsx
│   │       └── BookingsManager.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useProtectedRoute.ts
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── SignIn.tsx
│   │   │   └── SignUp.tsx
│   │   ├── ClientDashboard.tsx
│   │   ├── CompanionDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   ├── BrowseCompanions.tsx
│   │   ├── CompanionApplication.tsx
│   │   ├── CompanionProfile.tsx
│   │   └── ClientProfile.tsx
│   ├── routes/
│   │   └── index.tsx          # Route configuration
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces
│   └── utils/
│       ├── localStorage.ts
│       └── validation.ts
```

---

## 🚀 Getting Started

### Backend Setup:
1. Install dependencies: `npm install`
2. Configure database in `config/config.js`
3. Run database setup: `node setup-admin.js`
4. Start server: `npm start`

### Frontend Setup:
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Access at `http://localhost:5173`

### Default Credentials:
- **Admin**: admin@meetgo.com / admin123
- **Test Users**: sarah@test.com, mike@test.com, emma@test.com / 123456

---

## 🔧 Key Components

### Backend Controllers:
- **authController**: Handles login, signup, email verification
- **adminController**: Manages applications, users, platform stats
- **clientController**: Client profile management
- **companionController**: Companion applications, profile photos
- **bookingController**: Booking creation, availability management

### Frontend Components:
- **Calendar**: Date selection with availability checking
- **TimeSlotPicker**: Available time slot selection
- **BookingForm**: Complete booking creation form
- **AvailabilityManager**: Companion schedule management
- **BookingsManager**: Booking status management

### Key Pages:
- **BrowseCompanions**: Public companion listing with booking
- **CompanionDashboard**: Companion management interface
- **ClientDashboard**: Client booking management
- **AdminDashboard**: Platform administration

---

This documentation provides a complete overview of the MeetGo platform, including all implemented features, database structure, API endpoints, and user flows. The system is fully functional with authentication, booking management, and companion scheduling capabilities.
