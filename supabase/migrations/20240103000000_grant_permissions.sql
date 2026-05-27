-- Grant permissions to anon and authenticated roles

-- user_profiles
GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO anon;

-- workout_sessions
GRANT SELECT, INSERT, UPDATE ON workout_sessions TO authenticated;
GRANT SELECT ON workout_sessions TO anon;

-- workout_sets
GRANT SELECT, INSERT, UPDATE ON workout_sets TO authenticated;
GRANT SELECT ON workout_sets TO anon;

-- exercises
GRANT SELECT ON exercises TO anon;
GRANT SELECT, INSERT ON exercises TO authenticated;

-- body_weight_logs
GRANT SELECT, INSERT ON body_weight_logs TO authenticated;
GRANT SELECT ON body_weight_logs TO anon;

-- ai_plans
GRANT SELECT, INSERT ON ai_plans TO authenticated;
GRANT SELECT ON ai_plans TO anon;

-- workout_templates
GRANT SELECT ON workout_templates TO anon;
GRANT SELECT, INSERT ON workout_templates TO authenticated;
