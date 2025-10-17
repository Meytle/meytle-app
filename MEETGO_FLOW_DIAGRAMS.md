# MeetGo Platform - Flow Diagrams

## 📊 Complete User Journey Flow Diagrams

This document contains visual flow diagrams showing the complete user journeys and system interactions in the MeetGo platform.

---

## 🔄 1. Overall System Architecture Flow

```mermaid
graph TB
    A[User Visits Website] --> B{User Type?}
    B -->|New User| C[Sign Up Page]
    B -->|Existing User| D[Sign In Page]
    B -->|Guest| E[Browse Companions]
    
    C --> F[Email Verification]
    F --> G[Choose Role]
    G -->|Client| H[Client Dashboard]
    G -->|Companion| I[Companion Application]
    G -->|Admin| J[Admin Dashboard]
    
    D --> K{Authentication}
    K -->|Success| L[Role-based Redirect]
    K -->|Failed| D
    
    L -->|Client| H
    L -->|Companion| M{Has Application?}
    L -->|Admin| J
    
    M -->|Yes| N[Companion Dashboard]
    M -->|No| I
    
    E --> O[View Companion Profiles]
    O --> P[Book Companion]
    P --> Q[Booking Form]
    Q --> R[Payment/Confirmation]
```

---

## 👤 2. Client User Journey Flow

```mermaid
graph TD
    A[Client Visits Site] --> B[Sign Up as Client]
    B --> C[Email Verification]
    C --> D[Client Dashboard]
    
    D --> E[Browse Companions]
    E --> F[View Companion Profile]
    F --> G[Click Book Now]
    G --> H[Booking Modal Opens]
    
    H --> I[Select Date from Calendar]
    I --> J[Choose Available Time Slot]
    J --> K[Add Special Requests]
    K --> L[Add Meeting Location]
    L --> M[Review Booking Summary]
    M --> N[Create Booking]
    
    N --> O[Booking Status: Pending]
    O --> P[Wait for Companion Confirmation]
    P --> Q{Companion Response}
    Q -->|Confirmed| R[Booking Confirmed]
    Q -->|Cancelled| S[Booking Cancelled]
    
    R --> T[Attend Meeting]
    T --> U[Rate Companion]
    U --> V[Booking Completed]
    
    D --> W[View My Bookings]
    W --> X[Manage Bookings]
    X --> Y[Cancel/Reschedule]
```

---

## 🎭 3. Companion User Journey Flow

```mermaid
graph TD
    A[User Signs Up as Companion] --> B[Companion Application Form]
    B --> C[Upload Profile Photo]
    C --> D[Upload Government ID]
    D --> E[Fill Personal Information]
    E --> F[Submit Application]
    F --> G[Application Status: Pending]
    
    G --> H[Admin Reviews Application]
    H --> I{Admin Decision}
    I -->|Approved| J[Application Approved]
    I -->|Rejected| K[Application Rejected]
    
    J --> L[Companion Dashboard Access]
    L --> M[Set Availability Schedule]
    M --> N[Configure Weekly Hours]
    N --> O[Save Availability]
    
    O --> P[Wait for Booking Requests]
    P --> Q[Receive Booking Notification]
    Q --> R[Review Booking Details]
    R --> S{Accept Booking?}
    S -->|Yes| T[Confirm Booking]
    S -->|No| U[Decline Booking]
    
    T --> V[Attend Meeting]
    V --> W[Mark Booking Complete]
    W --> X[Receive Payment]
    
    L --> Y[Manage Bookings Tab]
    Y --> Z[View All Bookings]
    Z --> AA[Update Booking Status]
    
    K --> BB[Can Reapply]
    BB --> B
```

---

## 👑 4. Admin User Journey Flow

