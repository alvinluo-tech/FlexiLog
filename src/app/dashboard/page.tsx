import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch real data in parallel
  const [
    { data: sessions },
    { data: profile },
    { data: weightLogs },
  ] = await Promise.all([
    supabase
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
      .limit(5),
    supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('body_weight_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(7),
  ])

  // Calculate stats
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const thisWeekSessions = sessions?.filter(s => 
    new Date(s.started_at) >= weekStart
  ) || []

  const totalVolume = thisWeekSessions.reduce((sum, session) => {
    const sessionVolume = (session.workout_sets || []).reduce((s: number, set: any) => 
      s + (Number(set.weight_kg) || 0) * (set.reps || 0), 0
    )
    return sum + sessionVolume
  }, 0)

  const currentWeight = weightLogs?.[0]?.weight_kg || profile?.weight_kg || 0
  const prevWeight = weightLogs?.[1]?.weight_kg || currentWeight
  const weightChange = currentWeight - prevWeight

  // Calculate streak
  let streak = 0
  if (sessions && sessions.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      
      const hasWorkout = sessions.some(s => {
        const workoutDate = new Date(s.started_at)
        workoutDate.setHours(0, 0, 0, 0)
        return workoutDate.getTime() === checkDate.getTime()
      })
      
      if (hasWorkout) {
        streak++
      } else if (i > 0) {
        break
      }
    }
  }

  const stats = {
    weeklyWorkouts: thisWeekSessions.length,
    targetWorkouts: profile?.training_days_per_week || 5,
    totalVolume,
    currentWeight,
    weightChange,
    streak,
  }

  const recentWorkouts = sessions?.map(session => {
    const sets = session.workout_sets || []
    const exerciseNames = [...new Set(sets.map((s: any) => s.exercises?.name).filter(Boolean))]
    const duration = session.ended_at
      ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)
      : 0
    const volume = sets.reduce((sum: number, set: any) => sum + (Number(set.weight_kg) || 0) * (set.reps || 0), 0)
    
    return {
      id: session.id,
      name: exerciseNames.length > 0 ? exerciseNames[0] + ' Day' : '训练',
      date: getRelativeDate(session.started_at),
      exercises: exerciseNames.length,
      duration: duration > 0 ? `${duration}min` : '进行中',
      volume,
    }
  }) || []

  return (
    <DashboardClient 
      stats={stats} 
      recentWorkouts={recentWorkouts}
      userName={user.user_metadata?.display_name || user.email?.split('@')[0] || '用户'}
    />
  )
}

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays === 2) return '前天'
  if (diffDays < 7) return `${diffDays}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
