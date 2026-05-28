-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Exercise Library
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL CHECK (muscle_group IN ('chest', 'back', 'legs', 'shoulders', 'biceps', 'triceps', 'core', 'full_body')),
  description TEXT,
  tips TEXT,
  image_url TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Workout Templates
CREATE TABLE workout_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  exercises UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Workout Sessions
CREATE TABLE workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  template_id UUID REFERENCES workout_templates(id),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  notes TEXT
);
-- Workout Sets
CREATE TABLE workout_sets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  set_number INTEGER NOT NULL,
  weight_kg DECIMAL(6,2) NOT NULL,
  reps INTEGER NOT NULL,
  rpe DECIMAL(3,1),
  completed BOOLEAN DEFAULT false,
  rest_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- User Profiles
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  age INTEGER,
  height_cm DECIMAL(5,1),
  weight_kg DECIMAL(5,1),
  body_fat_percentage DECIMAL(4,1),
  fitness_years INTEGER,
  injuries TEXT,
  goal TEXT CHECK (goal IN ('bulk', 'cut', 'maintain', 'strength')),
  training_days_per_week INTEGER,
  session_duration_minutes INTEGER,
  equipment TEXT CHECK (equipment IN ('full_gym', 'dumbbells', 'bodyweight')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Body Weight Logs
CREATE TABLE body_weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  weight_kg DECIMAL(5,1) NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);
-- AI Plans
CREATE TABLE ai_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  plan_type TEXT CHECK (plan_type IN ('weekly', 'single')),
  plan_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create indexes
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_workout_sets_session ON workout_sets(session_id);
CREATE INDEX idx_workout_sets_exercise ON workout_sets(exercise_id);
CREATE INDEX idx_body_weight_logs_user ON body_weight_logs(user_id);
CREATE INDEX idx_workout_sessions_user ON workout_sessions(user_id);
-- Enable RLS
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_plans ENABLE ROW LEVEL SECURITY;
-- RLS Policies
-- Exercises: public read, authenticated write for custom exercises
CREATE POLICY "Exercises are viewable by everyone" ON exercises FOR SELECT USING (true);
CREATE POLICY "Users can create custom exercises" ON exercises FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND is_custom = true);
CREATE POLICY "Users can update own custom exercises" ON exercises FOR UPDATE USING (auth.uid() IS NOT NULL AND is_custom = true);
-- Workout Templates: public read
CREATE POLICY "Templates are viewable by everyone" ON workout_templates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create templates" ON workout_templates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
-- Workout Sessions: user-scoped
CREATE POLICY "Users can view own sessions" ON workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own sessions" ON workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON workout_sessions FOR UPDATE USING (auth.uid() = user_id);
-- Workout Sets: through session ownership
CREATE POLICY "Users can view own sets" ON workout_sets FOR SELECT USING (
  EXISTS (SELECT 1 FROM workout_sessions WHERE workout_sessions.id = workout_sets.session_id AND workout_sessions.user_id = auth.uid())
);
CREATE POLICY "Users can create own sets" ON workout_sets FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM workout_sessions WHERE workout_sessions.id = workout_sets.session_id AND workout_sessions.user_id = auth.uid())
);
CREATE POLICY "Users can update own sets" ON workout_sets FOR UPDATE USING (
  EXISTS (SELECT 1 FROM workout_sessions WHERE workout_sessions.id = workout_sets.session_id AND workout_sessions.user_id = auth.uid())
);
-- User Profiles: user-scoped
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
-- Body Weight Logs: user-scoped
CREATE POLICY "Users can view own weight logs" ON body_weight_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own weight logs" ON body_weight_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
-- AI Plans: user-scoped
CREATE POLICY "Users can view own plans" ON ai_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own plans" ON ai_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
-- Seed data: Basic exercises
INSERT INTO exercises (name, muscle_group, description, tips, is_custom) VALUES
-- Chest
('Bench Press', 'chest', 'Lie on a flat bench and press the barbell upward', 'Keep feet flat on floor, arch back slightly, control the descent', false),
('Incline Dumbbell Press', 'chest', 'Press dumbbells on an inclined bench', 'Set bench to 30-45 degrees, squeeze chest at top', false),
('Cable Flyes', 'chest', 'Cable crossover movement for chest isolation', 'Slight bend in elbows, feel the stretch at bottom', false),
('Push-ups', 'chest', 'Bodyweight chest exercise', 'Keep core tight, full range of motion', false),

-- Back
('Deadlift', 'back', 'Compound movement lifting barbell from floor', 'Keep back straight, drive through heels, hinge at hips', false),
('Barbell Row', 'back', 'Bent-over rowing with barbell', 'Pull to lower chest, squeeze shoulder blades', false),
('Lat Pulldown', 'back', 'Cable pull-down for lats', 'Lean back slightly, pull to upper chest', false),
('Pull-ups', 'back', 'Bodyweight pulling exercise', 'Full hang to chin over bar, control the movement', false),

-- Legs
('Squat', 'legs', 'Barbell back squat', 'Break at hips and knees together, knees track toes', false),
('Leg Press', 'legs', 'Machine-based leg press', 'Feet shoulder-width, don''t lock knees', false),
('Romanian Deadlift', 'legs', 'Hip-hinge movement for hamstrings', 'Slight knee bend, feel stretch in hamstrings', false),
('Leg Curl', 'legs', 'Machine hamstring curl', 'Control the movement, squeeze at top', false),
('Calf Raises', 'legs', 'Standing calf raise', 'Full range of motion, pause at top', false),

-- Shoulders
('Overhead Press', 'shoulders', 'Standing barbell press', 'Brace core, press straight up, lock out at top', false),
('Lateral Raises', 'shoulders', 'Dumbbell lateral raise for side delts', 'Slight bend in elbows, raise to shoulder height', false),
('Face Pulls', 'shoulders', 'Cable face pull for rear delts', 'Pull to face level, squeeze rear delts', false),

-- Biceps
('Barbell Curl', 'biceps', 'Standing barbell bicep curl', 'Keep elbows pinned, control the negative', false),
('Hammer Curl', 'biceps', 'Neutral grip dumbbell curl', 'Keep wrists straight, alternate arms', false),

-- Triceps
('Tricep Pushdown', 'triceps', 'Cable tricep pushdown', 'Keep elbows pinned to sides, full extension', false),
('Skull Crushers', 'triceps', 'Lying tricep extension', 'Lower to forehead, extend fully', false),

-- Core
('Plank', 'core', 'Isometric core hold', 'Keep body straight, don''t sag hips', false),
('Cable Crunch', 'core', 'Kneeling cable crunch', 'Crunch down, don''t just hinge at hips', false),
('Hanging Leg Raise', 'core', 'Hanging leg raise for lower abs', 'Control the movement, avoid swinging', false),

-- Full Body
('Clean and Press', 'full_body', 'Olympic-style clean and press', 'Explosive pull, catch on shoulders, press overhead', false),
('Turkish Get-up', 'full_body', 'Complex full-body movement', 'Follow each step carefully, keep eyes on weight', false);
