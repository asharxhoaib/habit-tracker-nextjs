# Habitual — Habit Tracker

A production-ready habit tracker built with Next.js 14 (App Router), TypeScript,
Tailwind CSS, Zustand, TanStack Query, and Recharts.

## Features

- **Today view** — checklist of today's habits grouped by morning / afternoon /
  evening, with one-tap complete toggle and a live streak badge per habit.
- **Habit CRUD** — create/edit a habit with a custom frequency (daily, specific
  weekdays, or X times per week), an icon + color picker, and an optional
  reminder time (UI only — no real notifications are scheduled).
- **Streak calendar** — a GitHub-contributions-style month heatmap per habit,
  with current streak and longest streak stats, month navigation.
- **Stats dashboard** — a Recharts line chart of completion rate over the last
  14 days, a per-habit bar chart comparison over 30 days, and an overall
  consistency score.
- **Gamification** — milestone badges (7 / 30 / 100-day streaks) that unlock
  automatically and are shown in a badge shelf, plus a CSS-only confetti burst
  when you complete a habit.
- **Habit detail page** — full history log, edit / archive / delete actions,
  and optional free-text notes per completion.
- **Dark mode** — toggle persisted to `localStorage`, respected across every
  screen.
- **Responsive layout** — mobile: stacked checklist with a bottom tab bar.
  Desktop: a persistent sidebar with a dashboard-style grid.

## Tech stack

| Concern            | Choice                                   |
| ------------------- | ----------------------------------------- |
| Framework           | Next.js 14, App Router, TypeScript        |
| Styling             | Tailwind CSS (class-based dark mode)      |
| Client state        | Zustand, persisted to `localStorage`      |
| Server/async state  | TanStack Query (`QueryClientProvider`)    |
| Charts              | Recharts                                  |

## Architecture

```
app/
  layout.tsx            Root layout: sidebar (desktop) + bottom nav (mobile)
  page.tsx               Redirects "/" to "/today"
  today/page.tsx          Today checklist, grouped by time of day
  calendar/page.tsx       Habit picker + streak heatmap
  stats/page.tsx          Recharts dashboard
  habit/new/page.tsx      Create-habit form
  habit/[id]/page.tsx     Habit detail: history, edit, archive, delete, notes

components/
  Sidebar.tsx / BottomNav.tsx   Navigation shells (desktop / mobile)
  HabitCard.tsx                 Today-list row: toggle, streak badge, confetti
  HabitForm.tsx                 Shared create/edit form
  Heatmap.tsx                   Month-grid streak calendar for one habit
  BadgeShelf.tsx                 Milestone badge display (locked/unlocked)
  StreakBadge.tsx                 Small "🔥 N days" pill
  ConfettiOverlay.tsx             CSS-only completion animation
  DarkModeToggle.tsx               Persisted dark-mode switch
  Providers.tsx                     TanStack QueryClientProvider + theme sync

store/
  useHabitStore.ts     Zustand store: habits, logs, badges (persisted)
  useThemeStore.ts     Zustand store: dark mode flag (persisted)

lib/
  types.ts       Habit / LogEntry / Badge / Frequency types, icon & color enums
  dates.ts       Local-time date helpers (date keys, month matrix, etc.)
  streaks.ts      Streak, completion-rate, and scheduling calculations
  seed.ts         Deterministic mock seed data (5 habits, ~45 days of logs)
```

State is split into two independent Zustand stores so that toggling dark mode
never triggers a re-render of habit data consumers, and vice versa. Both
stores use Zustand's `persist` middleware backed by `localStorage`, so all
data survives a page reload with no backend required.

## Streak-calculation logic

Streaks are computed from two building blocks in `lib/streaks.ts`:

1. **`isHabitScheduledOnDate(habit, date)`** — decides whether a habit is
   "due" on a given calendar date:
   - `daily` → every date is scheduled.
   - `weekdays` → only the chosen weekdays (0 = Sunday … 6 = Saturday).
   - `xPerWeek` → every date is *eligible* (the user can pick which days to
     do it on, as long as the weekly target is met), so every day counts as
     schedulable for streak purposes and the actual completion log drives the
     count.

2. **`computeCurrentStreak(habit, logs)`** — walks backward day-by-day from
   today. Non-scheduled days are skipped without breaking the streak;
   scheduled-but-incomplete days end it. If *today* is scheduled but not yet
   completed, the walk starts from yesterday instead — this is a grace period
   so an in-progress day doesn't zero out the streak before it's over.

   **`computeLongestStreak(habit, logs)`** scans forward from the habit's
   creation date (or its earliest log, if older) through today, tracking the
   best run of consecutive completed scheduled days — this is what powers the
   "Longest" stat and the 7/30/100-day milestone badges.

3. **`computeCompletionRate(habit, logs, from, to)`** — counts
   `completed / scheduled` scheduled days in a date range, used for the 30-day
   rate on the habit detail page and the per-habit bar chart on the stats
   dashboard.

Milestone badges (`useHabitStore.checkAndUnlockBadges`) are evaluated every
time a habit is toggled complete: if the freshly recomputed current streak
crosses 7, 30, or 100 and that badge hasn't been unlocked yet, it's added to
the store and immediately visible in the habit's badge shelf.

## Running locally

This repository ships source files only — no `node_modules`,
`package-lock.json`, or build artifacts are committed.

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The app seeds
itself with 5 example habits and ~45 days of mock history on first load, all
stored client-side in `localStorage` under the `habit-tracker-storage` and
`habit-tracker-theme` keys — clear those keys (or use dev tools' "Clear site
data") to reset to a blank slate.

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint with the Next.js ESLint config
```

## Notes

- Reminder times are stored and displayed on the habit detail page but do not
  trigger real browser or push notifications — this is UI-only, by design.
- There is no backend: all persistence is `localStorage` via Zustand's
  `persist` middleware, which is why every store read gracefully handles the
  pre-hydration state (`hydrated` flag) to avoid server/client markup
  mismatches.
