import { Habit, LogEntry } from "./types";
import { addDays, parseDateKey, toDateKey, todayKey } from "./dates";

/**
 * Determines whether a habit is "scheduled" (expected) on a given date.
 *
 * - daily: every day is scheduled.
 * - weekdays: only the chosen weekdays (0=Sun..6=Sat) are scheduled.
 * - xPerWeek: every day is *eligible*, since the user can pick which days
 *   to complete it on as long as the weekly target is met. For streak
 *   purposes we treat every day as schedulable and rely on completion
 *   data itself (see computeCurrentStreak).
 */
export function isHabitScheduledOnDate(habit: Habit, date: Date): boolean {
  const { frequency } = habit;
  if (frequency.type === "weekdays") {
    return (frequency.weekdays ?? []).includes(date.getDay());
  }
  return true; // daily & xPerWeek
}

export function isHabitCompletedOnDate(
  logs: LogEntry[],
  habitId: string,
  dateKey: string
): boolean {
  return logs.some(
    (l) => l.habitId === habitId && l.date === dateKey && l.completed
  );
}

/**
 * Current streak = number of consecutive *scheduled* days, walking
 * backwards from today, that were completed. Non-scheduled days are
 * skipped over (they don't break the streak). The streak calculation
 * starts from today; if today is scheduled but not yet completed, we
 * still allow the streak to be computed as of yesterday (a grace period
 * so the badge doesn't zero out before the day is over).
 */
export function computeCurrentStreak(habit: Habit, logs: LogEntry[]): number {
  const habitLogs = logs.filter((l) => l.habitId === habit.id);
  let cursor = parseDateKey(todayKey());
  let streak = 0;

  // If today is scheduled and not completed, start counting from yesterday
  // instead, so an in-progress day doesn't prematurely reset the streak.
  const todaysKey = toDateKey(cursor);
  if (
    isHabitScheduledOnDate(habit, cursor) &&
    !isHabitCompletedOnDate(habitLogs, habit.id, todaysKey)
  ) {
    cursor = addDays(cursor, -1);
  }

  // Safety bound: never look back more than 10 years.
  for (let i = 0; i < 3650; i++) {
    const key = toDateKey(cursor);
    const scheduled = isHabitScheduledOnDate(habit, cursor);
    if (scheduled) {
      const completed = isHabitCompletedOnDate(habitLogs, habit.id, key);
      if (completed) {
        streak += 1;
      } else {
        break;
      }
    }
    cursor = addDays(cursor, -1);
    // Stop scanning before habit was created.
    if (cursor < parseDateKey(habit.createdAt.slice(0, 10))) break;
  }

  return streak;
}

/**
 * Longest streak ever recorded: scans forward from the habit's creation
 * date (or earliest log, whichever is earlier) to today, tracking the
 * best run of consecutive completed scheduled days.
 */
export function computeLongestStreak(habit: Habit, logs: LogEntry[]): number {
  const habitLogs = logs.filter((l) => l.habitId === habit.id);
  if (habitLogs.length === 0) return 0;

  const createdDate = parseDateKey(habit.createdAt.slice(0, 10));
  const earliestLogDate = habitLogs.reduce((min, l) => {
    const d = parseDateKey(l.date);
    return d < min ? d : min;
  }, createdDate);
  const start = earliestLogDate < createdDate ? earliestLogDate : createdDate;
  const end = parseDateKey(todayKey());

  let longest = 0;
  let current = 0;
  let cursor = new Date(start);

  while (cursor <= end) {
    const key = toDateKey(cursor);
    if (isHabitScheduledOnDate(habit, cursor)) {
      if (isHabitCompletedOnDate(habitLogs, habit.id, key)) {
        current += 1;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
    cursor = addDays(cursor, 1);
  }

  return longest;
}

export function computeCompletionRate(
  habit: Habit,
  logs: LogEntry[],
  fromDate: Date,
  toDate: Date
): number {
  const habitLogs = logs.filter((l) => l.habitId === habit.id);
  let scheduledCount = 0;
  let completedCount = 0;
  let cursor = new Date(fromDate);

  while (cursor <= toDate) {
    if (isHabitScheduledOnDate(habit, cursor)) {
      scheduledCount += 1;
      if (isHabitCompletedOnDate(habitLogs, habit.id, toDateKey(cursor))) {
        completedCount += 1;
      }
    }
    cursor = addDays(cursor, 1);
  }

  if (scheduledCount === 0) return 0;
  return Math.round((completedCount / scheduledCount) * 100);
}

export const MILESTONES = [7, 30, 100] as const;
