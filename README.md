# EaglePass

A real-time digital hall pass system for schools, built with React (Vite) on the frontend and Firebase (Firestore, Auth, Functions/Express) on the backend.

## Current State

- **Milestone:** milestone-0-stable
- **Branch:** my-fresh-start
- **Repo:** Clean, with only essential files retained.

## Tech Stack

- **Frontend:** React 18, Vite 6.3.5, Tailwind 3.4.17, TypeScript (strict mode)
- **Backend:** Firebase Functions (Express), Firestore, Firebase Auth
- **Testing:** Jest, Supertest (backend), React Testing Library (frontend)

## Getting Started

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd EaglePass
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd functions && npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - Add your Firebase configuration (see `.env.example`).

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Run backend tests:**
   ```bash
   cd functions && npm test
   ```

## Project Structure

- `src/` - Frontend React app
- `functions/` - Backend Express API
- `docs/` - Project documentation
- `scripts/` - Utility scripts

## Contributing

- Follow the PRD process for new features.
- Ensure all business logic is in the backend.
- Write tests for all new functionality.

## License

[MIT](LICENSE)
