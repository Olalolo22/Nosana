# Multi-stage build for Nosana Agents 102 Challenge
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY mcp-server/package.json ./mcp-server/
COPY agent/package.json ./agent/

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Build MCP server
WORKDIR /app/mcp-server
COPY mcp-server/package.json ./
RUN npm ci
COPY mcp-server/ ./
RUN npm run build

# Build Agent
WORKDIR /app/agent
COPY agent/package.json ./
RUN npm ci
COPY agent/ ./
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy MCP server
COPY --from=builder --chown=nextjs:nodejs /app/mcp-server/dist ./mcp-server/dist
COPY --from=builder --chown=nextjs:nodejs /app/mcp-server/node_modules ./mcp-server/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/mcp-server/package.json ./mcp-server/

# Copy Agent
COPY --from=builder --chown=nextjs:nodejs /app/agent/dist ./agent/dist
COPY --from=builder --chown=nextjs:nodejs /app/agent/node_modules ./agent/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/agent/package.json ./agent/

# Copy configuration files
COPY --chown=nextjs:nodejs next.config.js ./
COPY --chown=nextjs:nodejs tailwind.config.js ./
COPY --chown=nextjs:nodejs postcss.config.js ./

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
