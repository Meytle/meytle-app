# 🎯 Meytle - Social Companion Platform

A modern web application connecting clients with verified social companions for various activities.

---

## 📚 Quick Links

- [Setup Instructions](#setup)
- [Admin Dashboard Guide](#admin-dashboard)
- [Project Structure](#project-structure)
- [Features](#features)

---

## 🚀 Setup

### **Prerequisites**
- Node.js (v18+)
- MySQL (v8+)
- npm or yarn

### **Installation**

1. **Clone repository**
```bash
git clone <repository-url>
cd meytle
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=meytle_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret_here
PORT=5000
NODE_ENV=development
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Start Application**

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run dev
```

---

## 👑 Admin Dashboard

### **Create Admin User**
```bash
cd backend
node utils/scripts/setup-admin.js
```

**Default Admin Credentials:**
- Email: `admin@meytle.com`
- Password: `admin123`

### **Admin Features**
- View dashboard statistics
- Review companion applications
- Approve/reject applications
- Manage users
- View earnings reports

### **Access Admin Panel**
1. Login with admin credentials
2. Navigate to `/admin-dashboard`
3. Review pending applications in "Applications" tab

---

## 📁 Project Structure

```
meytle/
├── backend/                    # Node.js/Express backend
│   ├── config/                # Database & app configuration
│   ├── controllers/           # Business logic handlers
│   ├── middleware/            # Auth & validation middleware
│   ├── routes/                # API endpoint definitions
│   ├── services/              # External service integrations
│   ├── utils/                 # Utility functions
│   │   └── scripts/           # Utility scripts
│   │       ├── setup-admin.js # Create admin & test data
│   │       └── test-email.js  # Email configuration tester
│   ├── uploads/               # File upload storage
│   │   ├── profiles/          # Profile photos
│   │   └── documents/         # Government IDs
│   └── server.js              # Application entry point
│
├── frontend/                   # React/TypeScript frontend
│   ├── src/
│   │   ├── api/               # API client modules
│   │   ├── components/        # Reusable React components
│   │   │   ├── common/        # Shared UI components
│   │   │   └── companion/     # Companion-specific components
│   │   ├── contexts/          # React contexts (Auth)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── routes/            # React Router configuration
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Utility functions
│   │   └── config/            # App configuration
│   ├── public/                # Static assets
│   └── vite.config.ts         # Vite build configuration
│
├── .gitignore                 # Git ignore rules
├── README.md                  # Project documentation
└── CLAUDE.md                  # AI assistant guidance
```

---

## ✨ Features

### **Dual Role Support**
- Users can be both **Client** and **Companion** simultaneously
- Seamless role switching with dedicated dashboards
- Role-based access control with multiple permissions

### **User Roles**
1. **Client** - Book companions for activities
2. **Companion** - Offer services as a companion  
3. **Admin** - Manage platform and approve companions
4. **Dual Role** - Users can have both client and companion roles

### **Interests & Topics System**
- Companions can select from 12+ predefined interests
- Filter companions by interests (Coffee, Dinner, Movies, Sports, Art, Music, Travel, Shopping, Hiking, Gaming, Beach, Nightlife)
- Interest-based matching for better companion discovery
- Visual interest badges on companion profiles

### **Self-Booking Prevention**
- Users cannot book themselves as companions
- Automatic validation prevents self-booking attempts
- Clear error messages for invalid booking attempts

### **Enhanced UI/UX**
- Consistent design system with centralized theming
- Reusable UI components (Button, Card, Badge, etc.)
- Modern gradient color schemes (purple/pink primary)
- Responsive design with mobile-first approach
- Smooth animations and transitions

### **Authentication**
- JWT-based authentication with dual role support
- Role switching without re-authentication
- Protected routes with role-based access
- Email verification system

### **Companion Application**
- Multi-step application form with progress indicator
- Interest selection during application
- Photo and document upload with drag-and-drop
- Admin review and approval workflow

### **Admin Dashboard**
- Real-time statistics and analytics
- Application management with bulk actions
- User management with role assignments
- Earnings tracking and reports
- Interest management and analytics

---

## 🛠️ Tech Stack

### **Backend**
- Node.js + Express
- MySQL
- JWT Authentication
- Multer (file uploads)
- bcryptjs (password hashing)

### **Frontend**
- React + TypeScript
- React Router DOM
- Tailwind CSS
- Axios
- React Hot Toast

---

## 📊 Database Schema

### **Users Table**
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role ENUM('client', 'companion', 'admin'),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **User Roles Table (Dual Role Support)**
```sql
CREATE TABLE user_roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  role ENUM('client', 'companion', 'admin'),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_role (user_id, role)
);
```

### **Companion Interests Table**
```sql
CREATE TABLE companion_interests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  companion_id INT,
  interest_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (companion_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_companion_interest (companion_id, interest_name)
);
```

### **Companion Applications Table**
```sql
CREATE TABLE companion_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  profile_photo_url VARCHAR(500),
  government_id_url VARCHAR(500),
  date_of_birth DATE,
  government_id_number VARCHAR(100),
  status ENUM('pending', 'approved', 'rejected'),
  rejection_reason TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🔐 API Endpoints

### **Authentication**
- `POST /api/auth/signup` - Register new user (supports multiple roles)
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/switch-role` - Switch active role

### **Companion**
- `POST /api/companion/application` - Submit application (with interests)
- `GET /api/companion/application/status` - Check application status
- `POST /api/companion/profile/photo` - Update profile photo
- `GET /api/companion/browse` - Browse companions (with interest filtering)
- `POST /api/companion/interests` - Save/update companion interests
- `GET /api/companion/interests/:companionId` - Get companion interests

### **Admin (Protected)**
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/applications` - Get applications
- `PUT /api/admin/applications/:id/approve` - Approve application
- `PUT /api/admin/applications/:id/reject` - Reject application
- `GET /api/admin/users` - Get all users
- `DELETE /api/admin/users/:id` - Delete user

---

## 🚀 Running the Application

### **Setup Admin Account**
```bash
cd backend
node utils/scripts/setup-admin.js
```

### **Access URLs**
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API Health: `http://localhost:5000/health`

---

## 📝 Environment Variables

### **Backend (.env)**
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=meytle_db
DB_PORT=3306

# JWT
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## 🐛 Common Issues

### **Database Connection Failed**
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database exists

### **Admin Routes 404**
- Restart backend server
- Verify admin routes are registered in `server.js`

### **File Upload Not Working**
- Check `uploads/` directory exists
- Verify multer configuration
- Check file size limits

---

## 🚦 Development Workflow

1. **Start MySQL server**
2. **Run backend:** `cd backend && npm start`
3. **Run frontend:** `cd frontend && npm run dev`
4. **Create admin:** `cd backend && node utils/scripts/setup-admin.js`
5. **Test features:** Login and test functionality

---

## 📦 Production Deployment

### **Backend**
1. Set `NODE_ENV=production`
2. Use environment variables for secrets
3. Set up proper CORS origins
4. Enable HTTPS
5. Use process manager (PM2)

### **Frontend**
1. Build: `npm run build`
2. Serve static files from `dist/`
3. Configure reverse proxy (nginx)
4. Enable HTTPS

### **Database**
1. Use production credentials
2. Enable SSL connections
3. Regular backups
4. Optimize queries

---

## 👥 User Roles & Permissions

| Feature | Client | Companion | Admin | Dual Role |
|---------|--------|-----------|-------|-----------|
| View Home | ✅ | ✅ | ✅ | ✅ |
| Sign Up/In | ✅ | ✅ | ✅ | ✅ |
| Submit Application | ❌ | ✅ | ❌ | ✅ (as Companion) |
| Browse Companions | ✅ | ❌ | ✅ | ✅ (as Client) |
| Book Companions | ✅ | ❌ | ❌ | ✅ (as Client) |
| Manage Bookings | ❌ | ✅ | ✅ | ✅ (as Companion) |
| Review Applications | ❌ | ❌ | ✅ | ❌ |
| Manage Users | ❌ | ❌ | ✅ | ❌ |
| Edit Profile | ✅ | ✅ | ✅ | ✅ |
| Switch Roles | ❌ | ❌ | ❌ | ✅ |
| Select Interests | ❌ | ✅ | ❌ | ✅ (as Companion) |
| Filter by Interests | ✅ | ❌ | ✅ | ✅ (as Client) |

---

## 📄 License

Private project - All rights reserved

---

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

---

## 📞 Support

For issues or questions:
- Check this README
- Review console logs
- Check network requests
- Verify database state

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Status:** ✅ Production Ready





















