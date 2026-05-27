import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WorkoutLiveClient from './workout-client'

export default async function WorkoutLivePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch exercises for the picker
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id, name, muscle_group')
    .order('muscle_group')
    .order('name')

  // Fetch recent workout for history comparison
  const { data: recentSession } = await supabase
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
    .limit(1)
    .single()

  // Build previous data map
  const previousData: Record<string, { weight: string; reps: string }[]> = {}
  if (recentSession?.workout_sets) {
    for (const set of recentSession.workout_sets) {
      const exerciseId = set.exercise_id
      if (!previousData[exerciseId]) {
        previousData[exerciseId] = []
      }
      previousData[exerciseId].push({
        weight: String(set.weight_kg || ''),
        reps: String(set.reps || ''),
      })
    }
  }

  return (
    <WorkoutLiveClient 
      exercises={exercises || []}
      previousData={previousData}
      userId={user.id}
    />
  )
}