```mermaid
graph TD
    A[Admin Login] --> B[Admin Dashboard]
    B --> C[View Platform Statistics]
    C --> D[Pending Applications]
    
    D --> E[Review Companion Application]
    E --> F[Check Documents]
    F --> G[Verify Information]
    G --> H{Decision}
    
    H -->|Approve| I[Approve Application]
    H -->|Reject| J[Reject Application]
    
    I --> K[Companion Gets Access]
    K --> L[Companion Can Set Availability]
    
    J --> M[Send Rejection Email]
    M --> N[Companion Can Reapply]
    
    B --> O[User Management]
    O --> P[View All Users]
    P --> Q[Delete Users]
    Q --> R[Manage User Roles]
    
    B --> S[Application Management]
    S --> T[Filter Applications]
    T --> U[Bulk Actions]
    U --> V[Export Data]
```

---

## 📅 5. Booking System Flow

```mermaid
graph TD
    A[Client Wants to Book] --> B[Browse Companions]
    B --> C[Select Companion]
    C --> D[Click Book Now]
    D --> E[Booking Modal Opens]
    
    E --> F[Select Date from Calendar]
    F --> G[System Checks Availability]
    G --> H{Date Available?}
    H -->|No| I[Show No Available Slots]
    H -->|Yes| J[Show Available Time Slots]
    
    J --> K[Client Selects Time Slot]
    K --> L[Add Booking Details]
    L --> M[Special Requests]
    M --> N[Meeting Location]
    N --> O[Review Booking Summary]
    O --> P[Calculate Total Cost]
    P --> Q[Create Booking Request]
    
    Q --> R[Booking Status: Pending]
    R --> S[Notify Companion]
    S --> T[Companion Reviews Request]
    T --> U{Companion Decision}
    
    U -->|Accept| V[Booking Confirmed]
    U -->|Decline| W[Booking Cancelled]
    
    V --> X[Both Parties Notified]
    X --> Y[Meeting Day Arrives]
    Y --> Z[Service Provided]
    Z --> AA[Mark as Completed]
    AA --> BB[Payment Processed]
    BB --> CC[Rating & Review]
```

---

## 🗄️ 6. Database Interaction Flow

```mermaid
graph TD
    A[User Action] --> B[Frontend Request]
    B --> C[API Endpoint]
    C --> D[Authentication Check]
    D --> E{Authenticated?}
    E -->|No| F[Return 401 Unauthorized]
    E -->|Yes| G[Controller Function]
    
    G --> H[Validate Request Data]
    H --> I{Valid Data?}
    I -->|No| J[Return 400 Bad Request]
    I -->|Yes| K[Database Query]
    
    K --> L[MySQL Database]
    L --> M[Execute Query]
    M --> N[Return Results]
    N --> O[Process Data]
    O --> P[Format Response]
    P --> Q[Return JSON Response]
    Q --> R[Frontend Updates UI]
    
    L --> S[users table]
    L --> T[companion_applications table]
    L --> U[bookings table]
    L --> V[companion_availability table]
    L --> W[booking_reviews table]
```

---

## 🔐 7. Authentication Flow

```mermaid
graph TD
    A[User Login Request] --> B[Submit Credentials]
    B --> C[Validate Email/Password]
    C --> D{Valid Credentials?}
    D -->|No| E[Return Error Message]
    D -->|Yes| F[Generate JWT Token]
    
    F --> G[Token Contains User Info]
    G --> H[Store Token in localStorage]
    H --> I[Redirect Based on Role]
    
    I --> J{User Role}
    J -->|Client| K[Client Dashboard]
    J -->|Companion| L{Has Application?}
    J -->|Admin| M[Admin Dashboard]
    
    L -->|Yes| N[Companion Dashboard]
    L -->|No| O[Application Form]
    
    K --> P[Protected Routes]
    N --> P
    M --> P
    O --> Q[Public Routes]
    
    P --> R[Check Token on Each Request]
    R --> S{Token Valid?}
    S -->|Yes| T[Allow Access]
    S -->|No| U[Redirect to Login]
```

---

## 📱 8. Frontend Component Flow

