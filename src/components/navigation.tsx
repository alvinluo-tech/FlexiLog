'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, Barbell, ListChecks, Sparkle, User } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: '看板', icon: House },
  { href: '/exercises', label: '动作库', icon: Barbell },
  { href: '/workout/live', label: '训练', icon: ListChecks },
  { href: '/ai-coach', label: 'AI教练', icon: Sparkle },
  { href: '/profile', label: '我的', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full text-[10px] font-medium transition-colors duration-150 rounded-[var(--radius-md)] mx-0.5',
                isActive 
                  ? 'text-[var(--accent)]' 
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              )}
            >
              <item.icon 
                weight={isActive ? 'fill' : 'regular'} 
                className="h-5 w-5" 
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
