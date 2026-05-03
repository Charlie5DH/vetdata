# Deploying VetData to vetdata.com.br

Target: a single Ubuntu droplet at `157.245.131.216` running the full stack
in Docker behind Caddy (auto-HTTPS for `vetdata.com.br` + `www.vetdata.com.br`).

## Architecture

```
Internet (80/443)
       │
       ▼
   ┌───────┐    ┌───────────┐
   │ Caddy │ ──▶│ frontend  │  React SPA (nginx)
   │ TLS   │    └───────────┘
   │       │    ┌───────────┐
   │       │ ──▶│ backend   │  FastAPI + Alembic
   └───────┘    └─────┬─────┘
                      ▼
                ┌───────────┐
                │ Postgres  │  postgres_data volume
                └───────────┘
```

Only Caddy publishes ports to the host (80, 443). Everything else
talks over the internal docker network `vetdata_internal`.

## Prerequisites

- DNS: A records `@` and `www` for `vetdata.com.br` already pointed at
  `157.245.131.216` (you've done this in GoDaddy). Allow up to a few
  hours for propagation if it's fresh — `dig vetdata.com.br +short`
  must return `157.245.131.216` before TLS issuance can succeed.
- SSH access to the droplet as `root` (or another sudoer).
- Docker is **not** installed on the droplet yet.

## 1. Bootstrap the droplet (one-time)

From your laptop:

```bash
# Copy the bootstrap script up
scp scripts/server-bootstrap.sh root@157.245.131.216:/root/

# Run it on the droplet
ssh root@157.245.131.216 'bash /root/server-bootstrap.sh'
```

That installs Docker + the compose plugin, configures UFW (only 22/80/443
open), creates a non-root `vetdata` user, and copies your SSH key so you
can log in as that user.

Verify:

```bash
ssh vetdata@157.245.131.216 'docker --version && docker compose version'
```

## 2. Sync the code

From your laptop, in the project root:

```bash
chmod +x scripts/deploy.sh        # first time only
./scripts/deploy.sh vetdata@157.245.131.216
```

This rsyncs the project to `~/vetdata/` on the droplet, excluding
`.git`, `node_modules`, `.venv`, `__pycache__`, all `.env*` files, etc.

## 3. Configure production secrets on the droplet

SSH in:

```bash
ssh vetdata@157.245.131.216
cd ~/vetdata
```

Create the two production env files from the templates and edit them.
Note: the root file is named `.env` (not `.env.production`) so that
`docker compose` auto-loads it on every command. The backend file keeps
its `.env.production` name because compose loads it explicitly via
`env_file:`.

```bash
cp .env.production.example .env
cp backend/.env.production.example backend/.env.production

# Generate strong values you can paste into the files. Hex for the
# Postgres password keeps it URL-safe inside DATABASE_URL.
echo "POSTGRES_PASSWORD: $(openssl rand -hex 32)"
echo "AUTH_JWT_SECRET:   $(openssl rand -base64 64 | tr -d '\n')"

nano .env
nano backend/.env.production
```

Things to set:

**`.env`** (root)
- `LETSENCRYPT_EMAIL` — your email; Let's Encrypt sends renewal notices here.
- `POSTGRES_PASSWORD` — strong random string.
- `VITE_GOOGLE_OAUTH_CLIENT_ID` — only if you want Google sign-in (also see Google Cloud step below).

**`backend/.env.production`**
- `DATABASE_URL` — paste the same Postgres password you used above:
  `postgresql+asyncpg://vetdata:<PASSWORD>@db:5432/vetdata`
- `AUTH_JWT_SECRET` — strong random string.
- `OPENAI_API_KEY` — leave blank if you don't want chat. **Rotate the
  key that's currently in your local `backend/.env`** before reusing it.

> ⚠️ **Google OAuth note:** if you use `GOOGLE_OAUTH_CLIENT_ID`, go to
> Google Cloud Console → Credentials, and add `https://vetdata.com.br`
> to "Authorized JavaScript origins". The current client ID is
> registered for `localhost`, so sign-in will fail in prod until you do.

## 4. Bring up the stack

Still on the droplet, from `~/vetdata`:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

First boot does three things in order:

1. Postgres starts and reaches a healthy state.
2. Backend container runs `init-db.sh`, which retries `alembic upgrade
   head` until the DB is ready, then starts uvicorn.
3. Caddy starts, requests Let's Encrypt certs for `vetdata.com.br` and
   `www.vetdata.com.br`, and starts serving traffic.

Watch the logs for cert issuance:

```bash
docker compose -f docker-compose.prod.yml logs -f caddy
```

You should see lines like `certificate obtained successfully` for both
hostnames.

## 5. Verify

From anywhere:

```bash
curl -I https://vetdata.com.br/
curl    https://vetdata.com.br/api/v1/health
# → {"status":"healthy","service":"veterinary-api"}

curl -I https://www.vetdata.com.br/   # should 301 -> https://vetdata.com.br/
```

Open `https://vetdata.com.br/` in a browser — the SPA should load.
Browser dev tools → Network — XHRs should go to `/api/v1/...` and return 200.

## 6. Updating

For routine code updates from your laptop:

```bash
./scripts/deploy.sh vetdata@157.245.131.216 --up
```

That rsyncs the new code and runs `up -d --build` remotely. Migrations
run automatically on backend container startup via `init-db.sh`.

## Operations cheat sheet

```bash
# All on the droplet, in ~/vetdata:

# View logs
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f backend

# Restart a single service
docker compose -f docker-compose.prod.yml restart backend

# Run a one-off Alembic command
docker compose -f docker-compose.prod.yml exec backend alembic current
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head

# Open a psql shell
docker compose -f docker-compose.prod.yml exec db psql -U vetdata -d vetdata

# Stop everything (data persists in volumes)
docker compose -f docker-compose.prod.yml down

# Backup the database
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U vetdata vetdata | gzip > "vetdata-$(date +%F).sql.gz"
```

## Troubleshooting

**Caddy keeps trying to get a cert.** Make sure DNS has propagated
(`dig vetdata.com.br +short` should be `157.245.131.216`) and that
ports 80/443 are reachable (`curl -I http://vetdata.com.br/`). UFW
should already allow them; double-check with `sudo ufw status`.

**Backend container restarts in a loop with DB errors.** The healthcheck
on the `db` service is `pg_isready`. Check `docker compose logs db` for
auth errors — usually a mismatch between `POSTGRES_PASSWORD` in the
root `.env.production` and the password embedded in `DATABASE_URL` in
`backend/.env.production`.

**Frontend loads but API calls 404.** The SPA was built with
`VITE_API_BASE_URL=/api/v1` baked in. If you changed it after building,
rebuild: `docker compose -f docker-compose.prod.yml build frontend`.

**Mixed-content / CORS errors in browser.** `CORS_ORIGINS` in
`backend/.env.production` must include `https://vetdata.com.br` (and
`https://www.vetdata.com.br` if you want www to call the API directly,
though we redirect www to apex so this is mostly defensive).
