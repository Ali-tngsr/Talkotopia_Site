import type { Metadata } from "next";
import { ToastProvider } from "../components/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talkotopia",
  description: "سامانه مدیریت یادگیری Talkotopia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html dir="rtl" lang="fa">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
