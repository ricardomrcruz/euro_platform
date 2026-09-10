# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/euro-platform-front /usr/share/nginx/html
EXPOSE 80

# Local dev only (see docker-compose.override.yml): runs the Angular dev server against a
# bind-mounted source tree instead of a static build, so editing a file and refreshing the
# browser is enough -- no rebuild step. --poll is required for reliable file-watching across
# the Windows -> Docker Desktop bind-mount boundary; native fs events don't propagate there.
FROM node:20-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
EXPOSE 4200
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--port", "4200", "--poll", "1000", "--proxy-config", "proxy.conf.json"]
