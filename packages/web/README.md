# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

# EaglePass Web Application

A modern hall pass management system for schools built with React, TypeScript, and Firebase.

## 🔐 Authentication System

### Features Implemented

- **Google SSO Integration**: Domain-restricted authentication for `@nhcs.net` emails
- **Role-Based Access Control**: Student, Teacher, and Admin roles with appropriate permissions
- **Pending Approval Workflow**: New users require admin approval before accessing the system
- **Real-time User Management**: Admins can approve/reject users and assign roles in real-time
- **Secure Firestore Rules**: Comprehensive security rules enforcing role-based data access

### User Roles

1. **Student**: Can create and manage their own hall passes
2. **Teacher**: Can monitor passes, approve requests, and manage location-based access
3. **Admin**: Full system access including user management and system configuration

### User Status Flow

1. **New User**: Signs in with Google SSO → Account created with "pending" status
2. **Pending**: User sees waiting screen until admin approval
3. **Approved**: User gains access to role-appropriate features
4. **Rejected/Suspended**: User sees appropriate error screen

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase project with Authentication and Firestore enabled
- Google Cloud Console project with OAuth 2.0 configured

### Environment Setup

1. Copy the environment file:
   ```bash
   cp packages/web/env.example packages/web/.env.local
   ```

2. Configure your Firebase settings in `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

### Firebase Configuration

1. **Enable Authentication**:
   - Go to Firebase Console → Authentication → Sign-in method
   - Enable Google provider
   - Add your domain to authorized domains
   - Configure OAuth consent screen with `nhcs.net` domain restriction

2. **Configure Firestore**:
   - Create a Firestore database
   - Deploy the security rules from `firestore.rules`
   - The rules enforce domain restriction and role-based access

3. **Domain Restriction**:
   - In Google Cloud Console, configure OAuth 2.0 client
   - Set authorized domains to include your hosting domain
   - Configure `hd` parameter to restrict to `nhcs.net`

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Firebase emulators (optional)
firebase emulators:start
```

### First Admin Setup

Since all new users start as "pending", you'll need to manually promote the first admin:

1. Sign in with your `@nhcs.net` Google account
2. In Firebase Console, go to Firestore
3. Find your user document in the `users` collection
4. Update the `status` field to `"approved"` and `role` field to `"admin"`
5. Refresh the app - you now have admin access to approve other users

## 📁 Project Structure

```
packages/web/src/
├── lib/
│   ├── firebase.ts          # Firebase configuration
│   └── auth.ts              # Authentication logic and utilities
├── hooks/
│   └── useAuth.ts           # React hook for auth state management
├── components/
│   ├── auth/                # Authentication components
│   │   ├── LoginForm.tsx    # Google SSO login form
│   │   ├── ProtectedRoute.tsx # Route protection wrapper
│   │   ├── UserStatusHandler.tsx # Handles pending/rejected states
│   │   └── index.ts         # Component exports
│   └── admin/               # Admin-only components
│       ├── UserApprovalPanel.tsx # User approval interface
│       └── index.ts         # Component exports
└── App.tsx                  # Main application with role-based routing
```

## 🔒 Security Features

- **Domain Restriction**: Only `@nhcs.net` emails can authenticate
- **Role-Based UI**: Different interfaces for students, teachers, and admins
- **Firestore Security Rules**: Server-side enforcement of all permissions
- **Real-time Updates**: User status changes are reflected immediately
- **Audit Trail**: All user actions are logged for compliance

## 🎯 Next Steps

Task 1 (Authentication) is now complete! The next tasks will build upon this foundation:

- Task 2: Firestore database schema design
- Task 3: Zod validation schemas
- Task 4: Pass lifecycle management
- Task 5: Student dashboard and pass creation UI

## 🧪 Testing

To test the authentication system:

1. Try signing in with a non-`@nhcs.net` email (should be rejected)
2. Sign in with a valid `@nhcs.net` email (should show pending screen)
3. Approve the user as an admin (should gain access)
4. Test role-based access by changing user roles
5. Test the sign-out functionality

## 📝 Notes

- All authentication logic is centralized in `src/lib/auth.ts`
- The `useAuth` hook provides a clean React interface
- Components automatically handle loading and error states
- Real-time listeners ensure immediate updates when user status changes
- The system is designed to be easily extended for additional features
