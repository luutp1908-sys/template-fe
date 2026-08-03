# Frontend Workspace Context (fe)

## What This Project Is
This folder is an Nx frontend workspace with two apps that consume the same backend API.

- editor: End-user template editor application
- admin: Back-office management app for categories/templates and admin flows

## Tech Stack
- Nx workspace orchestration
- React + Vite apps
- Vitest + Playwright for testing

## Main Commands
Run from this folder.

```bash
yarn install
yarn start:editor
yarn start:admin
```

Build commands:

```bash
yarn build:editor
yarn build:admin
```

## Local App Ports
- admin dev server: http://localhost:5173
- editor dev server: http://localhost:5174

## Backend Integration
The backend is expected at http://localhost:4000 by default.

Environment variables used across apps:

- editor:
  - VITE_API_ORIGIN
  - VITE_API_BASE
  - VITE_APP_API_URL
- admin:
  - VITE_BE_API_BASE
  - VITE_EDITOR_APP_URL
  - VITE_CATEGORY_WORKSPACE_ID

## API Path Convention
Most calls target backend versioned endpoints under /api/v1.

Examples:

- /api/v1/auth/login
- /api/v1/auth/me
- /api/v1/category
- /api/v1/template

## How This Connects To Other Projects
- Depends on be for all core business data and auth.
- Can share auth/session concepts with homepage (both call be auth endpoints).
- homepage is a separate Next.js app and not part of this Nx workspace.

## Quick Mental Model
When FE features fail:

1. Confirm backend is running and reachable at expected base URL.
2. Verify env vars for current app (editor vs admin).
3. Check whether endpoint expects /api/v1 prefix.
4. Inspect auth token/cookie behavior for protected routes.
