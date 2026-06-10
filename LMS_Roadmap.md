# 🗺️ نقشه راه پروژه پلتفرم فروش دوره و کلاس آنلاین (LMS)

> **نسخه:** 1.1 | **تاریخ:** ۱۴۰۴ | **رویکرد:** API-First / Headless

---

## 📋 فهرست مراحل

| فاز | عنوان | تخمین زمان |
|-----|--------|------------|
| 0 | راه‌اندازی و زیرساخت | ۱ هفته |
| 1 | احراز هویت و مدیریت کاربران | ۲ هفته |
| 2 | مدیریت دوره‌ها و محتوا | ۲ هفته |
| **2.5** | **پخش آنلاین و دانلود محتوای ویدیویی** | **۲ هفته** |
| 3 | فروش و درگاه پرداخت | ۲ هفته |
| 4 | زیرساخت کلاس‌های آنلاین | ۲ هفته |
| 5 | بهینه‌سازی، کشینگ و امنیت | ۱ هفته |
| 6 | فرانت‌اند (Next.js) | ۳ هفته |
| 7 | استقرار و پایش (ایران‌محور) | ۱ هفته |

**⏱ جمع کل تخمینی: ۱۶ هفته (حدود ۴ ماه)**

---

## 🔵 فاز 0 — راه‌اندازی پروژه و زیرساخت پایه



### 0.1 انتخاب و تنظیم فریم‌ورک بک‌اند

- [x] انتخاب فریم‌ورک بک‌اند: NestJS (TypeScript) نهایی شد.
- [x] راه‌اندازی Monorepo (پیشنهاد: Turborepo + PNPM) برای مدیریت یکپارچه بک‌اند و فرانت‌اند.
- [x] تنظیم ESLint + Prettier + Husky (pre-commit hooks) برای کل فضای کاری.
- [x] تنظیم Docker و docker-compose برای محیط توسعه محلی.
### 0.2 راه‌اندازی پایگاه‌داده‌ها

- [x] نصب و تنظیم **PostgreSQL** در Docker
  - طراحی اولیه Schema (جداول: users, courses, enrollments, orders, sessions)
  - تنظیم Connection Pooling (pgBouncer یا داخلی NestJS/FastAPI)
- [x] نصب و تنظیم **Redis**
  - تعریف Key Naming Convention (مثال: `cache:courses:page:1`, `session:userId:xxx`)
  - تنظیم `maxmemory-policy` (توصیه: `allkeys-lru` برای کش)
- [ ] راه‌اندازی ابزار Migration: **Alembic** (FastAPI) یا **TypeORM Migrations** (NestJS)

### 0.3 ساختار پروژه و مستندسازی API

- [ ] راه‌اندازی **Swagger / OpenAPI** به‌صورت خودکار
- [ ] تعریف Convention نام‌گذاری Endpoint‌ها (`/api/v1/...`)
- [ ] تنظیم **Environment Variables** با `.env.example` و validation هنگام startup

### 0.4 ابزارهای داخلی (ضروری برای ایران)

- [ ] دانلود و هاست محلی تمام وابستگی‌های فرانت‌اند (فونت‌ها، آیکون‌ها، CSS/JS)
- [ ] راه‌اندازی **Local Docker Registry** برای ذخیره ایمیج‌ها (آمادگی برای قطعی اینترنت)
- [ ] تنظیم **NPM/PyPI mirror** داخلی یا اطمینان از آفلاین بودن بیلد

---

## 🟢 فاز 1 — سیستم احراز هویت و مدیریت کاربران

### 1.1 طراحی مدل کاربری

- [ ] طراحی جدول `users`:
  ```
  id, email, phone, password_hash, full_name, role (student/teacher/admin),
  is_verified, created_at, updated_at
  ```
- [ ] سیستم نقش‌ها و دسترسی‌ها (RBAC):
  - `student`: خرید دوره، ورود به کلاس
  - `teacher`: ایجاد دوره، مدیریت محتوا، اجرای کلاس
  - `admin`: مدیریت کامل سیستم

### 1.2 پیاده‌سازی JWT (Access + Refresh Token)

