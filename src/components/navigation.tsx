'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, Barbell, ListChecks, Sparkle, User, Lightning, Clock, Users } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: '首页', icon: House },
  { href: '/exercises', label: '动作', icon: Barbell },
  { href: '/workout/live', label: '训练', icon: ListChecks },
  { href: '/history', label: '历史', icon: Clock },
  { href: '/ai-coach', label: 'AI 教练', icon: Sparkle },
  { href: '/feed', label: '动态', icon: Users },
  { href: '/profile', label: '我的', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-[var(--border-default)] bg-[var(--surface-1)]">
      <div className="p-6 pb-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center bg-[var(--surface-2)]">
            <img src="/icon-192.png" alt="FlexiLog Logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold tracking-tight">FlexiLog</h1>
            <p className="text-[11px] text-[var(--text-disabled)] -mt-0.5">AI 健身追踪器</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200',
              isActive ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-2)]'
            )}>
              <item.icon weight={isActive ? 'fill' : 'regular'} className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-3 px-3">
          <div className="h-9 w-9 rounded-full bg-[var(--surface-3)] flex items-center justify-center">
            <User className="h-4 w-4 text-[var(--text-tertiary)]" />
          </div>
          <div>
            <div className="text-[14px] font-medium">User</div>
            <div className="text-[12px] text-[var(--text-disabled)]">v1.0.0</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export function BottomNav() {
  const pathname = usePathname()
  // Show only 5 items on mobile
  const mobileItems = navItems.filter(item => 
    ['/dashboard', '/exercises', '/workout/live', '/ai-coach', '/profile'].includes(item.href)
  )
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav md:hidden safe-bottom">
      <div className="flex justify-around items-center h-[72px] px-2">
        {mobileItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className={cn(
              'flex flex-col items-center justify-center gap-1 w-full h-full rounded-2xl transition-all duration-200',
              isActive ? 'text-[var(--accent)]' : 'text-[var(--text-disabled)]'
            )}>
              <div className={cn('p-1.5 rounded-xl transition-all duration-200', isActive && 'bg-[var(--accent-muted)]')}>
                <item.icon weight={isActive ? 'fill' : 'regular'} className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
