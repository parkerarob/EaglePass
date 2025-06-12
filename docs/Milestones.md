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

## 🚀 Milestone 1 — Firebase Scaffold

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

## 🚀 Milestone 2 — Functional Cloud Implementation

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

- Pass all Firebase Emulator Suite tests.