- [ ] **Access Token**: کوتاه‌مدت (۱۵ دقیقه)، Stateless، شامل: `userId`, `role`, `exp`
- [ ] **Refresh Token**: بلندمدت (۷ روز)، ذخیره‌شده در Redis به‌صورت:
  ```
  Key: refresh:userId:tokenHash
  Value: { deviceInfo, ip, createdAt }
  TTL: 7 days
  ```
- [ ] Middleware بررسی Access Token در هر Request محافظت‌شده
- [ ] Endpoint لغو Token (`POST /auth/logout`) → حذف Refresh Token از Redis
- [ ] مدیریت Token‌های لو رفته: Blacklist در Redis با TTL برابر زمان انقضای Access Token

### 1.3 ثبت‌نام و ورود

- [ ] `POST /auth/register` — ثبت‌نام با ایمیل/شماره تلفن + ارسال کد تأیید
- [ ] `POST /auth/verify-otp` — تأیید OTP (کد از طریق SMS داخلی)
- [ ] `POST /auth/login` — ورود، بازگشت Access + Refresh Token
- [ ] `POST /auth/refresh` — دریافت Access Token جدید با Refresh Token
- [ ] `POST /auth/forgot-password` + `POST /auth/reset-password`

### 1.4 امنیت و Rate Limiting

- [ ] **Rate Limiting** روی Endpoint‌های حساس با Redis:
  ```
  Key: ratelimit:ip:endpoint
  Max: 5 requests / 1 minute (برای OTP و login)
  ```
- [ ] Hash کردن پسورد با **bcrypt** (rounds: 12)
- [ ] جلوگیری از SQL Injection از طریق Parameterized Queries / ORM

---

## 🟡 فاز 2 — مدیریت دوره‌ها و محتوا

### 2.1 طراحی دیتابیس دوره‌ها

- [ ] جدول `courses`:
  ```
  id, title, slug, description, teacher_id, price, discount_price,
  thumbnail, status (draft/published/archived), created_at
  ```
- [ ] جدول `course_sections` (فصل‌ها): `id, course_id, title, order`
- [ ] جدول `lessons` (جلسات):
  ```
  id, section_id, title, order,
  content_type (video/pdf/text),
  storage_key,             -- کلید فایل اصلی در Object Storage
  duration_seconds,
  is_free_preview,
  allow_download,          -- آیا دانلود برای این جلسه مجاز است؟ (bool)
  processing_status (pending/processing/ready/failed),
  created_at
  ```
- [ ] جدول `enrollments`: `id, user_id, course_id, enrolled_at, completed_at`
- [ ] جدول `course_reviews`: `id, user_id, course_id, rating, comment, created_at`

### 2.2 API Endpoint‌های دوره

**عمومی (Public):**
- [ ] `GET /courses` — لیست دوره‌ها با Pagination, Filter, Sort (کش‌شده در Redis)
- [ ] `GET /courses/:slug` — جزئیات دوره (کش‌شده)
- [ ] `GET /courses/:id/reviews` — نظرات

**مدرس (Teacher):**
- [ ] `POST /courses` — ایجاد دوره جدید
- [ ] `PUT /courses/:id` — ویرایش دوره
- [ ] `POST /courses/:id/sections` — افزودن فصل
- [ ] `POST /sections/:id/lessons` — افزودن جلسه
- [ ] `DELETE /lessons/:id`

**دانشجو (Student):**
- [ ] `GET /my/courses` — دوره‌های خریداری‌شده
- [ ] `GET /courses/:id/lessons/:lessonId` — دسترسی به محتوا (بررسی enrollment)
- [ ] `POST /courses/:id/reviews` — ثبت نظر

### 2.3 کشینگ لیست دوره‌ها با Redis

- [ ] Cache دوره‌های پرطرفدار:
  ```
  Key: cache:courses:list:page:1:sort:popular
  TTL: 10 minutes
  ```
- [ ] Invalidation کش هنگام ویرایش یا انتشار دوره
- [ ] استراتژی Cache-Aside Pattern

### 2.4 آپلود فایل و مدیریت رسانه

- [ ] آپلود ویدیو/فایل به **Object Storage داخلی** (Minio یا Arvan Cloud Object Storage)
- [ ] تولید Signed URL با TTL کوتاه برای دسترسی به محتوای محافظت‌شده
- [ ] Validation نوع فایل و حجم (max: 500MB برای ویدیو)

