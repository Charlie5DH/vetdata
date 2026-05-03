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
- `AUTH_JWT_SECRET=change_me_to_a_long_random_string`
- `AUTH_JWT_ACCESS_TTL_MINUTES=15`
- `AUTH_JWT_REFRESH_TTL_DAYS=30`
- `GOOGLE_OAUTH_CLIENT_ID=` (optional)

The backend issues its own JWT tokens; `AUTH_JWT_SECRET` must be set before the backend can start. Every API route is protected except `/api/v1/health` and `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/google`.

Recommended local setup:

```bash
# Backend auth settings
set AUTH_JWT_SECRET=change_me_to_a_long_random_string
set GOOGLE_OAUTH_CLIENT_ID=

# Frontend env
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
