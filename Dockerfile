# --- Stage 1: Build Astro ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app

# Build argument for the API URL
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL

# Copy root package files
COPY package*.json ./
RUN npm install
# Copy the source and build
COPY . .
RUN npm run build

# --- Stage 2: Build Hono API ---
FROM node:22-alpine AS backend-builder
WORKDIR /app/api
# Copy API package files
COPY api/package*.json ./
RUN npm install
# Copy API source code
COPY api/ ./
RUN npm run build
# Prune dev dependencies for production
RUN npm prune --production

# --- Stage 3: Production Runner ---
FROM node:22-alpine AS runner
WORKDIR /app

# Copy the built Astro static files from Stage 1
COPY --from=frontend-builder /app/dist ./dist

# Copy the built Hono backend from Stage 2
# We place it in /app/api so relative paths match
COPY --from=backend-builder /app/api/dist ./api/dist
COPY --from=backend-builder /app/api/package*.json ./api/
COPY --from=backend-builder /app/api/node_modules ./api/node_modules

# Expose the single port
EXPOSE 3000

# Start the Hono server
WORKDIR /app/api

# Production defaults
ENV PORT=3000
ENV NODE_ENV=production
ENV JWT_SECRET=ash-and-fire-change-me
ENV DATABASE_URL=file:local.db
ENV DATABASE_AUTH_TOKEN=

CMD ["npm", "run", "start"]
