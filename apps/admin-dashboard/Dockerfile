# Dockerfile for admin-dashboard (Vite + React)
FROM node:20-alpine AS base
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Dependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* tsconfig.base.json ./
COPY packages/shared-types/package.json ./packages/shared-types/
COPY apps/admin-dashboard/package.json ./apps/admin-dashboard/
RUN pnpm install --frozen-lockfile || pnpm install

# Build
FROM base AS build
COPY --from=deps /app /app
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/admin-dashboard ./apps/admin-dashboard
RUN pnpm --filter @loksewa/shared-types build
RUN pnpm --filter @loksewa/admin-dashboard build

# Runtime with nginx
FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/apps/admin-dashboard/dist /usr/share/nginx/html
COPY apps/admin-dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget -q --spider http://localhost:5173/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
