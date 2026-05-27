'use client'

import { useState } from 'react'
import { signUp } from '@/app/actions/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lightning, Envelope, Lock, User, CheckCircle } from '@phosphor-icons/react'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setEmail(formData.get('email') as string)
    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col justify-center px-6 bg-[var(--surface-0)]">
        <div className="w-full max-w-sm mx-auto text-center">
          <div className="h-20 w-20 rounded-full bg-[var(--success-muted)] flex items-center justify-center mx-auto mb-6">
            <CheckCircle weight="fill" className="h-12 w-12 text-[var(--success)]" />
          </div>
          <h2 className="text-[24px] font-bold mb-2">Check your email</h2>
          <p className="text-[15px] text-[var(--text-tertiary)] mb-8">
            We sent a verification link to <span className="text-[var(--accent)] font-medium">{email}</span>
          </p>
          <Link href="/login">
            <Button className="w-full h-14 rounded-xl text-[16px] font-semibold">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-[var(--surface-0)]">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-10">
          <div className="h-16 w-16 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-lg bg-[var(--surface-1)]">
            <img src="/icon-192.png" alt="FlexiLog Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-[32px] font-bold tracking-tight">Create Account</h1>
          <p className="text-[15px] text-[var(--text-tertiary)] mt-1">Start your fitness journey</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[13px] text-[var(--text-secondary)] font-medium">Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-disabled)]" />
              <Input name="name" type="text" placeholder="Your name" required className="h-14 pl-12 bg-[var(--surface-2)] border-[var(--border-default)] rounded-xl text-[16px]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] text-[var(--text-secondary)] font-medium">Email</label>
            <div className="relative">
              <Envelope className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-disabled)]" />
              <Input name="email" type="email" placeholder="your@email.com" required className="h-14 pl-12 bg-[var(--surface-2)] border-[var(--border-default)] rounded-xl text-[16px]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] text-[var(--text-secondary)] font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-disabled)]" />
              <Input name="password" type="password" placeholder="Min 6 characters" required minLength={6} className="h-14 pl-12 bg-[var(--surface-2)] border-[var(--border-default)] rounded-xl text-[16px]" />
            </div>
          </div>

          {error && (
            <div className="text-[14px] text-[var(--danger)] bg-[var(--danger-muted)] p-3 rounded-xl">{error}</div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl text-[16px] font-semibold">
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="text-center text-[14px] text-[var(--text-tertiary)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--accent)] font-medium">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
