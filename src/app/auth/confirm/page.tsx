import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token

  if (!token) {
    redirect('/login?error=invalid_token')
  }

  const supabase = await createClient()
  
  // Verify the token
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: 'signup',
  })

  if (error) {
    redirect('/login?error=verification_failed')
  }

  redirect('/dashboard')
}
