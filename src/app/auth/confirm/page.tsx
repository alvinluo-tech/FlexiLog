'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightning, CheckCircle, XCircle, Spinner } from '@phosphor-icons/react'
import Link from 'next/link'

function ConfirmContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token_hash') || searchParams.get('token')
  const type = searchParams.get('type')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function confirm() {
      if (!token) {
        setStatus('error')
        setMessage('无效的确认链接')
        return
      }

      const supabase = createClient()
      
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: type as any || 'signup',
      })

      if (error) {
        setStatus('error')
        setMessage(error.message || '确认失败，请重试')
      } else {
        setStatus('success')
        setMessage('邮箱验证成功！')
      }
    }

    confirm()
  }, [token, type])

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--surface-0)]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center mx-auto mb-4 bg-[var(--surface-1)]">
            <img src="/icon-192.png" alt="FlexiLog Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">FlexiLog</h1>
        </div>

        <Card className="card-surface border rounded-[var(--radius-xl)]">
          <CardContent className="p-8 text-center">
            {status === 'loading' && (
              <>
                <Spinner className="h-12 w-12 mx-auto mb-4 text-[var(--accent)] animate-spin" />
                <h2 className="text-lg font-semibold mb-2">正在验证...</h2>
                <p className="text-sm text-[var(--text-tertiary)]">请稍候</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="h-16 w-16 rounded-full bg-[var(--success-muted)] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle weight="fill" className="h-10 w-10 text-[var(--success)]" />
                </div>
                <h2 className="text-lg font-semibold mb-2">验证成功！</h2>
                <p className="text-sm text-[var(--text-tertiary)] mb-6">{message}</p>
                <Link href="/dashboard">
                  <Button className="w-full">进入控制面板</Button>
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="h-16 w-16 rounded-full bg-[var(--danger-muted)] flex items-center justify-center mx-auto mb-4">
                  <XCircle weight="fill" className="h-10 w-10 text-[var(--danger)]" />
                </div>
                <h2 className="text-lg font-semibold mb-2">验证失败</h2>
                <p className="text-sm text-[var(--text-tertiary)] mb-6">{message}</p>
                <div className="space-y-2">
                  <Link href="/register">
                    <Button variant="outline" className="w-full">重新注册</Button>
                  </Link>
                  <Link href="/login">
                    <Button className="w-full">返回登录</Button>
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-0)]">
        <Spinner className="h-8 w-8 text-[var(--accent)] animate-spin" />
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}
