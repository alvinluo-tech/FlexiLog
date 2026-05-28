'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function shareWorkout(sessionId: string, title: string, description?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get session data
  const { data: session } = await supabase
    .from('workout_sessions')
    .select('*, workout_sets (*, exercises (name, muscle_group))')
    .eq('id', sessionId)
    .single()

  if (!session) return { error: 'Session not found' }

  const { data, error } = await supabase
    .from('shared_workouts')
    .insert({
      user_id: user.id,
      session_id: sessionId,
      title,
      description,
      workout_data: session,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/feed')
  return { data }
}

export async function getFeed(limit = 20) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('shared_workouts')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data || [] }
}

export async function toggleLike(sharedWorkoutId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Check if already liked
    const { data: existing } = await supabase
      .from('workout_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('shared_workout_id', sharedWorkoutId)
      .single()

    if (existing) {
      await supabase.from('workout_likes').delete().eq('id', existing.id)
      return { liked: false }
    } else {
      await supabase.from('workout_likes').insert({ user_id: user.id, shared_workout_id: sharedWorkoutId })
      return { liked: true }
    }
  } catch (e) {
    console.error('toggleLike error:', e)
    return { error: '操作失败' }
  }
}

export async function addComment(sharedWorkoutId: string, content: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const { data, error } = await supabase
      .from('workout_comments')
      .insert({ user_id: user.id, shared_workout_id: sharedWorkoutId, content })
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath('/feed')
    return { data }
  } catch (e) {
    console.error('addComment error:', e)
    return { error: '操作失败' }
  }
}

export async function getComments(sharedWorkoutId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('workout_comments')
    .select('*')
    .eq('shared_workout_id', sharedWorkoutId)
    .order('created_at', { ascending: true })

  return { data: data || [] }
}
