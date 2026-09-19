-- ==============================================================================
-- QubitLabs: Supabase PostgreSQL Database Schema & Row Level Security (RLS)
-- Migration: 20260919000000_init_qubitlabs_schema.sql
-- ==============================================================================

-- 1. PROFILES TABLE (User identity linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. USER PROGRESSION TABLE (XP, Streaks, Counters)
CREATE TABLE IF NOT EXISTS public.user_progression (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    xp INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date TEXT DEFAULT '',
    simulation_count INTEGER NOT NULL DEFAULT 0,
    copilot_inquiry_count INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. LESSON PROGRESS TABLE (Completed curriculum modules)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_lesson UNIQUE (user_id, lesson_id)
);

-- 4. CHALLENGE PROGRESS TABLE (Hands-on circuit challenges)
CREATE TABLE IF NOT EXISTS public.challenge_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    challenge_id TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT true,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_challenge UNIQUE (user_id, challenge_id)
);

-- 5. QUIZ PROGRESS TABLE (Conceptual quiz attempts & best scores)
CREATE TABLE IF NOT EXISTS public.quiz_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    best_score INTEGER NOT NULL DEFAULT 0,
    attempts INTEGER NOT NULL DEFAULT 1,
    passed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_quiz UNIQUE (user_id, lesson_id)
);

-- 6. USER ACHIEVEMENTS TABLE (Physical & algorithmic milestones)
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- 7. LEARNING ACTIVITY LOG TABLE (Milestone history)
CREATE TABLE IF NOT EXISTS public.learning_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user ON public.challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_user ON public.quiz_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_activity_user ON public.learning_activity(user_id, created_at DESC);

-- ==============================================================================
-- AUTOMATIC PROFILE & PROGRESSION TRIGGER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    initial_name TEXT;
BEGIN
    initial_name := COALESCE(
        NEW.raw_user_meta_data->>'display_name',
        split_part(NEW.email, '@', 1),
        'Quantum Explorer'
    );

    INSERT INTO public.profiles (id, email, display_name)
    VALUES (NEW.id, NEW.email, initial_name)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_progression (user_id, xp, current_streak, longest_streak)
    VALUES (NEW.id, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (MANDATORY)
-- ==============================================================================

-- 1. PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. USER PROGRESSION
ALTER TABLE public.user_progression ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progression"
    ON public.user_progression FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progression"
    ON public.user_progression FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progression"
    ON public.user_progression FOR UPDATE
    USING (auth.uid() = user_id);

-- 3. LESSON PROGRESS
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lesson progress"
    ON public.lesson_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lesson progress"
    ON public.lesson_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lesson progress"
    ON public.lesson_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lesson progress"
    ON public.lesson_progress FOR DELETE
    USING (auth.uid() = user_id);

-- 4. CHALLENGE PROGRESS
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own challenge progress"
    ON public.challenge_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress"
    ON public.challenge_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress"
    ON public.challenge_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challenge progress"
    ON public.challenge_progress FOR DELETE
    USING (auth.uid() = user_id);

-- 5. QUIZ PROGRESS
ALTER TABLE public.quiz_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own quiz progress"
    ON public.quiz_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz progress"
    ON public.quiz_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quiz progress"
    ON public.quiz_progress FOR UPDATE
    USING (auth.uid() = user_id);

-- 6. USER ACHIEVEMENTS
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
    ON public.user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
    ON public.user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 7. LEARNING ACTIVITY
ALTER TABLE public.learning_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activity log"
    ON public.learning_activity FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity log"
    ON public.learning_activity FOR INSERT
    WITH CHECK (auth.uid() = user_id);
