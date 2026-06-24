# 🎨 Talkotopia Frontend Development Plan & To-Do List

**Version:** 1.1
**Stack:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
**UI Library:** shadcn/ui
**Internationalization:** `next-intl` (English `en` & Farsi `fa`)
**State Management:** React Query, Zustand
**Approach:** API-First / Headless (Mock Data -> Backend Integration)

---

## 🛠️ Step 1: Architecture & Anti-Sanction Infrastructure
Before building pages, the foundational frontend architecture must be set up, strictly adhering to the offline/anti-sanction rules.

### Details:
* Initialize the Next.js workspace with Tailwind and TypeScript.
* Install and configure `shadcn/ui` to generate local components.
* **Anti-Sanction Rule:** All external assets must be downloaded and hosted locally in the `public` folder. No CDNs allowed.

### To-Do List:
- [ ] Initialize Next.js 14+ (App Router) in `apps/web`.
- [ ] Configure `tailwind.config.ts` and `shadcn/ui` integration.
- [ ] Download and self-host Persian fonts (e.g., Vazirmatn) and English fonts (e.g., Inter/Geist) in `public/fonts`.
- [ ] Download and configure local icons (e.g., Lucide React bundle).
- [ ] Setup `mockData.ts` and `api.ts` files to simulate backend delays and data.

---

## 🌍 Step 2: Bilingual Support (English & Farsi) Setup
Implementing `next-intl` to handle language switching and dynamic text direction (RTL/LTR).

### Details:
* Move all routes into a dynamic `[locale]` folder (e.g., `app/[locale]/page.tsx`).
* Create JSON dictionary files to store all text translations.
* Configure the root layout to dynamically change the HTML `dir` attribute so Tailwind CSS correctly flips the UI for Farsi.

### To-Do List:
- [ ] Install the `next-intl` package.
- [ ] Create translation dictionaries in the root: `messages/fa.json` and `messages/en.json`.
- [ ] Move all Next.js page routes inside a dynamic `app/[locale]/` directory.
- [ ] Create `middleware.ts` to detect user language and redirect them to the correct route.
- [ ] Create `i18n.ts` configuration file to load the JSON dictionaries.
- [ ] Update `app/[locale]/layout.tsx` to dynamically output `<html lang={locale} dir={locale === 'fa' ? 'rtl' : 'ltr'}>`.
- [ ] Configure Tailwind CSS to support RTL (use logical properties like `ms-4` instead of `ml-4`, or install the `tailwindcss-rtl` plugin).

---

## 🧩 Step 3: Core Reusable UI Components
Build the essential, custom UI pieces that will be reused across multiple pages.

### Details:
* Components must pull text from the `next-intl` dictionaries rather than hardcoding text.
* Integrate a self-hosted Video Player without relying on external CDNs.

### To-Do List:
- [ ] Generate basic shadcn/ui components (Buttons, Inputs, Modals, Tabs, Forms).
- [ ] Create a **Language Switcher Component** (Dropdown to toggle between EN/FA).
- [ ] Create `CourseCard` (Cover image, translated title, instructor name, progress bar).
- [ ] Create `CourseSidebar` (Accordion list of chapters/sessions, locked/watched indicators).
- [ ] Create `VideoPlayer` (Custom styled, self-hosted player with playback controls).

---

## 🌐 Step 4: Public Pages Development
Develop the user-facing pages using mock data and dictionary translations.

### To-Do List:
- [ ] Build **Landing Page** (`/[locale]/`).
- [ ] Build **Course List Page** (`/[locale]/courses`) with filters and pagination.
- [ ] Build **Course Details / Watch Page** (`/[locale]/courses/[slug]`):
  - [ ] Integrate `VideoPlayer` and `CourseSidebar`.
  - [ ] Integrate `Tabs` below the video (Description, Attachments, Comments).
- [ ] Build **Checkout / Cart Page** (`/[locale]/checkout`).
- [ ] Build **Certificate Verification Page** (`/[locale]/certificate/[id]`).

---

## 🔐 Step 5: Authentication Pages
Build the secure entry points for users. 

### To-Do List:
- [ ] Build **Login Page** (`/[locale]/auth/login`).
- [ ] Build **Sign Up / Register Page** (`/[locale]/auth/register`).
- [ ] Build **OTP Verification Page** (`/[locale]/auth/verify`) for 5-digit code entry.
- [ ] Build **Forgot / Reset Password Page**.

---

## 🎛️ Step 6: User Dashboards (Panels)
Develop the specialized, role-based dashboards with full localization.

### To-Do List:
- [ ] **Student Dashboard:**
  - [ ] My Courses (Enrolled courses with progress tracking).
  - [ ] Payment History.
- [ ] **Teacher Dashboard:**
  - [ ] Course Creation / Chapter Management form.
  - [ ] Media Upload Form (Designed to handle large file inputs).
  - [ ] Sales Statistics / Analytics view.
- [ ] **Admin Dashboard:**
  - [ ] Site-wide Financial Reports.
  - [ ] User Management.
  - [ ] Course Management.

---

## 🔗 Step 7: Backend Integration & State Management (The Merge)
This is the final step where the isolated frontend connects to the NestJS backend.

### To-Do List:
- [ ] Setup `Axios` instance with Interceptors (to automatically attach/refresh JWT tokens).
- [ ] Setup `React Query (TanStack Query)` to handle server state, fetching, and caching.
- [ ] Swap out `delay()` mock functions in `api.ts` with real `fetch()` / `axios.get()` calls to the NestJS server.
- [ ] Ensure API requests pass the selected language (`Accept-Language: fa` or `en`) so the NestJS backend knows which language to return for dynamic database content (like Course Titles).