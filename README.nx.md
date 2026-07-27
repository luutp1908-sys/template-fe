This folder contains an Nx workspace for the frontend apps.

Workspaces:
- `editor` — the existing frontend app (rooted at `.` inside this workspace)
- `admin` — a new React+Vite admin app (scaffolded at `apps/admin`)

Quick commands (run inside `fe/`):

```bash
# install deps
yarn install

# serve editor
yarn start:editor

# serve admin
yarn start:admin

# build both
yarn build:editor
yarn build:admin
```
