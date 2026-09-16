import HabitForm from "@/components/HabitForm";

export default function NewHabitPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:px-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-800 dark:text-slate-100">
        New Habit
      </h1>
      <HabitForm />
    </div>
  );
}
