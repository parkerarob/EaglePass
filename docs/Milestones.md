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

## 🚧 Milestone 2 — Functional Cloud Scaffold (future)

- Full data writes & reads
- State machine wiring
- Validation rules
- Firestore security rules

