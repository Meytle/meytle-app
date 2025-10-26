# Meytle Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- MySQL 5.7+ installed and running
- Git installed

## Quick Start (Development)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/meytle.git
cd meytle
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Database will auto-initialize on first run
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Create Admin Account
```bash
cd backend
node setup-admin.js
# Creates: admin@meytle.com / admin123
```

### 5. Access Application
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Admin: Login with admin@meytle.com

## Essential Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=meytle_db

# Auth
JWT_SECRET=your-secret-key-min-32-chars

# Development
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Email (Testing Mode)
RESEND_API_KEY=re_test_xxxxx
EMAIL_MODE=testing
TEST_EMAIL_RECIPIENT=test@example.com

# Stripe (Test Keys)
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Frontend (.env) - Optional
```env
# Usually not needed due to proxy
VITE_API_URL=http://localhost:5000
```

## Common Commands

### Backend
```bash
npm start          # Production mode
npm run dev        # Development with auto-reload
npm test          # Run tests
node setup-admin.js # Create admin user
node test-email.js  # Test email config
```

### Frontend
```bash
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # Run linter
```

## Database Management

### Reset Database
```bash
mysql -u root -p
DROP DATABASE IF EXISTS meytle_db;
CREATE DATABASE meytle_db;
# Restart backend - tables auto-create
```

### Backup Database
```bash
mysqldump -u root -p meytle_db > backup.sql
```

### Restore Database
```bash
mysql -u root -p meytle_db < backup.sql
```

## Testing Accounts

### Admin
- Email: admin@meytle.com
- Password: admin123

### Test Client
- Email: client@test.com
- Password: test123

### Test Companion
- Email: companion@test.com
- Password: test123

## Stripe Testing

### Test Cards
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002
- Requires Auth: 4000 0025 0000 3155

### Test Webhook
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:5000/api/stripe/webhook
# Copy webhook secret to .env
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill process
kill -9 [PID]  # Mac/Linux
taskkill /PID [PID] /F  # Windows
```

### Database Connection Failed
1. Check MySQL is running
2. Verify credentials in .env
3. Ensure database exists
4. Check port 3306 is not blocked

### CORS Errors
1. Check FRONTEND_URL in backend .env
2. Ensure no trailing slash
3. Restart backend after changes

### Email Not Sending
1. Check RESEND_API_KEY is valid
2. Set EMAIL_MODE=testing for development
3. Check TEST_EMAIL_RECIPIENT is set

## Project Structure

```
meytle/
├── backend/
│   ├── config/         # Database, multer config
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Auth, admin checks
│   ├── routes/         # API routes
│   ├── services/       # Email, payment services
│   ├── uploads/        # File uploads (gitignored)
│   ├── utils/          # Helper functions
│   └── server.js       # Entry point
│
├── frontend/           # React/TypeScript frontend
│   ├── src/
│   │   ├── api/        # API client modules
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts
│   │   ├── data/       # Static data
│   │   ├── hooks/      # Custom hooks
│   │   ├── pages/      # Page components
│   │   ├── routes/     # Route definitions
│   │   ├── types/      # TypeScript types
│   │   └── utils/      # Utilities
│   └── index.html      # Entry HTML
│
└── docs/
    ├── DEPLOYMENT_GUIDE.md
    ├── QUICK_SETUP.md
    └── PRODUCTION_CHECKLIST.md
```

## API Endpoints

### Authentication
- POST /api/auth/signup
- POST /api/auth/login
- GET /api/auth/profile
- POST /api/auth/verify-email
- DELETE /api/auth/delete-account

### Companion
- POST /api/companion/application
- GET /api/companion/application/status
- GET /api/companion/browse
- PUT /api/companion/availability

### Booking
- POST /api/booking/create
- PUT /api/booking/:id/status
- GET /api/booking/client
- GET /api/booking/companion

### Admin
- GET /api/admin/applications
- PUT /api/admin/application/:id/status
- GET /api/admin/stats

## Development Workflow

### Feature Development
1. Create feature branch
2. Implement backend API
3. Implement frontend
4. Test locally
5. Create pull request

### Before Committing
1. Run linter: `npm run lint`
2. Test build: `npm run build`
3. Check for console errors
4. Verify mobile responsive

## Deployment Checklist
See [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

## Support
- GitHub Issues: [your-repo/issues]
- Documentation: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Email: support@meytle.com