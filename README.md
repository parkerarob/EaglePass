# EaglePass

![Backend Tests](https://img.shields.io/badge/backend%20tests-100%25-brightgreen)
![Frontend](https://img.shields.io/badge/frontend-implemented-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)

A modern hall pass management system for schools, built with React 18, TypeScript, Firebase, and Tailwind CSS.

## 🚀 Features

- **Student-focused MVP**: Simple pass creation and return workflow
- **Firebase Integration**: Cloud Functions, Firestore, and Authentication
- **Immutable Event Logging**: Complete audit trail for all pass activities
- **State Machine Logic**: Robust pass state management (IN_CLASS ↔ IN_TRANSIT)
- **Google SSO**: Secure authentication via Firebase Auth
- **Real-time Updates**: Live pass status tracking
- **React Router**: Full SPA navigation with `/dashboard`, `/pass/new`, `/pass/:id`
- **Staff Dashboard**: Monitor active passes (MVP stub)

## 🛠️ Tech Stack

- **Frontend**: React 18.3.1, TypeScript (strict), Vite 6.3.5, React Router 7
- **Styling**: Tailwind CSS 3.4.17, PostCSS
- **Backend**: Firebase Cloud Functions, Firestore
- **Authentication**: Firebase Auth (Google SSO)
- **Testing**: Jest, @firebase/rules-unit-testing, @testing-library/react
- **Build Tools**: Vite, ESLint, Husky

## 📋 Prerequisites

- Node.js 18+
- Firebase CLI
- Git

## 🚀 Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd eaglepass
   npm install
   cd functions && npm install && cd ..
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase configuration
   ```

3. **Run tests**
   ```bash
   npm test                # Backend tests (100% coverage)
   npm run test:frontend   # Frontend component tests
   ```

4. **Start development server**
   ```bash
   npm run dev        # Local development with emulators
   npm run dev:live   # Development against live Blaze project
   ```

## 🌱 Seeding the Blaze Project

To populate the live Firebase project with test data:

1. **Generate a service account key**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file securely (e.g., `dev-sa.json`)

2. **Set up credentials**
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/dev-sa.json
   ```

3. **Run the seed script**
   ```bash
   npm run seed
   ```

This will create:
- Two test users: `alice@example.com` and `bob@example.com` (password: `Test123!`)
- Two active passes linked to these users
- All data will be created in your live Blaze project

**Note:** The seed script is designed to be idempotent - running it multiple times is safe.

## 🧪 Testing

The project uses comprehensive Jest tests that run without emulator dependencies:

```bash
# Run backend tests (Cloud Functions)
npm test

# Run frontend tests (React components)
npm run test:frontend

# Run all tests
npm run test:all

# Type checking
npm run type-check

# Build for production
npm run build
```

**Backend tests validate:**
- Business logic and state machine transitions
- Authentication and authorization
- Data validation and error handling
- Firebase security rules enforcement

**Frontend tests validate:**
- Component rendering and user interactions
- Form validation and error states
- Navigation and routing
- Mocked Firebase service calls

## 📁 Project Structure

```
eaglepass/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components (Dashboard, NewPass, PassDetail)
│   ├── services/          # Firebase service layer (typed wrappers)
│   ├── types/             # TypeScript type definitions
│   └── __tests__/         # Frontend component tests
├── functions/             # Firebase Cloud Functions
│   ├── src/               # Function implementations
│   ├── __tests__/         # Jest test suites (100% coverage)
│   └── scripts/           # Utility scripts
└── docs/                  # Project documentation
    ├── PRD.md            # Product Requirements Document
    ├── Milestones.md     # Development milestones
    └── KNOWN_ISSUES.md   # Current known issues
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run dev:remote` - Start development against live Firebase
- `npm run build` - Build for production
- `npm test` - Run backend tests
- `npm run test:frontend` - Run frontend tests
- `npm run test:all` - Run all tests
- `npm run type-check` - TypeScript type checking
- `npm run lint` - Run ESLint

## 🎯 Current Status (Milestone 3)

✅ **Complete Student UI Flow**
- Dashboard with pass creation and staff view toggle
- New pass form with location selection and validation
- Pass detail page with live status and action buttons
- Declare departure/return functionality

✅ **Typed Firebase Service Layer**
- `createPass(data)` - calls Cloud Function with typed interfaces
- `declareDeparture(passId)` - calls Cloud Function with error handling
- `declareReturn(passId)` - calls Cloud Function with error handling

✅ **Staff Dashboard Stub**
- Active passes list with status badges
- Pass details with timestamps
- View details navigation

✅ **Technical Implementation**
- React Router 7 integration
- Strict TypeScript compliance (zero `any`)
- Error handling and loading states
- Clean production builds

## 📖 Documentation

- [Product Requirements Document](docs/PRD.md)
- [Development Milestones](docs/Milestones.md)
- [Known Issues](docs/KNOWN_ISSUES.md)

## 🤝 Contributing

1. Ensure all tests pass: `npm run test:all`
2. Follow TypeScript strict mode
3. Maintain test coverage
4. Use conventional commit messages

## 📄 License

This project is licensed under the MIT License.
