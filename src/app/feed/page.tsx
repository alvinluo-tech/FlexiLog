import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedClient from './feed-client'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('shared_workouts')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return <FeedClient posts={posts || []} currentUserId={user.id} />
}
