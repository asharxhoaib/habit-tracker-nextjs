"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";
import { useHabitStore } from "@/store/useHabitStore";
import { addDays, toDateKey } from "@/lib/dates";
import {
  computeCompletionRate,
  isHabitCompletedOnDate,
  isHabitScheduledOnDate,
} from "@/lib/streaks";

const DAYS_WINDOW = 14;

export default function StatsPage() {
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const activeHabits = useMemo(
    () => habits.filter((h) => !h.archived),
    [habits]
  );

  const completionOverTime = useMemo(() => {
    const today = new Date();
    const points: { date: string; rate: number }[] = [];
    for (let i = DAYS_WINDOW - 1; i >= 0; i--) {
      const day = addDays(today, -i);
      const dateKey = toDateKey(day);
      let scheduled = 0;
      let completed = 0;
      for (const habit of activeHabits) {
        if (isHabitScheduledOnDate(habit, day)) {
          scheduled += 1;
          if (isHabitCompletedOnDate(logs, habit.id, dateKey)) {
            completed += 1;
          }
        }
      }
      points.push({
        date: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        rate: scheduled === 0 ? 0 : Math.round((completed / scheduled) * 100),
      });
    }
    return points;
  }, [activeHabits, logs]);

  const perHabitComparison = useMemo(() => {
    const today = new Date();
    const from = addDays(today, -29);
    return activeHabits.map((habit) => ({
      name: habit.name.length > 12 ? habit.name.slice(0, 12) + "…" : habit.name,
      rate: computeCompletionRate(habit, logs, from, today),
      color: habit.color,
    }));
  }, [activeHabits, logs]);

  const consistencyScore = useMemo(() => {
    if (perHabitComparison.length === 0) return 0;
    const sum = perHabitComparison.reduce((acc, h) => acc + h.rate, 0);
    return Math.round(sum / perHabitComparison.length);
  }, [perHabitComparison]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
      <h1 className="mb-1 text-2xl font-bold text-slate-800 dark:text-slate-100">
        Stats Dashboard
      </h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Last {DAYS_WINDOW} days of completion trends.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-3xl font-bold text-brand-600 dark:text-brand-300">
            {consistencyScore}%
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Overall consistency (30d)
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">
            {activeHabits.length}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Active habits
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">
            {logs.filter((l) => l.completed).length}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Total completions
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Completion rate over time
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={completionOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="date" fontSize={11} stroke="currentColor" opacity={0.6} />
              <YAxis
                domain={[0, 100]}
                fontSize={11}
                stroke="currentColor"
                opacity={0.6}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Completion rate"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#3a56f5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Per-habit comparison (30d completion %)
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perHabitComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
              <XAxis dataKey="name" fontSize={11} stroke="currentColor" opacity={0.6} />
              <YAxis
                domain={[0, 100]}
                fontSize={11}
                stroke="currentColor"
                opacity={0.6}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value}%`, "Completion rate"]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend />
              <Bar dataKey="rate" name="Completion %" radius={[4, 4, 0, 0]}>
                {perHabitComparison.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
