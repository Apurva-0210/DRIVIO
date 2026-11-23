# ==============================================================================
# DRIVIO Transit OS - Unified Full-Stack Production Container
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build React Frontend
# ------------------------------------------------------------------------------
FROM node:18-alpine AS web-builder

WORKDIR /app/fleetease-web

# Install frontend dependencies
COPY fleetease-web/package*.json ./
RUN npm ci

# Copy web source and build optimized bundle
COPY fleetease-web/ ./
ENV NODE_ENV=production
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Install Backend Production Dependencies
# ------------------------------------------------------------------------------
FROM node:18-alpine AS backend-deps

WORKDIR /app/fleetease-backend

# Install only production dependencies
COPY fleetease-backend/package*.json ./
RUN npm ci --omit=dev

# ------------------------------------------------------------------------------
# Stage 3: Production Runtime
# ------------------------------------------------------------------------------
FROM node:18-alpine AS runner

WORKDIR /app

# Install curl for container health checks
RUN apk add --no-cache curl

# Copy backend dependencies and source
COPY --from=backend-deps /app/fleetease-backend/node_modules ./fleetease-backend/node_modules
COPY fleetease-backend/ ./fleetease-backend/

# Copy built frontend into the expected static serving path
COPY --from=web-builder /app/fleetease-web/build ./fleetease-web/build

# Set production environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Expose primary application port
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT}/api/v1/health || exit 1

# Start the unified server
CMD ["node", "fleetease-backend/server.js"]
