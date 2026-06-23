const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
  }
}

async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

async function getRefreshToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refresh_token');
}

async function setTokens(access: string, refresh: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

async function clearTokens() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await getRefreshToken();
  if (!refresh) return null;

  if (isRefreshing) {
    return refreshPromise ?? Promise.resolve(null);
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (!res.ok) {
        await clearTokens();
        return null;
      }
      const data = await res.json();
      await setTokens(data.access_token, data.refresh_token);
      return data.access_token as string;
    } catch {
      await clearTokens();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;
  let token = await getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401 && path !== '/auth/refresh') {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = undefined;
    }
    const msg =
      typeof data === 'object' && data && 'message' in data && typeof data.message === 'string'
        ? data.message
        : `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

// ========== Auth API ==========

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  message?: string;
};

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    apiRequest<{ message: string; dev_otp: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyOtp: (data: { email: string; otp: string }) =>
    apiRequest<AuthTokens>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiRequest<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  refresh: (refresh_token: string) =>
    apiRequest<{ access_token: string; refresh_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token }),
    }),

  forgotPassword: (data: { email: string }) =>
    apiRequest<{ message: string; dev_reset_token?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  resetPassword: (data: { token: string; new_password: string }) =>
    apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiRequest<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),
};

export function saveAuth(tokens: AuthTokens) {
  setTokens(tokens.access_token, tokens.refresh_token);
  localStorage.setItem('user', JSON.stringify(tokens.user));
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuth() {
  clearTokens();
}

// ========== Courses API ==========

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  teacher_id: string;
  price: number;
  discount_price: number | null;
  thumbnail: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type PaginatedCourses = {
  data: Course[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type CourseSection = {
  id: string;
  course_id: string;
  title: string;
  order: number;
  lessons?: Lesson[];
};

export type Lesson = {
  id: string;
  section_id: string;
  title: string;
  order: number;
  content_type: string;
  quality_720_url: string;
  quality_1080_url: string | null;
  quality_480_url: string | null;
  duration_seconds: number | null;
  is_free_preview: boolean;
  allow_download: boolean;
  created_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type VideoSource = {
  quality: string;
  url: string;
  is_default: boolean;
  can_download: boolean;
  filename: string;
};

export type LessonMedia = {
  lesson_id: string;
  title: string;
  default_quality: string;
  sources: VideoSource[];
  allow_download: boolean;
};

export const coursesApi = {
  list: (params?: { page?: number; limit?: number; sort?: string }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.sort) sp.set('sort', params.sort);
    const qs = sp.toString();
    return apiRequest<PaginatedCourses>(`/courses${qs ? `?${qs}` : ''}`);
  },

  getBySlug: (slug: string) => apiRequest<Course>(`/courses/${slug}`),

  getReviews: (courseId: string) => apiRequest<Review[]>(`/courses/${courseId}/reviews`),

  getMyEnrolled: () => apiRequest<Course[]>(`/courses/my/enrolled`),

  getMyCreated: () => apiRequest<Course[]>(`/courses/my/created`),

  getCourseSections: (slug: string) => apiRequest<CourseSection[]>(`/courses/${slug}/sections`),

  getLessonContent: (courseId: string, lessonId: string) =>
    apiRequest<Lesson>(`/courses/${courseId}/lessons/${lessonId}`),

  getLessonMedia: (courseId: string, lessonId: string) =>
    apiRequest<LessonMedia>(`/courses/${courseId}/lessons/${lessonId}/media`),

  addReview: (courseId: string, data: { rating: number; comment?: string }) =>
    apiRequest<Review>(`/courses/${courseId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  create: (data: { title: string; description: string; price: number; discount_price?: number; thumbnail?: string }) =>
    apiRequest<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (courseId: string, data: Partial<Course>) =>
    apiRequest<Course>(`/courses/${courseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  createSection: (courseId: string, data: { title: string; order: number }) =>
    apiRequest<CourseSection>(`/courses/${courseId}/sections`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createLesson: (sectionId: string, data: {
    title: string;
    order: number;
    quality_720_url: string;
    quality_1080_url?: string;
    quality_480_url?: string;
    is_free_preview?: boolean;
    allow_download?: boolean;
  }) =>
    apiRequest<Lesson>(`/courses/sections/${sectionId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLesson: (lessonId: string, data: Partial<Lesson>) =>
    apiRequest<Lesson>(`/courses/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteLesson: (lessonId: string) =>
    apiRequest<void>(`/courses/lessons/${lessonId}`, {
      method: 'DELETE',
    }),

  enroll: (courseId: string) =>
    apiRequest<{ id: string; course_id: string; user_id: string; enrolled_at: string }>(`/courses/${courseId}/enroll`, {
      method: 'POST',
    }),
};

// ========== Orders API ==========

export type OrderItem = {
  id: string;
  course_id: string;
  course_title: string;
  unit_price: number;
};

export type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  currency: string;
  items: OrderItem[];
  created_at: string;
};

export type PaymentRequest = {
  order_id: string;
  transaction_id: string;
  authority: string;
  gateway: string;
  payment_url: string;
  amount: number;
  currency: string;
};

export const ordersApi = {
  create: (data: { course_ids: string[] }) =>
    apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMy: () => apiRequest<Order[]>('/orders'),

  getOne: (id: string) => apiRequest<Order>(`/orders/${id}`),

  requestPayment: (orderId: string) =>
    apiRequest<PaymentRequest>(`/orders/${orderId}/payment/request`, {
      method: 'POST',
    }),
};
