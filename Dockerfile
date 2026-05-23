# --- Stage 1: Build Everything ---
FROM node:22-alpine AS builder
WORKDIR /app

# Copy all package files to leverage npm workspaces and caching
COPY package*.json ./
COPY api/package*.json ./api/

# Install all dependencies (root + workspaces)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the Hono API
RUN cd api && npm run build

# Build the Astro frontend
# Astro will now find 'hono/client' in the hoisted node_modules
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:22-alpine AS runner
WORKDIR /app

# Copy the built Astro static files
COPY --from=builder /app/dist ./dist

# Copy the built Hono backend
COPY --from=builder /app/api/dist ./api/dist
COPY --from=builder /app/api/package*.json ./api/

# Install only production dependencies for the API
WORKDIR /app/api
RUN npm install --production

# Expose the unified port
EXPOSE 3000

# Production environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV JWT_SECRET=ash-and-fire-default-secret-change-me-in-production
ENV DATABASE_URL=file:local.db
ENV DATABASE_AUTH_TOKEN=

# Start the unified server
CMD ["npm", "run", "start"]
