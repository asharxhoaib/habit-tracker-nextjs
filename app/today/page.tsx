"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useHabitStore } from "@/store/useHabitStore";
import { TimeOfDay } from "@/lib/types";
import { isHabitScheduledOnDate } from "@/lib/streaks";
import HabitCard from "@/components/HabitCard";
import { formatDayLabel, todayKey } from "@/lib/dates";

const SECTIONS: { key: TimeOfDay; label: string; icon: string }[] = [
  { key: "morning", label: "Morning", icon: "🌅" },
  { key: "afternoon", label: "Afternoon", icon: "☀️" },
  { key: "evening", label: "Evening", icon: "🌙" },
];

export default function TodayPage() {
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const hydrated = useHabitStore((s) => s.hydrated);

  const today = new Date();

  const activeHabits = useMemo(
    () => habits.filter((h) => !h.archived),
    [habits]
  );

  const dueToday = useMemo(
    () => activeHabits.filter((h) => isHabitScheduledOnDate(h, today)),
    [activeHabits]
  );

  const completedCount = useMemo(() => {
    const key = todayKey();
    return dueToday.filter((h) =>
      logs.some((l) => l.habitId === h.id && l.date === key && l.completed)
    ).length;
  }, [dueToday, logs]);

  if (!hydrated) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Loading your habits…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Today
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {formatDayLabel(today)} · {completedCount}/{dueToday.length} done
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{
              width: `${
                dueToday.length === 0
                  ? 0
                  : Math.round((completedCount / dueToday.length) * 100)
              }%`,
            }}
          />
        </div>
      </div>

      {activeHabits.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          You have no habits yet.{" "}
          <Link href="/habit/new" className="font-medium text-brand-600">
            Create your first habit
          </Link>
          .
        </div>
      )}

      <div className="flex flex-col gap-6">
        {SECTIONS.map((section) => {
          const sectionHabits = dueToday.filter(
            (h) => h.timeOfDay === section.key
          );
          if (sectionHabits.length === 0) return null;
          return (
            <div key={section.key}>
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <span>{section.icon}</span>
                {section.label}
              </h2>
              <div className="flex flex-col gap-2">
                {sectionHabits.map((habit) => (
                  <HabitCard key={habit.id} habit={habit} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {activeHabits.length > 0 && dueToday.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Nothing scheduled for today. Enjoy the rest!
        </div>
      )}
    </div>
  );
}
