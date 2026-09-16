import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Badge, Habit, LogEntry } from "@/lib/types";
import { seedHabits, seedLogs } from "@/lib/seed";
import { todayKey } from "@/lib/dates";
import { computeCurrentStreak, MILESTONES } from "@/lib/streaks";

interface HabitStore {
  habits: Habit[];
  logs: LogEntry[];
  badges: Badge[];
  hydrated: boolean;

  // Habit CRUD
  addHabit: (habit: Omit<Habit, "id" | "createdAt" | "archived">) => string;
  updateHabit: (id: string, updates: Partial<Omit<Habit, "id">>) => void;
  archiveHabit: (id: string) => void;
  unarchiveHabit: (id: string) => void;
  deleteHabit: (id: string) => void;

  // Logs
  toggleCompletion: (habitId: string, date?: string) => void;
  setNote: (habitId: string, date: string, note: string) => void;
  getLogForDate: (habitId: string, date: string) => LogEntry | undefined;

  // Badges
  checkAndUnlockBadges: (habitId: string) => Badge[];

  setHydrated: () => void;
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: seedHabits,
      logs: seedLogs,
      badges: [],
      hydrated: false,

      addHabit: (habit) => {
        const id = makeId("habit");
        const newHabit: Habit = {
          ...habit,
          id,
          createdAt: new Date().toISOString(),
          archived: false,
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
        return id;
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        }));
      },

      archiveHabit: (id) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, archived: true } : h
          ),
        }));
      },

      unarchiveHabit: (id) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, archived: false } : h
          ),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          logs: state.logs.filter((l) => l.habitId !== id),
          badges: state.badges.filter((b) => b.habitId !== id),
        }));
      },

      toggleCompletion: (habitId, date) => {
        const dateKey = date ?? todayKey();
        set((state) => {
          const existing = state.logs.find(
            (l) => l.habitId === habitId && l.date === dateKey
          );
          if (existing) {
            return {
              logs: state.logs.map((l) =>
                l.id === existing.id
                  ? {
                      ...l,
                      completed: !l.completed,
                      completedAt: !l.completed
                        ? new Date().toISOString()
                        : undefined,
                    }
                  : l
              ),
            };
          }
          const newLog: LogEntry = {
            id: makeId("log"),
            habitId,
            date: dateKey,
            completed: true,
            completedAt: new Date().toISOString(),
          };
          return { logs: [...state.logs, newLog] };
        });
        get().checkAndUnlockBadges(habitId);
      },

      setNote: (habitId, date, note) => {
        set((state) => {
          const existing = state.logs.find(
            (l) => l.habitId === habitId && l.date === date
          );
          if (existing) {
            return {
              logs: state.logs.map((l) =>
                l.id === existing.id ? { ...l, note } : l
              ),
            };
          }
          const newLog: LogEntry = {
            id: makeId("log"),
            habitId,
            date,
            completed: false,
            note,
          };
          return { logs: [...state.logs, newLog] };
        });
      },

      getLogForDate: (habitId, date) => {
        return get().logs.find((l) => l.habitId === habitId && l.date === date);
      },

      checkAndUnlockBadges: (habitId) => {
        const state = get();
        const habit = state.habits.find((h) => h.id === habitId);
        if (!habit) return [];

        const streak = computeCurrentStreak(habit, state.logs);
        const unlocked: Badge[] = [];

        for (const milestone of MILESTONES) {
          const alreadyHas = state.badges.some(
            (b) => b.habitId === habitId && b.milestone === milestone
          );
          if (!alreadyHas && streak >= milestone) {
            unlocked.push({
              id: makeId("badge"),
              habitId,
              milestone,
              unlockedAt: new Date().toISOString(),
            });
          }
        }

        if (unlocked.length > 0) {
          set((s) => ({ badges: [...s.badges, ...unlocked] }));
        }

        return unlocked;
      },

      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "habit-tracker-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
