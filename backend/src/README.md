# Backend Source Architecture

This `src` tree mirrors the clean TypeScript backend structure defined in `ARCHITECTURE.md`.

The runnable backend is now the Fastify entrypoint in `src/app.ts`. The domain folders remain available for the longer-term Prisma-backed architecture, but production traffic currently starts from `src/index.ts`.
