-- Personal Records table for tracking PRs per exercise
CREATE TABLE public.personal_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  exercise_id uuid NOT NULL REFERENCES public.exercises(id),
  record_type text NOT NULL CHECK (record_type IN ('max_weight', 'max_volume', 'max_reps', 'estimated_1rm')),
  value numeric NOT NULL,
  achieved_at timestamptz NOT NULL DEFAULT now(),
  workout_set_id uuid REFERENCES public.workout_sets(id),
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, exercise_id, record_type)
);

-- Enable RLS
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- Users can read their own PRs
CREATE POLICY "Users can read own personal records"
  ON public.personal_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own PRs
CREATE POLICY "Users can insert own personal records"
  ON public.personal_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own PRs
CREATE POLICY "Users can update own personal records"
  ON public.personal_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_personal_records_user_exercise ON public.personal_records(user_id, exercise_id);
CREATE INDEX idx_personal_records_user_recent ON public.personal_records(user_id, achieved_at DESC);;
