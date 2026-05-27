'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Barbell, TrendUp, CalendarBlank, Lightning, ArrowRight, Target, Clock, Flame, ChartLineUp } from '@phosphor-icons/react'
import Link from 'next/link'

interface Props {
  stats: { weeklyWorkouts: number; targetWorkouts: number; totalVolume: number; currentWeight: number; weightChange: number; streak: number }
  recentWorkouts: { id: string; name: string; date: string; exercises: number; duration: string; volume: number }[]
  userName: string
}

export default function DashboardClient({ stats, recentWorkouts, userName }: Props) {
  return (
    <div className="min-h-screen bg-[var(--surface-0)]">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-[13px] text-[var(--text-tertiary)] font-medium">Welcome back</p>
            <h1 className="text-[28px] font-bold tracking-tight">{userName}</h1>
          </div>
          {stats.streak > 0 && (
            <div className="flex items-center gap-1.5 bg-[var(--surface-2)] px-3 py-1.5 rounded-full">
              <Flame weight="fill" className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-semibold data-number">{stats.streak}</span>
            </div>
          )}
        </div>
      </div>

      {/* Start Workout CTA */}
      <div className="px-4 mb-6">
        <Link href="/workout/live">
          <div className="relative overflow-hidden rounded-2xl gradient-accent p-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/70 text-[13px] font-medium mb-1">Start Training</p>
                <p className="text-white text-xl font-bold">New Workout</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {/* Weekly Workouts */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
                <Target className="h-4 w-4 text-[var(--accent)]" />
              </div>
              <span className="text-[13px] text-[var(--text-tertiary)]">This Week</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-bold data-number">{stats.weeklyWorkouts}</span>
              <span className="text-[18px] text-[var(--text-disabled)] data-number">/{stats.targetWorkouts}</span>
            </div>
            <Progress value={(stats.weeklyWorkouts / stats.targetWorkouts) * 100} className="mt-3 h-1.5" />
          </div>

          {/* Volume */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-[var(--success-muted)] flex items-center justify-center">
                <Barbell className="h-4 w-4 text-[var(--success)]" />
              </div>
              <span className="text-[13px] text-[var(--text-tertiary)]">Volume</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-bold data-number">{(stats.totalVolume / 1000).toFixed(1)}</span>
              <span className="text-[18px] text-[var(--text-disabled)]">T</span>
            </div>
            {stats.totalVolume > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <TrendUp className="h-3 w-3 text-[var(--success)]" />
                <span className="text-[12px] text-[var(--success)] font-medium">+8.5%</span>
              </div>
            )}
          </div>

          {/* Weight */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-[var(--warning-muted)] flex items-center justify-center">
                <ChartLineUp className="h-4 w-4 text-[var(--warning)]" />
              </div>
              <span className="text-[13px] text-[var(--text-tertiary)]">Weight</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-bold data-number">{stats.currentWeight || '--'}</span>
              <span className="text-[18px] text-[var(--text-disabled)]">kg</span>
            </div>
            {stats.weightChange !== 0 && (
              <p className={"text-[12px] mt-2 data-number " + (stats.weightChange < 0 ? "text-[var(--success)]" : "text-[var(--warning)]")}>
                {stats.weightChange > 0 ? '+' : ''}{stats.weightChange.toFixed(1)}kg
              </p>
            )}
          </div>

          {/* AI Coach */}
          <Link href="/ai-coach">
            <div className="card p-4 h-full cursor-pointer active:scale-[0.98] transition-transform">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <Lightning weight="fill" className="h-4 w-4 text-purple-500" />
                </div>
                <span className="text-[13px] text-[var(--text-tertiary)]">AI Coach</span>
              </div>
              <p className="text-[15px] font-semibold">Generate Plan</p>
              <p className="text-[12px] text-[var(--text-tertiary)] mt-1">Personalized for you</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[18px] font-semibold">Recent</h2>
          <Link href="/workout/live" className="text-[13px] text-[var(--accent)] font-medium">See All</Link>
        </div>
        
        {recentWorkouts.length === 0 ? (
          <div className="card p-8 text-center">
            <Barbell className="h-10 w-10 mx-auto mb-3 text-[var(--text-disabled)]" />
            <p className="text-[15px] text-[var(--text-tertiary)]">No workouts yet</p>
            <Link href="/workout/live" className="text-[14px] text-[var(--accent)] mt-2 inline-block font-medium">Start your first workout</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentWorkouts.map((w) => (
              <div key={w.id} className="card p-4 flex items-center justify-between active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-[var(--surface-3)] flex items-center justify-center">
                    <Barbell className="h-5 w-5 text-[var(--text-secondary)]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold">{w.name}</p>
                    <p className="text-[13px] text-[var(--text-tertiary)]">
                      {w.exercises} exercises · {w.duration}
                      {w.volume > 0 && <span className="data-number"> · {(w.volume / 1000).toFixed(1)}T</span>}
                    </p>
                  </div>
                </div>
                <span className="text-[13px] text-[var(--text-disabled)]">{w.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/exercises">
            <div className="card p-4 text-center active:scale-[0.98] transition-transform">
              <div className="h-12 w-12 rounded-xl bg-[var(--surface-3)] flex items-center justify-center mx-auto mb-2">
                <Barbell className="h-6 w-6 text-[var(--text-secondary)]" />
              </div>
              <p className="text-[14px] font-semibold">Exercises</p>
              <p className="text-[12px] text-[var(--text-tertiary)]">25+ movements</p>
            </div>
          </Link>
          <Link href="/profile">
            <div className="card p-4 text-center active:scale-[0.98] transition-transform">
              <div className="h-12 w-12 rounded-xl bg-[var(--surface-3)] flex items-center justify-center mx-auto mb-2">
                <ChartLineUp className="h-6 w-6 text-[var(--text-secondary)]" />
              </div>
              <p className="text-[14px] font-semibold">Profile</p>
              <p className="text-[12px] text-[var(--text-tertiary)]">Body stats</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
