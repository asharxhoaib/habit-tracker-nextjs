"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { useHabitStore } from "@/store/useHabitStore";
import Heatmap from "@/components/Heatmap";
import { computeCurrentStreak, computeLongestStreak } from "@/lib/streaks";

export default function CalendarPage() {
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const activeHabits = useMemo(
    () => habits.filter((h) => !h.archived),
    [habits]
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(
    activeHabits[0]?.id
  );

  const selectedHabit =
    activeHabits.find((h) => h.id === selectedId) ?? activeHabits[0];

  if (!selectedHabit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
        Create a habit first to see its streak calendar.
      </div>
    );
  }

  const currentStreak = computeCurrentStreak(selectedHabit, logs);
  const longestStreak = computeLongestStreak(selectedHabit, logs);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <h1 className="mb-4 text-2xl font-bold text-slate-800 dark:text-slate-100">
        Streak Calendar
      </h1>

      <div className="mb-4 flex flex-wrap gap-2">
        {activeHabits.map((h) => (
          <button
            key={h.id}
            onClick={() => setSelectedId(h.id)}
            className={clsx(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              selectedHabit.id === h.id
                ? "border-transparent text-white"
                : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            )}
            style={
              selectedHabit.id === h.id ? { backgroundColor: h.color } : undefined
            }
          >
            <span>{h.icon}</span>
            {h.name}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-300">
            {currentStreak}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Current streak
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
            {longestStreak}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Longest streak
          </p>
        </div>
      </div>

      <Heatmap habit={selectedHabit} logs={logs} />
    </div>
  );
}
