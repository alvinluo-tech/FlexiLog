import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ensureUserProfile } from '@/app/actions/auth'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  await ensureUserProfile(user.id)

  const [
    { data: sessions },
    { data: profile },
    { data: weightLogs },
  ] = await Promise.all([
    supabase
      .from('workout_sessions')
      .select('*, workout_sets (*, exercises (name, muscle_group))')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(15),
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase.from('body_weight_logs').select('*').eq('user_id', user.id).order('logged_at', { ascending: false }).limit(7),
  ])

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const thisWeekSessions = sessions?.filter((s: any) => new Date(s.started_at) >= weekStart) || []
  const totalVolume = thisWeekSessions.reduce((sum: number, s: any) => {
    return sum + (s.workout_sets || []).reduce((s: number, set: any) => s + (Number(set.weight_kg) || 0) * (set.reps || 0), 0)
  }, 0)
  // Calculate last week's volume for comparison
  const lastWeekStart = new Date(weekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  const lastWeekSessions = sessions?.filter((s: any) => {
    const d = new Date(s.started_at)
    return d >= lastWeekStart && d < weekStart
  }) || []
  const lastWeekVolume = lastWeekSessions.reduce((sum: number, s: any) => {
    return sum + (s.workout_sets || []).reduce((s: number, set: any) => s + (Number(set.weight_kg) || 0) * (set.reps || 0), 0)
  }, 0)
  const volumeChange = lastWeekVolume > 0 ? ((totalVolume - lastWeekVolume) / lastWeekVolume) * 100 : 0


  const currentWeight = weightLogs?.[0]?.weight_kg || profile?.weight_kg || 0
  const prevWeight = weightLogs?.[1]?.weight_kg || currentWeight

  let streak = 0
  if (sessions?.length) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    for (let i = 0; i < 30; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      if (sessions.some((s: any) => { const wd = new Date(s.started_at); wd.setHours(0,0,0,0); return wd.getTime() === d.getTime() })) {
        streak++
      } else if (i > 0) break
    }
  }

  const recentWorkouts = sessions?.map((s: any) => {
    const sets = s.workout_sets || []
    const names = [...new Set(sets.map((x: any) => x.exercises?.name).filter(Boolean))]
    const isActive = !s.ended_at
    const dur = s.ended_at 
      ? Math.max(1, Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 60000))
      : 0
    const vol = sets.reduce((sum: number, x: any) => sum + (Number(x.weight_kg) || 0) * (x.reps || 0), 0)
    const diff = Math.floor((now.getTime() - new Date(s.started_at).getTime()) / 86400000)
    const dateStr = diff === 0 ? '今天' : diff === 1 ? '昨天' : diff < 7 ? diff + '天前' : new Date(s.started_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    
    return { 
      id: s.id, 
      name: names[0] ? names[0] + ' Day' : 'Workout', 
      date: dateStr, 
      exercises: names.length, 
      duration: isActive ? 'Active' : dur + ' min', 
      volume: vol,
      isActive
    }
  }) || []

  return <DashboardClient stats={{ weeklyWorkouts: thisWeekSessions.length, targetWorkouts: profile?.training_days_per_week || 5, totalVolume, currentWeight, weightChange: currentWeight - prevWeight, streak, volumeChange }} recentWorkouts={recentWorkouts} userName={user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'} />
}
