'use server'

import { createClient } from '@/lib/supabase/server'
import { HISTORY_PAGE_LIMIT } from '@/lib/constants'

export interface HistoryPage {
  sessions: any[]
  hasMore: boolean
}

export async function getHistoryPage(
  offset: number = 0,
  limit: number = HISTORY_PAGE_LIMIT,
  dateFilter?: string,
  muscleGroup?: string,
): Promise<HistoryPage> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { sessions: [], hasMore: false }
  }

  let query = supabase
    .from('workout_sessions')
    .select('*, workout_sets (*, exercises (name, muscle_group))')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })

  // Apply date filter
  if (dateFilter) {
    const now = new Date()
    let startDate: Date
    switch (dateFilter) {
      case 'week':
        startDate = new Date(now)
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3months':
        startDate = new Date(now)
        startDate.setMonth(now.getMonth() - 3)
        break
      default:
        startDate = new Date(0)
    }
    if (dateFilter !== 'all') {
      query = query.gte('started_at', startDate.toISOString())
    }
  }

  // Fetch one extra to know if there are more
  const { data: sessions } = await query.range(offset, offset + limit)

  const hasMore = (sessions?.length || 0) > limit
  const trimmedSessions = (sessions || []).slice(0, limit)

  // If muscle group filter is set, post-filter
  let filtered = trimmedSessions
  if (muscleGroup && muscleGroup !== 'all') {
    filtered = trimmedSessions.filter((session: any) => {
      const groups = (session.workout_sets || [])
        .map((s: any) => s.exercises?.muscle_group)
        .filter(Boolean)
      return groups.includes(muscleGroup)
    })
  }

  return { sessions: filtered, hasMore }
}
