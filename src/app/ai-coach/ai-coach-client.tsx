'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkle, CalendarBlank, Barbell, Clock, Target, CircleNotch, Lightning, ChatCircle } from '@phosphor-icons/react'
import { savePlanAsTemplate } from '@/app/actions/templates'
import AIChat from '@/components/ai-chat'

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
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<'generate' | 'chat'>('chat')

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
      setError('Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlanFromChat = (plan: any) => {
    setCurrentPlan(plan)
    setView('generate')
  }

  const applyToWorkout = async () => {
    if (!currentPlan || !currentPlan.days || currentPlan.days.length === 0) return
    
    setSaving(true)
    const result = await savePlanAsTemplate(currentPlan)
    
    if (result.error) {
      alert('Failed to save: ' + result.error)
    } else {
      localStorage.setItem('ai_plan', JSON.stringify(currentPlan))
      router.push('/workout/live')
    }
    setSaving(false)
  }

  const displayPlan = currentPlan || (savedPlans.length > 0 ? savedPlans[0].plan_data : null)

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Sparkle weight="fill" className="h-5 w-5 text-[var(--accent)]" />
            AI Coach
          </h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">Your personal fitness AI</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'chat' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('chat')}
            className="gap-1.5"
          >
            <ChatCircle className="h-4 w-4" />
            Chat
          </Button>
          <Button
            variant={view === 'generate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView('generate')}
            className="gap-1.5"
          >
            <Lightning className="h-4 w-4" />
            Generate
          </Button>
        </div>
      </div>

      {/* Chat View */}
      {view === 'chat' && (
        <AIChat onPlanGenerated={handlePlanFromChat} />
      )}

      {/* Generate View */}
      {view === 'generate' && (
        <>
          {/* Generate Button */}
          <Card className="gradient-accent border-0 rounded-[var(--radius-xl)] text-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1">Generate Plan</h2>
                  <p className="text-sm opacity-80">
                    {profile ? 'Based on your body parameters' : 'Complete profile for better plans'}
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
                      Generating
                    </>
                  ) : (
                    <>
                      <Lightning weight="fill" className="h-5 w-5" />
                      Generate
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

          {/* Plan Display */}
          {displayPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">{displayPlan.name || 'Training Plan'}</h2>
                {displayPlan.duration && (
                  <Badge variant="secondary" className="text-xs">{displayPlan.duration}</Badge>
                )}
              </div>
              {displayPlan.description && (
                <p className="text-sm text-[var(--text-tertiary)]">{displayPlan.description}</p>
              )}

              {displayPlan.days && displayPlan.days.length > 0 && (
                <>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full flex overflow-x-auto">
                      {displayPlan.days.map((day: any, index: number) => (
                        <TabsTrigger key={index} value={index.toString()} className="flex-shrink-0">
                          {day.day?.split(' - ')[0] || `Day ${index + 1}`}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {displayPlan.days.map((day: any, index: number) => (
                      <TabsContent key={index} value={index.toString()} className="mt-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="mb-3">
                              <p className="font-medium">{day.day}</p>
                              {day.focus && <p className="text-xs text-[var(--text-tertiary)]">{day.focus}</p>}
                            </div>
                            <div className="space-y-2">
                              {day.exercises?.map((ex: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-[var(--surface-2)] rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-md bg-[var(--surface-3)] flex items-center justify-center">
                                      <Barbell className="h-4 w-4 text-[var(--text-tertiary)]" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">{ex.name}</p>
                                      <p className="text-xs text-[var(--text-tertiary)]">{ex.sets} sets x {ex.reps}</p>
                                    </div>
                                  </div>
                                  {ex.rest && (
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {ex.rest}
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

                  <Button className="w-full h-12 gap-2 rounded-[var(--radius-lg)]" onClick={applyToWorkout} disabled={saving}>
                    <CalendarBlank className="h-5 w-5" />
                    {saving ? 'Saving...' : 'Apply to Workout'}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="h-16 w-16 rounded-full bg-[var(--accent-muted)] flex items-center justify-center mx-auto mb-4">
                  <Sparkle weight="fill" className="h-8 w-8 text-[var(--accent)]" />
                </div>
                <h3 className="text-base font-semibold mb-2">No Plan Yet</h3>
                <p className="text-sm text-[var(--text-tertiary)]">Chat with AI or click Generate to create a plan</p>
              </CardContent>
            </Card>
          )}

          {/* Saved Plans */}
          {savedPlans.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3">Saved Plans</h2>
              <div className="space-y-2">
                {savedPlans.map(plan => (
                  <Card key={plan.id} className="cursor-pointer" onClick={() => setCurrentPlan(plan.plan_data)}>
                    <CardContent className="p-3.5 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[var(--accent-muted)] flex items-center justify-center">
                        <Target className="h-5 w-5 text-[var(--accent)]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{plan.plan_data?.name || 'Training Plan'}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">
                          {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
