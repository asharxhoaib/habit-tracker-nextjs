interface StreakBadgeProps {
  streak: number;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak <= 0) {
    return (
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        No streak yet
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
      🔥 {streak} day{streak === 1 ? "" : "s"}
    </span>
  );
}
