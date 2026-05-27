import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'invite' | null
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // PKCE flow: exchange code for session
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Implicit flow: verify token_hash directly
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Fallback: check if user already has a session (cookies set by Supabase redirect)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    return NextResponse.redirect(`${origin}${next}`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
