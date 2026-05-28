-- Fix RLS policies for user_profiles

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- Create new policies with proper permissions
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
-- Also fix workout tables RLS
DROP POLICY IF EXISTS "Users can view own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can create own sessions" ON workout_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON workout_sessions;
CREATE POLICY "Users can view own sessions"
  ON workout_sessions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions"
  ON workout_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions"
  ON workout_sessions FOR UPDATE
  USING (auth.uid() = user_id);
-- Fix workout_sets policies
DROP POLICY IF EXISTS "Users can view own sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can create own sets" ON workout_sets;
DROP POLICY IF EXISTS "Users can update own sets" ON workout_sets;
CREATE POLICY "Users can view own sets"
  ON workout_sets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = workout_sets.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create own sets"
  ON workout_sets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = workout_sets.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );
-- Fix body_weight_logs policies
DROP POLICY IF EXISTS "Users can view own weight logs" ON body_weight_logs;
DROP POLICY IF EXISTS "Users can create own weight logs" ON body_weight_logs;
CREATE POLICY "Users can view own weight logs"
  ON body_weight_logs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create own weight logs"
  ON body_weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- Fix ai_plans policies
DROP POLICY IF EXISTS "Users can view own plans" ON ai_plans;
DROP POLICY IF EXISTS "Users can create own plans" ON ai_plans;
CREATE POLICY "Users can view own plans"
  ON ai_plans FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create own plans"
  ON ai_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);
-- Allow exercises to be read by everyone
DROP POLICY IF EXISTS "Exercises are viewable by everyone" ON exercises;
CREATE POLICY "Exercises are viewable by everyone"
  ON exercises FOR SELECT
  USING (true);
-- Allow authenticated users to create custom exercises
DROP POLICY IF EXISTS "Users can create custom exercises" ON exercises;
CREATE POLICY "Users can create custom exercises"
  ON exercises FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND is_custom = true);
