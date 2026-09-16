"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useHabitStore } from "@/store/useHabitStore";
import {
  computeCurrentStreak,
  computeLongestStreak,
  computeCompletionRate,
} from "@/lib/streaks";
import { addDays, parseDateKey, todayKey } from "@/lib/dates";
import Heatmap from "@/components/Heatmap";
import BadgeShelf from "@/components/BadgeShelf";
import HabitForm from "@/components/HabitForm";

function frequencyLabel(habit: {
  frequency: { type: string; weekdays?: number[]; timesPerWeek?: number };
}): string {
  const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  if (habit.frequency.type === "daily") return "Every day";
  if (habit.frequency.type === "weekdays") {
    return (habit.frequency.weekdays ?? [])
      .map((d) => WEEKDAY_NAMES[d])
      .join(", ");
  }
  return `${habit.frequency.timesPerWeek}x per week`;
}

export default function HabitDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const habits = useHabitStore((s) => s.habits);
  const logs = useHabitStore((s) => s.logs);
  const badges = useHabitStore((s) => s.badges);
  const toggleCompletion = useHabitStore((s) => s.toggleCompletion);
  const setNote = useHabitStore((s) => s.setNote);
  const archiveHabit = useHabitStore((s) => s.archiveHabit);
  const unarchiveHabit = useHabitStore((s) => s.unarchiveHabit);
  const deleteHabit = useHabitStore((s) => s.deleteHabit);

  const [isEditing, setIsEditing] = useState(false);
  const [noteDraftDate, setNoteDraftDate] = useState<string | null>(null);
  const [noteDraftText, setNoteDraftText] = useState("");

  const habit = habits.find((h) => h.id === params.id);
  const habitLogs = useMemo(
    () => logs.filter((l) => l.habitId === params.id).sort((a, b) => (a.date < b.date ? 1 : -1)),
    [logs, params.id]
  );
  const habitBadges = useMemo(
    () => badges.filter((b) => b.habitId === params.id),
    [badges, params.id]
  );

  if (!habit) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
        Habit not found.
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-6 md:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Edit Habit
          </h1>
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-slate-500 hover:underline dark:text-slate-400"
          >
            Cancel
          </button>
        </div>
        <HabitForm existingHabit={habit} />
      </div>
    );
  }

  const currentStreak = computeCurrentStreak(habit, logs);
  const longestStreak = computeLongestStreak(habit, logs);
  const today = new Date();
  const rate30d = computeCompletionRate(habit, logs, addDays(today, -29), today);
  const key = todayKey();
  const completedToday = habitLogs.some((l) => l.date === key && l.completed);

  function handleDelete() {
    if (!habit) return;
    if (confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
      deleteHabit(habit.id);
      router.push("/today");
    }
  }

  function openNoteEditor(date: string, existingNote?: string) {
    setNoteDraftDate(date);
    setNoteDraftText(existingNote ?? "");
  }

  function saveNote() {
    if (!habit || !noteDraftDate) return;
    setNote(habit.id, noteDraftDate, noteDraftText.trim());
    setNoteDraftDate(null);
    setNoteDraftText("");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-2xl text-white"
            style={{ backgroundColor: habit.color }}
          >
            {habit.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {habit.name}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {frequencyLabel(habit)} · {habit.timeOfDay}
              {habit.reminderTime ? ` · reminder ${habit.reminderTime}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => toggleCompletion(habit.id, key)}
          className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-white transition"
          style={{ backgroundColor: completedToday ? "#16a34a" : habit.color }}
        >
          {completedToday ? "✓ Done today" : "Mark today done"}
        </button>
      </div>

      {habit.description && (
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
          {habit.description}
        </p>
      )}

      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xl font-bold text-brand-600 dark:text-brand-300">
            {currentStreak}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Current</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xl font-bold text-slate-700 dark:text-slate-200">
            {longestStreak}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Longest</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xl font-bold text-slate-700 dark:text-slate-200">
            {rate30d}%
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">30d rate</p>
        </div>
      </div>

      <div className="mb-6">
        <BadgeShelf badges={habitBadges} />
      </div>

      <div className="mb-6">
        <Heatmap habit={habit} logs={logs} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Edit habit
        </button>
        {habit.archived ? (
          <button
            onClick={() => unarchiveHabit(habit.id)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Unarchive
          </button>
        ) : (
          <button
            onClick={() => archiveHabit(habit.id)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Archive
          </button>
        )}
        <button
          onClick={handleDelete}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Delete
        </button>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
          History log
        </h2>
        {habitLogs.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500">
            No history yet — complete this habit to start building a log.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {habitLogs.slice(0, 60).map((log) => (
              <li
                key={log.id}
                className="rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {parseDateKey(log.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span
                    className={
                      log.completed
                        ? "text-xs font-semibold text-green-600 dark:text-green-400"
                        : "text-xs font-semibold text-slate-400"
                    }
                  >
                    {log.completed ? "Completed" : "Note only"}
                  </span>
                </div>
                {log.note && (
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    “{log.note}”
                  </p>
                )}
                {noteDraftDate === log.date ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      autoFocus
                      value={noteDraftText}
                      onChange={(e) => setNoteDraftText(e.target.value)}
                      placeholder="Add a note…"
                      className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800"
                    />
                    <button
                      onClick={saveNote}
                      className="rounded-md bg-brand-600 px-2 py-1 text-xs font-medium text-white"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openNoteEditor(log.date, log.note)}
                    className="mt-1 text-xs text-brand-600 hover:underline dark:text-brand-300"
                  >
                    {log.note ? "Edit note" : "Add note"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
