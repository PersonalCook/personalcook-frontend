# --- build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_API_USER_URL=/api/user
ARG VITE_API_RECIPE_URL=/api/recipe
ARG VITE_API_SEARCH_URL=/api/search
ARG VITE_API_SOCIAL_URL=/api/social
ARG VITE_API_SHOPPING_URL=/api/shopping
ARG VITE_USE_MOCK_API=false

ENV VITE_API_USER_URL=$VITE_API_USER_URL \
    VITE_API_RECIPE_URL=$VITE_API_RECIPE_URL \
    VITE_API_SEARCH_URL=$VITE_API_SEARCH_URL \
    VITE_API_SOCIAL_URL=$VITE_API_SOCIAL_URL \
    VITE_API_SHOPPING_URL=$VITE_API_SHOPPING_URL \
    VITE_USE_MOCK_API=$VITE_USE_MOCK_API

RUN npm run build

# --- runtime stage ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

