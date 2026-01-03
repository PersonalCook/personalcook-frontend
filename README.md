# personalcook-frontend

Frontend web application for PersonalCook, built with React and Vite.

---

## Overview
The frontend provides the user interface for authentication, recipe browsing/creation, social features (likes, follows, comments, saves), and shopping cart management.
 
---

## Architecture
- React SPA (Vite) with React Router.
- Axios-based API clients for backend services.
- Tailwind CSS for styling.
- Static production build served by Nginx  
- Kubernetes deployment managed via Helm  
- NGINX Ingress Controller for HTTP routing 

### API routing model

All API requests are made using relative paths, which are routed by the Ingress controller to the correct backend services.

The following API prefixes are used:

- /api/user  
- /api/recipe  
- /api/search  
- /api/social  
- /api/shopping  

---

## Local development

For local development, the frontend is run using the Vite development server.

1. npm install  
2. npm run dev  
3. Open http://localhost:5173  

---

## Configuration

Vite reads environment variables at **build time**.  
Only variables prefixed with `VITE_` are exposed to the frontend application.

### Local development configuration

When running backend services locally, API URLs typically point to localhost with different ports. These values are intended for local development only.

### Production and Kubernetes configuration

In Kubernetes, API URLs are configured as relative paths so that requests are routed through the Ingress controller:

- VITE_API_USER_URL=/api/user  
- VITE_API_RECIPE_URL=/api/recipe  
- VITE_API_SEARCH_URL=/api/search  
- VITE_API_SOCIAL_URL=/api/social  
- VITE_API_SHOPPING_URL=/api/shopping  
- VITE_USE_MOCK_API=false  


---

## Kubernetes and Helm deployment

The frontend is deployed to Kubernetes using a Helm chart.

Key Kubernetes resources include:

- **Deployment**, which runs the Nginx container serving the frontend  
- **Service**, which exposes the frontend internally within the cluster  
- **Ingress**, which routes HTTP requests from the outside world to the frontend and backend services  
- **ConfigMap**, which provides the Nginx configuration including SPA routing fallback  

Ingress routing rules forward the root path to the frontend service and API paths to the corresponding backend microservices.

---

## Dependencies

The frontend depends on the following backend services, which are accessed via the Ingress using relative API paths:

- user service → /api/user  
- recipe service → /api/recipe  
- search service → /api/search  
- social service → /api/social  
- shopping service → /api/shopping 

---

## Docker
This repo ships a Dockerfile and docker-compose for production-like serving via Nginx.

- Build args are used to inject API base URLs:
  - `VITE_API_USER_URL`, `VITE_API_RECIPE_URL`, `VITE_API_SEARCH_URL`,
    `VITE_API_SOCIAL_URL`, `VITE_API_SHOPPING_URL`, `VITE_USE_MOCK_API`

- Run with compose:
  1. docker network create personalcook-net
  2. docker compose up --build
  3. Open http://localhost:5173

---

## CI
This repo runs two GitHub Actions jobs:
- test: installs npm dependencies and runs `npm run build`
- container: builds the Docker image, runs the container, and hits `/` for a smoke test

Tests (files and intent):
- No unit tests configured; the build verifies Vite compiles the frontend bundle.

---

## Troubleshooting
- API calls failing: verify `VITE_API_*` URLs and backend services.
- CORS errors: ensure backend CORS allows the frontend origin.
- Blank page after build: confirm build env vars were set at build time.
