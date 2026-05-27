'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkle, CalendarBlank, Barbell, Clock, Target, 
  CaretRight, CircleNotch, Lightning 
} from '@phosphor-icons/react'

interface WorkoutPlan {
  id: string
  name: string
  description: string
  duration: string
  days: {
    day: string
    focus: string
    exercises: {
      name: string
      sets: number
      reps: string
      rest: string
    }[]
  }[]
}

const mockPlans: WorkoutPlan[] = [
  {
    id: '1',
    name: 'PPL 推拉腿计划',
    description: '适合中级健身者的6天训练计划',
    duration: '4周循环',
    days: [
      {
        day: '周一 - Push',
        focus: '胸部、肩部、三头',
        exercises: [
          { name: '卧推', sets: 4, reps: '8-10', rest: '90s' },
          { name: '上斜哑铃推举', sets: 3, reps: '10-12', rest: '60s' },
          { name: '肩推', sets: 3, reps: '8-10', rest: '90s' },
          { name: '侧平举', sets: 3, reps: '12-15', rest: '45s' },
          { name: '绳索下压', sets: 3, reps: '12-15', rest: '45s' },
        ],
      },
      {
        day: '周二 - Pull',
        focus: '背部、二头',
        exercises: [
          { name: '硬拉', sets: 4, reps: '5-6', rest: '120s' },
          { name: '杠铃划船', sets: 4, reps: '8-10', rest: '90s' },
          { name: '高位下拉', sets: 3, reps: '10-12', rest: '60s' },
          { name: '面拉', sets: 3, reps: '15-20', rest: '45s' },
          { name: '杠铃弯举', sets: 3, reps: '10-12', rest: '45s' },
        ],
      },
      {
        day: '周三 - Legs',
        focus: '腿部',
        exercises: [
          { name: '深蹲', sets: 4, reps: '6-8', rest: '120s' },
          { name: '罗马尼亚硬拉', sets: 3, reps: '10-12', rest: '90s' },
          { name: '腿举', sets: 3, reps: '12-15', rest: '60s' },
          { name: '腿弯举', sets: 3, reps: '12-15', rest: '45s' },
          { name: '提踵', sets: 4, reps: '15-20', rest: '30s' },
        ],
      },
    ],
  },
  {
    id: '2',
    name: '新手全身计划',
    description: '适合初学者的3天全身训练',
    duration: '4周循环',
    days: [
      {
        day: '周一/周五',
        focus: '全身训练A',
        exercises: [
          { name: '深蹲', sets: 3, reps: '8-10', rest: '90s' },
          { name: '卧推', sets: 3, reps: '8-10', rest: '90s' },
          { name: '杠铃划船', sets: 3, reps: '8-10', rest: '60s' },
          { name: '肩推', sets: 3, reps: '8-10', rest: '60s' },
          { name: '平板支撑', sets: 3, reps: '30s', rest: '30s' },
        ],
      },
      {
        day: '周三',
        focus: '全身训练B',
        exercises: [
          { name: '罗马尼亚硬拉', sets: 3, reps: '10-12', rest: '90s' },
          { name: '引体向上', sets: 3, reps: '力竭', rest: '90s' },
          { name: '哑铃卧推', sets: 3, reps: '10-12', rest: '60s' },
          { name: '侧平举', sets: 3, reps: '12-15', rest: '45s' },
          { name: '卷腹', sets: 3, reps: '15-20', rest: '30s' },
        ],
      },
    ],
  },
]

export default function AICoachPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setSelectedPlan(mockPlans[0])
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Sparkle weight="fill" className="h-5 w-5 text-[var(--accent)]" />
          AI 教练
        </h1>
        <p className="text-sm text-[var(--text-tertiary)] mt-0.5">基于你的数据生成个性化训练计划</p>
      </div>

      {/* Generate Button */}
      <Card className="gradient-accent border-0 rounded-[var(--radius-xl)] text-white">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-1">生成训练计划</h2>
              <p className="text-sm opacity-80">AI 根据身体参数和目标制定专属计划</p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="gap-2 rounded-[var(--radius-md)]"
            >
              {isGenerating ? (
                <>
                  <CircleNotch className="h-5 w-5 animate-spin" />
                  生成中
                </>
              ) : (
                <>
                  <Lightning weight="fill" className="h-5 w-5" />
                  生成
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      {selectedPlan ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{selectedPlan.name}</h2>
            <Badge variant="secondary" className="text-xs bg-[var(--surface-3)] border-[var(--border-default)]">{selectedPlan.duration}</Badge>
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">{selectedPlan.description}</p>

          <Tabs defaultValue="0">
            <TabsList className="w-full flex overflow-x-auto bg-[var(--surface-1)] border border-[var(--border-default)] p-1 rounded-[var(--radius-lg)]">
              {selectedPlan.days.map((day, index) => (
                <TabsTrigger key={index} value={index.toString()} className="flex-shrink-0 text-xs rounded-[var(--radius-md)]">
                  {day.day.split(' - ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {selectedPlan.days.map((day, index) => (
              <TabsContent key={index} value={index.toString()} className="mt-4">
                <Card className="card-surface border rounded-[var(--radius-lg)]">
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">{day.day}</CardTitle>
                    <p className="text-xs text-[var(--text-tertiary)]">{day.focus}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {day.exercises.map((exercise, exIndex) => (
                        <div
                          key={exIndex}
                          className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-[var(--radius-md)]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-[var(--radius-sm)] bg-[var(--surface-3)] flex items-center justify-center">
                              <Barbell className="h-4 w-4 text-[var(--text-tertiary)]" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{exercise.name}</div>
                              <div className="text-xs text-[var(--text-tertiary)] data-number">
                                {exercise.sets}组 x {exercise.reps}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] gap-1 bg-[var(--surface-3)] border-[var(--border-default)]">
                            <Clock className="h-3 w-3" />
                            {exercise.rest}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <Button className="w-full h-12 gap-2 rounded-[var(--radius-lg)]" size="lg">
            <CalendarBlank className="h-5 w-5" />
            应用到今日训练
          </Button>
        </div>
      ) : (
        <Card className="card-surface border rounded-[var(--radius-lg)]">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-[var(--accent-muted)] flex items-center justify-center mx-auto mb-4">
              <Sparkle weight="fill" className="h-8 w-8 text-[var(--accent)]" />
            </div>
            <h3 className="text-base font-semibold mb-2">还没有训练计划</h3>
            <p className="text-sm text-[var(--text-tertiary)] mb-4">点击上方按钮，AI 为你生成个性化计划</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              <Badge variant="secondary" className="text-[10px] bg-[var(--surface-3)] border-[var(--border-default)]">身体参数</Badge>
              <Badge variant="secondary" className="text-[10px] bg-[var(--surface-3)] border-[var(--border-default)]">训练目标</Badge>
              <Badge variant="secondary" className="text-[10px] bg-[var(--surface-3)] border-[var(--border-default)]">器械条件</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Plans */}
      <section>
        <h2 className="text-base font-semibold mb-3">示例计划</h2>
        <div className="space-y-2">
          {mockPlans.map(plan => (
            <Card
              key={plan.id}
              className="card-surface border rounded-[var(--radius-lg)] cursor-pointer group"
              onClick={() => setSelectedPlan(plan)}
            >
              <CardContent className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--accent-muted)] flex items-center justify-center">
                    <Target className="h-5 w-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{plan.name}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{plan.description}</div>
                  </div>
                </div>
                <CaretRight className="h-4 w-4 text-[var(--text-disabled)] group-hover:text-[var(--text-tertiary)] transition-colors" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
