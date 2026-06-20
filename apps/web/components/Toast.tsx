'use client';

import { useEffect, useState } from 'react';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export type ToastMessage = {
  id: string;
  message: string;
  type: ToastType;
};

const toastStore: { listeners: ((toasts: ToastMessage[]) => void)[]; toasts: ToastMessage[] } = {
  listeners: [],
  toasts: [],
};

function notify() {
  toastStore.listeners.forEach((l) => l([...toastStore.toasts]));
}

export function toast(message: string, type: ToastType = 'info') {
  const id = Math.random().toString(36).slice(2);
  toastStore.toasts.push({ id, message, type });
  notify();
  setTimeout(() => {
    toastStore.toasts = toastStore.toasts.filter((t) => t.id !== id);
    notify();
  }, 4000);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler = (t: ToastMessage[]) => setToasts(t);
    toastStore.listeners.push(handler);
    return () => {
      toastStore.listeners = toastStore.listeners.filter((l) => l !== handler);
    };
  }, []);

  return (
    <div className="fixed left-4 top-4 z-[100] flex flex-col gap-2" dir="rtl">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg backdrop-blur-md ${
            t.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : t.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {t.type === 'success' ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : t.type === 'error' ? (
            <AlertCircle className="h-5 w-5 shrink-0" />
          ) : (
            <Info className="h-5 w-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{t.message}</span>
          <button
            onClick={() => {
              toastStore.toasts = toastStore.toasts.filter((x) => x.id !== t.id);
              notify();
            }}
            className="mr-2 rounded-full p-1 hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
