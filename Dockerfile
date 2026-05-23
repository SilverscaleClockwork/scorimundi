# --- Stage 1: Build Everything ---
FROM oven/bun:1 AS builder
WORKDIR /app

# Copy all package files to leverage bun workspaces and caching
COPY package*.json ./
COPY api/package*.json ./api/

# Install all dependencies
RUN bun install

# Copy the rest of the source code
COPY . .

# Build the Astro frontend
# Astro will now find 'hono/client' in the hoisted node_modules
RUN bun run build

# --- Stage 2: Production Runner ---
FROM oven/bun:1 AS runner
WORKDIR /app

# Copy the built Astro static files
COPY --from=builder /app/dist ./dist

# Copy the Hono backend source (runs directly with Bun)
COPY --from=builder /app/api ./api

# Install only production dependencies for the API
WORKDIR /app/api
RUN bun install --production

# Expose the unified port
EXPOSE 3000

# Production environment variables
ENV PORT=3000
ENV NODE_ENV=production
ENV JWT_SECRET=ash-and-fire-default-secret-change-me-in-production
ENV DATABASE_URL=file:local.db
ENV DATABASE_AUTH_TOKEN=

# Start the unified server using Bun, running migrations and seeding first
CMD ["sh", "-c", "bun run db:migrate && bun run db:seed && bun run start"]
