# syntax=docker/dockerfile:1

FROM node:22-alpine AS backend-deps
WORKDIR /workspace/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS dashboard-deps
WORKDIR /workspace/admin-dashboard
COPY admin-dashboard/package.json admin-dashboard/package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /workspace
COPY --from=backend-deps /workspace/backend/node_modules ./backend/node_modules
COPY --from=dashboard-deps /workspace/admin-dashboard/node_modules ./admin-dashboard/node_modules
COPY backend ./backend
COPY admin-dashboard ./admin-dashboard
RUN cd backend && npm run build
RUN cd admin-dashboard && npm run build
RUN cd backend && npm prune --omit=dev

FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    LOKSEWA_ENV=production \
    HOST=0.0.0.0 \
    PORT=8000 \
    NODE_BACKEND_DB_PATH=/data/node-backend-db.json \
    ADMIN_DIST_PATH=/app/admin-dashboard/dist

WORKDIR /app
RUN addgroup -S loksewa && adduser -S loksewa -G loksewa

COPY --from=build /workspace/backend/package.json ./package.json
COPY --from=build /workspace/backend/package-lock.json ./package-lock.json
COPY --from=build /workspace/backend/node_modules ./node_modules
COPY --from=build /workspace/backend/dist ./dist
COPY --from=build /workspace/backend/prisma ./prisma
COPY --from=build /workspace/admin-dashboard/dist ./admin-dashboard/dist

RUN mkdir -p /data && chown -R loksewa:loksewa /app /data
USER loksewa

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s CMD node -e "fetch('http://127.0.0.1:8000/healthz').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
