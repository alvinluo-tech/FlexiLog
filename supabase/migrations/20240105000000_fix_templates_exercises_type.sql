-- Fix workout_templates.exercises column type
ALTER TABLE workout_templates DROP COLUMN IF EXISTS exercises;
ALTER TABLE workout_templates ADD COLUMN exercises JSONB DEFAULT '[]';
