# ==========================================
# Multi-Stage Dockerfile for Angular 17+ SSR
# Optimized for Production with Alpine Linux
# ==========================================

# ==========================================
# Stage 1: Build
# Purpose: Install dependencies and build Angular app
# ==========================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci --silent

# Copy source code
COPY . .

# Build the application for production with SSR
RUN npm run build

# ==========================================
# Stage 2: Production Runtime
# Purpose: Minimal runtime image with only built files
# ==========================================
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Create node user and set ownership
RUN chown -R node:node /app

# Switch to non-root user for security
USER node

# Copy package files
COPY --chown=node:node package*.json ./

# Install only production dependencies
# Angular SSR needs some dependencies at runtime (express, @angular/ssr, etc.)
RUN npm ci --production --silent

# Copy built application from builder stage
# Angular 17+ SSR structure: dist/web/browser and dist/web/server
COPY --chown=node:node --from=builder /app/dist ./dist

# Expose port
EXPOSE 4000

# Set environment variables
ENV PORT=4000
ENV NODE_ENV=production

# Allow runtime environment variables
# These can be passed when running the container:
# - API_URL: Backend API URL
# - Any other custom environment variables
ENV API_URL=http://localhost:3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Use dumb-init to properly handle signals
ENTRYPOINT ["dumb-init", "--"]

# Start the SSR server
CMD ["node", "dist/web/server/server.mjs"]
