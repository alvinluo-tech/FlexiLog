'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Sparkle, CalendarBlank, Barbell, Clock, Target, 
  CircleNotch, Lightning 
} from '@phosphor-icons/react'

interface Plan {
  id: string
  plan_type: string
  plan_data: any
  created_at: string
}

interface AICoachClientProps {
  profile: any
  savedPlans: Plan[]
}

export default function AICoachClient({ profile, savedPlans }: AICoachClientProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('0')

  const applyToWorkout = () => {
    if (!displayPlan || !displayPlan.days || displayPlan.days.length === 0) return
    
    // Store the plan in localStorage for the workout page to use
    localStorage.setItem('ai_plan', JSON.stringify(displayPlan))
    
    // Navigate to workout page
    router.push('/workout/live')
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'generate_plan',
          params: {
            gender: profile?.gender,
            age: profile?.age,
            height_cm: profile?.height_cm,
            weight_kg: profile?.weight_kg,
            body_fat_percentage: profile?.body_fat_percentage,
            fitness_years: profile?.fitness_years,
            injuries: profile?.injuries,
            goal: profile?.goal || '增肌',
            training_days_per_week: profile?.training_days_per_week || 5,
            session_duration_minutes: profile?.session_duration_minutes || 60,
            equipment: profile?.equipment || '商业健身房',
          },
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else if (data.plan) {
        setCurrentPlan(data.plan)
      }
    } catch (err) {
      setError('生成失败，请稍后重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const displayPlan = currentPlan || (savedPlans.length > 0 ? savedPlans[0].plan_data : null)

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
              <p className="text-sm opacity-80">
                {profile ? '基于你的身体参数生成专属计划' : '完善个人设置可获得更精准的计划'}
              </p>
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

      {error && (
        <div className="text-sm text-[var(--danger)] bg-[var(--danger-muted)] p-3 rounded-[var(--radius-md)]">
          {error}
        </div>
      )}

      {/* Plans */}
      {displayPlan ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">{displayPlan.name || '训练计划'}</h2>
            {displayPlan.duration && (
              <Badge variant="secondary" className="text-xs bg-[var(--surface-3)] border-[var(--border-default)]">
                {displayPlan.duration}
              </Badge>
            )}
          </div>
          {displayPlan.description && (
            <p className="text-sm text-[var(--text-tertiary)]">{displayPlan.description}</p>
          )}

          {displayPlan.days && displayPlan.days.length > 0 && (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full flex overflow-x-auto bg-[var(--surface-1)] border border-[var(--border-default)] p-1 rounded-[var(--radius-lg)]">
                  {displayPlan.days.map((day: any, index: number) => (
                    <TabsTrigger key={index} value={index.toString()} className="flex-shrink-0 text-xs rounded-[var(--radius-md)]">
                      {day.day?.split(' - ')[0] || `Day ${index + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {displayPlan.days.map((day: any, index: number) => (
                  <TabsContent key={index} value={index.toString()} className="mt-4">
                    <Card className="card-surface border rounded-[var(--radius-lg)]">
                      <CardHeader>
                        <CardTitle className="text-sm font-medium">{day.day}</CardTitle>
                        {day.focus && <p className="text-xs text-[var(--text-tertiary)]">{day.focus}</p>}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {day.exercises?.map((exercise: any, exIndex: number) => (
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
                              {exercise.rest && (
                                <Badge variant="outline" className="text-[10px] gap-1 bg-[var(--surface-3)] border-[var(--border-default)]">
                                  <Clock className="h-3 w-3" />
                                  {exercise.rest}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>

              <Button className="w-full h-12 gap-2 rounded-[var(--radius-lg)]" size="lg" onClick={applyToWorkout}>
                <CalendarBlank className="h-5 w-5" />
                应用到今日训练
              </Button>
            </>
          )}
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

      {/* Saved Plans */}
      {savedPlans.length > 0 && (
        <section>
          <h2 className="text-base font-semibold mb-3">历史计划</h2>
          <div className="space-y-2">
            {savedPlans.map(plan => (
              <Card 
                key={plan.id} 
                className="card-surface border rounded-[var(--radius-lg)] cursor-pointer"
                onClick={() => setCurrentPlan(plan.plan_data)}
              >
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--accent-muted)] flex items-center justify-center">
                      <Target className="h-5 w-5 text-[var(--accent)]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{plan.plan_data?.name || '训练计划'}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        {new Date(plan.created_at).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
