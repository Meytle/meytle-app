# Meet & Go

A modern platform for connecting people with companions for various events and activities.

## 🚀 Features

- User authentication (Sign In/Sign Up)
- Browse companions
- Service discovery
- Responsive design
- Modern UI with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **State Management**: Custom Hooks + Local State
- **Icons**: React Icons, Heroicons
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Type Safety**: 100% TypeScript coverage

## 📦 Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Git

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/meetandgo.git
   cd meetandgo
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   # or
   yarn install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   VITE_API_URL=http://localhost:3000/api
   # Add other environment variables as needed
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   The app will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
frontend/
├── public/                   # Static files
├── src/
│   ├── api/                  # API integration layer
│   │   └── auth.ts          # Authentication API
│   ├── assets/               # Images, fonts, etc.
│   ├── components/           # React components
│   │   ├── common/          # Reusable components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── DashboardNav.tsx
│   │   │   ├── UserProfileCard.tsx
│   │   │   └── index.ts
│   │   ├── MainLayout.tsx
│   │   └── Navbar.tsx
│   ├── constants/            # Application constants
│   │   └── index.ts         # Routes, messages, validation
│   ├── hooks/                # Custom React hooks
│   │   ├── useAuth.ts       # Authentication hook
│   │   ├── useProtectedRoute.ts  # Route protection
│   │   └── index.ts
│   ├── pages/                # Page components
│   │   ├── auth/
│   │   │   ├── SignIn.tsx
│   │   │   └── SignUp.tsx
│   │   ├── ClientDashboard.tsx
│   │   ├── CompanionDashboard.tsx
│   │   └── Home.tsx
│   ├── routes/               # Route configuration
│   │   └── index.tsx
│   ├── types/                # TypeScript definitions
│   │   └── index.ts
│   ├── utils/                # Utility functions
│   │   ├── localStorage.ts  # Type-safe storage
│   │   ├── validation.ts    # Form validation
│   │   └── index.ts
│   ├── App.tsx              # Main App component
│   └── main.tsx             # Entry point
├── ARCHITECTURE.md           # Detailed architecture docs
├── CODE_ORGANIZATION_SUMMARY.md  # Organization summary
└── package.json              # Dependencies and scripts
```

> 📖 For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md)
> 
> 📋 For code organization summary, see [CODE_ORGANIZATION_SUMMARY.md](./CODE_ORGANIZATION_SUMMARY.md)

## 🧪 Testing

Run tests:
```bash
npm test
# or
yarn test
```

## 🧹 Code Quality

### Linting
We use ESLint for code quality. Run linter:

```bash
npm run lint
```

### Type Checking
Full TypeScript type checking:

```bash
npm run build
```

### Code Organization
- Follow the established folder structure
- Use centralized types from `/types`
- Use constants from `/constants`
- Create reusable components in `/components/common`
- Encapsulate logic in custom hooks

### Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase (e.g., `LoadingSpinner`)
- **Hooks**: camelCase with "use" prefix (e.g., `useAuth`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `STORAGE_KEYS`)
- **Types/Interfaces**: PascalCase (e.g., `User`, `AuthResponse`)

## 📚 Key Features & Architecture

### ✨ Well-Organized Codebase
- **Type Safety**: 100% TypeScript with strict typing
- **DRY Principle**: No code duplication
- **Reusable Components**: Shared UI components
- **Custom Hooks**: Encapsulated business logic
- **Constants**: No magic strings
- **Utilities**: Helper functions for common operations

### 🔐 Authentication
- Secure JWT-based authentication
- Role-based access control (Client/Companion)
- Protected routes with automatic redirects
- Custom `useAuth` hook for auth state

### 🎨 UI/UX
- Modern, responsive design
- Smooth animations and transitions
- Loading states
- Toast notifications
- Consistent styling with Tailwind CSS

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the established code organization patterns
4. Read `ARCHITECTURE.md` for detailed guidelines
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Development Guidelines
- Use existing constants instead of magic strings
- Check for reusable components before creating new ones
- Use custom hooks for business logic
- Document new functions with JSDoc comments
- Maintain type safety (no `any` types)
- Follow naming conventions

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
