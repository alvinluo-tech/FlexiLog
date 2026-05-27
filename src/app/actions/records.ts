'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type RecordType = 'max_weight' | 'max_volume' | 'max_reps' | 'estimated_1rm'

export interface PersonalRecord {
  id: string
  user_id: string
  exercise_id: string
  record_type: RecordType
  value: number
  achieved_at: string
  workout_set_id: string | null
  exercises?: { name: string; muscle_group: string }
}

const RECORD_LABELS: Record<RecordType, string> = {
  max_weight: '最大重量',
  max_volume: '最大训练量',
  max_reps: '最大次数',
  estimated_1rm: '预估1RM',
}

const RECORD_UNITS: Record<RecordType, string> = {
  max_weight: 'kg',
  max_volume: 'kg',
  max_reps: '次',
  estimated_1rm: 'kg',
}

export async function getRecordLabel(type: RecordType): Promise<string> {
  return RECORD_LABELS[type] || type
}

export async function getRecordUnit(type: RecordType): Promise<string> {
  return RECORD_UNITS[type] || ''
}

/**
 * Get personal records for a user, optionally filtered by exercise
 */
export async function getPersonalRecords(userId: string, exerciseId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('personal_records')
    .select(`
      *,
      exercises (name, muscle_group)
    `)
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false })

  if (exerciseId) {
    query = query.eq('exercise_id', exerciseId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Failed to get personal records:', error)
    return { data: [] as PersonalRecord[], error: error.message }
  }

  return { data: (data || []) as PersonalRecord[] }
}

/**
 * Get recent PRs for dashboard display
 */
export async function getRecentPRs(userId: string, limit = 5) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('personal_records')
    .select(`
      *,
      exercises (name, muscle_group)
    `)
    .eq('user_id', userId)
    .order('achieved_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to get recent PRs:', error)
    return { data: [] as PersonalRecord[], error: error.message }
  }

  return { data: (data || []) as PersonalRecord[] }
}

/**
 * Check and update PRs after a set is completed.
 * Returns a list of newly achieved PRs (if any).
 */
export async function checkAndUpdatePRs(
  userId: string,
  exerciseId: string,
  weight: number,
  reps: number,
  setId?: string
): Promise<{ newPRs: { type: RecordType; value: number; previousValue: number }[]; error?: string }> {
  const supabase = await createClient()

  // Calculate derived values
  const volume = weight * reps
  // Brzycki formula for estimated 1RM
  const estimated1RM = reps === 1 ? weight : Math.round(weight * (36 / (37 - reps)) * 10) / 10

  // Fetch existing PRs for this exercise
  const { data: existingPRs, error: fetchError } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)

  if (fetchError) {
    return { newPRs: [], error: fetchError.message }
  }

  const prMap = new Map<string, any>()
  for (const pr of existingPRs || []) {
    prMap.set(pr.record_type, pr)
  }

  const candidates: { type: RecordType; value: number }[] = [
    { type: 'max_weight', value: weight },
    { type: 'max_volume', value: volume },
    { type: 'max_reps', value: reps },
    { type: 'estimated_1rm', value: estimated1RM },
  ]

  const newPRs: { type: RecordType; value: number; previousValue: number }[] = []

  for (const candidate of candidates) {
    const existing = prMap.get(candidate.type)

    if (!existing || candidate.value > Number(existing.value)) {
      const previousValue = existing ? Number(existing.value) : 0

      if (existing) {
        // Update existing PR
        const { error: updateError } = await supabase
          .from('personal_records')
          .update({
            value: candidate.value,
            achieved_at: new Date().toISOString(),
            workout_set_id: setId || existing.workout_set_id,
          })
          .eq('id', existing.id)

        if (updateError) {
          console.error(`Failed to update PR (${candidate.type}):`, updateError)
          continue
        }
      } else {
        // Insert new PR
        const { error: insertError } = await supabase
          .from('personal_records')
          .insert({
            user_id: userId,
            exercise_id: exerciseId,
            record_type: candidate.type,
            value: candidate.value,
            achieved_at: new Date().toISOString(),
            workout_set_id: setId || null,
          })

        if (insertError) {
          console.error(`Failed to insert PR (${candidate.type}):`, insertError)
          continue
        }
      }

      newPRs.push({ type: candidate.type, value: candidate.value, previousValue })
    }
  }

  if (newPRs.length > 0) {
    revalidatePath('/dashboard')
  }

  return { newPRs }
}
