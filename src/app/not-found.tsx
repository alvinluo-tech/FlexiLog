import Link from 'next/link'
import { House } from '@phosphor-icons/react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--surface-0)] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-[80px] font-black text-[var(--text-disabled)] leading-none mb-4 data-number">404</div>
        <h2 className="text-2xl font-bold text-white mb-2">页面未找到</h2>
        <p className="text-[var(--text-secondary)] mb-6">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-bold text-sm hover:bg-[var(--accent-hover)] transition-colors"
        >
          <House className="h-4 w-4" />
          返回首页
        </Link>
      </div>
    </div>
  )
}
