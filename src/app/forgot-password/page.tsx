'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lightning, Envelope } from '@phosphor-icons/react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--surface-0)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center mx-auto mb-4 bg-[var(--surface-1)]">
            <img src="/icon-192.png" alt="FlexiLog Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">FlexiLog</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">忘记密码</p>
        </div>

        <Card className="card-surface border rounded-[var(--radius-xl)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">找回密码</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="text-sm text-[var(--success)] bg-[var(--success-muted)] p-3 rounded-[var(--radius-md)]">
                  重置链接已发送到你的邮箱，请查收！
                </div>
                <Link href="/login">
                  <Button variant="outline" className="w-full">返回登录</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-[var(--text-tertiary)]">
                  输入你的注册邮箱，我们将发送重置密码链接。
                </p>

                <div className="space-y-2">
                  <label className="text-sm text-[var(--text-secondary)]">邮箱</label>
                  <div className="relative">
                    <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-disabled)]" />
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 bg-[var(--surface-2)] border-[var(--border-default)]"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-[var(--danger)] bg-[var(--danger-muted)] p-3 rounded-[var(--radius-md)]">
                    {error}
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full h-11">
                  {loading ? '发送中...' : '发送重置链接'}
                </Button>

                <div className="text-center">
                  <Link href="/login" className="text-sm text-[var(--accent)] hover:underline">
                    返回登录
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
