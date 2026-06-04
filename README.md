# DevPulse API

> Internal Tech Issue & Feature Tracker — A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

**Live URL:** `https://your-deployment.up.railway.app`

---

## Features

- JWT-based authentication with role-based access control
- Two roles: `contributor` and `maintainer` with distinct permissions
- Full CRUD for issues (bug reports & feature requests)
- Filtering by type and status; sorting by newest/oldest
- No ORMs or query builders — raw SQL with `pg` pool
- TypeScript strict mode throughout

## Tech Stack

| Technology | Version |
|---|---|
| Node.js | 24.x LTS |
| TypeScript | 5.x |
| Express.js | 4.x |
| PostgreSQL | Any (hosted on NeonDB/Supabase) |
| bcrypt | 5.x |
| jsonwebtoken | 9.x |

## Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/devpulse
cd devpulse

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET

# 4. Initialize the database
# Run schema.sql against your PostgreSQL instance:
psql $DATABASE_URL -f schema.sql

# 5. Build and start
npm run build
npm start

# Or for development:
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |

### Issues

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/issues` | Authenticated | Create a new issue |
| GET | `/api/issues` | Public | Get all issues (filterable) |
| GET | `/api/issues/:id` | Public | Get a single issue |
| PATCH | `/api/issues/:id` | Authenticated | Update an issue |
| DELETE | `/api/issues/:id` | Maintainer only | Delete an issue |

**Query params for GET /api/issues:**
- `sort` — `newest` (default) or `oldest`
- `type` — `bug` or `feature_request`
- `status` — `open`, `in_progress`, or `resolved`

**Authorization header format:**
```
Authorization: <JWT_TOKEN>
```

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| name | VARCHAR | Required |
| email | VARCHAR | Required, unique |
| password | VARCHAR | Hashed with bcrypt, never returned |
| role | VARCHAR | `contributor` (default) or `maintainer` |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-refreshed via trigger |

### `issues`
| Column | Type | Notes |
|---|---|---|
| id | SERIAL | Primary key |
| title | VARCHAR(150) | Required, max 150 chars |
| description | TEXT | Required, min 20 chars |
| type | VARCHAR | `bug` or `feature_request` |
| status | VARCHAR | `open` (default), `in_progress`, `resolved` |
| reporter_id | INTEGER | No FK constraint — validated in app |
| created_at | TIMESTAMPTZ | Auto-set |
| updated_at | TIMESTAMPTZ | Auto-refreshed via trigger |

## Project Structure

```
src/
├── config/
│   ├── db.ts           # PostgreSQL pool configuration
│   └── env.ts          # Environment variable loader
├── middleware/
│   ├── authenticate.ts  # JWT verification middleware
│   ├── requireRole.ts   # Role-based access guard
│   └── errorHandler.ts  # Centralized error handler
├── modules/
│   ├── auth/
│   │   ├── auth.types.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   └── auth.routes.ts
│   └── issues/
│       ├── issues.types.ts
│       ├── issues.service.ts
│       ├── issues.controller.ts
│       └── issues.routes.ts
├── utils/
│   ├── response.ts     # Standardized API response helpers
│   ├── jwt.ts          # JWT sign/verify helpers
│   └── query.ts        # Centralized pool.query wrapper
└── index.ts            # App entry point
```
