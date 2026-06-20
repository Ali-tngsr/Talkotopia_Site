'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, coursesApi, saveAuth, clearAuth, getUser } from './api';
import type { AuthUser } from './api';

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ dev_otp: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  enrolledIds: string[];
  refetchEnrolled: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => ({ dev_otp: '' }),
  verifyOtp: async () => {},
  logout: async () => {},
  refresh: async () => {},
  enrolledIds: [],
  refetchEnrolled: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setIsLoading(false);
  }, []);

  const fetchEnrolled = useCallback(async () => {
    try {
      const courses = await coursesApi.getMyEnrolled();
      setEnrolledIds(courses.map((c) => c.id));
    } catch {
      setEnrolledIds([]);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchEnrolled();
    } else {
      setEnrolledIds([]);
    }
  }, [user, fetchEnrolled]);

  const login = useCallback(async (email: string, password: string) => {
    const tokens = await authApi.login({ email, password });
    saveAuth(tokens);
    setUser(tokens.user);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await authApi.register({ name, email, password });
    return { dev_otp: result.dev_otp };
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const tokens = await authApi.verifyOtp({ email, otp });
    saveAuth(tokens);
    setUser(tokens.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearAuth();
    setUser(null);
    setEnrolledIds([]);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  const refresh = useCallback(async () => {
    const u = getUser();
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        verifyOtp,
        logout,
        refresh,
        enrolledIds,
        refetchEnrolled: fetchEnrolled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
