import { createClient } from '@/lib/supabase/server'
import ExercisesClient from './exercises-client'

export default async function ExercisesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('muscle_group')
    .order('name')

  // Get exercise usage counts for the current user
  let usageCounts: Record<string, number> = {}
  if (user) {
    // Get user's session IDs first
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', user.id)

    if (sessions?.length) {
      const sessionIds = sessions.map(s => s.id)
      const { data: sets } = await supabase
        .from('workout_sets')
        .select('exercise_id')
        .in('session_id', sessionIds)

      if (sets) {
        for (const s of sets) {
          if (s.exercise_id) {
            usageCounts[s.exercise_id] = (usageCounts[s.exercise_id] || 0) + 1
          }
        }
      }
    }
  }

  return <ExercisesClient exercises={exercises || []} usageCounts={usageCounts} />
}
