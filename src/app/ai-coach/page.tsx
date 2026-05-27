import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AICoachClient from './ai-coach-client'

export default async function AICoachPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch saved plans
  const { data: plans } = await supabase
    .from('ai_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <AICoachClient 
      profile={profile}
      savedPlans={plans || []}
    />
  )
}
