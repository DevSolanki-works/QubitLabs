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

    return parsed;
  } catch {
    return [];
  }
}

export function isLessonComplete(
  lessonId: string
): boolean {
  return getCompletedLessons().includes(lessonId);
}

export function markLessonComplete(
  lessonId: string
) {
  if (typeof window === "undefined") {
    return;
  }

  const completed = getCompletedLessons();

  if (!completed.includes(lessonId)) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        ...completed,
        lessonId,
      ])
    );
  }
}

export function getProgress(
  totalLessons: number
) {
  const completed = getCompletedLessons();

  return {
    completed: completed.length,
    total: totalLessons,
    percentage:
      totalLessons === 0
        ? 0
        : Math.round(
            (completed.length / totalLessons) * 100
          ),
  };
}