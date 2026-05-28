-- Add UPDATE policy + GRANT for workout_templates so users can rename their own templates
CREATE POLICY "Users can update own templates"
  ON workout_templates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT UPDATE ON workout_templates TO authenticated;
