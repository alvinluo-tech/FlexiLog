'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MagnifyingGlass, Plus, Barbell, ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { MuscleGroup } from '@/types'

const muscleGroups: { value: MuscleGroup; label: string }[] = [
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背' },
  { value: 'legs', label: '腿' },
  { value: 'shoulders', label: '肩' },
  { value: 'biceps', label: '二头' },
  { value: 'triceps', label: '三头' },
  { value: 'core', label: '核心' },
  { value: 'full_body', label: '全身' },
]

const mockExercises = [
  { id: '1', name: '卧推', muscle_group: 'chest' as MuscleGroup, description: '平躺推举杠铃', tips: '背部微弓，脚踏实地' },
  { id: '2', name: '上斜哑铃推举', muscle_group: 'chest' as MuscleGroup, description: '斜板推举哑铃', tips: '角度30-45度' },
  { id: '3', name: '绳索飞鸟', muscle_group: 'chest' as MuscleGroup, description: '绳索夹胸', tips: '肘部微弯' },
  { id: '4', name: '俯卧撑', muscle_group: 'chest' as MuscleGroup, description: '自重胸部训练', tips: '核心收紧' },
  { id: '5', name: '硬拉', muscle_group: 'back' as MuscleGroup, description: '从地面拉起杠铃', tips: '背部挺直' },
  { id: '6', name: '杠铃划船', muscle_group: 'back' as MuscleGroup, description: '俯身划船', tips: '挤压肩胛骨' },
  { id: '7', name: '高位下拉', muscle_group: 'back' as MuscleGroup, description: '下拉练背', tips: '微后仰' },
  { id: '8', name: '引体向上', muscle_group: 'back' as MuscleGroup, description: '自重拉的动作', tips: '全程控制' },
  { id: '9', name: '深蹲', muscle_group: 'legs' as MuscleGroup, description: '杠铃深蹲', tips: '膝盖对准脚尖' },
  { id: '10', name: '腿举', muscle_group: 'legs' as MuscleGroup, description: '器械腿举', tips: '不锁死膝盖' },
  { id: '11', name: '罗马尼亚硬拉', muscle_group: 'legs' as MuscleGroup, description: '髋关节铰链', tips: '膝盖微弯' },
  { id: '12', name: '腿弯举', muscle_group: 'legs' as MuscleGroup, description: '腘绳肌训练', tips: '控制动作' },
  { id: '13', name: '提踵', muscle_group: 'legs' as MuscleGroup, description: '站姿提踵', tips: '全程运动' },
  { id: '14', name: '肩推', muscle_group: 'shoulders' as MuscleGroup, description: '站姿杠铃推举', tips: '核心收紧' },
  { id: '15', name: '侧平举', muscle_group: 'shoulders' as MuscleGroup, description: '哑铃侧平举', tips: '举至肩高' },
  { id: '16', name: '面拉', muscle_group: 'shoulders' as MuscleGroup, description: '绳索面拉', tips: '挤压后三角肌' },
  { id: '17', name: '杠铃弯举', muscle_group: 'biceps' as MuscleGroup, description: '站姿杠铃弯举', tips: '肘部固定' },
  { id: '18', name: '锤式弯举', muscle_group: 'biceps' as MuscleGroup, description: '中性握弯举', tips: '手腕平直' },
  { id: '19', name: '绳索下压', muscle_group: 'triceps' as MuscleGroup, description: '三头下压', tips: '肘部贴身' },
  { id: '20', name: '碎颅者', muscle_group: 'triceps' as MuscleGroup, description: '仰卧臂屈伸', tips: '下放至额头' },
  { id: '21', name: '平板支撑', muscle_group: 'core' as MuscleGroup, description: '静态核心训练', tips: '身体成直线' },
  { id: '22', name: '绳索卷腹', muscle_group: 'core' as MuscleGroup, description: '跪姿卷腹', tips: '卷曲身体' },
  { id: '23', name: '悬垂举腿', muscle_group: 'core' as MuscleGroup, description: '悬挂举腿', tips: '避免摆动' },
  { id: '24', name: '高翻推举', muscle_group: 'full_body' as MuscleGroup, description: '高翻推举', tips: '爆发性拉起' },
  { id: '25', name: '土耳其起立', muscle_group: 'full_body' as MuscleGroup, description: '复杂全身动作', tips: '按步骤进行' },
]

export default function ExercisesPage() {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | 'all'>('all')

  const filteredExercises = useMemo(() => {
    return mockExercises.filter(ex => {
      const matchesSearch = !search || ex.name.includes(search) || ex.description.includes(search)
      const matchesGroup = selectedGroup === 'all' || ex.muscle_group === selectedGroup
      return matchesSearch && matchesGroup
    })
  }, [search, selectedGroup])

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
          className="pl-10 bg-[var(--surface-1)] border-[var(--border-default)] focus:border-[var(--accent)]"
        />
      </div>

      {/* Muscle Group Tabs */}
      <Tabs defaultValue="all" onValueChange={(v) => setSelectedGroup(v as MuscleGroup | 'all')}>
        <TabsList className="w-full flex overflow-x-auto bg-[var(--surface-1)] border border-[var(--border-default)] p-1 rounded-[var(--radius-lg)]">
          <TabsTrigger value="all" className="flex-shrink-0 text-xs rounded-[var(--radius-md)]">全部</TabsTrigger>
          {muscleGroups.map(group => (
            <TabsTrigger key={group.value} value={group.value} className="flex-shrink-0 text-xs rounded-[var(--radius-md)]">
              {group.label}
            </TabsTrigger>
          ))}
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

function ExerciseList({ exercises }: { exercises: typeof mockExercises }) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-tertiary)]">
        <Barbell className="h-10 w-10 mx-auto mb-3 text-[var(--text-disabled)]" />
        <p className="text-sm">没有找到匹配的动作</p>
      </div>
    )
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
                    {muscleGroups.find(g => g.value === exercise.muscle_group)?.label}
                  </Badge>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] truncate">{exercise.tips}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--text-disabled)] ml-3 shrink-0 group-hover:text-[var(--text-tertiary)] transition-colors" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
