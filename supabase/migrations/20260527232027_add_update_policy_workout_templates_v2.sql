CREATE POLICY "Users can update own templates"
  ON workout_templates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);;