```mermaid
graph TD
    A[App.tsx] --> B[AuthProvider]
    B --> C[Router]
    C --> D{User Authenticated?}
    
    D -->|No| E[Public Routes]
    D -->|Yes| F[Protected Routes]
    
    E --> G[Home Page]
    E --> H[Sign In Page]
    E --> I[Sign Up Page]
    E --> J[Browse Companions]
    
    F --> K[Client Dashboard]
    F --> L[Companion Dashboard]
    F --> M[Admin Dashboard]
    
    K --> N[Client Profile]
    K --> O[My Bookings]
    
    L --> P[Overview Tab]
    L --> Q[Availability Tab]
    L --> R[Bookings Tab]
    
    P --> S[Application Status]
    P --> T[Quick Actions]
    
    Q --> U[AvailabilityManager]
    U --> V[Set Weekly Schedule]
    V --> W[Time Slot Management]
    
    R --> X[BookingsManager]
    X --> Y[View All Bookings]
    Y --> Z[Update Booking Status]
    
    M --> AA[Application Review]
    M --> BB[User Management]
    M --> CC[Platform Statistics]
```

---

## 🔄 9. File Upload Flow

```mermaid
graph TD
    A[User Selects File] --> B[File Input Change]
    B --> C[Validate File Type]
    C --> D{Valid File?}
    D -->|No| E[Show Error Message]
    D -->|Yes| F[Validate File Size]
    
    F --> G{Size OK?}
    G -->|No| H[Show Size Error]
    G -->|Yes| I[Create FormData]
    
    I --> J[Add Authentication Header]
    J --> K[Send to Upload Endpoint]
    K --> L[Multer Processes File]
    L --> M[Save to uploads/ folder]
    M --> N[Generate Unique Filename]
    N --> O[Save File Path to Database]
    O --> P[Return Success Response]
    P --> Q[Update UI with File Preview]
```

---

## 📧 10. Email Notification Flow

```mermaid
graph TD
    A[System Event Triggered] --> B{Event Type}
    
    B -->|User Signup| C[Send Welcome Email]
    B -->|Email Verification| D[Send Verification Email]
    B -->|Application Submitted| E[Send Application Confirmation]
    B -->|Application Approved| F[Send Approval Email]
    B -->|Application Rejected| G[Send Rejection Email]
    B -->|Booking Created| H[Send Booking Notification]
    B -->|Booking Confirmed| I[Send Confirmation Email]
    
    C --> J[Email Service]
    D --> J
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> K[Configure Email Template]
    K --> L[Add User Data]
    L --> M[Send via Nodemailer]
    M --> N[Email Delivered]
    N --> O[User Receives Notification]
```

---

## 🎯 11. Complete Booking Process Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant B as Backend
    participant D as Database
    participant Co as Companion
    participant A as Admin
    
    C->>F: Browse Companions
    F->>B: GET /api/companion/browse
    B->>D: Query approved companions
    D-->>B: Return companion data
    B-->>F: Return companions list
    F-->>C: Display companions
    
    C->>F: Click "Book Now"
    F->>C: Open booking modal
    
    C->>F: Select date & time
    F->>B: GET /api/booking/availability/:id/slots
    B->>D: Check availability
    D-->>B: Return available slots
    B-->>F: Return time slots
    F-->>C: Show available times
    
    C->>F: Fill booking form
    F->>B: POST /api/booking/create
    B->>D: Check for conflicts
    D-->>B: No conflicts found
    B->>D: Create booking record
    D-->>B: Booking created
    B-->>F: Booking created successfully
    F-->>C: Show success message
    
    B->>Co: Notify companion (email)
    Co->>F: Check companion dashboard
    F->>B: GET /api/booking/my-bookings
    B->>D: Query companion bookings
    D-->>B: Return bookings
    B-->>F: Return bookings list
    F-->>Co: Show booking request
    
    Co->>F: Accept/Decline booking
    F->>B: PUT /api/booking/:id/status
    B->>D: Update booking status
    D-->>B: Status updated
    B-->>F: Status updated
    F-->>Co: Show updated status
    
    B->>C: Notify client (email)
    C->>F: Check booking status
    F->>B: GET /api/booking/my-bookings
    B->>D: Query client bookings
    D-->>B: Return bookings
    B-->>F: Return bookings list
    F-->>C: Show booking status
