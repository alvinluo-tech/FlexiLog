-- 1. Grant SELECT and DELETE permissions to service_role on all tables in public schema
-- (Supabase service_role should always have full privileges on all tables by default)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- 2. Grant DELETE permissions to authenticated users on sessions and sets
GRANT DELETE ON workout_sessions TO authenticated;
GRANT DELETE ON workout_sets TO authenticated;
-- 3. Enable RLS and Create DELETE policies for workout_sessions
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete own sessions" ON workout_sessions;
CREATE POLICY "Users can delete own sessions"
  ON workout_sessions FOR DELETE
  USING (auth.uid() = user_id);
-- 4. Enable RLS and Create DELETE policies for workout_sets
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete own sets" ON workout_sets;
CREATE POLICY "Users can delete own sets"
  ON workout_sets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workout_sessions 
      WHERE workout_sessions.id = workout_sets.session_id 
      AND workout_sessions.user_id = auth.uid()
    )
  );
