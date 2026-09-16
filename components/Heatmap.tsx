"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Habit, LogEntry } from "@/lib/types";
import {
  formatMonthLabel,
  getMonthMatrix,
  toDateKey,
  WEEKDAY_LABELS,
} from "@/lib/dates";
import { isHabitCompletedOnDate, isHabitScheduledOnDate } from "@/lib/streaks";

interface HeatmapProps {
  habit: Habit;
  logs: LogEntry[];
}

export default function Heatmap({ habit, logs }: HeatmapProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const weeks = useMemo(() => getMonthMatrix(year, month), [year, month]);

  function goToPrevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const today = toDateKey(new Date());

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Previous month"
        >
          ←
        </button>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {formatMonthLabel(year, month)}
        </h3>
        <button
          onClick={goToNextMonth}
          className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Next month"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-slate-400 dark:text-slate-500">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {weeks.flatMap((week, wi) =>
          week.map((date, di) => {
            if (!date) {
              return <div key={`${wi}-${di}`} className="aspect-square" />;
            }
            const key = toDateKey(date);
            const scheduled = isHabitScheduledOnDate(habit, date);
            const completed = isHabitCompletedOnDate(logs, habit.id, key);
            const isFuture = date > new Date();
            const isToday = key === today;

            return (
              <div
                key={key}
                title={`${key}${completed ? " · completed" : ""}`}
                className={clsx(
                  "flex aspect-square items-center justify-center rounded-md text-[10px] font-medium transition",
                  isToday && "ring-2 ring-brand-500",
                  isFuture && "opacity-40",
                  completed
                    ? "text-white"
                    : scheduled
                    ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                    : "bg-slate-50 text-slate-300 dark:bg-slate-800/40 dark:text-slate-600"
                )}
                style={completed ? { backgroundColor: habit.color } : undefined}
              >
                {date.getDate()}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <span
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: habit.color }}
          />
          Completed
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-slate-100 dark:bg-slate-800" />
          Scheduled
        </span>
        <span className="flex items-center gap-1">
          <span className="h-3 w-3 rounded-sm bg-slate-50 dark:bg-slate-800/40" />
          Not scheduled
        </span>
      </div>
    </div>
  );
}
