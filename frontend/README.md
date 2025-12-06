## Frontend (builder + runtime)

### Prereqs
- Node.js 20+ (LTS)

### Install
```bash
cd frontend
npm install
```

### Dev servers
- Builder: `npm run dev -w apps/builder`
- Runtime: `npm run dev -w apps/runtime`

### Build
```bash
npm run build -ws
```

### Notes
- Shared types live in `frontend/packages/schema`.
- Mocks are reused between builder/runtime for consistency.
- Lockfile (`frontend/package-lock.json`) is tracked for deterministic installs.