---

## 🟠 فاز 2.5 — پخش آنلاین و دانلود محتوای ویدیویی

### 2.5.1 معماری کلی پردازش و تحویل ویدیو

```
مدرس ویدیو آپلود می‌کند
      ↓
فایل خام در Object Storage ذخیره می‌شود
      ↓
یک Job در صف (Queue) ایجاد می‌شود
      ↓
Worker با FFmpeg ویدیو را به چند کیفیت ترانسکد می‌کند
(360p / 480p / 720p / 1080p)
      ↓
فایل‌های HLS (.m3u8 + .ts chunks) در Object Storage ذخیره می‌شوند
      ↓
وضعیت جلسه: processing_status → ready
      ↓
دانشجو درخواست پخش یا دانلود می‌دهد
      ↓
بک‌اند بررسی Enrollment + تولید Signed URL موقت
      ↓
کاربر فایل را از CDN داخلی دریافت می‌کند (نه مستقیم از بک‌اند)
```

### 2.5.2 طراحی دیتابیس پردازش ویدیو

- [ ] جدول `video_versions` (نسخه‌های مختلف کیفیت):
  ```
  id, lesson_id,
  quality (360p / 480p / 720p / 1080p / original),
  storage_key,         -- مسیر فایل در Object Storage
  file_size_bytes,
  bitrate_kbps,
  hls_manifest_key,    -- مسیر فایل .m3u8
  created_at
  ```
- [ ] جدول `video_processing_jobs` (لاگ صف ترانسکد):
  ```
  id, lesson_id, status (queued/processing/done/failed),
  worker_id, started_at, finished_at, error_message
  ```
- [ ] جدول `lesson_progress` (پیشرفت تماشای دانشجو):
  ```
  id, user_id, lesson_id, watched_seconds, total_seconds,
  is_completed, last_watched_at
  ```
- [ ] جدول `download_tokens` (توکن‌های یکبارمصرف دانلود):
  ```
  id, user_id, lesson_id, token_hash, quality,
  expires_at, used_at, ip_address
  ```
- [ ] جدول `certificates` (گواهینامه تکمیل دوره):
  ```
  id, user_id, course_id, issued_at, certificate_code (unique)
  ```

### 2.5.3 زیرساخت پردازش (FFmpeg + Queue)

- [ ] راه‌اندازی **FFmpeg** روی سرور Worker (یا همان سرور اصلی در مرحله اولیه)
- [ ] راه‌اندازی سیستم صف با **BullMQ** (NestJS) یا **Celery** (FastAPI) — پشتیبان Redis
- [ ] تعریف Job پردازش ویدیو با خروجی ساختاریافته:
  ```
  ورودی: storage_key فایل خام
  خروجی:
    lessons/{id}/360p/index.m3u8  + chunks
    lessons/{id}/720p/index.m3u8  + chunks
    lessons/{id}/1080p/index.m3u8 + chunks
    lessons/{id}/original.mp4     (برای دانلود)
  ```
- [ ] تنظیم **Retry** خودکار برای Job های ناموفق (max: 3 بار با exponential backoff)
- [ ] ارسال Notification به مدرس پس از اتمام پردازش

**دستور نمونه FFmpeg برای HLS 720p:**
```bash
ffmpeg -i input.mp4 \
  -vf scale=-2:720 -c:v libx264 -crf 23 -preset fast -c:a aac \
  -hls_time 6 -hls_playlist_type vod \
  -hls_segment_filename "lessons/{id}/720p_%03d.ts" \
  lessons/{id}/720p/index.m3u8
```

### 2.5.4 API Endpoint‌های پخش آنلاین (Streaming)

- [ ] `GET /lessons/:id/stream`
  - بررسی Enrollment کاربر
  - تولید **Signed URL** موقت برای فایل `.m3u8` (TTL: 2 ساعت)
  - بازگشت URL پخش + کیفیت‌های موجود + موقعیت Resume
  ```json
  {
    "stream_url": "https://cdn.example.ir/lessons/123/720p/index.m3u8?sig=...&exp=...",
    "qualities": [
      { "label": "1080p", "url": "...1080p/index.m3u8?..." },
      { "label": "720p",  "url": "...720p/index.m3u8?..."  },
      { "label": "360p",  "url": "...360p/index.m3u8?..."  }
    ],
    "default_quality": "720p",
    "resume_at_seconds": 145
  }
  ```
