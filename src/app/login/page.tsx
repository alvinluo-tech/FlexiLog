'use client'

import { useState } from 'react'
import { signIn } from '@/app/actions/auth'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lightning, Envelope, Lock } from '@phosphor-icons/react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signIn(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-[var(--surface-0)]">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="h-16 w-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lightning weight="fill" className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-[32px] font-bold tracking-tight">FlexiLog</h1>
          <p className="text-[15px] text-[var(--text-tertiary)] mt-1">AI Fitness Tracker</p>
        </div>

        {/* Form */}
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[13px] text-[var(--text-secondary)] font-medium">Email</label>
            <div className="relative">
              <Envelope className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-disabled)]" />
              <Input
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="h-14 pl-12 bg-[var(--surface-2)] border-[var(--border-default)] rounded-xl text-[16px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] text-[var(--text-secondary)] font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-disabled)]" />
              <Input
                name="password"
                type="password"
                placeholder="Enter password"
                required
                minLength={6}
                className="h-14 pl-12 bg-[var(--surface-2)] border-[var(--border-default)] rounded-xl text-[16px]"
              />
            </div>
          </div>

          {error && (
            <div className="text-[14px] text-[var(--danger)] bg-[var(--danger-muted)] p-3 rounded-xl">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl text-[16px] font-semibold">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="flex items-center justify-between mt-2">
            <Link href="/forgot-password" className="text-[14px] text-[var(--accent)] font-medium">
              Forgot password?
            </Link>
            <Link href="/register" className="text-[14px] text-[var(--accent)] font-medium">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
