'use client'

import { useState } from 'react'
import Image from 'next/image'
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
          <h2 className="text-[24px] font-bold mb-2">请查看邮箱</h2>
          <p className="text-[15px] text-[var(--text-tertiary)] mb-8">
            我们已向 <span className="text-[var(--accent)] font-medium">{email}</span> 发送了验证链接
          </p>
          <Link href="/login">
            <Button className="w-full h-14 rounded-xl text-[16px] font-semibold">返回登录</Button>
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
            <Image src="/icon-192.png" alt="FlexiLog Logo" width={64} height={64} className="h-full w-full object-cover" />
          </div>
          <h1 className="text-[32px] font-bold tracking-tight">创建账号</h1>
          <p className="text-[15px] text-[var(--text-tertiary)] mt-1">开始你的健身之旅</p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[13px] text-[var(--text-secondary)] font-medium">名称</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-disabled)]" />
              <Input name="name" type="text" placeholder="你的名字" required className="h-14 pl-12 bg-[var(--surface-2)] border-[var(--border-default)] rounded-xl text-[16px]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] text-[var(--text-secondary)] font-medium">邮箱</label>
            <div className="relative">
              <Envelope className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-disabled)]" />
              <Input name="email" type="email" placeholder="your@email.com" required className="h-14 pl-12 bg-[var(--surface-2)] border-[var(--border-default)] rounded-xl text-[16px]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] text-[var(--text-secondary)] font-medium">密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-disabled)]" />
              <Input name="password" type="password" placeholder="至少6位" required minLength={6} className="h-14 pl-12 bg-[var(--surface-2)] border-[var(--border-default)] rounded-xl text-[16px]" />
            </div>
          </div>

          {error && (
            <div className="text-[14px] text-[var(--danger)] bg-[var(--danger-muted)] p-3 rounded-xl">{error}</div>
          )}

          <Button type="submit" disabled={loading} className="w-full h-14 rounded-xl text-[16px] font-semibold">
            {loading ? '创建中...' : '创建账号'}
          </Button>

          <p className="text-center text-[14px] text-[var(--text-tertiary)]">
            已有账号？{' '}
            <Link href="/login" className="text-[var(--accent)] font-medium">登录</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
