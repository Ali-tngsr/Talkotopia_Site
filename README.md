# Talkotopia LMS

Talkotopia is an MVP learning-management platform for selling and watching pre-recorded language courses.

## MVP scope

The current roadmap focuses on a lightweight VOD product:

- NestJS API for authentication, roles, courses, lessons, enrollments, reviews, orders and MVP payment verification.
- Next.js web app for public course discovery, auth screens, student dashboard, watch page and teacher/admin MVP management screens.
- PostgreSQL for relational data and Redis for OTP/token/rate-limit/cache use cases.
- Manual MP4 quality URLs (`720p` required, `480p`/`1080p` optional) instead of server-side transcoding, FFmpeg workers or HLS in the MVP.
- Simple deployment path with Docker Compose/PaaS rather than self-hosted CI/CD infrastructure.

## Repository layout

```text
apps/api     NestJS backend API
apps/web     Next.js frontend
packages/*   Shared lint and TypeScript configuration
```

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Start local infrastructure:

```bash
docker compose up -d
```

3. Configure environment variables. The API expects at least:

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=talkotopia
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too
```

4. Run development servers:

```bash
pnpm --filter api start:dev
pnpm --filter web dev
```

## Useful checks

```bash
pnpm --filter api build
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web check-types
```

> The legacy API unit specs have been cleaned up to cover the current controller/service contracts with mocks. Prefer adding focused service/controller specs for new API behavior.

## Roadmap documents

- [`LMS_Roadmap.md`](./LMS_Roadmap.md) — canonical MVP roadmap.
- [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) — high-level progress snapshot.
- `PHASE_*_COMPLETION.md` — implementation notes for completed phases.
