# syntax=docker/dockerfile:1

# ---- build: compile the Angular app with the production configuration ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci --ignore-scripts
COPY . .
# Optional build-time sdk-config values; prefer runtime SDK_* variables (see docs/configuration.md)
RUN npm run prod-build-angularsdk

# ---- runtime: static files behind nginx, sdk-config.json generated from SDK_* env vars at start ----
FROM nginxinc/nginx-unprivileged:alpine AS runtime
USER root
RUN apk add --no-cache nodejs
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html
COPY --chown=101:101 scripts/configure-sdk.js /opt/sdk/scripts/configure-sdk.js
COPY --chown=101:101 scripts/lib /opt/sdk/scripts/lib
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --chmod=755 docker/entrypoint.sh /docker-entrypoint.d/40-sdk-config.sh
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1
