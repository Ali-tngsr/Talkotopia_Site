"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthTokens, getAccessToken } from "../../lib/auth-storage";

export default function DashboardPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/login");
      return;
    }

    setIsReady(true);
  }, [router]);

  function handleLogout() {
    clearAuthTokens();
    router.replace("/login");
  }

  if (!isReady) {
    return null;
  }

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <h1 className="auth-title">داشبورد Talkotopia</h1>
        <p className="auth-subtitle">خوش آمدید! ورود شما با موفقیت انجام شده است.</p>
        <button className="primary-button" onClick={handleLogout} style={{ maxWidth: 180 }} type="button">
          خروج
        </button>
      </section>
    </main>
  );
}