- [ ] `GET /lessons/:id/status` — وضعیت پردازش ویدیو (polling هنگام آپلود توسط مدرس)
- [ ] `POST /lessons/:id/progress` — ذخیره موقعیت فعلی تماشا (ارسال هر ۱۰–۱۵ ثانیه)
  ```json
  { "watched_seconds": 145 }
  ```
- [ ] `GET /lessons/:id/progress` — دریافت آخرین موقعیت برای Resume هنگام ورود

### 2.5.5 API Endpoint‌های دانلود (Download)

- [ ] `GET /lessons/:id/download/options` — لیست کیفیت‌های قابل دانلود + حجم فایل‌ها
  ```json
  {
    "allow_download": true,
    "options": [
      { "quality": "1080p", "size_mb": 890 },
      { "quality": "720p",  "size_mb": 420 },
      { "quality": "360p",  "size_mb": 150 }
    ]
  }
  ```
- [ ] `POST /lessons/:id/download` — درخواست دانلود
  - بررسی شرط ۱: کاربر Enrollment فعال دارد؟
  - بررسی شرط ۲: `allow_download = true` برای این جلسه؟
  - بررسی شرط ۳: حداکثر ۳ دانلود همزمان (Redis Counter)
  - تولید **Download Token** یکبارمصرف (TTL: 30 دقیقه، ذخیره در DB)
  - بازگشت Signed URL مستقیم به Object Storage:
  ```json
  {
    "download_url": "https://storage.example.ir/lessons/123/original.mp4?token=...",
    "filename": "lesson-name-720p.mp4",
    "file_size_mb": 420,
    "expires_in_minutes": 30
  }
  ```

### 2.5.6 امنیت پخش و دانلود

- [ ] **Signed URL** برای تمام دسترسی‌ها — هیچ فایلی بدون امضا قابل دسترس نیست:
  ```
  signature = HMAC-SHA256(storage_key + userId + expiry, SECRET_KEY)
  ```
- [ ] **Token یکبارمصرف** برای دانلود: پس از اولین استفاده، `used_at` ثبت می‌شود و توکن باطل می‌شود
- [ ] محدودیت دانلود همزمان در Redis:
  ```
  Key: ratelimit:download:userId
  Max: 3 دانلود فعال در یک لحظه
  ```
- [ ] **Referer Check** در Nginx: جلوگیری از Hotlinking مستقیم به فایل‌های HLS
- [ ] **IP Binding اختیاری** برای Download Token: توکن فقط از IP درخواست‌دهنده اولیه کار کند
- [ ] لاگ تمام دانلودها در `audit_logs` با `ip_address` و `user_agent`
- [ ] **Watermarking متنی (اختیاری):** افزودن نام/ایمیل کاربر به ویدیو هنگام ترانسکد برای ردیابی لیک

### 2.5.7 پیشرفت دوره و گواهینامه

- [ ] محاسبه درصد تکمیل دوره از روی `lesson_progress`:
  ```
  completion% = (تعداد جلسات با is_completed=true) / (کل جلسات) × 100
  ```
- [ ] `GET /my/courses/:id/progress` — درصد پیشرفت + آخرین جلسه تماشاشده + جلسه بعدی
- [ ] Trigger خودکار صدور گواهینامه هنگام رسیدن `completion%` به ۱۰۰٪
- [ ] تولید گواهینامه PDF با کد یکتا (قابل تأیید آنلاین)
- [ ] `GET /certificates/:code/verify` — تأیید عمومی اعتبار گواهینامه

### 2.5.8 کش Redis برای استریم و دانلود

| داده | Key | TTL |
|------|-----|-----|
| وضعیت پردازش ویدیو | `video:status:{lessonId}` | ۵ دقیقه |
| Signed Stream URL (cache) | `stream:signed:{lessonId}:{userId}` | ۱ ساعت |
| Download Token | `dl:token:{hash}` | ۳۰ دقیقه |
| Counter دانلود همزمان | `ratelimit:download:{userId}` | ۵ دقیقه |
| پیشرفت تماشا (buffer قبل از flush) | `progress:{userId}:{lessonId}` | ۵ دقیقه |

