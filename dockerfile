# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_API_USER_URL
ARG VITE_API_RECIPE_URL
ARG VITE_API_SEARCH_URL
ARG VITE_API_SOCIAL_URL
ARG VITE_API_SHOPPING_URL
ARG VITE_USE_MOCK_API

ENV VITE_API_USER_URL=$VITE_API_USER_URL \
    VITE_API_RECIPE_URL=$VITE_API_RECIPE_URL \
    VITE_API_SEARCH_URL=$VITE_API_SEARCH_URL \
    VITE_API_SOCIAL_URL=$VITE_API_SOCIAL_URL \
    VITE_API_SHOPPING_URL=$VITE_API_SHOPPING_URL \
    VITE_USE_MOCK_API=$VITE_USE_MOCK_API

RUN npm run build

# --- runtime stage ---
FROM nginx:1.27-alpine
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
