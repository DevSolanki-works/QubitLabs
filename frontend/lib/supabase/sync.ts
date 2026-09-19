import { createClient, isSupabaseConfigured } from "./client";
import { GamificationState, DEFAULT_STATE } from "../gamification";
import { getCompletedLessons } from "../progress";

const PROGRESS_STORAGE_KEY = "qubitlabs-progress";
const GAMIFICATION_STORAGE_KEY = "qubitlabs-gamification";

/**
 * Fetch all user learning records from Supabase and synchronize them into local client state.
 */
export async function syncUserDataFromSupabase(userId: string): Promise<{
  completedLessons: string[];
  gamification: GamificationState;
}> {
  if (!isSupabaseConfigured() || typeof window === "undefined") {
    return { completedLessons: [], gamification: DEFAULT_STATE };
  }

  const supabase = createClient();

  try {
    // 1. Fetch completed lessons
    const { data: lessonRows, error: lessonErr } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("completed", true);

    if (lessonErr) console.warn("Supabase lesson_progress error:", lessonErr);

    const completedLessons = (lessonRows || []).map((r: { lesson_id: string }) => r.lesson_id);

    // 2. Fetch progression (XP, streak, counters)
    const { data: progressionRow, error: progErr } = await supabase
      .from("user_progression")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (progErr) console.warn("Supabase user_progression error:", progErr);

    // 3. Fetch achievements
    const { data: achievementRows, error: achErr } = await supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at")
      .eq("user_id", userId);

    if (achErr) console.warn("Supabase user_achievements error:", achErr);

    const unlockedAchievements = (achievementRows || []).map((a: { achievement_id: string; unlocked_at: string }) => ({
      id: a.achievement_id,
      unlockedAt: a.unlocked_at,
    }));

    // 4. Fetch quiz progress
    const { data: quizRows, error: quizErr } = await supabase
      .from("quiz_progress")
      .select("*")
      .eq("user_id", userId);

    if (quizErr) console.warn("Supabase quiz_progress error:", quizErr);

    const quizzes: GamificationState["quizzes"] = {};
    (quizRows || []).forEach((q: {
      lesson_id: string;
      passed: boolean;
      score: number;
      total: number;
      attempts: number;
      best_score: number;
      completed_at: string;
    }) => {
      quizzes[q.lesson_id] = {
        passed: q.passed,
        score: q.score,
        total: q.total,
        attempts: q.attempts,
        bestScore: q.best_score,
        completedAt: q.completed_at,
      };
    });

    // 5. Fetch recent activity log for history
    const { data: activityRows, error: actErr } = await supabase
      .from("learning_activity")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (actErr) console.warn("Supabase learning_activity error:", actErr);

    const history = (activityRows || []).map((a: { id: string; description: string; xp_earned: number; created_at: string }) => ({
      id: a.id,
      description: a.description,
      xp: a.xp_earned,
      timestamp: a.created_at,
    }));

    const gamification: GamificationState = {
      xp: progressionRow?.xp ?? 0,
      unlockedAchievements,
      simulationCount: progressionRow?.simulation_count ?? 0,
      copilotInquiryCount: progressionRow?.copilot_inquiry_count ?? 0,
      streak: {
        lastActiveDate: progressionRow?.last_active_date || "",
        currentStreak: progressionRow?.current_streak ?? 0,
        longestStreak: progressionRow?.longest_streak ?? 0,
      },
      quizzes,
      history,
    };

    // Hydrate localStorage cache
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(completedLessons));
    localStorage.setItem(GAMIFICATION_STORAGE_KEY, JSON.stringify(gamification));

    // Dispatch reactive events for mounted UI components
    window.dispatchEvent(new Event("qubitlabs-progress-updated"));
    window.dispatchEvent(new Event("qubitlabs-gamification-updated"));

    return { completedLessons, gamification };
  } catch (err) {
    console.error("Failed to sync user data from Supabase:", err);
    return { completedLessons: [], gamification: DEFAULT_STATE };
  }
}

/**
 * Migrate anonymous local progress to the user's Supabase account on first login/signup.
 */
