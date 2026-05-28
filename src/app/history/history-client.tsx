'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Barbell, Clock, TrendUp, CaretDown, CaretUp, ChartLineUp, DownloadSimple, Funnel } from '@phosphor-icons/react'
import WeightChart from '@/components/charts/weight-chart'
import VolumeChart from '@/components/charts/volume-chart'
import { getHistoryPage } from '@/app/actions/history'
import { exportWorkoutData } from '@/app/actions/export'
import { toast } from 'sonner'

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
  allMuscleGroups: string[]
  userId: string
}

const DATE_FILTERS = [
  { key: 'all', label: '全部' },
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: '3months', label: '三个月' },
]

const GROUP_LABELS: Record<string, string> = {
  chest: '胸部',
  back: '背部',
  legs: '腿部',
  shoulders: '肩部',
  biceps: '二头',
  triceps: '三头',
  core: '核心',
  full_body: '全身',
}

export default function HistoryClient({ history: initialHistory, weightChartData, volumeChartData, allMuscleGroups, userId }: Props) {
  const [history, setHistory] = useState<HistoryItem[]>(initialHistory)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(initialHistory.length >= 20)
  const [dateFilter, setDateFilter] = useState('all')
  const [muscleFilter, setMuscleFilter] = useState('all')
  const [exporting, setExporting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
    if (diffDays === 0) return '今天'
    if (diffDays === 1) return '昨天'
    if (diffDays < 7) return diffDays + ' 天前'
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
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

  const processSessions = useCallback((sessions: any[]): HistoryItem[] => {
    return sessions.map(session => {
      const sets = session.workout_sets || []
      const exercises: string[] = [...new Set(sets.map((s: any) => s.exercises?.name).filter(Boolean))] as string[]
      const volume = sets.reduce((sum: number, s: any) => sum + (Number(s.weight_kg) || 0) * (s.reps || 0), 0)
      const duration = session.ended_at
        ? Math.round((new Date(session.ended_at).getTime() - new Date(session.started_at).getTime()) / 60000)
        : 0
      const muscleGroups: string[] = [...new Set(sets.map((s: any) => s.exercises?.muscle_group).filter(Boolean))] as string[]

      return {
        id: session.id,
        date: session.started_at,
        exercises,
        exerciseCount: exercises.length,
        setCount: sets.length,
        volume,
        duration,
        muscleGroups,
        sets: sets.map((s: any) => ({
          exercise: s.exercises?.name || 'Unknown',
          muscleGroup: s.exercises?.muscle_group || '',
          setNumber: s.set_number,
          weight: s.weight_kg,
          reps: s.reps,
          rpe: s.rpe,
        })),
      }
    })
  }, [])

  const handleLoadMore = async () => {
    setLoadingMore(true)
    const result = await getHistoryPage(history.length, 20, dateFilter === 'all' ? undefined : dateFilter, muscleFilter === 'all' ? undefined : muscleFilter)
    if (result.sessions.length > 0) {
      const newItems = processSessions(result.sessions)
      setHistory(prev => [...prev, ...newItems])
    }
    setHasMore(result.hasMore)
    setLoadingMore(false)
  }

  const handleFilterChange = async (newDateFilter: string, newMuscleFilter: string) => {
    setDateFilter(newDateFilter)
    setMuscleFilter(newMuscleFilter)
    setLoadingMore(true)
    const result = await getHistoryPage(0, 20, newDateFilter === 'all' ? undefined : newDateFilter, newMuscleFilter === 'all' ? undefined : newMuscleFilter)
    const newItems = processSessions(result.sessions)
    setHistory(newItems)
    setHasMore(result.hasMore)
    setLoadingMore(false)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const result = await exportWorkoutData(userId)
      if (result.error) {
        toast.error('导出失败', { description: result.error })
        return
      }
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `flexilog-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('数据导出成功')
    } catch (e) {
      toast.error('导出失败')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header with export */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">训练历史</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <Funnel className="h-4 w-4" />
            <span className="text-xs">筛选</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={exporting || history.length === 0}
            className="gap-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
          >
            <DownloadSimple className="h-4 w-4" />
            <span className="text-xs">{exporting ? '导出中...' : '导出'}</span>
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="space-y-3 p-3 rounded-xl bg-[var(--surface-1)] border border-[var(--border-default)]">
          <div>
            <p className="text-xs text-[var(--text-disabled)] mb-2 font-medium">时间范围</p>
            <div className="flex flex-wrap gap-1.5">
              {DATE_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => handleFilterChange(f.key, muscleFilter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    dateFilter === f.key
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {allMuscleGroups.length > 0 && (
            <div>
              <p className="text-xs text-[var(--text-disabled)] mb-2 font-medium">肌群</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleFilterChange(dateFilter, 'all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    muscleFilter === 'all'
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  全部
                </button>
                {allMuscleGroups.map(g => (
                  <button
                    key={g}
                    onClick={() => handleFilterChange(dateFilter, g)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      muscleFilter === g
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--surface-2)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {GROUP_LABELS[g] || g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <Tabs defaultValue="volume">
        <TabsList className="w-fit">
          <TabsTrigger value="volume" className="gap-1.5">
            <Barbell className="h-4 w-4" /> 训练量
          </TabsTrigger>
          <TabsTrigger value="weight" className="gap-1.5">
            <ChartLineUp className="h-4 w-4" /> 体重
          </TabsTrigger>
        </TabsList>
        <TabsContent value="volume" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-[var(--text-tertiary)] mb-3">近14天训练量</p>
              <VolumeChart data={volumeChartData} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weight" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-[var(--text-tertiary)] mb-3">体重趋势</p>
              <WeightChart data={weightChartData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold data-number">{history.length}</p>
          <p className="text-xs text-[var(--text-tertiary)]">次训练</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold data-number">{(history.reduce((s, h) => s + h.volume, 0) / 1000).toFixed(1)}T</p>
          <p className="text-xs text-[var(--text-tertiary)]">总训练量</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold data-number">{history.reduce((s, h) => s + h.duration, 0)}</p>
          <p className="text-xs text-[var(--text-tertiary)]">分钟</p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {history.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Barbell className="h-10 w-10 mx-auto mb-3 text-[var(--text-disabled)]" />
              <p className="text-[var(--text-tertiary)]">暂无训练记录</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {history.map(item => (
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
                          <span>{item.exerciseCount} 个动作</span>
                          <span>|</span>
                          <span className="data-number">{item.duration}min</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-semibold data-number">{(item.volume / 1000).toFixed(1)}T</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{item.setCount} 组</p>
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
                          <div>动作</div>
                          <div className="text-right">重量</div>
                          <div className="text-right">次数</div>
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
            ))}

            {/* Load More button */}
            {hasMore && (
              <div className="flex justify-center py-4">
                <Button
                  variant="ghost"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="gap-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  {loadingMore ? (
                    <span className="animate-spin h-4 w-4 border-2 border-[var(--text-disabled)] border-t-[var(--accent)] rounded-full" />
                  ) : (
                    <CaretDown className="h-4 w-4" />
                  )}
                  {loadingMore ? '加载中...' : '加载更多'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
