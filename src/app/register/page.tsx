'use client'

import { useState } from 'react'
import { signUp } from '@/app/actions/auth'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lightning, Envelope, Lock, User } from '@phosphor-icons/react'

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await signUp(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--surface-0)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-[var(--accent)] flex items-center justify-center mx-auto mb-4">
            <Lightning weight="fill" className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">FlexiLog</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">AI 健身记录</p>
        </div>

        <Card className="card-surface border rounded-[var(--radius-xl)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">创建账号</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)]">昵称</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-disabled)]" />
                  <Input
                    name="name"
                    type="text"
                    placeholder="你的昵称"
                    required
                    className="pl-10 bg-[var(--surface-2)] border-[var(--border-default)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)]">邮箱</label>
                <div className="relative">
                  <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-disabled)]" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    className="pl-10 bg-[var(--surface-2)] border-[var(--border-default)]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-[var(--text-secondary)]">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-disabled)]" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="至少6位"
                    required
                    minLength={6}
                    className="pl-10 bg-[var(--surface-2)] border-[var(--border-default)]"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-[var(--danger)] bg-[var(--danger-muted)] p-3 rounded-[var(--radius-md)]">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-[var(--radius-md)]"
              >
                {loading ? '注册中...' : '注册'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-[var(--text-tertiary)]">
              已有账号？{' '}
              <Link href="/login" className="text-[var(--accent)] hover:underline">
                登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
