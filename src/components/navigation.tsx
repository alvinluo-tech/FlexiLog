'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, Barbell, ListChecks, Sparkle, User, Lightning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: '看板', icon: House },
  { href: '/exercises', label: '动作库', icon: Barbell },
  { href: '/workout/live', label: '训练', icon: ListChecks },
  { href: '/ai-coach', label: 'AI教练', icon: Sparkle },
  { href: '/profile', label: '我的', icon: User },
]

/* Desktop Sidebar */
export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col border-r border-[var(--border-default)] bg-[var(--surface-1)]">
      {/* Logo */}
      <div className="p-5 pb-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Lightning weight="fill" className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">FlexiLog</h1>
            <p className="text-[10px] text-[var(--text-disabled)] -mt-0.5">AI Fitness Tracker</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-2)]'
              )}
            >
              <item.icon
                weight={isActive ? 'fill' : 'regular'}
                className="h-[18px] w-[18px]"
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-default)]">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded-full bg-[var(--surface-3)] flex items-center justify-center">
            <User className="h-4 w-4 text-[var(--text-tertiary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">健身爱好者</div>
            <div className="text-[11px] text-[var(--text-disabled)]">v1.0.0</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

/* Mobile Bottom Nav - optimized for touch */
export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav md:hidden safe-bottom">
      <div className="flex justify-around items-center h-16 px-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] font-medium transition-colors duration-150 rounded-[var(--radius-md)]',
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-disabled)] hover:text-[var(--text-tertiary)]'
              )}
            >
              <item.icon
                weight={isActive ? 'fill' : 'regular'}
                className="h-5 w-5"
              />
              <span className="leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
