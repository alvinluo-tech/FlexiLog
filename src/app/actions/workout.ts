'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Workout Sessions
export async function createWorkoutSession(templateId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: '未登录' }
  }

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      template_id: templateId || null,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/workout')
  return { data }
}

export async function endWorkoutSession(sessionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('workout_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/workout')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getWorkoutSessions(limit = 10) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: [] }
  }

  const { data } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_sets (
        *,
        exercises (name, muscle_group)
      )
    `)
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(limit)

  return { data: data || [] }
}

// Workout Sets
export async function addWorkoutSet(sessionId: string, exerciseId: string, setData: {
  set_number: number
  weight_kg: number
  reps: number
  rpe?: number
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('workout_sets')
    .insert({
      session_id: sessionId,
      exercise_id: exerciseId,
      ...setData,
      completed: true,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/workout')
  return { data }
}

export async function updateWorkoutSet(setId: string, updates: {
  weight_kg?: number
  reps?: number
  rpe?: number
  completed?: boolean
}) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('workout_sets')
    .update(updates)
    .eq('id', setId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/workout')
  return { success: true }
}

// Exercises
export async function getExercises(muscleGroup?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('exercises')
    .select('*')
    .order('name')

  if (muscleGroup && muscleGroup !== 'all') {
    query = query.eq('muscle_group', muscleGroup)
  }

  const { data } = await query
  return { data: data || [] }
}

// User Profile
export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: null }
  }

  const { data } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data }
}

export async function updateUserProfile(updates: {
  gender?: string
  age?: number
  height_cm?: number
  weight_kg?: number
  body_fat_percentage?: number
  fitness_years?: number
  injuries?: string
  goal?: string
  training_days_per_week?: number
  session_duration_minutes?: number
  equipment?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: '未登录' }
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

// Body Weight Logs
export async function logBodyWeight(weight: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: '未登录' }
  }

  const { error } = await supabase
    .from('body_weight_logs')
    .insert({
      user_id: user.id,
      weight_kg: weight,
      logged_at: new Date().toISOString(),
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function getBodyWeightHistory(limit = 30) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: [] }
  }

  const { data } = await supabase
    .from('body_weight_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(limit)

  return { data: data || [] }
}

// AI Plans
export async function saveAiPlan(planType: string, planData: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: '未登录' }
  }

  const { error } = await supabase
    .from('ai_plans')
    .insert({
      user_id: user.id,
      plan_type: planType,
      plan_data: planData,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/ai-coach')
  return { success: true }
}

export async function getAiPlans() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: [] }
  }

  const { data } = await supabase
    .from('ai_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return { data: data || [] }
}
