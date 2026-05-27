'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dumbbell, TrendingUp, Calendar, Flame, ArrowRight } from 'lucide-react'
import Link from 'next/link'

// Mock data - will be replaced with real Supabase data
const mockData = {
  todayWorkout: {
    name: 'Push Day',
    exercises: 5,
    completedSets: 0,
    totalSets: 15,
  },
  weeklyStats: {
    workouts: 3,
    target: 5,
    volume: 12500, // kg
    change: 8.5,
  },
  recentWorkouts: [
    { id: '1', name: 'Pull Day', date: '昨天', exercises: 4, duration: '52分钟' },
    { id: '2', name: 'Leg Day', date: '前天', exercises: 5, duration: '65分钟' },
    { id: '3', name: 'Push Day', date: '3天前', exercises: 5, duration: '48分钟' },
  ],
  bodyWeight: {
    current: 75.5,
    trend: 'stable',
    change: -0.3,
  },
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">FlexiLog</h1>
          <p className="text-muted-foreground">今天也要加油 💪</p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          <Flame className="h-4 w-4 mr-1 text-orange-500" />
          {mockData.weeklyStats.workouts}天连续
        </Badge>
      </div>

      {/* Today's Workout Card */}
      <Link href="/workout/live">
        <Card className="bg-primary text-primary-foreground hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">今日训练</CardTitle>
              <ArrowRight className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{mockData.todayWorkout.name}</div>
            <div className="flex gap-4 text-sm opacity-90">
              <span>{mockData.todayWorkout.exercises} 个动作</span>
              <span>{mockData.todayWorkout.completedSets}/{mockData.todayWorkout.totalSets} 组</span>
            </div>
            <Progress 
              value={(mockData.todayWorkout.completedSets / mockData.todayWorkout.totalSets) * 100} 
              className="mt-3 h-2"
            />
          </CardContent>
        </Card>
      </Link>

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">本周训练</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockData.weeklyStats.workouts}/{mockData.weeklyStats.target}</div>
            <p className="text-xs text-muted-foreground mt-1">次训练</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">训练容量</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(mockData.weeklyStats.volume / 1000).toFixed(1)}T</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+{mockData.weeklyStats.change}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">当前体重</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockData.bodyWeight.current}<span className="text-lg">kg</span></div>
            <p className="text-xs text-muted-foreground mt-1">较上周 {mockData.bodyWeight.change}kg</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-90">AI 教练</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold mb-2">生成训练计划</div>
            <p className="text-xs opacity-80">基于你的身体数据和历史记录</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Workouts */}
      <div>
        <h2 className="text-lg font-semibold mb-3">最近训练</h2>
        <div className="space-y-2">
          {mockData.recentWorkouts.map((workout) => (
            <Card key={workout.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{workout.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {workout.exercises} 个动作 · {workout.duration}
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
      <div className="grid grid-cols-2 gap-4">
        <Link href="/exercises">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
              <Dumbbell className="h-8 w-8 mb-2 text-primary" />
              <div className="font-medium">动作库</div>
              <div className="text-xs text-muted-foreground">浏览所有动作</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/ai-coach">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
              <Calendar className="h-8 w-8 mb-2 text-primary" />
              <div className="font-medium">训练计划</div>
              <div className="text-xs text-muted-foreground">AI 生成计划</div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