```

---

## 📊 12. System Status Flow

```mermaid
graph TD
    A[System Startup] --> B[Check Database Connection]
    B --> C{Database Connected?}
    C -->|No| D[Show Connection Error]
    C -->|Yes| E[Initialize Database Schema]
    
    E --> F[Create Tables if Not Exist]
    F --> G[Check for Admin User]
    G --> H{Admin Exists?}
    H -->|No| I[Create Default Admin]
    H -->|Yes| J[System Ready]
    
    I --> J
    J --> K[Start Express Server]
    K --> L[Listen on Port 5000]
    L --> M[API Endpoints Available]
    M --> N[Frontend Can Connect]
    
    N --> O[User Authentication]
    O --> P[Role-based Access]
    P --> Q[Feature Access Control]
    Q --> R[Database Operations]
    R --> S[File Uploads]
    S --> T[Email Notifications]
```

---

## 🎨 13. UI Component Hierarchy

```mermaid
graph TD
    A[App.tsx] --> B[AuthProvider]
    B --> C[Router]
    C --> D[MainLayout]
    
    D --> E[Navbar]
    D --> F[Main Content]
    D --> G[Footer]
    
    E --> H[Logo]
    E --> I[Navigation Links]
    E --> J[User Menu]
    
    F --> K[Home Page]
    F --> L[Browse Companions]
    F --> M[Client Dashboard]
    F --> N[Companion Dashboard]
    F --> O[Admin Dashboard]
    
    L --> P[Companion Cards]
    P --> Q[Booking Modal]
    Q --> R[Booking Form]
    R --> S[Calendar Component]
    R --> T[TimeSlotPicker]
    
    N --> U[Overview Tab]
    N --> V[Availability Tab]
    N --> W[Bookings Tab]
    
    V --> X[AvailabilityManager]
    X --> Y[Day Schedule]
    Y --> Z[Time Slots]
    
    W --> AA[BookingsManager]
    AA --> BB[Booking Cards]
    BB --> CC[Status Actions]
```

---

## 🔧 14. Error Handling Flow

```mermaid
graph TD
    A[User Action] --> B[Frontend Request]
    B --> C[API Call]
    C --> D{Request Success?}
    
    D -->|Yes| E[Process Response]
    D -->|No| F[Check Error Type]
    
    F --> G{Error Type}
    G -->|Network Error| H[Show Connection Error]
    G -->|401 Unauthorized| I[Redirect to Login]
    G -->|403 Forbidden| J[Show Access Denied]
    G -->|404 Not Found| K[Show Not Found]
    G -->|500 Server Error| L[Show Server Error]
    G -->|Validation Error| M[Show Field Errors]
    
    H --> N[Retry Option]
    I --> O[Clear Auth Token]
    J --> P[Contact Admin]
    K --> Q[Go to Home]
    L --> R[Report Bug]
    M --> S[Fix Form Data]
    
    E --> T[Update UI]
    T --> U[Show Success Message]
```

---

## 📈 15. Data Flow Summary

```mermaid
graph LR
    A[User Interface] --> B[React Components]
    B --> C[API Calls]
    C --> D[Express Routes]
    D --> E[Controllers]
    E --> F[Database Queries]
    F --> G[MySQL Database]
    G --> H[Data Processing]
    H --> I[JSON Response]
    I --> J[State Updates]
    J --> K[UI Re-render]
    K --> A
    
    L[File Uploads] --> M[Multer Middleware]
    M --> N[File Storage]
    N --> O[Database Path]
    
    P[Email Events] --> Q[Email Service]
    Q --> R[Nodemailer]
    R --> S[SMTP Server]
    S --> T[User Inbox]
```

---

These flow diagrams provide a comprehensive visual representation of how the MeetGo platform works, from user interactions to system processes. Each diagram shows the step-by-step flow of different aspects of the platform, making it easy to understand the complete system architecture and user journeys.
