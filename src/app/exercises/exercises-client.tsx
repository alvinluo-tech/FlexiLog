'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MagnifyingGlass, Plus, Barbell, ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface Exercise {
  id: string
  name: string
  muscle_group: string
  description: string | null
  tips: string | null
  is_custom: boolean
}

const muscleGroups = [
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背' },
  { value: 'legs', label: '腿' },
  { value: 'shoulders', label: '肩' },
  { value: 'biceps', label: '二头' },
  { value: 'triceps', label: '三头' },
  { value: 'core', label: '核心' },
  { value: 'full_body', label: '全身' },
]

export default function ExercisesClient({ exercises }: { exercises: Exercise[] }) {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('all')

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchesSearch = !search || 
        ex.name.includes(search) || 
        (ex.description && ex.description.includes(search))
      const matchesGroup = selectedGroup === 'all' || ex.muscle_group === selectedGroup
      return matchesSearch && matchesGroup
    })
  }, [exercises, search, selectedGroup])

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">动作库</h1>
        <Button size="sm" variant="secondary" className="gap-1.5 bg-[var(--surface-3)] border-[var(--border-default)]">
          <Plus className="h-4 w-4" />
          自定义
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-disabled)]" />
        <Input
          placeholder="搜索动作..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[var(--surface-1)] border-[var(--border-default)]"
        />
      </div>

      {/* Muscle Group Tabs */}
      <Tabs defaultValue="all" onValueChange={setSelectedGroup}>
        <TabsList className="w-full flex overflow-x-auto bg-[var(--surface-1)] border border-[var(--border-default)] p-1 rounded-[var(--radius-lg)]">
          <TabsTrigger value="all" className="flex-shrink-0 text-xs rounded-[var(--radius-md)]">全部 ({exercises.length})</TabsTrigger>
          {muscleGroups.map(group => {
            const count = exercises.filter(e => e.muscle_group === group.value).length
            return (
              <TabsTrigger key={group.value} value={group.value} className="flex-shrink-0 text-xs rounded-[var(--radius-md)]">
                {group.label} ({count})
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ExerciseList exercises={filteredExercises} />
        </TabsContent>
        {muscleGroups.map(group => (
          <TabsContent key={group.value} value={group.value} className="mt-4">
            <ExerciseList exercises={filteredExercises} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function ExerciseList({ exercises }: { exercises: Exercise[] }) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-tertiary)]">
        <Barbell className="h-10 w-10 mx-auto mb-3 text-[var(--text-disabled)]" />
        <p className="text-sm">没有找到匹配的动作</p>
      </div>
    )
  }

  const getGroupLabel = (group: string) => {
    return muscleGroups.find(g => g.value === group)?.label || group
  }

  return (
    <div className="space-y-2">
      {exercises.map(exercise => (
        <Card key={exercise.id} className="card-surface border rounded-[var(--radius-lg)] cursor-pointer group">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-medium truncate">{exercise.name}</h3>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-[var(--surface-3)] border-[var(--border-default)] shrink-0">
                    {getGroupLabel(exercise.muscle_group)}
                  </Badge>
                  {exercise.is_custom && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                      自定义
                    </Badge>
                  )}
                </div>
                {exercise.tips && (
                  <p className="text-xs text-[var(--text-tertiary)] truncate">{exercise.tips}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--text-disabled)] ml-3 shrink-0 group-hover:text-[var(--text-tertiary)] transition-colors" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
