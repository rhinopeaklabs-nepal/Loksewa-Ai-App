# Backend Source Architecture

This `src` tree mirrors the clean TypeScript backend structure defined in `ARCHITECTURE.md`.

The current runnable backend is still the FastAPI adapter in `backend/app.py`. Keep it in place until the TypeScript services are fully implemented and migrated. This scaffold gives each bounded context its production folder, interfaces, DTOs, controllers, services, repositories, workers, routes, and shared configuration entry points.
