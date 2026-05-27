'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lightning, Lock } from '@phosphor-icons/react'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6位')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

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
          <div className="h-12 w-12 rounded-xl bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
            <Lightning weight="fill" className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">FlexiLog</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">重置密码</p>
        </div>

        <Card className="card-surface border rounded-[var(--radius-xl)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">设置新密码</CardTitle>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="text-sm text-[var(--success)] bg-[var(--success-muted)] p-3 rounded-[var(--radius-md)]">
                  密码已重置成功！
                </div>
                <Link href="/login">
                  <Button className="w-full">返回登录</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-[var(--text-secondary)]">新密码</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-disabled)]" />
                    <Input
                      type="password"
                      placeholder="至少6位"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="pl-10 bg-[var(--surface-2)] border-[var(--border-default)]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-[var(--text-secondary)]">确认密码</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-disabled)]" />
                    <Input
                      type="password"
                      placeholder="再次输入密码"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? '重置中...' : '重置密码'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
