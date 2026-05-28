'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SESSIONS_PAGE_LIMIT, MAX_REPS, MIN_AGE, MAX_AGE, MIN_HEIGHT_CM, MAX_HEIGHT_CM, MIN_WEIGHT_KG, MAX_WEIGHT_KG, MIN_BODY_FAT, MAX_BODY_FAT, WEIGHT_LOG_LIMIT } from '@/lib/constants'
import { PlanData } from '@/types'

// Workout Sessions
export async function createWorkoutSession(templateId?: string) {
  try {
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
  } catch (e) {
    console.error('createWorkoutSession error:', e)
    return { error: '操作失败' }
  }
}

export async function endWorkoutSession(sessionId: string, notes?: string) {
  try {
    const supabase = await createClient()

    const updateData: Record<string, any> = { ended_at: new Date().toISOString() }
    if (notes !== undefined) updateData.notes = notes

    const { error } = await supabase
      .from('workout_sessions')
      .update(updateData)
      .eq('id', sessionId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/workout')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e) {
    console.error('endWorkoutSession error:', e)
    return { error: '操作失败' }
  }
}

export async function discardWorkoutSession(sessionId: string) {
  // Get the authenticated user first
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  
  if (!user) {
    return { error: '未登录' }
  }

  const supabase = authClient

  // Delete ALL active (un-ended) sessions for this user, not just the current one.
  // This cleans up any stale sessions from previous runs that were never properly ended.
  // Foreign key ON DELETE CASCADE will automatically clean up related workout_sets.
  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('user_id', user.id)
    .is('ended_at', null)

  if (error) {
    console.error('Failed to discard sessions:', error)
    return { error: error.message }
  }

  revalidatePath('/workout')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getWorkoutSessions(limit = SESSIONS_PAGE_LIMIT) {
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
  rest_seconds?: number
}) {
  try {
    // Input validation
    if (setData.weight_kg < 0) {
      return { error: '重量不能为负数' }
    }
    if (setData.reps < 1) {
      return { error: '次数至少为 1' }
    }
    if (setData.reps > MAX_REPS) {
      return { error: '次数不能超过 ' + MAX_REPS }
    }
    if (setData.rpe !== undefined && (setData.rpe < 1 || setData.rpe > 10)) {
      return { error: 'RPE 必须在 1-10 之间' }
    }

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
  } catch (e) {
    console.error('addWorkoutSet error:', e)
    return { error: '操作失败' }
  }
}

export async function updateWorkoutSet(setId: string, updates: {
  weight_kg?: number
  reps?: number
  rpe?: number
  completed?: boolean
}) {
  try {
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
  } catch (e) {
    console.error('updateWorkoutSet error:', e)
    return { error: '操作失败' }
  }
}

export async function deleteWorkoutSet(setId: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('workout_sets')
      .delete()
      .eq('id', setId)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/workout')
    return { success: true }
  } catch (e) {
    console.error('deleteWorkoutSet error:', e)
    return { error: '操作失败' }
  }
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
  // Input validation
  if (updates.age !== undefined && (updates.age < MIN_AGE || updates.age > MAX_AGE)) {
    return { error: '年龄必须在 ' + MIN_AGE + '-' + MAX_AGE + ' 之间' }
  }
  if (updates.height_cm !== undefined && (updates.height_cm < MIN_HEIGHT_CM || updates.height_cm > MAX_HEIGHT_CM)) {
    return { error: '身高必须在 ' + MIN_HEIGHT_CM + '-' + MAX_HEIGHT_CM + ' cm 之间' }
  }
  if (updates.weight_kg !== undefined && (updates.weight_kg < MIN_WEIGHT_KG || updates.weight_kg > MAX_WEIGHT_KG)) {
    return { error: '体重必须在 ' + MIN_WEIGHT_KG + '-' + MAX_WEIGHT_KG + ' kg 之间' }
  }
  if (updates.body_fat_percentage !== undefined && (updates.body_fat_percentage < MIN_BODY_FAT || updates.body_fat_percentage > MAX_BODY_FAT)) {
    return { error: '体脂率必须在 ' + MIN_BODY_FAT + '%-' + MAX_BODY_FAT + '% 之间' }
  }

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

export async function getBodyWeightHistory(limit = WEIGHT_LOG_LIMIT) {
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
export async function saveAiPlan(planType: string, planData: PlanData) {
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
