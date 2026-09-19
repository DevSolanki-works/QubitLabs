const STORAGE_KEY = "qubitlabs-progress";

export function getCompletedLessons(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((id) => String(id));
  } catch {
    return [];
  }
}

import { awardXP, unlockAchievement } from "./gamification";
import { createClient, isSupabaseConfigured } from "./supabase/client";
import { persistLessonToSupabase } from "./supabase/sync";

export function isLessonComplete(lessonId: string): boolean {
  return getCompletedLessons().includes(lessonId);
}

export function markLessonComplete(lessonId: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const completed = getCompletedLessons();
    if (!completed.includes(lessonId)) {
      const updated = [...completed, lessonId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      // Award +50 XP for completing a lesson
      awardXP(50, `Completed Lesson: ${lessonId}`);

      // Check relevant achievements
      unlockAchievement("first-qubit");
      if (lessonId === "measurement") unlockAchievement("quantum-measure");
      if (lessonId === "superposition") unlockAchievement("pure-superposition");
      if (lessonId === "entanglement") unlockAchievement("spooky-correlation");
      if (lessonId === "deutsch-jozsa") unlockAchievement("phase-kickback");
      if (lessonId === "grovers-algorithm") unlockAchievement("database-inverter");

      // Check if all level 1 lessons completed
      const level1Lessons = ["qubit-basics", "measurement", "superposition", "bloch-sphere"];
      if (level1Lessons.every((id) => updated.includes(id))) {
        unlockAchievement("foundations-scholar");
      }

      // Dispatch a custom storage event so other components on the same page can re-render
      window.dispatchEvent(new Event("qubitlabs-progress-updated"));

      // Asynchronously persist to Supabase if authenticated
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        supabase.auth.getUser().then((res: any) => {
          const user = res?.data?.user;
          if (user) {
            persistLessonToSupabase(user.id, lessonId);
          }
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error("Failed to save progress to localStorage:", err);
  }
}

export function resetProgress(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("qubitlabs-progress-updated"));
  } catch (err) {
    console.error("Failed to reset progress:", err);
  }
}

export function getProgress(totalLessons: number): {
  completed: number;
  total: number;
  percentage: number;
} {
  const completed = getCompletedLessons();
  const validCompletedCount = Math.min(completed.length, totalLessons);
  const percentage =
    totalLessons <= 0
      ? 0
      : Math.round((validCompletedCount / totalLessons) * 100);

  return {
    completed: validCompletedCount,
    total: totalLessons,
    percentage,
  };
}

export type LessonProgressStatus = "completed" | "current" | "available";

export function getLessonStatus(
  lessonId: string,
  completedLessons: string[],
  allLessonIds: string[]
): LessonProgressStatus {
  if (completedLessons.includes(lessonId)) {
    return "completed";
  }

  // The first uncompleted lesson in the sequence is marked as "current"
  const firstUncompletedId = allLessonIds.find(
    (id) => !completedLessons.includes(id)
  );

  if (firstUncompletedId === lessonId) {
    return "current";
  }

  return "available";
}
