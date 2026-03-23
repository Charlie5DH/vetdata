# VetData AI Coding Agent Instructions

## Project Overview

VetData is a full-stack veterinary clinic management system for tracking treatment templates and time-series patient monitoring data. The application enables clinicians to:

- Create flexible treatment templates (e.g., anesthesia, blood transfusion)
- Record vital measurements over time during active treatment sessions
- Manage patients, owners, and measurement types dynamically

**Stack:** React 19 + TypeScript + FastAPI + PostgreSQL + Docker

## Architecture & Data Flow

### Core Domain Model (8 Tables)

The system follows a **hierarchical logging pattern** for time-series data collection:

```
Owner → Patient → TreatmentSession → TreatmentLog (rows) → LogValue (cells)
                        ↓                                       ↓
                    Template ←M:N→ Measure ←────────────────────┘
```

**Key Pattern:** `Template` defines which `Measures` to collect. A `TreatmentSession` instantiates a template for a patient. Each `TreatmentLog` represents one timestamp (a row), containing multiple `LogValue` entries (cells) for each configured measure.

**Critical Reading:** See `backend/app/models/` for SQLAlchemy models with computed properties like `Patient.active_sessions` and `Patient.monitored_measures`.

### Frontend Structure

- **State Management:** TanStack React Query (server state) + React Hook Form (form state)
- **API Layer:** Custom hooks in `src/api/` (e.g., `usePatients()`, `useCreateTreatmentSession()`)
- **Component Pattern:** Page components in `src/pages/` with modular sub-components in subdirectories
- **Routing:** React Router with layout wrapper (`PageLayout`) for consistent UI

**Path Alias:** Use `@/*` instead of relative imports (configured in `tsconfig.app.json`).

### Backend Structure

- **Route Organization:** Functional grouping in `routes/` (e.g., `owners_patients.py`, `treatments.py`)
- **Schema Validation:** Pydantic models in `schemas/` for request/response validation
- **Database:** Async SQLAlchemy with `asyncpg` driver
- **API Prefix:** All endpoints under `/api/v1`

## Developer Workflows

### Local Development Setup

```bash
docker-compose up -d              # Start PostgreSQL + FastAPI backend (port 8000)
cd frontend && npm run dev        # Start Vite dev server (port 5173)
```

**Backend auto-reloads** via Uvicorn. **Frontend has HMR** via Vite.

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

**Convention:** Migrations auto-generated from model changes, reviewed before commit.

### Build & Deployment

```bash
cd frontend
npm run build                     # TypeScript check + Vite production bundle
npm run lint                      # ESLint validation
```

**Backend builds** via Docker multi-stage Dockerfile with requirements caching.

### API Documentation

Access auto-generated docs at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project-Specific Conventions

### Database Patterns

1. **UUID Primary Keys:** All tables use UUID for `id` (not auto-increment integers)
2. **Async Context Managers:** Always use `async with get_db() as db:` for session handling
3. **Eager Loading:** Prevent N+1 queries with `selectinload()`:
   ```python
   stmt = select(Patient).options(selectinload(Patient.owner))
   ```
4. **JSONB Flexibility:** `measures.options` stores dynamic select options as JSONB
5. **Cascading Deletes:** Configured at ORM level (e.g., deleting a patient removes sessions)

### Frontend Patterns

1. **React Query Mutations:** Always invalidate related queries after mutations:
   ```typescript
   onSuccess: () => {
     queryClient.invalidateQueries({ queryKey: ["patients"] });
   };
   ```
2. **Form Validation:** React Hook Form + Zod schema (see `src/schemas/*` if exists, or define inline)
3. **Table Components:** Use TanStack Table with `DataTable` wrappers (see `src/components/table/`)
4. **Drag-and-Drop:** dnd-kit for reordering (e.g., template measures by `display_order`)

### TypeScript Conventions

- **Type Definitions:** Centralized in `src/types/index.ts` (Owner, Patient, Template, etc.)
- **API Types:** Match Pydantic schemas from backend (e.g., `CreatePatientRequest`)
- **Strict Mode:** Enabled — no implicit `any`, null checks enforced

### Backend Conventions

1. **Response Models:** Always specify `response_model` in FastAPI routes for OpenAPI accuracy
2. **Status Codes:** Use `status.HTTP_201_CREATED` for POST, `status.HTTP_200_OK` for GET/PUT
3. **Error Handling:** Raise `HTTPException(status_code=404)` for not found, `422` for validation errors
4. **CORS:** Currently wildcard (`*`) for development — restrict in production

## Integration Points

### API Endpoints (Key Routes)

- **Patients:** `POST /api/v1/patients` | `GET /api/v1/patients/{id}` with sessions
- **Treatment Sessions:** `POST /api/v1/sessions` | `PATCH /api/v1/sessions/{id}` (status updates)
- **Treatment Logs:** `POST /api/v1/sessions/{id}/logs` (add time-series entry)

**Pattern:** Always fetch sessions with `selectinload(TreatmentSession.treatment_logs)` to avoid lazy loading errors.

### Frontend-Backend Communication

- **HTTP Client:** Axios instance in `src/lib/api.ts` with base URL `http://localhost:8000`
- **Error Handling:** React Query automatically retries on failure (3x default)
- **Loading States:** Destructure `{ isLoading, error, data }` from query hooks

## Critical Files Reference

| File/Directory                                   | Purpose                                                               |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| `backend/app/models/treatment.py`                | Time-series logging models (TreatmentSession, TreatmentLog, LogValue) |
| `backend/app/routes/treatments.py`               | Treatment session CRUD + log entry endpoints                          |
| `frontend/src/api/treatments.ts`                 | React Query hooks for treatment operations                            |
| `frontend/src/pages/TreatmentSessionDetails.tsx` | Main UI for entering time-series measurements                         |
| `frontend/src/types/index.ts`                    | TypeScript type definitions for all domain objects                    |
| `docker-compose.yml`                             | Service orchestration (PostgreSQL + FastAPI)                          |
| `alembic/versions/`                              | Database migration history                                            |

## Language & Localization

**Primary Language:** Portuguese (pt-BR) for UI strings and documentation. Variable/function names in English.

## Common Gotchas

1. **Measure Value Storage:** All `log_values.value` stored as TEXT for flexibility — convert on read
2. **Template Measures Order:** Use `display_order` in `template_measures` to control column sequence
3. **Async All The Way:** Never mix sync/async DB operations — FastAPI routes must be `async def`
4. **React Query Keys:** Must be arrays, not strings: `['patients', patientId]` not `'patients'`
5. **computed_properties:** SQLAlchemy models have `@computed_field` decorators — these are NOT database columns

## Testing Strategy

**Current Status:** No test framework visible. When implementing:

- **Frontend:** Vitest + React Testing Library
- **Backend:** pytest with test database fixtures
- **E2E:** Playwright or Cypress

## Performance Considerations

- **Eager Load Relationships:** Use `selectinload()` to prevent N+1 queries
- **React Query Caching:** Leverage stale-while-revalidate behavior (default 5min)
- **Index Strategy:** UUID primary keys + foreign keys indexed by default
- **Bundle Size:** Vite code-splitting enabled — lazy load pages if bundle grows

---

**For Questions:** Refer to main `README.md` (Portuguese) for detailed ER diagrams and C4 architecture context.
