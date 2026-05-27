'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Barbell, Clock, TrendUp, CaretDown, CaretUp, ChartLineUp } from '@phosphor-icons/react'
import WeightChart from '@/components/charts/weight-chart'
import VolumeChart from '@/components/charts/volume-chart'

interface HistoryItem {
  id: string
  date: string
  exercises: string[]
  exerciseCount: number
  setCount: number
  volume: number
  duration: number
  muscleGroups: string[]
  sets: { exercise: string; muscleGroup: string; setNumber: number; weight: number; reps: number; rpe: number | null }[]
}

interface Props {
  history: HistoryItem[]
  weightChartData: { date: string; weight: number }[]
  volumeChartData: { date: string; volume: number }[]
}

export default function HistoryClient({ history, weightChartData, volumeChartData }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return diffDays + ' days ago'
    return date.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      chest: 'bg-blue-500/15 text-blue-400',
      back: 'bg-green-500/15 text-green-400',
      legs: 'bg-orange-500/15 text-orange-400',
      shoulders: 'bg-purple-500/15 text-purple-400',
      biceps: 'bg-pink-500/15 text-pink-400',
      triceps: 'bg-cyan-500/15 text-cyan-400',
      core: 'bg-yellow-500/15 text-yellow-400',
      full_body: 'bg-red-500/15 text-red-400',
    }
    return colors[group] || 'bg-gray-500/15 text-gray-400'
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Training History</h1>

      {/* Charts */}
      <Tabs defaultValue="volume">
        <TabsList className="w-fit">
          <TabsTrigger value="volume" className="gap-1.5">
            <Barbell className="h-4 w-4" /> Volume
          </TabsTrigger>
          <TabsTrigger value="weight" className="gap-1.5">
            <ChartLineUp className="h-4 w-4" /> Weight
          </TabsTrigger>
        </TabsList>
        <TabsContent value="volume" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-[var(--text-tertiary)] mb-3">Last 14 days training volume</p>
              <VolumeChart data={volumeChartData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weight" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-[var(--text-tertiary)] mb-3">Weight trend</p>
              <WeightChart data={weightChartData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold data-number">{history.length}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Workouts</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold data-number">{(history.reduce((s, h) => s + h.volume, 0) / 1000).toFixed(1)}T</p>
          <p className="text-xs text-[var(--text-tertiary)]">Total Volume</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold data-number">{history.reduce((s, h) => s + h.duration, 0)}</p>
          <p className="text-xs text-[var(--text-tertiary)]">Minutes</p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {history.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Barbell className="h-10 w-10 mx-auto mb-3 text-[var(--text-disabled)]" />
              <p className="text-[var(--text-tertiary)]">No workout history</p>
            </CardContent>
          </Card>
        ) : (
          history.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header - clickable */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center">
                      <Barbell className="h-5 w-5 text-[var(--accent)]" />
                    </div>
                    <div>
                      <p className="font-medium">{item.exercises[0] || 'Workout'}</p>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                        <span>{formatDate(item.date)}</span>
                        <span>|</span>
                        <span>{item.exerciseCount} exercises</span>
                        <span>|</span>
                        <span className="data-number">{item.duration}min</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold data-number">{(item.volume / 1000).toFixed(1)}T</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{item.setCount} sets</p>
                    </div>
                    {expandedId === item.id ? (
                      <CaretUp className="h-4 w-4 text-[var(--text-disabled)]" />
                    ) : (
                      <CaretDown className="h-4 w-4 text-[var(--text-disabled)]" />
                    )}
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedId === item.id && (
                  <div className="px-4 pb-4 border-t border-[var(--border-default)]">
                    {/* Muscle Groups */}
                    <div className="flex flex-wrap gap-1.5 mt-3 mb-3">
                      {item.muscleGroups.map(group => (
                        <Badge key={group} className={getGroupColor(group)}>
                          {group}
                        </Badge>
                      ))}
                    </div>

                    {/* Sets Table */}
                    <div className="space-y-1">
                      <div className="grid grid-cols-[1fr_60px_50px_50px] gap-2 text-xs text-[var(--text-disabled)] font-medium px-2">
                        <div>Exercise</div>
                        <div className="text-right">Weight</div>
                        <div className="text-right">Reps</div>
                        <div className="text-right">RPE</div>
                      </div>
                      {item.sets.map((set, i) => (
                        <div key={i} className="grid grid-cols-[1fr_60px_50px_50px] gap-2 text-sm px-2 py-1.5 rounded bg-[var(--surface-2)]">
                          <div className="truncate text-[var(--text-secondary)]">{set.exercise}</div>
                          <div className="text-right data-number">{set.weight}kg</div>
                          <div className="text-right data-number">{set.reps}</div>
                          <div className="text-right data-number text-[var(--text-tertiary)]">{set.rpe || '-'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
