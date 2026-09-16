"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Frequency,
  FrequencyType,
  Habit,
  HABIT_COLORS,
  HABIT_ICONS,
  TimeOfDay,
} from "@/lib/types";
import { useHabitStore } from "@/store/useHabitStore";
import { WEEKDAY_LABELS } from "@/lib/dates";

interface HabitFormProps {
  existingHabit?: Habit;
}

export default function HabitForm({ existingHabit }: HabitFormProps) {
  const router = useRouter();
  const addHabit = useHabitStore((s) => s.addHabit);
  const updateHabit = useHabitStore((s) => s.updateHabit);

  const [name, setName] = useState(existingHabit?.name ?? "");
  const [description, setDescription] = useState(
    existingHabit?.description ?? ""
  );
  const [icon, setIcon] = useState(existingHabit?.icon ?? HABIT_ICONS[0]);
  const [color, setColor] = useState(existingHabit?.color ?? HABIT_COLORS[0]);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(
    existingHabit?.timeOfDay ?? "morning"
  );
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(
    existingHabit?.frequency.type ?? "daily"
  );
  const [weekdays, setWeekdays] = useState<number[]>(
    existingHabit?.frequency.weekdays ?? [1, 2, 3, 4, 5]
  );
  const [timesPerWeek, setTimesPerWeek] = useState(
    existingHabit?.frequency.timesPerWeek ?? 3
  );
  const [reminderTime, setReminderTime] = useState(
    existingHabit?.reminderTime ?? ""
  );
  const [error, setError] = useState("");

  function toggleWeekday(day: number) {
    setWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give your habit a name.");
      return;
    }
    if (frequencyType === "weekdays" && weekdays.length === 0) {
      setError("Pick at least one weekday.");
      return;
    }

    const frequency: Frequency =
      frequencyType === "daily"
        ? { type: "daily" }
        : frequencyType === "weekdays"
        ? { type: "weekdays", weekdays }
        : { type: "xPerWeek", timesPerWeek };

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      timeOfDay,
      frequency,
      reminderTime: reminderTime || undefined,
    };

    if (existingHabit) {
      updateHabit(existingHabit.id, payload);
      router.push(`/habit/${existingHabit.id}`);
    } else {
      const id = addHabit(payload);
      router.push(`/habit/${id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-300">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Habit name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Drink water"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Description (optional)
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. 8 glasses a day"
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Icon
        </label>
        <div className="flex flex-wrap gap-2">
          {HABIT_ICONS.map((i) => (
            <button
              type="button"
              key={i}
              onClick={() => setIcon(i)}
              className={clsx(
                "flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition",
                icon === i
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/40"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              )}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Color
        </label>
        <div className="flex flex-wrap gap-2">
          {HABIT_COLORS.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setColor(c)}
              aria-label={`Choose color ${c}`}
              className={clsx(
                "h-9 w-9 rounded-full border-2 transition",
                color === c
                  ? "border-slate-800 dark:border-white"
                  : "border-transparent"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Time of day
        </label>
        <div className="flex gap-2">
          {(["morning", "afternoon", "evening"] as TimeOfDay[]).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setTimeOfDay(t)}
              className={clsx(
                "flex-1 rounded-lg border px-3 py-2 text-sm capitalize transition",
                timeOfDay === t
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Frequency
        </label>
        <div className="flex gap-2">
          {(
            [
              { key: "daily", label: "Every day" },
              { key: "weekdays", label: "Specific days" },
              { key: "xPerWeek", label: "X per week" },
            ] as { key: FrequencyType; label: string }[]
          ).map((f) => (
            <button
              type="button"
              key={f.key}
              onClick={() => setFrequencyType(f.key)}
              className={clsx(
                "flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition",
                frequencyType === f.key
                  ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {frequencyType === "weekdays" && (
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map((label, idx) => (
              <button
                type="button"
                key={label}
                onClick={() => toggleWeekday(idx)}
                className={clsx(
                  "flex h-9 w-12 items-center justify-center rounded-lg border text-xs font-medium transition",
                  weekdays.includes(idx)
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {frequencyType === "xPerWeek" && (
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={7}
              value={timesPerWeek}
              onChange={(e) => setTimesPerWeek(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-24 text-sm text-slate-600 dark:text-slate-300">
              {timesPerWeek}x / week
            </span>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          Reminder time (optional)
        </label>
        <input
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Display only — this app does not send real notifications.
        </p>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
      >
        {existingHabit ? "Save changes" : "Create habit"}
      </button>
    </form>
  );
}
