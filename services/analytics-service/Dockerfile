# Dockerfile for analytics-service
FROM node:22-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* tsconfig.base.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY services/analytics-service/package.json ./services/analytics-service/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS build
COPY --from=deps /app /app
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/analytics-service ./services/analytics-service
RUN pnpm --filter @loksewa/shared-types build
RUN pnpm --filter @loksewa/shared-utils build
RUN pnpm --filter @loksewa/analytics-service build

# Runtime
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@9
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml* ./
COPY --from=build /app/packages ./packages
COPY --from=build /app/services/analytics-service ./services/analytics-service
RUN pnpm install --prod --frozen-lockfile

EXPOSE 3011
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 CMD node -e "fetch('http://127.0.0.1:3011/healthz').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
USER node
CMD ["node", "services/analytics-service/dist/server.js"]
