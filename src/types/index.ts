export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'biceps' | 'triceps' | 'core' | 'full_body' | 'glutes' | 'forearms' | 'traps' | 'cardio'

export interface Exercise {
  id: string
  name: string
  muscle_group: MuscleGroup
  description: string
  tips: string
  image_url?: string
  is_custom: boolean
  created_at: string
}

export interface WorkoutTemplate {
  id: string
  name: string
  description: string
  exercises: DayPlan[] | string[]
  created_at: string
}

export interface WorkoutSet {
  id: string
  exercise_id: string
  set_number: number
  weight_kg: number
  reps: number
  rpe?: number
  completed: boolean
  rest_seconds?: number
}

export interface WorkoutSession {
  id: string
  template_id?: string
  started_at: string
  ended_at?: string
  notes?: string
  sets: WorkoutSet[]
}

export interface UserProfile {
  id: string
  gender?: 'male' | 'female' | 'other'
  age?: number
  height_cm?: number
  weight_kg?: number
  body_fat_percentage?: number
  fitness_years?: number
  injuries?: string
  goal?: 'bulk' | 'cut' | 'maintain' | 'strength'
  training_days_per_week?: number
  session_duration_minutes?: number
  equipment?: 'full_gym' | 'dumbbells' | 'bodyweight'
  created_at: string
  updated_at: string
}

export interface BodyWeightLog {
  id: string
  weight_kg: number
  logged_at: string
}

export interface PlanData {
  name?: string
  description?: string
  duration?: string
  days: DayPlan[]
}

export interface ExercisePlan {
  name: string
  sets: number
  reps: string
  weight_kg?: number
  weight?: number | string
  weight_ref?: string
  rest?: string
}

export interface DayPlan {
  day: string
  focus?: string
  exercises: ExercisePlan[]
}

export interface WorkoutSetWithExercise extends WorkoutSet {
  exercises?: { name: string; muscle_group: string }
}

export interface AIPlan {
  id: string
  plan_type: 'weekly' | 'single'
  plan_data: PlanData
  created_at: string
}
