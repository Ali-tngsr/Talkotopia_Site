import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "../lib/auth";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ToastContainer } from "./components/Toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Talkotopia — پلتفرم آموزشی زبان",
  description: "دوره‌های ضبط‌شده زبان را بفروشید، مدیریت کنید و امن پخش کنید.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <AuthProvider>
          <ToastContainer />
          <Navbar />
          <main className="min-h-[calc(100vh-64px-120px)]">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
