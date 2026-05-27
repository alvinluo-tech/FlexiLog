'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Barbell, TrendUp, CalendarBlank, Lightning, ArrowRight, 
  Target, Clock, Flame, ChartLineUp
} from '@phosphor-icons/react'
import Link from 'next/link'

const mockData = {
  todayWorkout: {
    name: 'Push Day',
    exercises: 5,
    completedSets: 0,
    totalSets: 15,
    duration: '45min',
  },
  weeklyStats: {
    workouts: 3,
    target: 5,
    volume: 12500,
    change: 8.5,
    streak: 7,
  },
  recentWorkouts: [
    { id: '1', name: 'Pull Day', date: '昨天', exercises: 4, duration: '52min', volume: 4200 },
    { id: '2', name: 'Leg Day', date: '前天', exercises: 5, duration: '65min', volume: 5800 },
    { id: '3', name: 'Push Day', date: '3天前', exercises: 5, duration: '48min', volume: 3900 },
  ],
  bodyWeight: {
    current: 75.5,
    change: -0.3,
  },
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent-subtle)] to-transparent h-48 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 pt-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">FlexiLog</h1>
              <p className="text-sm text-[var(--text-tertiary)] mt-0.5">今天继续突破</p>
            </div>
            <Badge variant="secondary" className="text-xs px-3 py-1 gap-1.5 bg-[var(--surface-3)] border-[var(--border-default)]">
              <Flame weight="fill" className="h-3.5 w-3.5 text-orange-500" />
              {mockData.weeklyStats.streak}天连续
            </Badge>
          </div>

          {/* Today's Workout - Hero Card */}
          <Link href="/workout/live" className="block mb-6">
            <Card className="relative overflow-hidden border-0 gradient-accent text-white rounded-[var(--radius-xl)]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-24 translate-x-24" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightning weight="fill" className="h-4 w-4" />
                    <span className="text-sm font-medium opacity-90">今日训练</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight mb-3">{mockData.todayWorkout.name}</div>
                <div className="flex gap-5 text-sm opacity-90 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Barbell className="h-4 w-4" />
                    {mockData.todayWorkout.exercises}个动作
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    {mockData.todayWorkout.completedSets}/{mockData.todayWorkout.totalSets}组
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {mockData.todayWorkout.duration}
                  </span>
                </div>
                <Progress 
                  value={(mockData.todayWorkout.completedSets / mockData.todayWorkout.totalSets) * 100} 
                  className="h-1.5 bg-white/20"
                />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-24 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="card-surface border rounded-[var(--radius-lg)]">
            <CardHeader className="pb-1">
              <CardTitle className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                本周训练
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight data-number">{mockData.weeklyStats.workouts}</span>
                <span className="text-lg text-[var(--text-disabled)] data-number">/{mockData.weeklyStats.target}</span>
              </div>
              <Progress 
                value={(mockData.weeklyStats.workouts / mockData.weeklyStats.target) * 100} 
                className="mt-3 h-1"
              />
            </CardContent>
          </Card>

          <Card className="card-surface border rounded-[var(--radius-lg)]">
            <CardHeader className="pb-1">
              <CardTitle className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                训练容量
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight data-number">{(mockData.weeklyStats.volume / 1000).toFixed(1)}</span>
                <span className="text-lg text-[var(--text-disabled)]">T</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <TrendUp weight="bold" className="h-3.5 w-3.5 text-[var(--success)]" />
                <span className="text-xs text-[var(--success)] font-medium data-number">+{mockData.weeklyStats.change}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-surface border rounded-[var(--radius-lg)]">
            <CardHeader className="pb-1">
              <CardTitle className="text-[11px] font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                当前体重
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight data-number">{mockData.bodyWeight.current}</span>
                <span className="text-lg text-[var(--text-disabled)]">kg</span>
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-2 data-number">
                {mockData.bodyWeight.change > 0 ? '+' : ''}{mockData.bodyWeight.change}kg
              </p>
            </CardContent>
          </Card>

          <Link href="/ai-coach">
            <Card className="card-surface border rounded-[var(--radius-lg)] h-full cursor-pointer group">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--accent-muted)] flex items-center justify-center mb-3">
                  <CalendarBlank weight="bold" className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div>
                  <div className="text-sm font-semibold">AI 教练</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">生成个性化计划</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Workouts */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold tracking-tight">最近训练</h2>
            <Link href="/workout/live" className="text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
              查看全部
            </Link>
          </div>
          <div className="space-y-2">
            {mockData.recentWorkouts.map((workout, index) => (
              <Card key={workout.id} className="card-surface border rounded-[var(--radius-lg)]">
                <CardContent className="p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--surface-3)] flex items-center justify-center">
                        <Barbell className="h-5 w-5 text-[var(--text-tertiary)]" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{workout.name}</div>
                        <div className="text-xs text-[var(--text-tertiary)] mt-0.5 flex items-center gap-1.5">
                          <span>{workout.exercises}个动作</span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span>{workout.duration}</span>
                          <span className="text-[var(--border-default)]">|</span>
                          <span className="data-number">{(workout.volume / 1000).toFixed(1)}T</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-disabled)]">{workout.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/exercises">
            <Card className="card-surface border rounded-[var(--radius-lg)] cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-[var(--radius-lg)] bg-[var(--surface-3)] flex items-center justify-center mb-2.5">
                  <Barbell className="h-6 w-6 text-[var(--text-secondary)]" />
                </div>
                <div className="text-sm font-medium">动作库</div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">25+ 基础动作</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/profile">
            <Card className="card-surface border rounded-[var(--radius-lg)] cursor-pointer h-full">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-[var(--radius-lg)] bg-[var(--surface-3)] flex items-center justify-center mb-2.5">
                  <ChartLineUp className="h-6 w-6 text-[var(--text-secondary)]" />
                </div>
                <div className="text-sm font-medium">数据趋势</div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">体重与容量</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
