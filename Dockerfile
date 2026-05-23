# --- Stage 1: Build Astro ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app
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
# We set PORT to 3000 to match the EXPOSE and Hono's default
ENV PORT=3000
CMD ["npm", "run", "start"]
