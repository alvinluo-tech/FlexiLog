import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTemplates } from '@/app/actions/templates'
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
    .select('id, name, muscle_group, rest_seconds')
    .order('muscle_group')
    .order('name')

  // Fetch templates
  const { data: templates } = await getTemplates()

  // Fetch recent workout for history comparison
  const { data: recentSession } = await supabase
    .from('workout_sessions')
    .select('*, workout_sets (*, exercises (name, muscle_group))')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .single()

  // Fetch active session if any exists
  const { data: activeSession } = await supabase
    .from('workout_sessions')
    .select('*, workout_sets (*, exercises (name, muscle_group))')
    .eq('user_id', user.id)
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

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

  // Reconstruct active session blocks if found
  let initialSessionId = null
  let initialSessionStartTime = null
  let initialExerciseBlocks: any[] = []

  if (activeSession) {
    initialSessionId = activeSession.id
    initialSessionStartTime = new Date(activeSession.started_at).getTime()
    
    const blocksMap: Record<string, any> = {}
    const sortedSets = [...(activeSession.workout_sets || [])].sort((a: any, b: any) => a.set_number - b.set_number)
    
    for (const set of sortedSets) {
      const ex = set.exercises
      if (!ex) continue
      const exerciseId = set.exercise_id
      if (!blocksMap[exerciseId]) {
        blocksMap[exerciseId] = {
          exercise: {
            id: exerciseId,
            name: ex.name,
            muscle_group: ex.muscle_group,
          },
          sets: [],
          previousData: previousData[exerciseId] || [],
          collapsed: false
        }
      }
      blocksMap[exerciseId].sets.push({
        id: set.id,
        weight: String(set.weight_kg || ''),
        reps: String(set.reps || ''),
        rpe: String(set.rpe || ''),
        completed: Boolean(set.completed),
        saved: true
      })
    }
    initialExerciseBlocks = Object.values(blocksMap)
  }

  return (
    <WorkoutLiveClient 
      exercises={exercises || []}
      previousData={previousData}
      userId={user.id}
      templates={templates || []}
      initialSessionId={initialSessionId}
      initialSessionStartTime={initialSessionStartTime}
      initialExerciseBlocks={initialExerciseBlocks}
    />
  )
}
