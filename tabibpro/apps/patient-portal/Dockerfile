# ============================================================
# TabibPro — Dockerfile Portail Patient (Next.js 15)
# Multi-stage : development | builder | production
# ============================================================

ARG NODE_VERSION=22

# ---- Stage base ----
FROM node:${NODE_VERSION}-alpine AS base
RUN npm install -g pnpm@9.14.0
WORKDIR /app

# ---- Stage development ----
FROM base AS development
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/patient-portal/package.json ./apps/patient-portal/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile
COPY . .
WORKDIR /app/apps/patient-portal
EXPOSE 3002
CMD ["pnpm", "dev"]

# ---- Stage builder ----
FROM base AS builder
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/patient-portal/package.json ./apps/patient-portal/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

COPY apps/patient-portal ./apps/patient-portal
COPY packages/shared ./packages/shared

RUN pnpm --filter @tabibpro/shared build

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm --filter @tabibpro/patient-portal build

# ---- Stage production ----
FROM node:${NODE_VERSION}-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/apps/patient-portal/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/patient-portal/.next/static ./apps/patient-portal/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/patient-portal/public ./apps/patient-portal/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "apps/patient-portal/server.js"]
