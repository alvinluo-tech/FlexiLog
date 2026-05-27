'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Dumbbell, LayoutDashboard, ListChecks, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: '看板', icon: LayoutDashboard },
  { href: '/exercises', label: '动作库', icon: Dumbbell },
  { href: '/workout/live', label: '训练', icon: ListChecks },
  { href: '/ai-coach', label: 'AI教练', icon: Sparkles },
  { href: '/profile', label: '我的', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-effect md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full h-full text-[10px] font-medium transition-all duration-200 rounded-xl mx-0.5',
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 transition-transform duration-200',
                isActive && 'scale-110'
              )} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
