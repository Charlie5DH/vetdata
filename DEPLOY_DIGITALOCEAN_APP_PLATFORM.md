# Deploy on DigitalOcean App Platform

This repository is now prepared for a single-repo App Platform deployment.

Important: the DigitalOcean "Create App" flow is App Platform, not a Droplet workflow. If you want a VM you manage yourself, use a Droplet and the Docker/Nginx approach instead. This guide is for the GitHub-connected App Platform path.

## 1. Create the monorepo on GitHub

From the project root, create one new GitHub repository and push this workspace to it.

```bash
git remote add origin https://github.com/YOUR_GITHUB_ORG/YOUR_MONOREPO.git
git add .
git commit -m "Create vetdata monorepo"
git push -u origin main
```

The previous nested repository metadata is preserved locally under `.git-archives/` and is ignored by the new root repository.

## 2. Create the app in DigitalOcean

Option A: use the control panel.

1. In DigitalOcean, click Create and choose App Platform.
2. Connect GitHub and select the new monorepo.
3. Select the `main` branch.
4. Import the app spec from `.do/app.yaml`.

Option B: create from the app spec with `doctl`.

```bash
doctl apps create --spec .do/app.yaml
```

Before creating the app, replace `YOUR_GITHUB_ORG/YOUR_MONOREPO` in `.do/app.yaml`.

## 3. Review the detected components

The app spec defines:

1. A managed PostgreSQL database named `vetdata-db`
2. A backend service built from `backend/Dockerfile`
3. A frontend static site built from `frontend/`
4. Ingress rules that route `/api`, `/docs`, `/redoc`, and `/openapi.json` to the backend and everything else to the frontend

The frontend uses `VITE_API_BASE_URL=/api/v1`, so both frontend and API live behind the same public domain.

## 4. Set production environment values

Backend runtime variables:

1. `DATABASE_URL=${vetdata-db.DATABASE_URL}`
2. `CORS_ORIGINS=https://YOUR_APP_DOMAIN`
3. `CLERK_JWKS_URL=https://YOUR_CLERK_DOMAIN/.well-known/jwks.json`
4. `CLERK_ISSUER=https://YOUR_CLERK_DOMAIN`
5. `CLERK_API_URL=https://api.clerk.com/v1`
6. `CLERK_AUTHORIZED_PARTIES=https://YOUR_APP_DOMAIN`
7. `CLERK_SECRET_KEY=...` as a secret
8. `CLERK_WEBHOOK_SECRET=...` as a secret

Frontend build-time variables:

1. `VITE_API_BASE_URL=/api/v1`
2. `VITE_CLERK_PUBLISHABLE_KEY=...`

The backend now normalizes plain Postgres URLs from managed services into the async SQLAlchemy format the app uses, including rewriting `sslmode=require` into the `ssl` query parameter that `asyncpg` expects, so the managed database URL can be passed directly.

## 5. Configure Clerk

Update Clerk to use the App Platform domain.

1. Add the public app URL to Clerk allowed origins.
2. Add the same public app URL to redirect and sign-in/sign-up callback settings.
3. Point the Clerk webhook to `https://YOUR_APP_DOMAIN/api/v1/auth/webhooks/clerk`.
4. Copy the webhook signing secret into `CLERK_WEBHOOK_SECRET`.

## 6. First deploy checks

After the first deployment finishes, verify:

1. Frontend loads on the default App Platform URL
2. `https://YOUR_APP_DOMAIN/api/v1/health` returns healthy
3. `https://YOUR_APP_DOMAIN/docs` loads Swagger
4. Clerk sign-in works end to end
5. Backend migrations completed during startup

## 7. Domain and DNS

After the app is healthy on the default DigitalOcean URL:

1. Add your custom domain in App Platform
2. Update DNS records as instructed by DigitalOcean
3. Replace the placeholder domain values in app environment variables
4. Trigger a redeploy

## Notes

1. App Platform is the correct match for "deploy directly from GitHub".
2. A Droplet is only needed if you want to manage Docker, Nginx, and PostgreSQL yourself.
3. The older Hostinger/VPS files can stay in the repo; they are separate from the App Platform flow.