---

## 🔴 فاز 3 — فروش و درگاه پرداخت

### 3.1 طراحی جریان خرید

```
کاربر دوره را انتخاب می‌کند
      ↓
POST /orders → ایجاد سفارش در وضعیت pending
      ↓
دریافت URL پرداخت از زرین‌پال / درگاه بانکی
      ↓
ریدایرکت کاربر به درگاه
      ↓
بازگشت با کد تراکنش (callback)
      ↓
POST /orders/verify → تأیید تراکنش
      ↓
ثبت Enrollment (درصورت موفقیت) | Rollback (درصورت خطا)
```

### 3.2 طراحی دیتابیس مالی

- [ ] جدول `orders`:
  ```
  id, user_id, course_id, amount, discount_code, status (pending/paid/failed/refunded),
  gateway, transaction_id, created_at, paid_at
  ```
- [ ] جدول `discount_codes`: `id, code, type (percent/fixed), value, max_uses, used_count, expires_at`
- [ ] جدول `transactions` (لاگ کامل): `id, order_id, gateway_ref, amount, response_data, created_at`

### 3.3 API Endpoint‌های پرداخت

- [ ] `POST /orders` — ایجاد سفارش و دریافت لینک پرداخت
- [ ] `GET /orders/callback` — Callback درگاه (GET یا POST بسته به درگاه)
- [ ] `POST /orders/verify` — تأیید دستی تراکنش (برای موارد مشکوک)
- [ ] `GET /my/orders` — تاریخچه خریدهای کاربر
- [ ] `POST /admin/orders/:id/refund` — استرداد توسط ادمین

### 3.4 Database Transaction (ACID)

- [ ] استفاده از Transaction برای تمام مراحل ثبت خرید:
  ```sql
  BEGIN;
    INSERT INTO orders ...
    INSERT INTO transactions ...
    UPDATE orders SET status = 'paid' ...
    INSERT INTO enrollments ...
  COMMIT;
  -- در صورت خطا در هر مرحله: ROLLBACK
  ```
- [ ] Idempotency: جلوگیری از ثبت دوباره تراکنش با یک `transaction_id`

### 3.5 کدهای تخفیف

- [ ] `POST /coupons/validate` — بررسی اعتبار کد تخفیف
- [ ] اعمال تخفیف در مرحله ایجاد سفارش
- [ ] Race Condition Prevention هنگام استفاده همزمان از یک کد (Redis Locking)

---

## 🟣 فاز 4 — زیرساخت کلاس‌های آنلاین

### 4.1 انتخاب سرویس ویدئوکنفرانس

| گزینه | مزیت | مناسب برای |
|-------|------|------------|
| **BigBlueButton** | متن‌باز، قابلیت‌های آموزشی کامل | هاست داخلی |
| **Jitsi Meet** | سبک‌تر، راه‌اندازی آسان‌تر | هاست داخلی |
| **سرویس‌های API ایرانی** | بدون هزینه زیرساخت | استفاده از API آماده |

### 4.2 جریان ورود به کلاس

```
کاربر درخواست ورود به کلاس می‌دهد
      ↓
بک‌اند بررسی می‌کند: آیا Enrollment فعال دارد؟
      ↓ (بله)
بک‌اند یک Meeting Token/JWT داخلی تولید می‌کند
      ↓
URL ورود به Jitsi/BBB با Token ارسال می‌شود
      ↓
کاربر به سرور ویدیو ریدایرکت می‌شود (بار اصلی روی سرور ویدیو)
```

### 4.3 جداول دیتابیس کلاس

- [ ] جدول `live_sessions`:
  ```
  id, course_id, teacher_id, title, scheduled_at, started_at, ended_at,
  meeting_id, status (scheduled/live/ended), recording_url
  ```
- [ ] جدول `session_participants`: `id, session_id, user_id, joined_at, left_at`

### 4.4 API Endpoint‌های کلاس

- [ ] `POST /sessions` — ایجاد کلاس توسط مدرس
- [ ] `GET /courses/:id/sessions` — لیست کلاس‌های دوره
- [ ] `POST /sessions/:id/join` — دریافت Token ورود (بررسی دسترسی + تولید JWT)
- [ ] `PUT /sessions/:id/start` — شروع کلاس توسط مدرس
- [ ] `PUT /sessions/:id/end` — پایان کلاس

