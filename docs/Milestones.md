# EaglePass Milestones

---

## ✅ Milestone 0 — Stable Scaffold

- React 18.3.1
- Vite 6.3.5
- Tailwind 3.4.17
- TypeScript Strict Mode Enabled
- PostCSS wired and functioning
- Clean Vite build
- Cursor locked for next scaffold stage

---

## ✅ Milestone 1 — Firebase Scaffold

- Scaffold `/functions/` directory with Cloud Functions skeleton:
    - createPass
    - declareDeparture
    - declareReturn
- Scaffold `src/types/` with TypeScript models (from PRD):
    - passes
    - eventLogs
- Scaffold `src/services/` with reusable Firebase SDK service layer
- Scaffold `src/components/` (reusable shell)
- Scaffold `src/pages/` with placeholder pages:
    - SelectDestinationPage
    - DeclareDeparturePage
    - DeclareReturnPage
- Configure Firebase Auth (Google SSO)
- Setup Firebase Emulator Suite (Auth, Firestore, Functions)
- Scaffold initial Jest and rules-unit-testing configs
- Confirm clean build & local dev

---

## ✅ Milestone 2 — Functional Cloud Implementation

- Fully implement Cloud Functions:
    - createPass
    - declareDeparture
    - declareReturn

- Implement Firestore writes for passes and eventLogs per PRD data models.

- Implement full state machine logic:
    - Status: OPEN → CLOSED
    - State: IN_CLASS → IN_TRANSIT → IN_CLASS

- Implement immutable event logging into eventLogs on every transition.

- Ensure all write operations are performed inside Cloud Functions (strict write model).

- Wire frontend pages to functional Cloud Functions via HTTPS Callable Functions.

- Wire Firebase Auth (Google SSO) fully into login flow.

- Implement basic error handling and type safety throughout.

- DO NOT build full teacher/admin functionality yet — student-only MVP.

- DO NOT add unscoped features not defined in PRD or core.rules.

- All Cloud Functions and security rules are covered by Jest + @firebase/rules-unit-testing (emulator optional).

---

## 🚀 Milestone 3 — Front-end MVP & Component Testing

### Acceptance Criteria

**Routing & Navigation**
- ✅ React Router v7 integration with routes: `/dashboard`, `/pass/new`, `/pass/:id`
- ✅ Navigation header with user info and sign-out functionality
- ✅ Proper route protection and redirects

**Student UI Flow**
- ✅ Dashboard with "Create New Pass" and "Staff View" toggle
- ✅ NewPassPage with form validation and location selection
- ✅ PassDetailPage with live status and action buttons (Declare Departure/Return)
- ✅ Error handling and loading states throughout

**Staff Dashboard Stub**
- ✅ Staff view toggle showing active passes list
- ✅ Pass details with status badges and timestamps
- ✅ View details links to individual pass pages

**Typed Firebase Service Layer**
- ✅ `createPass(data)` - calls Cloud Function with typed interfaces
- ✅ `declareDeparture(passId)` - calls Cloud Function with error handling
- ✅ `declareReturn(passId)` - calls Cloud Function with error handling
- ✅ All service functions use strict TypeScript types

**Component Testing**
- ✅ Jest + @testing-library/react test suite for all pages
- ✅ Mocked Firebase calls (no network requests in tests)
- ✅ Form validation, user interactions, and error states tested
- ✅ Target ≥80% statement coverage on `src/` directory

**Technical Requirements**
- ✅ Strict TypeScript compliance (zero `any` types)
- ✅ All existing backend tests continue to pass
- ✅ CI workflow remains green (`npm ci`, `npm run type-check`, `npm test`)
- ✅ Clean production build (`npm run build`)

**Documentation**
- ✅ Updated coverage badge reflecting combined front-end + back-end coverage
- ✅ Milestone 2 marked as "Done" in this document
- ✅ No emulator dependencies introduced

### Deliverables

- Student UI flow: create pass → live status → declare departure → declare return
- Staff dashboard stub listing active passes
- Comprehensive component test suite with mocked Firebase calls
- Updated documentation and coverage reporting
- All repo invariants maintained (green CI, no emulator scripts)