export async function migrateLocalDataToSupabase(userId: string): Promise<void> {
  if (!isSupabaseConfigured() || typeof window === "undefined") return;

  const supabase = createClient();
  const localLessons = getCompletedLessons();
  const localGamificationRaw = localStorage.getItem(GAMIFICATION_STORAGE_KEY);
  let localGamification: GamificationState | null = null;

  try {
    if (localGamificationRaw) {
      localGamification = JSON.parse(localGamificationRaw);
    }
  } catch {
    localGamification = null;
  }

  // Only migrate if there is meaningful local progress
  const hasLocalProgress =
    localLessons.length > 0 ||
    (localGamification && localGamification.xp > 0);

  if (!hasLocalProgress) return;

  try {
    // 1. Migrate lessons
    if (localLessons.length > 0) {
      const lessonPayloads = localLessons.map((lessonId) => ({
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
      }));
      await supabase.from("lesson_progress").upsert(lessonPayloads, {
        onConflict: "user_id,lesson_id",
      });
    }

    // 2. Migrate achievements
    if (localGamification?.unlockedAchievements?.length) {
      const achPayloads = localGamification.unlockedAchievements.map((ach) => ({
        user_id: userId,
        achievement_id: ach.id,
        unlocked_at: ach.unlockedAt || new Date().toISOString(),
      }));
      await supabase.from("user_achievements").upsert(achPayloads, {
        onConflict: "user_id,achievement_id",
      });
    }

    // 3. Migrate quizzes
    if (localGamification?.quizzes && Object.keys(localGamification.quizzes).length > 0) {
      const quizPayloads = Object.entries(localGamification.quizzes).map(
        ([lessonId, q]) => ({
          user_id: userId,
          lesson_id: lessonId,
          score: q.score,
          total: q.total,
          best_score: q.bestScore,
          attempts: q.attempts,
          passed: q.passed,
          completed_at: q.completedAt,
        })
      );
      await supabase.from("quiz_progress").upsert(quizPayloads, {
        onConflict: "user_id,lesson_id",
      });
    }

    // 4. Update user progression
    if (localGamification) {
      await supabase.from("user_progression").upsert(
        {
          user_id: userId,
          xp: localGamification.xp,
          current_streak: localGamification.streak?.currentStreak || 0,
          longest_streak: localGamification.streak?.longestStreak || 0,
          last_active_date: localGamification.streak?.lastActiveDate || "",
          simulation_count: localGamification.simulationCount || 0,
          copilot_inquiry_count: localGamification.copilotInquiryCount || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
    }
  } catch (err) {
    console.error("Failed to migrate local data to Supabase:", err);
  }
}

/**
 * Asynchronously persist a lesson completion to Supabase.
 */
export async function persistLessonToSupabase(
  userId: string,
  lessonId: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  try {
    await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );
  } catch (err) {
    console.warn("Could not persist lesson to Supabase:", err);
  }
}

/**
 * Asynchronously persist challenge completion to Supabase.
 */
export async function persistChallengeToSupabase(
  userId: string,
  challengeId: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  try {
    await supabase.from("challenge_progress").upsert(
      {
        user_id: userId,
        challenge_id: challengeId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,challenge_id" }
    );
  } catch (err) {
    console.warn("Could not persist challenge to Supabase:", err);
  }
}

/**
 * Asynchronously persist quiz submission to Supabase.
 */
export async function persistQuizToSupabase(
  userId: string,
  lessonId: string,
  score: number,
  total: number,
  bestScore: number,
  attempts: number,
  passed: boolean
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  try {
    await supabase.from("quiz_progress").upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        score,
        total,
        best_score: bestScore,
        attempts,
        passed,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" }
    );
  } catch (err) {
    console.warn("Could not persist quiz to Supabase:", err);
  }
}

/**
 * Asynchronously persist user achievement to Supabase.
 */
export async function persistAchievementToSupabase(
  userId: string,
  achievementId: string
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  try {
    await supabase.from("user_achievements").upsert(
      {
        user_id: userId,
        achievement_id: achievementId,
        unlocked_at: new Date().toISOString(),
      },
      { onConflict: "user_id,achievement_id" }
    );
  } catch (err) {
    console.warn("Could not persist achievement to Supabase:", err);
  }
}

/**
 * Asynchronously persist user progression state (XP, streak, counters) to Supabase.
 */
export async function persistProgressionToSupabase(
  userId: string,
  state: GamificationState
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  try {
    await supabase.from("user_progression").upsert(
      {
        user_id: userId,
        xp: state.xp,
        current_streak: state.streak?.currentStreak || 0,
        longest_streak: state.streak?.longestStreak || 0,
        last_active_date: state.streak?.lastActiveDate || "",
        simulation_count: state.simulationCount || 0,
        copilot_inquiry_count: state.copilotInquiryCount || 0,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  } catch (err) {
    console.warn("Could not persist progression to Supabase:", err);
  }
}

/**
 * Asynchronously log a milestone learning activity to Supabase.
 */
export async function logActivityToSupabase(
  userId: string,
  activityType: string,
  description: string,
  xpEarned: number
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  try {
    await supabase.from("learning_activity").insert({
      user_id: userId,
      activity_type: activityType,
      description,
      xp_earned: xpEarned,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Could not log activity to Supabase:", err);
  }
}

/**
 * Clear client-side local cache on sign out to guarantee user data isolation.
 */
export function clearClientUserData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PROGRESS_STORAGE_KEY);
    localStorage.removeItem(GAMIFICATION_STORAGE_KEY);
    window.dispatchEvent(new Event("qubitlabs-progress-updated"));
    window.dispatchEvent(new Event("qubitlabs-gamification-updated"));
  } catch (err) {
    console.warn("Failed to clear local user data:", err);
  }
}
