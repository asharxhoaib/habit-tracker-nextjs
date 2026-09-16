import { Badge } from "@/lib/types";
import { MILESTONES } from "@/lib/streaks";

interface BadgeShelfProps {
  badges: Badge[];
}

const MILESTONE_META: Record<number, { label: string; icon: string }> = {
  7: { label: "7-Day Streak", icon: "🥉" },
  30: { label: "30-Day Streak", icon: "🥈" },
  100: { label: "100-Day Streak", icon: "🥇" },
};

export default function BadgeShelf({ badges }: BadgeShelfProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
        Milestone Badges
      </h3>
      <div className="flex flex-wrap gap-3">
        {MILESTONES.map((milestone) => {
          const unlocked = badges.find((b) => b.milestone === milestone);
          const meta = MILESTONE_META[milestone];
          return (
            <div
              key={milestone}
              className={`flex w-24 flex-col items-center gap-1 rounded-lg border p-3 text-center transition ${
                unlocked
                  ? "border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/30"
                  : "border-dashed border-slate-200 opacity-50 dark:border-slate-700"
              }`}
            >
              <span className="text-2xl">{meta.icon}</span>
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                {meta.label}
              </span>
              {!unlocked && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Locked
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
