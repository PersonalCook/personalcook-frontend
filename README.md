# personalcook-frontend

Frontend web application for PersonalCook, built with React and Vite.

## Overview
The frontend provides the user interface for authentication, recipe browsing/creation, social features (likes, follows, comments, saves), and shopping cart management.

## Architecture
- React SPA (Vite) with React Router.
- Axios-based API clients for backend services.
- Tailwind CSS for styling.
- Static build served by Nginx in production.

## Local dev
1. npm install
2. npm run dev
3. Open http://localhost:5173

## Configuration
Environment variables (Vite uses `VITE_` prefix):
- `VITE_API_USER_URL` (default `http://localhost:8000/`)
- `VITE_API_RECIPE_URL` (default `http://localhost:8001`)
- `VITE_API_SEARCH_URL` (default `http://localhost:8003`)
- `VITE_API_SOCIAL_URL` (default `http://localhost:8002`)
- `VITE_API_SHOPPING_URL` (default `http://localhost:8004`)
- `VITE_USE_MOCK_API` (optional flag for mock data)

If your backend runs on different ports, set these to match.

## Dependencies
Backend services expected by default:
- user service: http://localhost:8000
- recipe service: http://localhost:8001
- search service: http://localhost:8002
- social service: http://localhost:8003
- shopping service: http://localhost:8004

## Build and preview
- Build: `npm run build`
- Preview build: `npm run preview`
- Lint: `npm run lint`

## Docker
This repo ships a Dockerfile and docker-compose for production-like serving via Nginx.

- Build args are used to inject API base URLs:
  - `VITE_API_USER_URL`, `VITE_API_RECIPE_URL`, `VITE_API_SEARCH_URL`,
    `VITE_API_SOCIAL_URL`, `VITE_API_SHOPPING_URL`, `VITE_USE_MOCK_API`

- Run with compose:
  1. docker network create personalcook-net
  2. docker compose up --build
  3. Open http://localhost:5173

## CI
This repo runs two GitHub Actions jobs:
- test: installs npm dependencies and runs `npm run build`
- container: builds the Docker image, runs the container, and hits `/` for a smoke test

Tests (files and intent):
- No unit tests configured; the build verifies Vite compiles the frontend bundle.

## Deployment
- Docker image and Helm chart are provided for deployment.
- Nginx serves the built static assets.

## Troubleshooting
- API calls failing: verify `VITE_API_*` URLs and backend services.
- CORS errors: ensure backend CORS allows the frontend origin.
- Blank page after build: confirm build env vars were set at build time.
