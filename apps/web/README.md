# Talkotopia Web

Next.js frontend for the Talkotopia LMS MVP.

## Implemented MVP screens

- `/` — landing page and featured courses.
- `/courses` — course catalog with basic search/filter UI.
- `/courses/[slug]` — course details, lessons, price and purchase/watch CTA.
- `/auth/login`, `/auth/register`, `/auth/verify`, `/auth/forgot-password` — authentication forms.
- `/student` — student dashboard, enrolled/locked course states and review form.
- `/teacher` — teacher/admin MVP management panel.
- `/watch/[lessonId]` — native HTML5 video player with manual quality switching and download options.

The screens currently use local MVP demo data from `app/lib/mockData.ts`. API wiring should be added after the final backend contract is stable.

## Commands

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web check-types
```
