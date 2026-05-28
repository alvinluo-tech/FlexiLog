-- Add rest_seconds column to exercises table
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS rest_seconds integer DEFAULT 90;

-- Update compound exercises (multi-joint) → 120s rest
UPDATE exercises SET rest_seconds = 120
WHERE lower(name) IN (
  'squat', 'barbell squat', 'back squat', 'front squat',
  'bench press', 'barbell bench press', 'flat bench press', 'incline bench press',
  'deadlift', 'conventional deadlift', 'sumo deadlift', 'romanian deadlift', 'rdl',
  'barbell row', 'bent over row', 'pendlay row',
  'overhead press', 'military press', 'barbell overhead press',
  'pull up', 'pull-up', 'chin up', 'chin-up',
  'dip', 'dips',
  'clean', 'power clean', 'clean and jerk', 'snatch',
  'leg press', 'hack squat',
  't-bar row'
);

-- Update isolation exercises → 60s rest
UPDATE exercises SET rest_seconds = 60
WHERE muscle_group IN ('biceps', 'triceps', 'forearms', 'traps')
  AND rest_seconds = 90;

-- Update core exercises → 45s rest
UPDATE exercises SET rest_seconds = 45
WHERE muscle_group = 'core';

-- Update cardio → 30s rest
UPDATE exercises SET rest_seconds = 30
WHERE muscle_group = 'cardio';;
