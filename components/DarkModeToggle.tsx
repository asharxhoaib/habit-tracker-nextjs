"use client";

import { useThemeStore } from "@/store/useThemeStore";

export default function DarkModeToggle() {
  const darkMode = useThemeStore((s) => s.darkMode);
  const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);

  return (
    <button
      onClick={toggleDarkMode}
      aria-label="Toggle dark mode"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-lg transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
    >
      {darkMode ? "🌙" : "☀️"}
    </button>
  );
}