### 4.5 Webhook از سرور ویدیو

- [ ] `POST /webhooks/bbb` — دریافت رویدادها (start, end, user-joined)
- [ ] ذخیره لینک ضبط درس پس از پایان کلاس
- [ ] ارسال Notification به دانشجویان هنگام شروع کلاس

---

## ⚡ فاز 5 — بهینه‌سازی، کشینگ و امنیت

### 5.1 استراتژی کشینگ پیشرفته با Redis

| داده | Key | TTL |
|------|-----|-----|
| لیست دوره‌ها | `cache:courses:list:*` | 10 دقیقه |
| جزئیات دوره | `cache:course:{id}` | 30 دقیقه |
| پروفایل کاربر | `cache:user:{id}:profile` | 5 دقیقه |
| تعداد دانشجویان دوره | `cache:course:{id}:count` | 1 ساعت |

### 5.2 بهینه‌سازی Query های PostgreSQL

- [ ] اضافه کردن Index روی فیلدهای پرکاربرد:
  ```sql
  CREATE INDEX idx_courses_status ON courses(status);
  CREATE INDEX idx_enrollments_user ON enrollments(user_id);
  CREATE INDEX idx_orders_user_status ON orders(user_id, status);
  ```
- [ ] استفاده از `EXPLAIN ANALYZE` برای شناسایی Query های کند
- [ ] پیاده‌سازی Pagination با `CURSOR` به جای `OFFSET` برای datasets بزرگ

### 5.3 Rate Limiting جامع

- [ ] Endpoint‌های عمومی: `100 req/min per IP`
- [ ] Endpoint‌های احراز هویت: `5 req/min per IP`
- [ ] Endpoint‌های پرداخت: `10 req/min per User`
- [ ] ذخیره Counter در Redis: `ratelimit:{type}:{identifier}`

### 5.4 امنیت API

- [ ] تنظیم **CORS** محدود به دامنه‌های مجاز
- [ ] فعال‌سازی **Helmet** (NestJS) یا معادل آن برای HTTP Security Headers
- [ ] اعتبارسنجی و Sanitize تمام ورودی‌ها (class-validator / Pydantic)
- [ ] جلوگیری از **Mass Assignment** با DTO‌های دقیق
- [ ] لاگ‌گیری تمام عملیات مالی و ورود/خروج در جدول `audit_logs`

### 5.5 CAPTCHA ایران‌محور

- [ ] حذف کامل Google reCAPTCHA
- [ ] استفاده از **hCaptcha self-hosted** یا سرویس CAPTCHA ایرانی
- [ ] پیاده‌سازی CAPTCHA روی فرم‌های ثبت‌نام، ورود و پرداخت

---

## 🎨 فاز 6 — فرانت‌اند (Next.js / Headless)

### 6.1 راه‌اندازی پروژه Next.js

- [ ] ایجاد پروژه با App Router (Next.js 14+)
- [ ] تنظیم **TypeScript** + **Tailwind CSS**
- [ ] هاست تمام Asset‌ها به‌صورت local (هیچ CDN خارجی):
  - فونت‌های فارسی: Vazirmatn (دانلود و self-host)
  - آیکون‌ها: Lucide React (bundle داخلی)

### 6.2 صفحات اصلی

| صفحه | مسیر | رویکرد Rendering |
|------|------|-----------------|
| صفحه اصلی | `/` | SSG + ISR |
| لیست دوره‌ها | `/courses` | SSR (برای SEO) |
| جزئیات دوره | `/courses/[slug]` | SSR |
| داشبورد دانشجو | `/dashboard` | CSR |
| **پخش ویدیو** | **`/watch/[lessonId]`** | **CSR** |
| پنل مدرس | `/teacher` | CSR |
| پرداخت | `/checkout` | CSR |
| کلاس آنلاین | `/class/[id]` | CSR |

### 6.3 مدیریت State و API

- [ ] **React Query (TanStack Query)**: مدیریت Server State و کشینگ سمت کلاینت
- [ ] **Zustand**: مدیریت Auth State (token، اطلاعات کاربر)
- [ ] **Axios Instance**: با Interceptor برای تزریق Token و Refresh خودکار

