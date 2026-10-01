# syntax=docker/dockerfile:1

# Development image, used by docker compose: all dependencies, code mounted.
FROM node:24-alpine AS dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
CMD ["npm", "run", "dev"]

# Production dependencies only.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Final image: no dev dependencies, no tests, non-root numeric UID.
FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public
USER 10001:10001
EXPOSE 3000
CMD ["node", "src/server.js"]
