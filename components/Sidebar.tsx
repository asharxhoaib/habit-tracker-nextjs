"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import DarkModeToggle from "./DarkModeToggle";

const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: "✅" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/stats", label: "Stats", icon: "📊" },
  { href: "/habit/new", label: "New Habit", icon: "➕" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 md:flex">
      <div className="mb-8 flex items-center justify-between px-2">
        <span className="text-xl font-bold text-brand-600 dark:text-brand-300">
          🔥 Habitual
        </span>
        <DarkModeToggle />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-2 text-xs text-slate-400 dark:text-slate-500">
        Built with Next.js, Zustand &amp; Recharts
      </div>
    </aside>
  );
}