### 6.3.1 کامپوننت پلیر ویدیو

- [ ] استفاده از **Video.js** یا **Plyr** (دانلود و self-host — بدون CDN خارجی)
- [ ] پشتیبانی از **HLS** از طریق `hls.js` (Adaptive Bitrate Streaming)
- [ ] قابلیت‌های پلیر:
  - انتخاب کیفیت دستی (360p / 720p / 1080p)
  - Resume خودکار از آخرین موقعیت (بارگذاری از API)
  - ارسال Progress هر ۱۰ ثانیه به بک‌اند (debounced)
  - دکمه دانلود (در صورت `allow_download = true`)
  - کنترل سرعت پخش (0.75x، 1x، 1.25x، 1.5x، 2x)
  - کلیدهای میانبر صفحه‌کلید (Space، ←/→، F برای فول‌اسکرین)
- [ ] نمایش نوار پیشرفت دوره زیر پلیر (درصد تکمیل فصل)

### 6.4 SEO پیشرفته

- [ ] تولید `sitemap.xml` پویا از دوره‌های منتشرشده
- [ ] `robots.txt` اختصاصی
- [ ] **Structured Data** (JSON-LD) برای دوره‌ها (schema.org/Course)
- [ ] بهینه‌سازی `<head>` با متا تگ‌های Open Graph برای هر دوره

### 6.5 پنل ادمین

- [ ] داشبورد آمار: تعداد کاربران، فروش، کلاس‌های فعال
- [ ] مدیریت کاربران (ban/unban، تغییر نقش)
- [ ] مدیریت دوره‌ها (تأیید/رد، ویرایش)
- [ ] مدیریت سفارش‌ها و استرداد

---

## 🚀 فاز 7 — استقرار و پایش (ایران‌محور)

### 7.1 هاستینگ داخلی

- [ ] انتخاب دیتاسنتر داخل ایران:
  - ابر آروان (ArvanCloud)
  - لیارا (Liara.ir)
  - رایانه ابری یا سرور اختصاصی داخلی
- [ ] **هرگز** از AWS، DigitalOcean، Hetzner، Cloudflare Worker استفاده نشود

### 7.2 استراتژی دامنه

- [ ] دامنه اصلی: `.ir` (برای پایداری روی شبکه ملی)
- [ ] دامنه آینه: `.com` یا `.io` (برای دسترسی از خارج در صورت نیاز)
- [ ] DNS داخلی: استفاده از سرویس DNS ارائه‌دهنده داخلی (آروان، پارس پک)
- [ ] **عدم استفاده از Cloudflare** برای traffic اصلی

### 7.3 CDN و تحویل محتوا

- [ ] استفاده از **CDN آروان** یا **CDN ایرانی معادل**
- [ ] ذخیره فایل‌های استاتیک دوره‌ها روی Object Storage داخلی
- [ ] تنظیم Cache Headers مناسب برای فایل‌های ثابت (`max-age=31536000`)

### 7.4 Containerization و CI/CD

- [ ] **Docker Compose** برای production:
  ```yaml
  services:
    backend, postgres, redis, nginx (reverse proxy)
  ```
- [ ] بیلد ایمیج‌ها و ذخیره در **Local Registry** (Gitea + Docker Registry)
- [ ] CI/CD با **Gitea Actions** یا **Gitlab CI** (self-hosted، نه GitHub Actions)
- [ ] آماده‌سازی **Offline Build Package**: آرشیوی از تمام ایمیج‌ها برای انتقال دستی به سرور
> 💡 **یادداشت مهم در خصوص استفاده از GitHub و استقرار (CI/CD):**
> برای شروع کار و توسعه فازهای اولیه، نگهداری کدها و همکاری تیمی روی **GitHub** کاملاً مناسب و بی‌دردسر است.اما با توجه به ریسک بالای قطعی اینترنت بین‌الملل ، استقرار پروژه نباید به سرویس‌های خارجی (مثل GitHub Actions) وابسته باشد. 
> 
> **رویکرد نهایی:** برای فاز استقرار (Deployment)، باید یک کپی از مخزن کدها روی یک سرور داخلی با ابزارهایی مثل **Gitea** یا **GitLab (Self-hosted)** راه‌اندازی شود. همچنین فرآیند بیلد ایمیج‌ها باید در یک Local Registry (مثل Gitea + Docker Registry) انجام گیرد تا در زمان اختلالات شبکه، امکان انتقال و آپدیت سرورهای داخلی متوقف نشود.

