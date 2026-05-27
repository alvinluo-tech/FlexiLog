'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Lightning, Lock, CheckCircle, XCircle, Spinner } from '@phosphor-icons/react'
import Link from 'next/link'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form')
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
    
    if (token) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      })
      
      if (verifyError) {
        setError('重置链接已过期或无效')
        setStatus('error')
        setLoading(false)
        return
      }
    }
    
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
    } else {
      setStatus('success')
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
          <p className="text-sm text-[var(--text-tertiary)] mt-1">重置密码</p>
        </div>

        <Card className="card-surface border rounded-[var(--radius-xl)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              {status === 'form' ? '设置新密码' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {status === 'form' && (
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

            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-[var(--success-muted)] flex items-center justify-center mx-auto">
                  <CheckCircle weight="fill" className="h-10 w-10 text-[var(--success)]" />
                </div>
                <h2 className="text-lg font-semibold">密码已重置！</h2>
                <p className="text-sm text-[var(--text-tertiary)]">你的密码已成功更改</p>
                <Link href="/login">
                  <Button className="w-full">返回登录</Button>
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-[var(--danger-muted)] flex items-center justify-center mx-auto">
                  <XCircle weight="fill" className="h-10 w-10 text-[var(--danger)]" />
                </div>
                <h2 className="text-lg font-semibold">重置失败</h2>
                <p className="text-sm text-[var(--text-tertiary)]">{error}</p>
                <div className="space-y-2">
                  <Link href="/forgot-password">
                    <Button variant="outline" className="w-full">重新申请</Button>
                  </Link>
                  <Link href="/login">
                    <Button className="w-full">返回登录</Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-0)]">
        <Spinner className="h-8 w-8 text-[var(--accent)] animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
