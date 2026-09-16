"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Habit } from "@/lib/types";
import { useHabitStore } from "@/store/useHabitStore";
import { computeCurrentStreak } from "@/lib/streaks";
import { todayKey } from "@/lib/dates";
import StreakBadge from "./StreakBadge";
import ConfettiOverlay from "./ConfettiOverlay";

interface HabitCardProps {
  habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
  const logs = useHabitStore((s) => s.logs);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const [burst, setBurst] = useState(false);

  const dateKey = todayKey();
  const log = logs.find((l) => l.habitId === habit.id && l.date === dateKey);
  const completed = Boolean(log?.completed);
  const streak = computeCurrentStreak(habit, logs);

  function handleToggle() {
    const willComplete = !completed;
    toggleCompletion(habit.id, dateKey);
    if (willComplete) {
      setBurst(true);
      setTimeout(() => setBurst(false), 900);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
      <ConfettiOverlay active={burst} />
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          aria-pressed={completed}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
          className={clsx(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xl transition",
            completed
              ? "animate-pop-in border-transparent text-white"
              : "border-slate-300 bg-slate-50 text-transparent hover:border-slate-400 dark:border-slate-600 dark:bg-slate-800"
          )}
          style={completed ? { backgroundColor: habit.color } : undefined}
        >
          {completed ? "✓" : habit.icon}
        </button>

        <Link href={`/habit/${habit.id}`} className="min-w-0 flex-1">
          <p
            className={clsx(
              "truncate font-medium text-slate-800 dark:text-slate-100",
              completed && "text-slate-400 line-through dark:text-slate-500"
            )}
          >
            {habit.icon} {habit.name}
          </p>
          {habit.description && (
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">
              {habit.description}
            </p>
          )}
        </Link>

        <StreakBadge streak={streak} />
      </div>
    </div>
  );
}
