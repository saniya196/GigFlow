# GigFlow – Smart Leads Dashboard

A production-ready full-stack Lead Management Dashboard built with the MERN stack and TypeScript throughout.

## Tech Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Frontend  | React 18, TypeScript, TailwindCSS, Zustand, React Query |
| Backend   | Node.js, Express, TypeScript, Mongoose                  |
| Database  | MongoDB                                                 |
| Auth      | JWT + bcrypt                                            |
| Container | Docker + Docker Compose                                 |

## Features

- **JWT Authentication** — register, login, protected routes, bcrypt password hashing
- **Full Lead CRUD** — create, read, update, delete with role-based access
- **Advanced Filtering** — status, source, sort, and debounced name/email search (all combinable)
- **Backend Pagination** — `skip`/`limit` with full metadata in every response
- **Role-Based Access Control** — `admin` sees all leads and can export CSV; `sales` sees only their own
- **CSV Export** — admin-only, respects active filters
- **Dark Mode** — persisted via `localStorage`, respects system preference on first load
- **Debounced Search** — 400 ms debounce, no redundant API calls
- **Stats Dashboard** — live lead counts by status and source
- **Centralized Error Handling** — typed AppError, Mongoose errors, Mongo duplicate key, JWT expiry
- **Request Validation** — `express-validator` on every route, `zod` + `react-hook-form` on the frontend
- **Rate Limiting, Helmet, CORS** — security defaults out of the box

## Project Structure

```
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── config/        # env parsing, DB connection
│   │   ├── controllers/   # authController, leadsController
│   │   ├── middleware/     # authenticate, authorize, errorHandler, validation
│   │   ├── models/        # User, Lead (Mongoose schemas)
│   │   ├── routes/        # auth.ts, leads.ts
│   │   ├── types/         # shared TypeScript interfaces
│   │   ├── utils/         # logger, response helpers
│   │   └── index.ts       # Express app entry
│   ├── tests/             # Jest unit tests
│   ├── Dockerfile
│   ├── .env.example
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/      # ProtectedRoute
│   │   │   ├── layout/    # Sidebar, DashboardLayout
│   │   │   ├── leads/     # LeadsTable, LeadForm, LeadFiltersBar, StatsGrid
│   │   │   └── ui/        # Button, Input, Select, Modal, Badge, Pagination, EmptyState
│   │   ├── hooks/         # useLeads, useDebounce
│   │   ├── pages/         # LoginPage, RegisterPage, LeadsPage
│   │   ├── services/      # apiClient, authService, leadsService
│   │   ├── store/         # authStore (Zustand)
│   │   ├── types/         # index.ts — all shared TS types
│   │   └── App.tsx        # Router
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   └── tsconfig.json
├── docker-compose.yml
├── API_DOCS.md
└── README.md
```

## Quick Start — Local Development

### Prerequisites
- Node.js 20+
- MongoDB running locally (or use Docker Compose below)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd smart-leads-dashboard
```

**Backend**
```bash
cd backend
cp .env.example .env     # fill in JWT_SECRET and MONGODB_URI
npm install
npm run dev              # http://localhost:5000
```

**Frontend** (new terminal)
```bash
cd frontend
cp .env.example .env
npm install
npm run dev              # http://localhost:3000
```

### 2. Create the first admin user

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"Admin1234","role":"admin"}'
```

---

## Quick Start — Docker Compose

```bash
cp .env.example .env          # adjust passwords if needed
cp backend/.env.example backend/.env
# Set JWT_SECRET in backend/.env

docker compose up --build
```

- Frontend: http://localhost:3000  
- Backend API: http://localhost:5000  
- MongoDB: localhost:27017

---

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Required | Default       | Description                        |
|-----------------------|----------|---------------|------------------------------------|
| `MONGODB_URI`         | ✅       | —             | MongoDB connection string          |
| `JWT_SECRET`          | ✅       | —             | Secret for signing JWTs            |
| `PORT`                | ❌       | `5000`        | HTTP port                          |
| `JWT_EXPIRES_IN`      | ❌       | `7d`          | Token lifetime                     |
| `BCRYPT_ROUNDS`       | ❌       | `12`          | bcrypt cost factor                 |
| `CORS_ORIGIN`         | ❌       | `http://localhost:3000` | Allowed CORS origin      |
| `NODE_ENV`            | ❌       | `development` | `development` / `production`       |
| `RATE_LIMIT_WINDOW_MS`| ❌       | `900000`      | Rate limit window (ms)             |
| `RATE_LIMIT_MAX`      | ❌       | `100`         | Max requests per window            |

### Frontend (`frontend/.env`)

| Variable       | Required | Default                          | Description         |
|----------------|----------|----------------------------------|---------------------|
| `VITE_API_URL` | ❌       | `http://localhost:5000/api/v1`   | Backend API base URL|

---

## Running Tests

Use these commands from the project root. The frontend install is pinned to `typescript@5.3.3`, so `npm run lint` runs without the ESLint parser warning.

**Backend**

```bash
cd backend
npm test              # runs Jest with coverage
npm run type-check    # TypeScript strict check (no emit)
npm run lint          # ESLint
```

**Frontend**

```bash
cd frontend
npm install
npm run type-check
npm run lint
npm run build
```

**Quick verification flow**

```bash
cd backend
npm test

cd ../frontend
npm run type-check
npm run lint
```

---

## API Reference

See [API_DOCS.md](./API_DOCS.md) for the full endpoint reference including request/response shapes, query parameters, and error codes.

---

## Role-Based Access

| Action                  | Admin | Sales |
|-------------------------|-------|-------|
| View all leads          | ✅    | ❌ (own only) |
| Create lead             | ✅    | ✅    |
| Edit any lead           | ✅    | ❌ (own only) |
| Delete any lead         | ✅    | ❌ (own only) |
| Export CSV              | ✅    | ❌    |
| View stats              | ✅ (all) | ✅ (own) |

---

## TypeScript Conventions

- `any` is banned via ESLint (`@typescript-eslint/no-explicit-any: error`)
- All Mongoose documents are typed with dedicated `IUser` / `ILead` interfaces
- All API request/response shapes are typed end-to-end via shared `types/index.ts` files
- `AuthenticatedRequest` extends Express `Request` to carry `req.user` safely
- Zod schemas mirror backend validation on the frontend for consistent error messages

---

## Git Commit Convention

```
feat: add CSV export for admin users
fix: resolve pagination off-by-one on last page
refactor: extract buildPaginationMeta into util
test: add auth middleware unit tests
chore: update docker compose healthcheck
```

---

## Deployment Checklist

- [ ] Set strong `JWT_SECRET` (32+ random chars)
- [ ] Set `NODE_ENV=production`
- [ ] Set `BCRYPT_ROUNDS=12` (or higher)
- [ ] Point `CORS_ORIGIN` to the actual frontend domain
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS in production (reverse proxy: Nginx / Caddy)
- [ ] Set `VITE_API_URL` to the production backend URL at build time

---

## License

MIT
