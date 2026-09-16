export type TimeOfDay = "morning" | "afternoon" | "evening";

export type FrequencyType = "daily" | "weekdays" | "xPerWeek";

export interface Frequency {
  type: FrequencyType;
  /** Used when type === "weekdays". 0 = Sunday ... 6 = Saturday */
  weekdays?: number[];
  /** Used when type === "xPerWeek" */
  timesPerWeek?: number;
}

export const HABIT_COLORS = [
  "#3a56f5",
  "#16a34a",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#0891b2",
  "#db2777",
  "#65a30d",
] as const;

export const HABIT_ICONS = [
  "💧",
  "🏃",
  "📚",
  "🧘",
  "🥗",
  "😴",
  "✍️",
  "🎯",
  "🧹",
  "💪",
  "🎨",
  "🌱",
] as const;

export interface Habit {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  timeOfDay: TimeOfDay;
  frequency: Frequency;
  reminderTime?: string; // "HH:MM", UI only
  createdAt: string; // ISO date
  archived: boolean;
}

export interface LogEntry {
  id: string;
  habitId: string;
  date: string; // "YYYY-MM-DD"
  completed: boolean;
  note?: string;
  completedAt?: string; // ISO timestamp
}

export interface Badge {
  id: string;
  habitId: string;
  milestone: 7 | 30 | 100;
  unlockedAt: string; // ISO timestamp
}
