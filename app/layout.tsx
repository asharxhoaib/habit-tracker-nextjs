import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import DarkModeToggle from "@/components/DarkModeToggle";

export const metadata: Metadata = {
  title: "Habitual — Habit Tracker",
  description: "Build better habits, one day at a time.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex min-h-screen flex-1 flex-col">
              <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
                <span className="text-lg font-bold text-brand-600 dark:text-brand-300">
                  🔥 Habitual
                </span>
                <DarkModeToggle />
              </header>
              <main className="flex-1 pb-20 md:pb-0">{children}</main>
            </div>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
