'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkle, CalendarBlank, Barbell, Clock, Target, CircleNotch, Lightning, ChatCircle, List } from '@phosphor-icons/react'
import { savePlanAsTemplate } from '@/app/actions/templates'
import AIChat from '@/components/ai-chat'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

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
  const [showSidebar, setShowSidebar] = useState(false)

  // Dynamically lock/unlock scrolling on outer document/body wrappers when on Chat view
  useEffect(() => {
    if (view === 'chat') {
      const mainElement = document.querySelector('main')
      if (mainElement) {
        mainElement.classList.add('chat-active')
      }
      document.body.classList.add('chat-active-body')
      document.documentElement.classList.add('chat-active-html')
    } else {
      const mainElement = document.querySelector('main')
      if (mainElement) {
        mainElement.classList.remove('chat-active')
      }
      document.body.classList.remove('chat-active-body')
      document.documentElement.classList.remove('chat-active-html')
    }

    return () => {
      const mainElement = document.querySelector('main')
      if (mainElement) {
        mainElement.classList.remove('chat-active')
      }
      document.body.classList.remove('chat-active-body')
      document.documentElement.classList.remove('chat-active-html')
    }
  }, [view])

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
      setError('生成失败')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePlanFromChat = (plan: any) => {
    setCurrentPlan(plan)
    setView('generate')
  }

  const applyToWorkout = async () => {
    const plan = currentPlan || (savedPlans.length > 0 ? savedPlans[0].plan_data : null)
    if (!plan || !plan.days || plan.days.length === 0) return
    
    setSaving(true)
    try {
      const result = await savePlanAsTemplate(plan)
      
      if (result.error) {
        alert('保存失败：' + result.error)
      } else {
        localStorage.setItem('ai_plan', JSON.stringify(plan))
        router.push('/workout/live')
      }
    } catch (e) {
      console.error('Apply plan failed:', e)
      alert('应用失败，请重试')
    }
    setSaving(false)
  }

  const displayPlan = currentPlan || (savedPlans.length > 0 ? savedPlans[0].plan_data : null)

  return (
    <div className={cn(
      "max-w-md mx-auto w-full flex flex-col overflow-hidden bg-[var(--surface-0)]",
      view === 'chat' ? "h-[100dvh] p-0 pb-[64px]" : "min-h-[100dvh] p-4 pb-32 space-y-5 pt-2"
    )}>
      {/* Generative Loader Overlay */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                className="h-20 w-20 rounded-full border-2 border-dashed border-purple-500 flex items-center justify-center"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkle weight="fill" className="h-8 w-8 text-purple-400 animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-black text-white mt-6 tracking-tight">AI 计划引擎运行中</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-[240px] leading-relaxed">
              正在分析您的身体数据、训练目标和历史记录，构建最优训练计划...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className={cn("flex flex-col gap-3.5 shrink-0", view === 'chat' ? "p-4 bg-[var(--surface-1)] border-b border-white/5" : "pt-2")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {view === 'chat' && (
              <Button
                variant="ghost"
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-0 h-9 w-9 flex items-center justify-center bg-[var(--surface-2)] border border-white/5 rounded-lg text-white shrink-0 active:scale-95 transition-transform"
              >
                <List weight="bold" className="h-5 w-5" />
              </Button>
            )}
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 leading-none">
              <Sparkle weight="fill" className="h-5 w-5 text-purple-400" />
              AI 教练
            </h1>
          </div>
          {view !== 'chat' && <p className="text-xs text-[var(--text-tertiary)] font-semibold">智能计划</p>}
        </div>

        {/* Segmented Selector for views */}
        <div className="grid grid-cols-2 p-1 bg-[var(--surface-2)] border border-white/5 rounded-xl">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('chat')}
            className={cn(
              "h-9 gap-1.5 font-bold text-xs uppercase rounded-lg transition-all active:scale-[0.98]",
              view === 'chat' 
                ? "bg-[var(--surface-3)] text-white shadow-sm border border-white/5" 
                : "text-[var(--text-tertiary)] hover:text-white"
            )}
          >
            <ChatCircle weight="fill" className="h-4.5 w-4.5 text-purple-400" />
            教练对话
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('generate')}
            className={cn(
              "h-9 gap-1.5 font-bold text-xs uppercase rounded-lg transition-all active:scale-[0.98]",
              view === 'generate' 
                ? "bg-[var(--surface-3)] text-white shadow-sm border border-white/5" 
                : "text-[var(--text-tertiary)] hover:text-white"
            )}
          >
            <Lightning weight="fill" className="h-4.5 w-4.5 text-purple-400" />
            计划生成
          </Button>
        </div>
      </div>

      {/* Chat View (Full Bleed Viewport) */}
      {view === 'chat' ? (
        <div className="flex-1 min-h-0 flex flex-col">
          <AIChat 
            onPlanGenerated={handlePlanFromChat} 
            showSidebar={showSidebar} 
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
          />
        </div>
      ) : (
        <div className="space-y-5 flex-1 overflow-y-auto">
          {/* Plan Generator Panel */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl overflow-hidden relative shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            <CardContent className="p-5 relative z-10 flex flex-col justify-between h-40">
              <div>
                <span className="inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md">
                  <Lightning weight="fill" className="h-3 w-3" /> 快速创建
                </span>
                <h2 className="text-lg font-black text-white mt-2 leading-none">快速生成</h2>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1.5 font-medium leading-relaxed">
                  {profile 
                    ? `基于身体数据生成：${profile.weight_kg}kg，目标：${profile.goal || '增肌'}`
                    : '请先完成个人资料配置以获得最佳效果。'
                  }
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full h-11 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl active:scale-95 transition-transform border border-white/10 mt-2 text-xs uppercase tracking-wider"
              >
                <Lightning weight="fill" className="h-4 w-4 mr-1.5" />
                生成自定义计划
              </Button>
            </CardContent>
          </Card>

          {error && (
            <div className="text-xs font-bold text-[var(--danger)] bg-red-500/10 border border-red-500/25 p-3.5 rounded-xl">
              {error}
            </div>
          )}

          {/* Plan Display */}
          {displayPlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 pt-1">
                <div>
                  <h2 className="text-[16px] font-black text-white tracking-tight">{displayPlan.name || '训练概览'}</h2>
                  {displayPlan.description && (
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 font-semibold leading-relaxed">{displayPlan.description}</p>
                  )}
                </div>
                {displayPlan.duration && (
                  <Badge className="text-[10px] font-extrabold uppercase tracking-wider bg-[var(--surface-3)] text-[var(--accent)] border border-white/5 shrink-0 rounded-md">
                    {displayPlan.duration}
                  </Badge>
                )}
              </div>

              {displayPlan.days && displayPlan.days.length > 0 && (
                <>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full flex overflow-x-auto bg-[var(--surface-1)] border border-white/5 p-1 rounded-xl">
                      {displayPlan.days.map((day: any, index: number) => (
                        <TabsTrigger 
                          key={index} 
                          value={index.toString()} 
                          className="flex-shrink-0 text-[11px] font-bold rounded-lg px-3 py-1.5"
                        >
                          {day.day?.split(' - ')[0] || `第 ${index + 1} 天`}
                        </TabsTrigger>
                      ))}
                    </TabsList>

                    {displayPlan.days.map((day: any, index: number) => (
                      <TabsContent key={index} value={index.toString()} className="mt-3.5 focus-visible:outline-none">
                        <Card className="bg-[var(--surface-1)] border border-white/5 rounded-2xl shadow-sm">
                          <CardContent className="p-4 space-y-3.5">
                            <div>
                              <p className="text-[13px] font-extrabold text-white leading-none">{day.day}</p>
                              {day.focus && (
                                <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider mt-1">{day.focus}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              {day.exercises?.map((ex: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-[var(--surface-2)] border border-white/5 rounded-xl">
                                  <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-xl bg-[var(--surface-3)] border border-white/5 flex items-center justify-center shrink-0">
                                      <Barbell className="h-5 w-5 text-[var(--text-secondary)]" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-bold text-white leading-tight">{ex.name}</p>
                                      <p className="text-[11px] text-[var(--text-tertiary)] font-semibold mt-0.5">
                                        {ex.sets} 组 x {ex.reps} 次
                                        {(ex.weight_kg || ex.weight_ref) && (
                                          <span className="text-[var(--accent)] ml-1.5">
                                            @ {ex.weight_kg ? `${ex.weight_kg}kg` : ex.weight_ref}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  {ex.rest && (
                                    <Badge variant="outline" className="text-[10px] font-bold border-white/5 text-[var(--text-secondary)] rounded-md py-0.5 px-1.5">
                                      <Clock className="h-3 w-3 mr-1 text-[var(--accent)]" />
                                      {ex.rest}秒休息
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

                  <Button 
                    className="w-full h-14 gap-2 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/90 hover:from-[var(--accent-hover)] text-white shadow-xl shadow-blue-500/10 font-bold uppercase tracking-wider border border-white/10 active:scale-98 transition-all" 
                    onClick={applyToWorkout} 
                    disabled={saving}
                  >
                    <CalendarBlank weight="fill" className="h-5.5 w-5.5" />
                    {saving ? '应用中...' : '立即应用计划'}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <Card className="bg-[var(--surface-1)] border border-white/5 rounded-2xl">
              <CardContent className="p-8 text-center flex flex-col items-center justify-center">
                <div className="h-14 w-14 rounded-2xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center mb-4">
                  <Sparkle weight="fill" className="h-7 w-7 text-purple-400" />
                </div>
                <h3 className="text-sm font-extrabold text-white mb-1.5">暂无自定义计划</h3>
                <p className="text-xs text-[var(--text-tertiary)] max-w-[200px] leading-relaxed">
                  在教练对话中创建计划，或点击快速创建来生成训练计划。
                </p>
              </CardContent>
            </Card>
          )}

          {/* Saved Plans Section */}
          {savedPlans.length > 0 && (
            <section className="space-y-3.5 pt-2">
              <h2 className="text-base font-black text-white tracking-tight">已保存计划</h2>
              <div className="space-y-2.5">
                {savedPlans.map(plan => (
                  <Card 
                    key={plan.id} 
                    className="cursor-pointer hover:bg-[var(--surface-3)] bg-[var(--surface-2)] border border-white/5 rounded-xl transition-all active:scale-[0.98]" 
                    onClick={() => {
                      setCurrentPlan(plan.plan_data);
                      setActiveTab('0');
                    }}
                  >
                    <CardContent className="p-3.5 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <Target className="h-5.5 w-5.5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{plan.plan_data?.name || '训练计划'}</p>
                        <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-bold uppercase tracking-wider">
                          创建于 {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
