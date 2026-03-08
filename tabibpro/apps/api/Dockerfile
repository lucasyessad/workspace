# ============================================================
# TabibPro — Dockerfile API (NestJS 11)
# Multi-stage : development | builder | production
# ============================================================

ARG NODE_VERSION=22

# ---- Stage base ----
FROM node:${NODE_VERSION}-alpine AS base
RUN npm install -g pnpm@9.14.0
WORKDIR /app

# ---- Stage development (hot-reload) ----
FROM base AS development
# Copier les fichiers de dépendances du monorepo
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db-medical/package.json ./packages/db-medical/
COPY packages/db-service/package.json ./packages/db-service/
RUN pnpm install --frozen-lockfile
COPY . .
WORKDIR /app/apps/api
EXPOSE 3001
CMD ["pnpm", "dev"]

# ---- Stage builder ----
FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db-medical/package.json ./packages/db-medical/
COPY packages/db-service/package.json ./packages/db-service/
RUN pnpm install --frozen-lockfile

# Copier les sources
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY packages/db-medical ./packages/db-medical
COPY packages/db-service ./packages/db-service

# Build packages dans l'ordre
RUN pnpm --filter @tabibpro/shared build
RUN pnpm --filter @tabibpro/db-medical generate
RUN pnpm --filter @tabibpro/db-service generate
RUN pnpm --filter @tabibpro/api build

# ---- Stage production ----
FROM node:${NODE_VERSION}-alpine AS production
RUN npm install -g pnpm@9.14.0
WORKDIR /app

# Copier uniquement ce qui est nécessaire
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/packages/db-medical/generated ./node_modules/@tabibpro/db-medical/generated
COPY --from=builder /app/packages/db-service/generated ./node_modules/@tabibpro/db-service/generated

# Installer uniquement les dépendances de production
RUN pnpm install --prod --frozen-lockfile 2>/dev/null || true

# Utilisateur non-root (sécurité)
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

CMD ["node", "dist/main"]