### 7.5 پایش و لاگ‌گیری

- [ ] **Prometheus + Grafana** (self-hosted) برای monitoring متریک‌ها
- [ ] **Loki** (self-hosted) برای aggregation لاگ‌ها
- [ ] **Uptime Kuma** برای بررسی uptime و alerting
- [ ] تنظیم Alert برای: CPU > 80%، Response Time > 2s، Error Rate > 1%

### 7.6 Backup و Disaster Recovery

- [ ] Backup خودکار PostgreSQL روزانه (pg_dump → Object Storage داخلی)
- [ ] Backup Redis (RDB/AOF) هر 6 ساعت
- [ ] تست بازیابی Backup هر ماه
- [ ] مستندسازی **Runbook** برای سناریوهای بحران (قطعی سرور، نشت داده)

---

## 📊 Milestones و تحویل‌پذیرها

```
هفته 1    → [فاز 0] زیرساخت Docker، DB، Redis آماده است
هفته 3    → [فاز 1] سیستم Auth کامل با تست‌های Integration
هفته 5    → [فاز 2]   CRUD دوره‌ها + کشینگ Redis + آپلود فایل
هفته 7    → [فاز 2.5] FFmpeg Worker فعال + HLS Streaming + دانلود امن + پیشرفت دوره
هفته 9    → [فاز 3]   جریان کامل خرید با زرین‌پال + رول‌بک
هفته 11   → [فاز 4]   ادغام Jitsi/BBB + Token ورود کلاس
هفته 12   → [فاز 5]   Rate Limiting جامع + Audit Log + CAPTCHA ایرانی
هفته 15   → [فاز 6]   فرانت‌اند Next.js + پلیر HLS + پنل ادمین
هفته 16   → [فاز 7]   استقرار روی سرور ایرانی + Monitoring فعال
```

---

## ⚠️ ریسک‌ها و راه‌حل‌ها

| ریسک | احتمال | راه‌حل |
|------|--------|--------|
| قطعی اینترنت بین‌الملل | بالا | تمام وابستگی‌ها self-hosted، بیلد آفلاین |
| مشکل درگاه پرداخت | متوسط | چند درگاه پشتیبان (زرین‌پال + بانکی مستقیم) |
| حملات DDoS | متوسط | Rate Limiting در Redis + CDN داخلی |
| حجم بالای ویدیو در سرور | بالا | Object Storage جدا، CDN ویدیو اختصاصی |
| کند بودن ترانسکد FFmpeg | متوسط | صف BullMQ/Celery + Worker اختصاصی + پیام وضعیت به مدرس |
| لیک ویدیوهای محافظت‌شده | متوسط | Signed URL + Token یکبارمصرف + Watermarking |
| فضای زیاد Object Storage | بالا | تعیین سقف حجم آپلود + حذف فایل خام پس از ترانسکد |
| Race Condition در پرداخت | کم | Redis Distributed Lock + DB Transaction |

---

## 🔧 Stack نهایی (خلاصه)

```
Backend:     NestJS (TypeScript) یا FastAPI (Python)
Database:    PostgreSQL 15+ با Connection Pooling
Cache:       Redis 7+
Auth:        JWT (Access 15m + Refresh 7d در Redis)
Storage:     MinIO یا ArvanCloud Object Storage
Transcoding: FFmpeg + BullMQ/Celery (Worker جدا)
Streaming:   HLS (hls.js) با Signed URL از CDN داخلی
Video Player: Video.js یا Plyr (self-hosted)
Live Video:  Jitsi Meet (self-hosted در ایران)
Frontend:    Next.js 14+ (App Router, SSR)
Hosting:     دیتاسنتر داخل ایران (آروان، لیارا)
CDN:         CDN آروان یا معادل داخلی
Domain:      .ir اصلی
CI/CD:       Gitea self-hosted + Docker Local Registry
Monitoring:  Prometheus + Grafana + Uptime Kuma (self-hosted)
```
