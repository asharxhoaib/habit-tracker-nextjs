import { Habit, LogEntry } from "./types";
import { addDays, toDateKey } from "./dates";

const now = new Date();
const createdAt = addDays(now, -45).toISOString();

export const seedHabits: Habit[] = [
  {
    id: "habit-water",
    name: "Drink water",
    description: "8 glasses a day",
    icon: "💧",
    color: "#0891b2",
    timeOfDay: "morning",
    frequency: { type: "daily" },
    reminderTime: "08:00",
    createdAt,
    archived: false,
  },
  {
    id: "habit-run",
    name: "Morning run",
    description: "30 minute jog",
    icon: "🏃",
    color: "#16a34a",
    timeOfDay: "morning",
    frequency: { type: "weekdays", weekdays: [1, 3, 5] },
    reminderTime: "06:30",
    createdAt,
    archived: false,
  },
  {
    id: "habit-read",
    name: "Read 20 pages",
    description: "Any book counts",
    icon: "📚",
    color: "#8b5cf6",
    timeOfDay: "evening",
    frequency: { type: "daily" },
    reminderTime: "21:00",
    createdAt,
    archived: false,
  },
  {
    id: "habit-meditate",
    name: "Meditate",
    description: "10 minutes of mindfulness",
    icon: "🧘",
    color: "#f59e0b",
    timeOfDay: "morning",
    frequency: { type: "xPerWeek", timesPerWeek: 4 },
    createdAt,
    archived: false,
  },
  {
    id: "habit-stretch",
    name: "Stretch",
    description: "Loosen up before bed",
    icon: "🎯",
    color: "#ef4444",
    timeOfDay: "evening",
    frequency: { type: "daily" },
    reminderTime: "22:00",
    createdAt,
    archived: false,
  },
];

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateSeedLogs(habits: Habit[]): LogEntry[] {
  const logs: LogEntry[] = [];
  let seedCounter = 1;

  for (const habit of habits) {
    for (let i = 44; i >= 0; i--) {
      const date = addDays(now, -i);
      const dateKey = toDateKey(date);
      const chance = pseudoRandom(seedCounter * 13.37 + date.getDate());
      seedCounter += 1;

      // Bias toward completion to make the seed data feel "lived in".
      const completed = chance > 0.28;
      if (!completed) continue;

      logs.push({
        id: `log-${habit.id}-${dateKey}`,
        habitId: habit.id,
        date: dateKey,
        completed: true,
        completedAt: date.toISOString(),
      });
    }
  }

  return logs;
}

export const seedLogs: LogEntry[] = generateSeedLogs(seedHabits);
