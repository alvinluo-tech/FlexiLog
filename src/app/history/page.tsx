import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculateSessionVolume } from '@/lib/volume-utils'
import HistoryClient from './history-client'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch initial batch (20 sessions)
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('*, workout_sets (*, exercises (name, muscle_group))')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .range(0, 20)

  // Fetch weight history
  const { data: weightLogs } = await supabase
    .from('body_weight_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })

  // Process sessions into history items
  const history = (sessions || []).map(session => {
    const sets = session.workout_sets || []
    const exercises: string[] = [...new Set(sets.map((s: any) => s.exercises?.name).filter(Boolean))] as string[]
    const volume = calculateSessionVolume(sets)
    const duration = session.ended_at 
      ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000) 
      : 0
    const muscleGroups: string[] = [...new Set(sets.map((s: any) => s.exercises?.muscle_group).filter(Boolean))] as string[]

    return {
      id: session.id,
      date: session.started_at,
      exercises,
      exerciseCount: exercises.length,
      setCount: sets.length,
      volume,
      duration,
      muscleGroups,
      sets: sets.map((s: any) => ({
        exercise: s.exercises?.name || 'Unknown',
        muscleGroup: s.exercises?.muscle_group || '',
        setNumber: s.set_number,
        weight: s.weight_kg,
        reps: s.reps,
        rpe: s.rpe,
      })),
    }
  })

  // Prepare chart data
  const weightChartData = (weightLogs || []).map(log => ({
    date: log.logged_at,
    weight: Number(log.weight_kg),
  }))

  const volumeChartData = history.slice(0, 14).reverse().map(h => ({
    date: h.date,
    volume: h.volume,
  }))

  // Collect all muscle groups for filter chips
  const allMuscleGroups = [...new Set(history.flatMap(h => h.muscleGroups))].sort()

  return (
    <HistoryClient 
      history={history}
      weightChartData={weightChartData}
      volumeChartData={volumeChartData}
      allMuscleGroups={allMuscleGroups}
      userId={user.id}
    />
  )
}
