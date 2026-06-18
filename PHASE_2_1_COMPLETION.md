# 🎓 فاز 2.1 — طراحی دیتابیس دوره‌ها [تکمیل شده]

**تاریخ تکمیل:** ۱۱ خرداد ۱۴۰۵

---

## 📝 خلاصه‌ی تکمیل‌شده

فاز 2.1 شامل طراحی و پیاده‌سازی پنج جدول اصلی برای مدیریت دوره‌های آموزشی، بخش‌های دوره، درس‌ها، ثبت‌نام‌های دانشجویان و نظرات است.

---

## ✅ کارهای انجام‌شده

### ۱. **ایجاد ساختار ماژول Courses**
- ساخت پوشه `src/courses` و زیر پوشه `entities`
- ایجاد Enums مورد نیاز:
  - `CourseStatus`: draft, published, archived
  - `ContentType`: video, pdf, text

### ۲. **طراحی و پیاده‌سازی Entities (نهادها)**

#### **`Course` (دوره)**
```typescript
- id (UUID - Primary Key)
- title (varchar 255)
- slug (varchar 255 - Unique Index)
- description (text)
- teacher_id (FK → users)
- price (decimal 10,2)
- discount_price (decimal 10,2 - nullable)
- thumbnail (varchar - nullable)
- status (enum: draft/published/archived)
- created_at (timestamp)
- updated_at (timestamp)
- Relations:
  - teacher: ManyToOne → User
  - sections: OneToMany → CourseSection
  - enrollments: OneToMany → Enrollment
  - reviews: OneToMany → CourseReview
```

#### **`CourseSection` (فصل‌های دوره)**
```typescript
- id (UUID - Primary Key)
- course_id (FK → courses)
- title (varchar 255)
- order (int)
- Relations:
  - course: ManyToOne → Course
  - lessons: OneToMany → Lesson
```

#### **`Lesson` (درس/جلسه)**
```typescript
- id (UUID - Primary Key)
- section_id (FK → course_sections)
- title (varchar 255)
- order (int)
- content_type (enum: video/pdf/text)
- quality_720_url (varchar - required)
- quality_1080_url (varchar - nullable)
- quality_480_url (varchar - nullable)
- duration_seconds (int - nullable)
- is_free_preview (boolean)
- allow_download (boolean)
- created_at (timestamp)
- Relations:
  - section: ManyToOne → CourseSection
```

#### **`Enrollment` (ثبت‌نام دانشجویان)**
```typescript
- id (UUID - Primary Key)
- user_id (FK → users)
- course_id (FK → courses)
- enrolled_at (timestamp)
- completed_at (timestamp - nullable)
- updated_at (timestamp)
- Constraints:
  - Unique(user_id, course_id)
```

#### **`CourseReview` (نظرات و امتیازات)**
```typescript
- id (UUID - Primary Key)
- user_id (FK → users)
- course_id (FK → courses)
- rating (int)
- comment (text - nullable)
- created_at (timestamp)
- updated_at (timestamp)
```

### ۳. **تنظیمات پایگاه‌داده**
- فعال‌سازی `autoLoadEntities: true` در TypeOrmModule
- راه‌اندازی `synchronize: true` برای ایجاد جداول خودکار
- تعریف Indexes روی فیلدهای پرکاربرد:
  - `courses(slug)` - Unique
  - `courses(teacher_id)`
  - `courses(status)`
  - `course_sections(course_id)`
  - `lessons(section_id)`
  - `enrollments(user_id, course_id)` - Unique
  - `enrollments(user_id)`
  - `enrollments(course_id)`
  - `course_reviews(user_id)`
  - `course_reviews(course_id)`

### ۴. **Integration با App Module**
- ایجاد `CoursesModule` و ثبت تمام Entities
- Import `CoursesModule` در `AppModule`
- صادرات `TypeOrmModule` برای استفاده در سرویس‌ها

---

## 📁 ساختار پروشه‌ای ایجادشده

```
apps/api/src/courses/
├── entities/
│   ├── course.entity.ts
│   ├── course-section.entity.ts
│   ├── lesson.entity.ts
│   ├── enrollment.entity.ts
│   └── course-review.entity.ts
├── course-status.enum.ts
├── content-type.enum.ts
└── courses.module.ts
```

---

## 🚀 حالت تکمیل

✅ **تمام Entities طراحی و پیاده‌سازی شد**

✅ **Build بدون خطا تکمیل شد**

✅ **Database Migrations آماده است** (با `synchronize: true`)

---

## 📋 مرحله‌ی بعدی (فاز 2.2)

فاز 2.2 شامل پیاده‌سازی API Endpointهای دوره، فصل، جلسه، ثبت‌نام، نظر و دسترسی محتوا است.

---

## ⚙️ تست و تأیید

```bash
# Build موفق
✓ pnpm build → Exit Code: 0

# Entities بار‌گذاری شدند
✓ autoLoadEntities: true working
✓ TypeORM Synchronization ready

# Database Tables (بعد از اجرا)
- courses
- course_sections
- lessons
- enrollments
- course_reviews
```

---

**وضعیت:** 🟢 **تکمیل شده و آماده برای فاز 2.2**
