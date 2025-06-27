|# 🏁 Bootstrap Playbook – EaglePass (Zero-Assumption Edition)

> Goal: Set up a modern, scalable web app using **React + Vite + TypeScript**, styled with **Tailwind CSS**, powered by **Firebase** (Auth, Firestore, Hosting, Functions), and organized as a **monorepo** using `pnpm`.

---

## ✅ Requirements

| Tool | Purpose | Install Command |
|------|---------|-----------------|
| **Node.js (v20+)** | Runtime for JS/TS | `brew install node@20` (or use nvm: `nvm install 20`) |
| **pnpm** | Fast package manager | `npm install -g pnpm` |
| **Firebase CLI** | Backend setup & local emulators | `npm install -g firebase-tools` |
| **Git** | Version control | `brew install git` (if needed) |

---

## 📦 Sprint 0 – Local & Cloud Setup

### 🗂️ Step 1 – Create Your Project Folder

```bash
mkdir eaglepass && cd eaglepass
```

### 📝 Step 2 – Initialize the Project with pnpm

```bash
pnpm init -y
```

Then, **add workspaces** support by editing your `package.json`:

```json
{
  "private": true,
  "name": "eaglepass",
  "version": "0.1.0",
  "workspaces": [
    "packages/*"
  ]
}
```

---

### 🧱 Step 3 – Scaffold the Web App (Vite + React + TypeScript + SWC)

```bash
pnpm create vite packages/web -- --template react-swc-ts
cd packages/web
pnpm install
```

When prompted:
- Choose **React**
- Choose **SWC + TypeScript**

This creates your frontend app in `packages/web`.

---

### 🔌 Step 4 – Install Core Dependencies (in the web app)

Still inside `packages/web`:

```bash
pnpm add firebase react-router-dom zod @tanstack/react-query
```

These are needed for:
- Firebase Auth & Firestore
- Routing (`react-router-dom`)
- Schema validation (`zod`)
- Async state/data (`react-query`)

---

### 🎨 Step 5 – Set Up Tailwind CSS

Still in `packages/web`:

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm exec tailwindcss init -p
```

This creates:
- `tailwind.config.js`
- `postcss.config.js`

Then update your CSS entry file (usually `src/index.css`):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Make sure this file is imported in `main.tsx`.

---

### 🔥 Step 6 – Initialize Firebase

Back in the project root:

```bash
firebase login
firebase init
```

When prompted:
- ✅ Select: **Firestore**, **Functions**, **Hosting**, **Emulators**
- ✔ Connect to an existing Firebase project *or* create a new one
- ✔ Use **TypeScript** and **ESM** for Functions
- ✔ Set `public` directory to `dist` (for Vite)
- ✔ Enable Hosting rewrites to `index.html`
- ✔ Enable Firestore and Functions emulators

> 🧠 You can change Firebase projects later using:
```bash
firebase use --add
```

Create three environments if needed:
```bash
firebase projects:create eaglepass-dev
firebase projects:create eaglepass-stage
firebase projects:create eaglepass-prod
```

---

### 🧪 Step 7 – Verify Local Dev

In one terminal, build your frontend:

```bash
pnpm --filter web dev
```

In another terminal, start Firebase emulators:

```bash
firebase emulators:start
```

This gives you:
- A running Vite app
- Local Firebase (Firestore, Functions) emulator
- No deployment needed yet

---

---

## 🗂️ Sprint 1 Repo Structure & CI
```
/
├─ .github/workflows/dev.yml        # on push → deploy preview channel
├─ firestore.rules                  # locked-down rules (see Sprint 3)
├─ functions/                       # Cloud Functions (Node 20, ESM)
├─ packages/
│   └─ web/                         # Vite React app
│       ├─ src/
│       │   ├─ components/          # (Button, Card, PassStateBadge …)
│       │   ├─ pages/               # StudentHome, TeacherDash, Admin
│       │   ├─ hooks/               # useAuth, usePass …
│       │   └─ lib/                 # firebase.ts, api.ts
│       └─ tailwind.config.ts
└─ package.json (workspace root)
```

* **CI** – drop in a simple GitHub Action:  
  ```yml
  - uses: pnpm/action-setup@v2
  - run: pnpm install
  - run: pnpm --filter web run build
  - run: firebase deploy --only hosting --token ${{ secrets.FB_TOKEN }}
  ```

---

## 💾 Sprint 2 Data Layer & Auth
1. **`firebase.ts`** – initialise SDK with env vars.  
2. **Domain-restricted Google SSO**  
   ```ts
   const provider = new GoogleAuthProvider();
   provider.setCustomParameters({ hd: 'nhcs.net' });
   ```
3. **Zod models** mirroring the Firestore schema in the PRD.  
4. **React Query** for optimistic Firestore writes (`useMutation`).  
5. **Pass Lifecycle Service** – small hook `usePassManager()` that exposes `createPass`, `checkIn`, `returnPass`.

---

## 🔐 Sprint 3 Security & Rules
Firestore **rules stub** (tight-scope MVP):

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function isTeacher()   { return request.auth.token.role in ['teacher','admin']; }
    function isStudent()   { return request.auth.token.role == 'student' &&
                              request.auth.token.sub == resource.data.studentId; }
    match /passes/{passId} {
      allow read, write: if isTeacher() || isStudent();
    }
    match /legs/{passId}/{legId} {
      allow read:  if isTeacher() || isStudent();
      allow write: if isTeacher(); // legs are immutable for students
    }
    // …repeat for students, staff, locations
  }
}
```

*Configure emulator ⇒ `firebase emulators:start` · add Jest test to hit rules with fake tokens.*

---

## 🎨 Sprint 4 UI Skeleton
* Install **shadcn/ui** (`npx shadcn-ui@latest init`) and pull Button, Card, Dialog.
* Pages:
  * **StudentHome** – info card ➜ Pass button ➜ dropdown list ➜ disclaimer.
  * **TeacherDashboard** – realtime grid (listener on `passes` where status == open).
  * **AdminSettings** – sliders for warning/alert thresholds.
* Add **state colours** (`bg-green-500`, `bg-yellow-500`, `bg-red-600`) via Tailwind - map to escalation timer.

---

## 🌐 Sprint 5 Sync & Seed
1. **OneRoster ingest Cloud Function** (`functions/onRosterZip.ts`) – uploads a zip-file, parses CSV → Firestore batch write.
2. **Seed script** – CLI in `scripts/seed.ts` that generates 2 000 mock students (you already have the Google Apps Script version).  
3. **BigQuery Export** – enable in Firebase console → schedule a Data Studio heat-map template.  
4. **Webhook service** – HTTP function `POST /events/escalation` → Slack incoming webhook.

---

## 🎉 Milestone – Clickable MVP
* Auth works for staff & students (domain locked).  
* Student can create / check-in / return pass.  
* Teacher dashboard updates live from emulator.  
* Rules block students from editing others’ passes.  
* Admin can tweak warning/alert minutes in UI → persists in `/settings/global`.

Ship this to a small pilot group at Ashley, gather feedback, then iterate on appointment passes & kiosk hooks.

---

### Quick references
```bash
# Switch Firebase targets
firebase use eaglepass-stage

# Deploy only functions
firebase deploy --only functions

# Serve everything locally (web + emulators)
pnpm --filter web dev & firebase emulators:start
```

---

## Next 👉
* Add **PWA install banner & offline caching** (`vite-plugin-pwa`).  
* Begin **integration tests** with Playwright against the local emulator.  
* Explore **TaskMaster-AI** (from your screenshot) to autogenerate subtasks for new user stories.

Happy bootstrapping! 🔧
