CI overview

This repo runs two GitHub Actions jobs:
- test: installs npm dependencies and runs `npm run build`
- container: builds the Docker image, runs the container, and hits `/` for a smoke test

Tests (files and intent):
- No unit tests configured; the build verifies Vite compiles the frontend bundle.
