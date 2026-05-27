'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MuscleGroup } from '@/types'

const muscleGroups: { value: MuscleGroup; label: string; emoji: string }[] = [
  { value: 'chest', label: '胸部', emoji: '💪' },
  { value: 'back', label: '背部', emoji: '🔙' },
  { value: 'legs', label: '腿部', emoji: '🦵' },
  { value: 'shoulders', label: '肩部', emoji: '🏋️' },
  { value: 'biceps', label: '肱二头肌', emoji: '💪' },
  { value: 'triceps', label: '肱三头肌', emoji: '🦾' },
  { value: 'core', label: '核心', emoji: '🎯' },
  { value: 'full_body', label: '全身', emoji: '⚡' },
]

// Mock exercises - will be fetched from Supabase
const mockExercises = [
  { id: '1', name: '卧推', muscle_group: 'chest' as MuscleGroup, description: '平躺推举杠铃', tips: '保持背部微弓，脚踏实地' },
  { id: '2', name: '上斜哑铃推举', muscle_group: 'chest' as MuscleGroup, description: '斜板推举哑铃', tips: '角度30-45度，顶部挤压胸部' },
  { id: '3', name: '绳索飞鸟', muscle_group: 'chest' as MuscleGroup, description: '绳索夹胸', tips: '肘部微弯，底部充分拉伸' },
  { id: '4', name: '俯卧撑', muscle_group: 'chest' as MuscleGroup, description: '自重胸部训练', tips: '核心收紧，全程控制' },
  { id: '5', name: '硬拉', muscle_group: 'back' as MuscleGroup, description: '从地面拉起杠铃', tips: '背部挺直，脚跟发力，髋关节铰链' },
  { id: '6', name: '杠铃划船', muscle_group: 'back' as MuscleGroup, description: '俯身划船', tips: '拉向下胸部，挤压肩胛骨' },
  { id: '7', name: '高位下拉', muscle_group: 'back' as MuscleGroup, description: '下拉练背', tips: '微后仰，拉向上胸部' },
  { id: '8', name: '引体向上', muscle_group: 'back' as MuscleGroup, description: '自重拉的动作', tips: '从完全悬挂到下巴过杆' },
  { id: '9', name: '深蹲', muscle_group: 'legs' as MuscleGroup, description: '杠铃深蹲', tips: '髋膝同时屈曲，膝盖对准脚尖方向' },
  { id: '10', name: '腿举', muscle_group: 'legs' as MuscleGroup, description: '器械腿举', tips: '双脚与肩同宽，不要锁死膝盖' },
  { id: '11', name: '罗马尼亚硬拉', muscle_group: 'legs' as MuscleGroup, description: '髋关节铰链动作', tips: '膝盖微弯，感受腘绳肌拉伸' },
  { id: '12', name: '腿弯举', muscle_group: 'legs' as MuscleGroup, description: '器械腘绳肌训练', tips: '控制动作，顶部挤压' },
  { id: '13', name: '提踵', muscle_group: 'legs' as MuscleGroup, description: '站姿提踵', tips: '全程运动，顶部停顿' },
  { id: '14', name: '肩推', muscle_group: 'shoulders' as MuscleGroup, description: '站姿杠铃推举', tips: '核心收紧，垂直推起，锁定顶部' },
  { id: '15', name: '侧平举', muscle_group: 'shoulders' as MuscleGroup, description: '哑铃侧平举', tips: '肘部微弯，举至肩高' },
  { id: '16', name: '面拉', muscle_group: 'shoulders' as MuscleGroup, description: '绳索面拉', tips: '拉向面部，挤压后三角肌' },
  { id: '17', name: '杠铃弯举', muscle_group: 'biceps' as MuscleGroup, description: '站姿杠铃弯举', tips: '肘部固定，控制离心' },
  { id: '18', name: '锤式弯举', muscle_group: 'biceps' as MuscleGroup, description: '中性握哑铃弯举', tips: '手腕保持平直，交替进行' },
  { id: '19', name: '绳索下压', muscle_group: 'triceps' as MuscleGroup, description: '绳索三头下压', tips: '肘部贴近身体，完全伸展' },
  { id: '20', name: '碎颅者', muscle_group: 'triceps' as MuscleGroup, description: '仰卧臂屈伸', tips: '下放至额头，完全伸展' },
  { id: '21', name: '平板支撑', muscle_group: 'core' as MuscleGroup, description: '静态核心训练', tips: '身体成一条直线，不要塌腰' },
  { id: '22', name: '绳索卷腹', muscle_group: 'core' as MuscleGroup, description: '跪姿绳索卷腹', tips: '卷曲身体，不只是髋关节弯曲' },
  { id: '23', name: '悬垂举腿', muscle_group: 'core' as MuscleGroup, description: '悬挂举腿练下腹', tips: '控制动作，避免摆动' },
  { id: '24', name: '高翻推举', muscle_group: 'full_body' as MuscleGroup, description: '奥林匹克高翻推举', tips: '爆发性拉起，接住于肩上，推举过头' },
  { id: '25', name: '土耳其起立', muscle_group: 'full_body' as MuscleGroup, description: '复杂全身动作', tips: '按步骤进行，眼睛始终看着重量' },
]

export default function ExercisesPage() {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<MuscleGroup | 'all'>('all')

  const filteredExercises = mockExercises.filter(ex => {
    const matchesSearch = ex.name.includes(search) || ex.description.includes(search)
    const matchesGroup = selectedGroup === 'all' || ex.muscle_group === selectedGroup
    return matchesSearch && matchesGroup
  })

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">动作库</h1>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          自定义
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索动作..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Muscle Group Tabs */}
      <Tabs defaultValue="all" onValueChange={(v) => setSelectedGroup(v as MuscleGroup | 'all')}>
        <TabsList className="w-full flex overflow-x-auto">
          <TabsTrigger value="all" className="flex-shrink-0">全部</TabsTrigger>
          {muscleGroups.map(group => (
            <TabsTrigger key={group.value} value={group.value} className="flex-shrink-0">
              {group.emoji} {group.label}
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
      <div className="text-center py-12 text-muted-foreground">
        <p>没有找到匹配的动作</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {exercises.map(exercise => (
        <Card key={exercise.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{exercise.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {muscleGroups.find(g => g.value === exercise.muscle_group)?.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{exercise.description}</p>
                <p className="text-xs text-muted-foreground italic">💡 {exercise.tips}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
