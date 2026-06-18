# Talkotopia API

NestJS backend for the Talkotopia LMS MVP.

## Implemented areas

- Authentication with JWT, OTP-style verification, refresh/logout and password reset flows.
- Role-based access for Student, Teacher and Admin.
- Course, section, lesson, media URL, enrollment and review management.
- Redis-backed rate limiting and course cache helpers.
- Orders and MVP payment verification flow that creates enrollments after successful payment.

## Local requirements

- PostgreSQL
- Redis
- Environment variables for database and JWT secrets

Example commands:

```bash
pnpm --filter api start:dev
pnpm --filter api build
pnpm --filter api test -- --runInBand
```

The MVP intentionally stores ready-to-use video URLs and does not run FFmpeg, HLS generation or background video workers.
