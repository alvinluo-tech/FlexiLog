'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, Barbell, ListChecks, Sparkle, User, Lightning } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: House },
  { href: '/exercises', label: 'Exercises', icon: Barbell },
  { href: '/workout/live', label: 'Workout', icon: ListChecks },
  { href: '/ai-coach', label: 'AI Coach', icon: Sparkle },
  { href: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-[var(--border-default)] bg-[var(--surface-1)]">
      <div className="p-6 pb-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl gradient-accent flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
            <Lightning weight="fill" className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold tracking-tight">FlexiLog</h1>
            <p className="text-[11px] text-[var(--text-disabled)] -mt-0.5">AI Fitness Tracker</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className="relative block group">
              <div className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 relative z-10',
                isActive ? 'text-white' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]'
              )}>
                <item.icon weight={isActive ? 'fill' : 'regular'} className="h-5 w-5" />
                {item.label}
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeTabSidebar"
                  className="absolute inset-0 bg-[var(--accent)] rounded-xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              {!isActive && (
                <div className="absolute inset-0 bg-[var(--surface-2)] opacity-0 group-hover:opacity-100 rounded-xl transition-opacity duration-150" />
              )}
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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--surface-1)]/90 backdrop-blur-xl border-t border-white/5 shadow-2xl safe-bottom">
      <div className="flex justify-around items-center h-[64px] px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 w-full h-full relative group">
              <div className="relative flex flex-col items-center justify-center w-full h-full z-10">
                <motion.div 
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  className={cn(
                    'p-1 rounded-xl transition-colors duration-200', 
                    isActive ? 'text-white' : 'text-[var(--text-disabled)]'
                  )}
                >
                  <item.icon weight={isActive ? 'fill' : 'regular'} className="h-5.5 w-5.5" />
                </motion.div>
                <span className={cn(
                  'text-[9px] font-bold leading-none mt-0.5 transition-colors duration-200 uppercase tracking-wider',
                  isActive ? 'text-white font-black' : 'text-[var(--text-disabled)]'
                )}>
                  {item.label}
                </span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="activeTabBottom"
                  className="absolute inset-x-2 py-6 bg-[var(--accent)]/15 border-t-2 border-[var(--accent)] rounded-lg z-0"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
