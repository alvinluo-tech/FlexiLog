-- Add user_id to workout_templates
ALTER TABLE workout_templates ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_workout_templates_user ON workout_templates(user_id);

-- Enable RLS
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own templates"
  ON workout_templates FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create own templates"
  ON workout_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON workout_templates FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT, INSERT, DELETE ON workout_templates TO authenticated;
GRANT SELECT ON workout_templates TO anon;
