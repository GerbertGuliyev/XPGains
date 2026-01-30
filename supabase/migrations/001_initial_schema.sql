-- XPGains Initial Schema Migration
-- Creates all tables with RLS policies for the fitness tracking app

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Extends auth.users with display name
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER BODY METRICS
-- Physical measurements for calculations
-- ============================================
CREATE TABLE IF NOT EXISTS user_body (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  height_cm INTEGER,
  weight_kg NUMERIC(5,2),
  body_fat_percent NUMERIC(4,1),
  age INTEGER,
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER STATS
-- Cached skill XP (derived from XP events)
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_xp JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROGRAM ENROLLMENTS
-- Tracks user enrollment in training programs
-- ============================================
CREATE TABLE IF NOT EXISTS program_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT NOT NULL,
  current_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Only one active enrollment per program per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_program_enrollments_unique_active
  ON program_enrollments(user_id, program_id)
  WHERE status = 'active';

-- ============================================
-- WORKOUT SESSIONS
-- Source of truth for completed workouts
-- ============================================
CREATE TABLE IF NOT EXISTS workout_sessions (
  id UUID PRIMARY KEY,  -- Client-generated for idempotency
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id TEXT,
  workout_id TEXT,
  completed_at TIMESTAMPTZ NOT NULL,
  duration_seconds INTEGER,
  total_xp_earned INTEGER NOT NULL,
  exercises JSONB NOT NULL,  -- Array of exercise data
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user ON workout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_completed ON workout_sessions(user_id, completed_at DESC);

-- ============================================
-- XP EVENTS
-- Immutable log of all XP changes
-- This is the canonical source for XP tracking
-- ============================================
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_event_id TEXT NOT NULL,  -- For idempotent inserts
  source_session_id UUID REFERENCES workout_sessions(id),
  skill_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workout', 'spillover', 'bonus', 'manual')),
  amount INTEGER NOT NULL,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint prevents duplicate XP awards
CREATE UNIQUE INDEX IF NOT EXISTS idx_xp_events_client_event
  ON xp_events(user_id, client_event_id);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_xp_events_user ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_skill ON xp_events(user_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created ON xp_events(user_id, created_at DESC);

-- ============================================
-- USER SETTINGS
-- Preferences and configuration
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  unit TEXT DEFAULT 'kg' CHECK (unit IN ('kg', 'lbs')),
  theme TEXT DEFAULT 'classic',
  language TEXT DEFAULT 'en',
  equipment_enabled BOOLEAN DEFAULT FALSE,
  equipment_available TEXT[] DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOM EXERCISES
-- User-defined exercises
-- ============================================
CREATE TABLE IF NOT EXISTS custom_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,  -- Client-generated ID "custom_timestamp"
  name TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('compound', 'isolation', 'bodyweight')),
  weight_config JSONB NOT NULL,
  reference_weight NUMERIC(5,2),
  xp_mode TEXT DEFAULT 'standard' CHECK (xp_mode IN ('standard', 'custom')),
  custom_xp_per_set INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on user + exercise_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_exercises_unique
  ON custom_exercises(user_id, exercise_id);

-- ============================================
-- TRAINING PLANS
-- User-defined workout plans
-- ============================================
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,  -- Client-generated ID
  name TEXT NOT NULL,
  items JSONB NOT NULL,  -- Array of plan items
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on user + plan_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_training_plans_unique
  ON training_plans(user_id, plan_id);

-- ============================================
-- FAVORITES
-- User's favorited exercises
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY(user_id, exercise_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- All tables restricted to authenticated user's own data
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_body ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User body policies
CREATE POLICY "Users can manage own body data"
  ON user_body FOR ALL
  USING (auth.uid() = user_id);

-- User stats policies
CREATE POLICY "Users can manage own stats"
  ON user_stats FOR ALL
  USING (auth.uid() = user_id);

-- Program enrollments policies
CREATE POLICY "Users can manage own enrollments"
  ON program_enrollments FOR ALL
  USING (auth.uid() = user_id);

-- Workout sessions policies
CREATE POLICY "Users can manage own sessions"
  ON workout_sessions FOR ALL
  USING (auth.uid() = user_id);

-- XP events policies
CREATE POLICY "Users can manage own xp events"
  ON xp_events FOR ALL
  USING (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);

-- Custom exercises policies
CREATE POLICY "Users can manage own custom exercises"
  ON custom_exercises FOR ALL
  USING (auth.uid() = user_id);

-- Training plans policies
CREATE POLICY "Users can manage own plans"
  ON training_plans FOR ALL
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);

  INSERT INTO user_stats (user_id, skill_xp)
  VALUES (NEW.id, '{}'::jsonb);

  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to recalculate user stats from XP events
CREATE OR REPLACE FUNCTION recalculate_user_stats(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_skill_xp JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_object_agg(skill_id, total_xp),
    '{}'::jsonb
  )
  INTO v_skill_xp
  FROM (
    SELECT skill_id, SUM(amount)::INTEGER as total_xp
    FROM xp_events
    WHERE user_id = p_user_id
    GROUP BY skill_id
  ) sub;

  INSERT INTO user_stats (user_id, skill_xp, updated_at)
  VALUES (p_user_id, v_skill_xp, NOW())
  ON CONFLICT (user_id)
  DO UPDATE SET skill_xp = v_skill_xp, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers to tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_body_updated_at
  BEFORE UPDATE ON user_body
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_program_enrollments_updated_at
  BEFORE UPDATE ON program_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_plans_updated_at
  BEFORE UPDATE ON training_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
