"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const NAV_ITEMS = [
  { href: "/today", label: "Today", icon: "✅" },
  { href: "/calendar", label: "Calendar", icon: "📅" },
  { href: "/stats", label: "Stats", icon: "📊" },
  { href: "/habit/new", label: "Add", icon: "➕" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
      {NAV_ITEMS.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition",
              active
                ? "text-brand-600 dark:text-brand-300"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
