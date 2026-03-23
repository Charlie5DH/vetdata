# Docker Deployment Guide

## Quick Start

To run the entire stack (PostgreSQL + FastAPI backend) using Docker:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The backend will be available at: **http://localhost:8000**  
API documentation (Swagger): **http://localhost:8000/docs**

## Services

### 1. PostgreSQL Database (`db`)

- **Image**: `postgres:15-alpine`
- **Port**: `5432`
- **Credentials**:
  - User: `postgres`
  - Password: `postgres`
  - Database: `vetdata`
- **Health Check**: Monitors database availability before starting backend

### 2. FastAPI Backend (`backend`)

- **Build**: Uses `backend/Dockerfile`
- **Port**: `8000`
- **Environment**: Automatically configured to connect to `db` service
- **Hot Reload**: Enabled for development (changes reflect immediately)

## Database Migrations

Migrations are managed by Alembic. To apply migrations:

```bash
# If you need to run migrations manually
docker-compose exec backend python -m alembic upgrade head

# Generate a new migration after model changes
docker-compose exec backend python -m alembic revision --autogenerate -m "description"
```

## Development Workflow

```bash
# Start services
docker-compose up -d

# Watch backend logs
docker-compose logs -f backend

# Access the running backend container
docker-compose exec backend bash

# Restart backend service
docker-compose restart backend

# Stop and remove all containers
docker-compose down -v  # -v removes volumes
```

## Environment Variables

The `docker-compose.yml` sets:

- `DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/vetdata`
- `CORS_ORIGINS=http://localhost:5173`
- `CLERK_SECRET_KEY=sk_test_replace_me`
- `CLERK_JWKS_URL=https://example.com/.well-known/jwks.json`
- `CLERK_API_URL=https://api.clerk.com/v1`
- `CLERK_AUTHORIZED_PARTIES=http://localhost:5173`

For a working authentication flow, replace the Clerk placeholders with your real instance values before starting the backend. The backend now protects every API route except `/api/v1/health` and the Clerk provisioning endpoints, so invalid placeholders will let the API boot but authenticated routes will fail as expected.

Recommended local setup:

```bash
# Backend auth settings
set CLERK_SECRET_KEY=sk_test_xxx
set CLERK_JWKS_URL=https://your-clerk-domain/.well-known/jwks.json
set CLERK_ISSUER=https://your-clerk-domain
set CLERK_WEBHOOK_SECRET=whsec_xxx
set CLERK_AUTHORIZED_PARTIES=http://localhost:5173

# Frontend auth settings
cd frontend
copy .env.example .env.local
```

To customize, edit the `docker-compose.yml` file or create a `.env` file.

## Troubleshooting

**Backend can't connect to database:**

- Ensure the `db` service is healthy: `docker-compose ps`
- Check logs: `docker-compose logs db`

**Port already in use:**

- Change the port mapping in `docker-compose.yml`, e.g., `"8001:8000"`

**Database persists between restarts:**

- Data is stored in the `postgres_data` volume
- To reset: `docker-compose down -v` (WARNING: deletes all data)
