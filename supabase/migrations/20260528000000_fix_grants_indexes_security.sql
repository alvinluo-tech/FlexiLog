-- ═══ P0: Fix missing GRANTs ═══

-- personal_records: RLS policies exist but GRANTs were missing
GRANT SELECT, INSERT, UPDATE, DELETE ON personal_records TO authenticated;

-- ai_messages: missing DELETE
GRANT DELETE ON ai_messages TO authenticated;

-- ai_plans: missing UPDATE, DELETE
GRANT UPDATE, DELETE ON ai_plans TO authenticated;

-- body_weight_logs: missing UPDATE, DELETE
GRANT UPDATE, DELETE ON body_weight_logs TO authenticated;


-- ═══ P1: Add missing indexes on foreign keys ═══

CREATE INDEX IF NOT EXISTS idx_personal_records_workout_set_id ON personal_records(workout_set_id);
CREATE INDEX IF NOT EXISTS idx_shared_workouts_session_id ON shared_workouts(session_id);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_template_id ON workout_sessions(template_id);


-- ═══ P1: Fix function search_path + revoke anon EXECUTE ═══

CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE shared_workouts SET likes_count = likes_count + 1 WHERE id = NEW.shared_workout_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE shared_workouts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.shared_workout_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE shared_workouts SET comments_count = comments_count + 1 WHERE id = NEW.shared_workout_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE shared_workouts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.shared_workout_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke EXECUTE from anon (trigger-only functions, not API-callable)
REVOKE EXECUTE ON FUNCTION update_conversation_timestamp() FROM anon;
REVOKE EXECUTE ON FUNCTION update_likes_count() FROM anon;
REVOKE EXECUTE ON FUNCTION update_comments_count() FROM anon;
