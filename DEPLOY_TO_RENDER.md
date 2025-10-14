# Deploying PersonalFinanceTracker to Render

## Overview
This repository contains two deployable pieces:
- `PFTbackend` — Laravel backend
- `PFTfrontend` — React (Vite) frontend

Below are steps and required adjustments to deploy them separately on Render.com.

---

## Backend (Laravel) — using Docker on Render
1. In Render, create a **Web Service** and choose **Docker**.
2. Point the Dockerfile path to `PFTbackend/Dockerfile`.
3. Set environment variables in Render:
   - `APP_KEY` (generate using `php artisan key:generate --show` locally)
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `FRONTEND_URL` = your frontend URL (e.g. `https://pft-frontend.onrender.com`)
   - Database: either set `DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE` or set `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
   - `JWT_SECRET` (for tymon/jwt-auth)
4. Important file changes already made:
   - `config/cors.php` now reads `FRONTEND_URL` env var (accepts single URL or comma-separated list).
   - `.env.example` updated with notes about `FRONTEND_URL` and Render `DATABASE_URL`.
5. After deploy, run these commands in the Render shell (or use a deploy hook):
   - `composer install --no-dev --optimize-autoloader`
   - `php artisan migrate --force`
   - `php artisan storage:link` (if you use storage)
   - `php artisan jwt:secret` (if needed)
6. If you use MySQL managed service, ensure Render's security group allows connections.

---

## Frontend (React + Vite) — Static site on Render
1. Create a **Static Site** on Render.
2. Set the build command: `npm install && npm run build`.
3. Set the publish directory: `dist` (Vite outputs to `dist` by default).
4. Set environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com` (include protocol)
5. The frontend reads `import.meta.env.VITE_API_URL` in `src/api/api.js`.
6. Optional: update `vite.config.js` `base` if serving from a subpath.

---

## Notes & Recommendations
- Secure secrets in Render dashboard (do not commit `.env`).
- If you want HTTPS between frontend and backend, ensure `APP_URL` and `VITE_API_URL` use `https://`.
- If you encounter CORS errors, verify `FRONTEND_URL` is set correctly in Render and CORS config was updated.

---

Files changed/added in this repo:
- `PFTbackend/config/cors.php` — updated to use env `FRONTEND_URL`
- `PFTbackend/.env.example` — added `FRONTEND_URL` and Render notes
- `render.backend.yaml` and `render.frontend.yaml` — examples

If you'd like, I can:
- Update the backend Dockerfile to optimize for Render (smaller image, set proper user).
- Add a GitHub Action to build and deploy to Render automatically.
- Run `php artisan migrate` locally against a test DB to verify migrations.

