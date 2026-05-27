'use client'

import { useEffect } from 'react'
import { Warning, ArrowClockwise } from '@phosphor-icons/react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--surface-0)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <Warning weight="fill" className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">出错了</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          抱歉，发生了意外错误。请尝试刷新页面。
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-bold text-sm hover:bg-[var(--accent-hover)] transition-colors"
        >
          <ArrowClockwise className="h-4 w-4" />
          重试
        </button>
      </div>
    </div>
  )
}
