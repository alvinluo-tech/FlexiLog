'use client'

import { Progress } from '@/components/ui/progress'
import { Barbell, TrendUp, Lightning, ArrowRight, Target, Flame, ChartLineUp } from '@phosphor-icons/react'
import Link from 'next/link'
import { motion } from 'motion/react'

interface Props {
  stats: { weeklyWorkouts: number; targetWorkouts: number; totalVolume: number; currentWeight: number; weightChange: number; streak: number }
  recentWorkouts: { id: string; name: string; date: string; exercises: number; duration: string; volume: number; isActive?: boolean }[]
  userName: string
}

// Framer motion variants for staggering child elements
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
}

export default function DashboardClient({ stats, recentWorkouts, userName }: Props) {
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="min-h-screen bg-[var(--surface-0)] pb-28 px-4 pt-6 max-w-md mx-auto w-full overflow-hidden"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[12px] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider">Welcome back</p>
          <h1 className="text-3xl font-extrabold tracking-tighter text-white leading-none mt-1">{userName}</h1>
        </div>
        {stats.streak > 0 && (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 px-3.5 py-1.5 rounded-full"
          >
            <Flame weight="fill" className="h-4 w-4 text-orange-500 animate-pulse" />
            <span className="text-sm font-bold text-orange-500 data-number">{stats.streak}d Streak</span>
          </motion.div>
        )}
      </motion.div>

      {/* Start Workout CTA */}
      <motion.div variants={itemVariants} className="mb-6">
        <Link href="/workout/live">
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl gradient-accent p-6 shadow-xl border border-white/10 group cursor-pointer"
          >
            {/* Ambient glows */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-xl transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-black/10 rounded-full blur-lg" />
            
            <div className="relative flex items-center justify-between">
              <div>
                <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md mb-2">
                  <Barbell className="h-3 w-3" /> Gym Time
                </span>
                <p className="text-white text-2xl font-black tracking-tight">START TRAINING</p>
                <p className="text-white/80 text-[12px] font-medium mt-1">Ready for your next workout session?</p>
              </div>
              <motion.div 
                whileHover={{ rotate: 45 }}
                className="h-12 w-12 rounded-full bg-white text-[var(--accent)] flex items-center justify-center shadow-lg transition-colors group-hover:bg-white/90"
              >
                <ArrowRight weight="bold" className="h-6 w-6" />
              </motion.div>
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Bento Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3.5 mb-6">
        {/* Weekly Workouts */}
        <div className="card p-4.5 flex flex-col justify-between h-36 bg-[var(--surface-1)] border-[var(--border-default)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-[var(--accent-subtle)] border border-[var(--accent-muted)] flex items-center justify-center">
                <Target className="h-3.5 w-3.5 text-[var(--accent)]" />
              </div>
              <span className="text-[12px] font-bold text-[var(--text-secondary)]">Weekly Target</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[34px] font-black leading-none data-number text-white">{stats.weeklyWorkouts}</span>
              <span className="text-md text-[var(--text-disabled)] font-bold data-number">/{stats.targetWorkouts}</span>
            </div>
          </div>
          <div className="w-full mt-2">
            <Progress value={Math.min((stats.weeklyWorkouts / stats.targetWorkouts) * 100, 100)} className="h-2 bg-[var(--surface-3)]" />
          </div>
        </div>

        {/* Volume */}
        <div className="card p-4.5 flex flex-col justify-between h-36 bg-[var(--surface-1)] border-[var(--border-default)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Barbell className="h-3.5 w-3.5 text-[var(--success)]" />
              </div>
              <span className="text-[12px] font-bold text-[var(--text-secondary)]">Total Volume</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[34px] font-black leading-none data-number text-white">{(stats.totalVolume / 1000).toFixed(1)}</span>
              <span className="text-md text-[var(--text-disabled)] font-bold">tons</span>
            </div>
          </div>
          {stats.totalVolume > 0 ? (
            <div className="flex items-center gap-1">
              <TrendUp className="h-3.5 w-3.5 text-[var(--success)]" />
              <span className="text-[11px] text-[var(--success)] font-bold">+8.5% this week</span>
            </div>
          ) : (
            <span className="text-[11px] text-[var(--text-tertiary)] font-medium">No weight logs yet</span>
          )}
        </div>

        {/* Weight Tracker */}
        <div className="card p-4.5 flex flex-col justify-between h-36 bg-[var(--surface-1)] border-[var(--border-default)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <ChartLineUp className="h-3.5 w-3.5 text-[var(--warning)]" />
              </div>
              <span className="text-[12px] font-bold text-[var(--text-secondary)]">Current Weight</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[34px] font-black leading-none data-number text-white">{stats.currentWeight || '--'}</span>
              <span className="text-md text-[var(--text-disabled)] font-bold">kg</span>
            </div>
          </div>
          {stats.weightChange !== 0 ? (
            <span className={"text-[11px] font-bold " + (stats.weightChange < 0 ? "text-[var(--success)]" : "text-[var(--warning)]")}>
              {stats.weightChange > 0 ? 'Increased' : 'Decreased'} {Math.abs(stats.weightChange).toFixed(1)}kg
            </span>
          ) : (
            <span className="text-[11px] text-[var(--text-tertiary)] font-medium">Stable trend</span>
          )}
        </div>

        {/* AI Coach Quick CTA */}
        <Link href="/ai-coach" className="h-full">
          <motion.div 
            whileTap={{ scale: 0.97 }}
            className="glass-card p-4.5 flex flex-col justify-between h-36 border border-purple-500/30 cursor-pointer bg-gradient-to-br from-purple-500/10 to-transparent hover:border-purple-500/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                <Lightning weight="fill" className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <span className="text-[12px] font-bold text-purple-300">AI Coach</span>
            </div>
            <div>
              <p className="text-[16px] font-extrabold text-white leading-tight">AI Plan Engine</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Generate routine now</p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-purple-400 font-bold">
              <span>Go to Chat</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Recent Workouts */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xl font-bold tracking-tight text-white">Recent Workouts</h2>
          <Link href="/history" className="text-sm text-[var(--accent)] font-semibold hover:text-[var(--accent-hover)]">See All</Link>
        </div>
        
        {recentWorkouts.length === 0 ? (
          <div className="card p-8 text-center bg-[var(--surface-1)] border-[var(--border-default)]">
            <Barbell className="h-10 w-10 mx-auto mb-3 text-[var(--text-tertiary)]" />
            <p className="text-[15px] font-bold text-[var(--text-secondary)]">No workouts recorded yet</p>
            <Link href="/workout/live" className="text-sm text-[var(--accent)] mt-2 inline-block font-semibold hover:underline">Start your first workout</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((w) => (
              <Link key={w.id} href={w.isActive ? "/workout/live" : "/history"}>
                <motion.div 
                  whileTap={{ scale: 0.98 }}
                  className="card p-4 flex items-center justify-between bg-[var(--surface-1)] border-[var(--border-default)] cursor-pointer hover:border-[var(--border-hover)]"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-12 w-12 rounded-xl bg-[var(--surface-3)] flex items-center justify-center border border-[var(--border-default)]">
                      <Barbell className="h-6 w-6 text-[var(--text-secondary)]" />
                    </div>
                    <div>
                      <p className="text-[15px] font-bold text-white">{w.name}</p>
                      <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">
                        {w.exercises} exercises · {w.duration}
                        {w.volume > 0 && <span className="data-number"> · {(w.volume / 1000).toFixed(1)}T</span>}
                      </p>
                    </div>
                  </div>
                  {w.isActive ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      Live
                    </span>
                  ) : (
                    <span className="text-[12px] text-[var(--text-disabled)] font-medium">{w.date}</span>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions (Floating bottom spacer helper) */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3.5">
        <Link href="/exercises">
          <motion.div 
            whileTap={{ scale: 0.97 }}
            className="card p-4 text-center bg-[var(--surface-1)] border-[var(--border-default)] cursor-pointer hover:border-[var(--border-hover)]"
          >
            <div className="h-10 w-10 rounded-xl bg-[var(--surface-3)] flex items-center justify-center mx-auto mb-2 border border-[var(--border-default)]">
              <Barbell className="h-5.5 w-5.5 text-[var(--text-secondary)]" />
            </div>
            <p className="text-[14px] font-bold text-white">Exercises</p>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">25+ movements</p>
          </motion.div>
        </Link>
        <Link href="/profile">
          <motion.div 
            whileTap={{ scale: 0.97 }}
            className="card p-4 text-center bg-[var(--surface-1)] border-[var(--border-default)] cursor-pointer hover:border-[var(--border-hover)]"
          >
            <div className="h-10 w-10 rounded-xl bg-[var(--surface-3)] flex items-center justify-center mx-auto mb-2 border border-[var(--border-default)]">
              <ChartLineUp className="h-5.5 w-5.5 text-[var(--text-secondary)]" />
            </div>
            <p className="text-[14px] font-bold text-white">Profile</p>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">Body stats</p>
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  )
}
