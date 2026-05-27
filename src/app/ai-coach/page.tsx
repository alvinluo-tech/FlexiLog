'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Calendar, Dumbbell, Clock, Target, ChevronRight, Loader2 } from 'lucide-react'

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
          { name: '卧推', sets: 4, reps: '8-10', rest: '90秒' },
          { name: '上斜哑铃推举', sets: 3, reps: '10-12', rest: '60秒' },
          { name: '肩推', sets: 3, reps: '8-10', rest: '90秒' },
          { name: '侧平举', sets: 3, reps: '12-15', rest: '45秒' },
          { name: '绳索下压', sets: 3, reps: '12-15', rest: '45秒' },
        ],
      },
      {
        day: '周二 - Pull',
        focus: '背部、二头',
        exercises: [
          { name: '硬拉', sets: 4, reps: '5-6', rest: '120秒' },
          { name: '杠铃划船', sets: 4, reps: '8-10', rest: '90秒' },
          { name: '高位下拉', sets: 3, reps: '10-12', rest: '60秒' },
          { name: '面拉', sets: 3, reps: '15-20', rest: '45秒' },
          { name: '杠铃弯举', sets: 3, reps: '10-12', rest: '45秒' },
        ],
      },
      {
        day: '周三 - Legs',
        focus: '腿部',
        exercises: [
          { name: '深蹲', sets: 4, reps: '6-8', rest: '120秒' },
          { name: '罗马尼亚硬拉', sets: 3, reps: '10-12', rest: '90秒' },
          { name: '腿举', sets: 3, reps: '12-15', rest: '60秒' },
          { name: '腿弯举', sets: 3, reps: '12-15', rest: '45秒' },
          { name: '提踵', sets: 4, reps: '15-20', rest: '30秒' },
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
          { name: '深蹲', sets: 3, reps: '8-10', rest: '90秒' },
          { name: '卧推', sets: 3, reps: '8-10', rest: '90秒' },
          { name: '杠铃划船', sets: 3, reps: '8-10', rest: '60秒' },
          { name: '肩推', sets: 3, reps: '8-10', rest: '60秒' },
          { name: '平板支撑', sets: 3, reps: '30秒', rest: '30秒' },
        ],
      },
      {
        day: '周三',
        focus: '全身训练B',
        exercises: [
          { name: '罗马尼亚硬拉', sets: 3, reps: '10-12', rest: '90秒' },
          { name: '引体向上', sets: 3, reps: '力竭', rest: '90秒' },
          { name: '哑铃卧推', sets: 3, reps: '10-12', rest: '60秒' },
          { name: '侧平举', sets: 3, reps: '12-15', rest: '45秒' },
          { name: '卷腹', sets: 3, reps: '15-20', rest: '30秒' },
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
    // Simulate AI generation
    setTimeout(() => {
      setSelectedPlan(mockPlans[0])
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI 教练
        </h1>
        <p className="text-muted-foreground">基于你的数据生成个性化训练计划</p>
      </div>

      {/* Generate Button */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">生成训练计划</h2>
              <p className="text-sm opacity-90">AI 将根据你的身体参数和目标制定专属计划</p>
            </div>
            <Button
              size="lg"
              variant="secondary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  生成
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      {selectedPlan ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{selectedPlan.name}</h2>
            <Badge variant="secondary">{selectedPlan.duration}</Badge>
          </div>
          <p className="text-muted-foreground">{selectedPlan.description}</p>

          <Tabs defaultValue="0">
            <TabsList className="w-full flex overflow-x-auto">
              {selectedPlan.days.map((day, index) => (
                <TabsTrigger key={index} value={index.toString()} className="flex-shrink-0">
                  {day.day.split(' - ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {selectedPlan.days.map((day, index) => (
              <TabsContent key={index} value={index.toString()} className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{day.day}</CardTitle>
                    <p className="text-sm text-muted-foreground">{day.focus}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {day.exercises.map((exercise, exIndex) => (
                        <div
                          key={exIndex}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Dumbbell className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{exercise.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {exercise.sets} 组 × {exercise.reps}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {exercise.rest}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <Button className="w-full" size="lg">
            <Calendar className="h-5 w-5 mr-2" />
            应用到今日训练
          </Button>
        </div>
      ) : (
        /* Empty State */
        <Card>
          <CardContent className="p-12 text-center">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">还没有训练计划</h3>
            <p className="text-muted-foreground mb-4">
              点击上方按钮，AI 将为你生成个性化训练计划
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">基于身体参数</Badge>
              <Badge variant="secondary">考虑训练目标</Badge>
              <Badge variant="secondary">适配器械条件</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Plans */}
      <div>
        <h2 className="text-lg font-semibold mb-3">示例计划</h2>
        <div className="space-y-2">
          {mockPlans.map(plan => (
            <Card
              key={plan.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedPlan(plan)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">{plan.description}</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
