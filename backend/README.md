# Meytle Backend API

Backend API server for the Meytle application with MySQL database integration.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment:**
   
   The application is pre-configured with the following defaults:
   - MySQL Host: `localhost`
   - MySQL User: `root`
   - MySQL Password: `sahil`
   - Database Name: `meytle_db`
   - Server Port: `5000`
   - Frontend URL: `http://localhost:5173`

   To change these defaults, you can set environment variables or create a `.env` file:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sahil
   DB_NAME=meytle_db
   DB_PORT=3306
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:5173
   ```

3. **Make sure MySQL is running:**
   ```bash
   # Windows (if MySQL is installed as a service)
   net start MySQL80
   
   # Or check MySQL status
   mysql -u root -p
   ```

4. **Start the server:**
   ```bash
   # Production mode
   npm start
   
   # Development mode with auto-reload
   npm run dev
   ```

The server will automatically:
- Create the database if it doesn't exist
- Create the users table with proper schema
- Start listening on port 5000

## 📡 API Endpoints

### Authentication

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "client"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client"
    }
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client"
    }
  }
}
```

#### Get Profile (Protected)
```http
GET /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "client",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('client', 'companion') NOT NULL DEFAULT 'client',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

## 🔒 Security Features

- **Password Hashing:** bcryptjs with salt rounds of 12
- **JWT Authentication:** Secure token-based authentication
- **CORS Protection:** Configured for frontend origin
- **SQL Injection Protection:** Parameterized queries
- **Input Validation:** Server-side validation for all inputs

## 📁 Project Structure

```
backend/
├── config/
│   ├── config.js          # Application configuration
│   └── database.js        # Database connection and setup
├── controllers/
│   └── authController.js  # Authentication logic
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── routes/
│   └── authRoutes.js      # Authentication routes
├── package.json
├── server.js              # Main server file
└── README.md
```

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL 2 (with promise support)
- **Authentication:** JSON Web Tokens (JWT)
- **Password Hashing:** bcryptjs
- **CORS:** cors
- **Environment Variables:** dotenv

## 🔍 Testing

You can test the API using tools like:
- Postman
- Thunder Client (VS Code extension)
- cURL
- Or directly from your React frontend

### Example cURL commands:

```bash
# Sign Up
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"client"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get Profile (replace TOKEN with actual JWT)
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Verify credentials in configuration
- Check if the database user has proper permissions

### Port Already in Use
- Change the PORT in configuration
- Kill the process using port 5000: `netstat -ano | findstr :5000` (Windows)

### CORS Errors
- Verify FRONTEND_URL matches your React app URL
- Ensure the frontend is running on the configured URL

## 📝 License

ISC
