'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dumbbell, TrendingUp, Calendar, Flame, ArrowRight, Zap, Target, Clock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const mockData = {
  todayWorkout: {
    name: 'Push Day',
    exercises: 5,
    completedSets: 0,
    totalSets: 15,
    duration: '45分钟',
  },
  weeklyStats: {
    workouts: 3,
    target: 5,
    volume: 12500,
    change: 8.5,
    streak: 7,
  },
  recentWorkouts: [
    { id: '1', name: 'Pull Day', date: '昨天', exercises: 4, duration: '52分钟', calories: 320 },
    { id: '2', name: 'Leg Day', date: '前天', exercises: 5, duration: '65分钟', calories: 450 },
    { id: '3', name: 'Push Day', date: '3天前', exercises: 5, duration: '48分钟', calories: 380 },
  ],
  bodyWeight: {
    current: 75.5,
    trend: 'stable',
    change: -0.3,
    history: [76.2, 76.0, 75.8, 75.5, 75.3, 75.5],
  },
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-subtle" />
        <div className="relative container mx-auto px-4 pt-6 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-gradient">FlexiLog</span>
              </h1>
              <p className="text-muted-foreground mt-1">今天也要突破极限 💪</p>
            </div>
            <Badge variant="secondary" className="text-sm px-4 py-1.5 glass-effect">
              <Flame className="h-4 w-4 mr-1.5 text-orange-500" />
              {mockData.weeklyStats.streak}天连续
            </Badge>
          </div>

          {/* Today's Workout - Hero Card */}
          <Link href="/workout/live" className="block mb-6">
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#5e6ad2] via-[#7170ff] to-[#828fff] text-white">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24" />
              <CardHeader className="relative pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    <CardTitle className="text-lg font-medium">今日训练</CardTitle>
                  </div>
                  <ArrowRight className="h-5 w-5 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-4xl font-bold mb-3 tracking-tight">{mockData.todayWorkout.name}</div>
                <div className="flex gap-6 text-sm opacity-90 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Dumbbell className="h-4 w-4" />
                    {mockData.todayWorkout.exercises} 个动作
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    {mockData.todayWorkout.completedSets}/{mockData.todayWorkout.totalSets} 组
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {mockData.todayWorkout.duration}
                  </span>
                </div>
                <Progress 
                  value={(mockData.todayWorkout.completedSets / mockData.todayWorkout.totalSets) * 100} 
                  className="h-2 bg-white/20"
                />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-24 space-y-6">
        {/* Stats Grid - Bento Style */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="card-premium border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">本周训练</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{mockData.weeklyStats.workouts}</span>
                <span className="text-xl text-muted-foreground">/{mockData.weeklyStats.target}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">次训练完成</p>
              <Progress 
                value={(mockData.weeklyStats.workouts / mockData.weeklyStats.target) * 100} 
                className="mt-3 h-1"
              />
            </CardContent>
          </Card>

          <Card className="card-premium border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">训练容量</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{(mockData.weeklyStats.volume / 1000).toFixed(1)}</span>
                <span className="text-xl text-muted-foreground">T</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-xs text-emerald-500 font-medium">+{mockData.weeklyStats.change}%</span>
                <span className="text-xs text-muted-foreground">较上周</span>
              </div>
            </CardContent>
          </Card>

          <Card className="card-premium border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">当前体重</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight">{mockData.bodyWeight.current}</span>
                <span className="text-xl text-muted-foreground">kg</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                较上周 <span className={mockData.bodyWeight.change < 0 ? 'text-emerald-500' : 'text-orange-500'}>
                  {mockData.bodyWeight.change > 0 ? '+' : ''}{mockData.bodyWeight.change}kg
                </span>
              </p>
            </CardContent>
          </Card>

          <Link href="/ai-coach">
            <Card className="card-premium border-0 h-full cursor-pointer group">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="h-10 w-10 rounded-lg gradient-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">AI 教练</div>
                  <div className="text-xs text-muted-foreground mt-0.5">生成个性化计划</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Workouts */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">最近训练</h2>
            <Link href="/workout/live" className="text-sm text-primary hover:text-primary/80 transition-colors">
              查看全部
            </Link>
          </div>
          <div className="space-y-2">
            {mockData.recentWorkouts.map((workout, index) => (
              <Card key={workout.id} className="card-premium border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center",
                        index === 0 ? "gradient-accent" : "bg-secondary"
                      )}>
                        <Dumbbell className={cn(
                          "h-6 w-6",
                          index === 0 ? "text-white" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <div className="font-semibold">{workout.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                          <span>{workout.exercises} 个动作</span>
                          <span className="text-border">·</span>
                          <span>{workout.duration}</span>
                          <span className="text-border">·</span>
                          <span>{workout.calories} kcal</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{workout.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/exercises">
            <Card className="card-premium border-0 cursor-pointer group h-full">
              <CardContent className="p-5 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Dumbbell className="h-7 w-7 text-primary" />
                </div>
                <div className="font-semibold">动作库</div>
                <div className="text-xs text-muted-foreground mt-1">25+ 基础动作</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/profile">
            <Card className="card-premium border-0 cursor-pointer group h-full">
              <CardContent className="p-5 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Target className="h-7 w-7 text-primary" />
                </div>
                <div className="font-semibold">个人设置</div>
                <div className="text-xs text-muted-foreground mt-1">身体参数配置</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
