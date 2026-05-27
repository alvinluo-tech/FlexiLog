'use server'

import { createClient } from '@/lib/supabase/server'

export async function exportWorkoutData(userId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '未登录' }
  }

  const targetUserId = userId || user.id

  // Fetch all workout sessions with sets and exercises
  const { data: sessions, error } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      started_at,
      ended_at,
      notes,
      workout_sets (
        set_number,
        weight_kg,
        reps,
        rpe,
        completed,
        exercises (name, muscle_group)
      )
    `)
    .eq('user_id', targetUserId)
    .order('started_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  // Transform into clean export format
  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    totalSessions: sessions?.length || 0,
    sessions: (sessions || []).map(session => {
      const sets = session.workout_sets || []
      const duration = session.ended_at
        ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)
        : 0
      const volume = sets.reduce((sum: number, s: any) => sum + (Number(s.weight_kg) || 0) * (s.reps || 0), 0)

      return {
        id: session.id,
        date: session.started_at,
        endedAt: session.ended_at,
        durationMinutes: duration,
        totalVolumeKg: volume,
        notes: session.notes || null,
        sets: sets.map((s: any) => ({
          exercise: s.exercises?.name || 'Unknown',
          muscleGroup: s.exercises?.muscle_group || '',
          setNumber: s.set_number,
          weightKg: Number(s.weight_kg) || 0,
          reps: s.reps || 0,
          rpe: s.rpe || null,
          completed: s.completed,
        })),
      }
    }),
  }

  return { data: exportData }
}
