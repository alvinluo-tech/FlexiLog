'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Play, Pause, ArrowCounterClockwise, Plus, Trash, 
  Timer, CaretDown, CaretUp, Check, Barbell, FloppyDisk, CalendarBlank, Lightning
} from '@phosphor-icons/react'
import { createWorkoutSession, endWorkoutSession, addWorkoutSet, discardWorkoutSession } from '@/app/actions/workout'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'

interface Exercise {
  id: string
  name: string
  muscle_group: string
}

interface WorkoutSet {
  id: string
  weight: string
  reps: string
  rpe: string
  completed: boolean
  saved: boolean
}

interface ExerciseBlock {
  exercise: Exercise
  sets: WorkoutSet[]
  previousData?: { weight: string; reps: string }[]
  collapsed: boolean
}

interface WorkoutLiveClientProps {
  exercises: Exercise[]
  previousData: Record<string, { weight: string; reps: string }[]>
  userId: string
  templates?: any[]
  initialSessionId?: string | null
  initialSessionStartTime?: number | null
  initialExerciseBlocks?: any[]
}

export default function WorkoutLiveClient({ 
  exercises, 
  previousData, 
  userId, 
  templates = [],
  initialSessionId = null,
  initialSessionStartTime = null,
  initialExerciseBlocks = []
}: WorkoutLiveClientProps) {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId)
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlock[]>(initialExerciseBlocks)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [restTime] = useState(90)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(initialSessionStartTime)
  const [elapsedTime, setElapsedTime] = useState(
    initialSessionStartTime ? Math.floor((Date.now() - initialSessionStartTime) / 1000) : 0
  )
  const [saving, setSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [aiPlan, setAiPlan] = useState<any | null>(null)
  const [isSessionPaused, setIsSessionPaused] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  // Load AI plan from localStorage on mount if exists
  useEffect(() => {
    const savedPlan = localStorage.getItem('ai_plan')
    if (savedPlan) {
      try {
        const plan = JSON.parse(savedPlan)
        setAiPlan(plan)
      } catch (e) {
        console.error('Failed to load AI plan:', e)
      }
    }
  }, [])

  // Start an empty workout
  const handleStartEmptyWorkout = async () => {
    setSaving(true)
    const result = await createWorkoutSession()
    if (result.data) {
      setSessionId(result.data.id)
      setSessionStartTime(Date.now())
      setElapsedTime(0)
      setIsSessionPaused(false)
      setExerciseBlocks([])
    }
    setSaving(false)
  }

  // Start workout from a template
  const handleStartTemplateWorkout = async (template: any) => {
    setSaving(true)
    try {
      const result = await createWorkoutSession(template.id)
      if (result.data) {
        setSessionId(result.data.id)
        setSessionStartTime(Date.now())
        setElapsedTime(0)
        setIsSessionPaused(false)
        
        const plan = template.exercises
        if (plan && plan.length > 0) {
          const today = new Date().getDay()
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          const todayName = dayNames[today]
          
          const todayPlan = plan.find((d: any) => 
            d.day?.toLowerCase().includes(todayName.toLowerCase())
          ) || plan[0]
          
          if (todayPlan?.exercises) {
            const newBlocks: ExerciseBlock[] = todayPlan.exercises.map((ex: any) => {
              const baseBlock: ExerciseBlock = {
                exercise: {
                  id: 'template-' + ex.name,
                  name: ex.name,
                  muscle_group: todayPlan.focus || 'general'
                },
                sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
                  id: 'set-' + Date.now() + '-' + i,
                  weight: '',
                  reps: ex.reps || '',
                  rpe: '',
                  completed: false,
                  saved: false
                })),
                previousData: [],
                collapsed: false
              }

              // Match master exercises list to get a valid database UUID
              const matched = exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase())
              if (matched) {
                baseBlock.exercise.id = matched.id
                baseBlock.exercise.muscle_group = matched.muscle_group
                baseBlock.previousData = previousData[matched.id] || []
              }

              return baseBlock
            })
            setExerciseBlocks(newBlocks)
          }
        }
      }
    } catch (e) {
      console.error('Failed to load template:', e)
    } finally {
      setSaving(false)
      setShowTemplates(false)
    }
  }

  // Start workout from Today's AI Coach Plan
  const handleStartAiWorkout = async () => {
    if (!aiPlan) return
    setSaving(true)
    try {
      const result = await createWorkoutSession()
      if (result.data) {
        setSessionId(result.data.id)
        setSessionStartTime(Date.now())
        setElapsedTime(0)
        setIsSessionPaused(false)
        
        if (aiPlan.days && aiPlan.days.length > 0) {
          const today = new Date().getDay()
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          const todayName = dayNames[today]
          
          const todayPlan = aiPlan.days.find((d: any) => 
            d.day?.toLowerCase().includes(todayName.toLowerCase())
          ) || aiPlan.days[0]
          
          if (todayPlan?.exercises) {
            const newBlocks: ExerciseBlock[] = todayPlan.exercises.map((ex: any) => {
              const baseBlock: ExerciseBlock = {
                exercise: {
                  id: 'ai-' + ex.name,
                  name: ex.name,
                  muscle_group: todayPlan.focus || 'general'
                },
                sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
                  id: 'set-' + Date.now() + '-' + i,
                  weight: '',
                  reps: '',
                  rpe: '',
                  completed: false,
                  saved: false
                })),
                previousData: [],
                collapsed: false
              }

              // Match master exercises list to get a valid database UUID
              const matched = exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase())
              if (matched) {
                baseBlock.exercise.id = matched.id
                baseBlock.exercise.muscle_group = matched.muscle_group
                baseBlock.previousData = previousData[matched.id] || []
              }

              return baseBlock
            })
            setExerciseBlocks(newBlocks)
          }
        }
        
        localStorage.removeItem('ai_plan')
        setAiPlan(null)
      }
    } catch (e) {
      console.error('Failed to load AI plan:', e)
    } finally {
      setSaving(false)
    }
  }

  // Session timer (Pauseable)
  useEffect(() => {
    if (!sessionStartTime || isSessionPaused || saving) return
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [sessionStartTime, isSessionPaused, saving])

  const formatSessionTime = useCallback((totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    
    const pad = (num: number) => num.toString().padStart(2, '0')
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
    }
    return `${pad(mins)}:${pad(secs)}`
  }, [])

  const handleDiscardWorkout = async () => {
    if (!sessionId) return
    setSaving(true)
    try {
      const result = await discardWorkoutSession(sessionId)
      if (result.success) {
        setSessionId(null)
        setSessionStartTime(null)
        setExerciseBlocks([])
        setIsSessionPaused(false)
        router.push('/dashboard')
      } else {
        console.error('Discard failed:', result.error)
      }
    } catch (e) {
      console.error('Failed to discard workout:', e)
    } finally {
      setSaving(false)
      setShowDiscardConfirm(false)
    }
  }

  // Rest timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isTimerRunning, timeLeft])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const addExercise = useCallback((exercise: Exercise) => {
    const prev = previousData[exercise.id]
    const newBlock: ExerciseBlock = {
      exercise,
      sets: [{ id: `set-${Date.now()}`, weight: '', reps: '', rpe: '', completed: false, saved: false }],
      previousData: prev || [],
      collapsed: false,
    }
    setExerciseBlocks(prev => [...prev, newBlock])
    setShowExercisePicker(false)
  }, [previousData])

  const addSet = useCallback((blockIndex: number) => {
    setExerciseBlocks(prev => {
      const updated = [...prev]
      const block = { ...updated[blockIndex] }
      block.sets = [...block.sets, {
        id: `set-${Date.now()}`,
        weight: '', reps: '', rpe: '', completed: false, saved: false,
      }]
      updated[blockIndex] = block
      return updated
    })
  }, [])

  const updateSet = useCallback((blockIndex: number, setIndex: number, field: keyof WorkoutSet, value: string | boolean) => {
    setExerciseBlocks(prev => {
      const updated = [...prev]
      const block = { ...updated[blockIndex] }
      const sets = [...block.sets]
      sets[setIndex] = { ...sets[setIndex], [field]: value }
      block.sets = sets
      updated[blockIndex] = block
      return updated
    })
  }, [])

  const toggleSetComplete = useCallback(async (blockIndex: number, setIndex: number) => {
    const block = exerciseBlocks[blockIndex]
    const set = block.sets[setIndex]
    const newCompleted = !set.completed

    if (newCompleted && sessionId && !set.saved) {
      // Save to database
      const weight = parseFloat(set.weight) || 0
      const reps = parseInt(set.reps) || 0
      const rpe = parseFloat(set.rpe) || undefined

      if (weight > 0 && reps > 0) {
        await addWorkoutSet(sessionId, block.exercise.id, {
          set_number: setIndex + 1,
          weight_kg: weight,
          reps,
          rpe,
        })
        updateSet(blockIndex, setIndex, 'saved', true)
      }
    }

    updateSet(blockIndex, setIndex, 'completed', newCompleted)
    
    if (newCompleted) {
      setTimeLeft(restTime)
      setIsTimerRunning(true)
    }
  }, [exerciseBlocks, sessionId, restTime, updateSet])

  const removeExercise = useCallback((blockIndex: number) => {
    setExerciseBlocks(prev => prev.filter((_, i) => i !== blockIndex))
  }, [])

  const toggleCollapse = useCallback((blockIndex: number) => {
    setExerciseBlocks(prev => {
      const updated = [...prev]
      updated[blockIndex] = { ...updated[blockIndex], collapsed: !updated[blockIndex].collapsed }
      return updated
    })
  }, [])

  const loadTemplate = useCallback((template: any) => {
    try {
      const plan = template.exercises
      if (plan && plan.length > 0) {
        const today = new Date().getDay()
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const todayName = dayNames[today]
        
        const todayPlan = plan.find((d: any) => 
          d.day?.toLowerCase().includes(todayName.toLowerCase())
        ) || plan[0]
        
        if (todayPlan?.exercises) {
          const newBlocks: ExerciseBlock[] = todayPlan.exercises.map((ex: any) => ({
            exercise: {
              id: 'template-' + ex.name,
              name: ex.name,
              muscle_group: todayPlan.focus || 'general'
            },
            sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
              id: 'set-' + Date.now() + '-' + i,
              weight: '',
              reps: ex.reps || '',
              rpe: '',
              completed: false,
              saved: false
            })),
            previousData: [],
            collapsed: false
          }))
          setExerciseBlocks(newBlocks)
        }
      }
      setShowTemplates(false)
    } catch (e) {
      console.error('Failed to load template:', e)
    }
  }, [])

  const finishWorkout = useCallback(async () => {
    if (!sessionId) return
    setSaving(true)
    await endWorkoutSession(sessionId)
    router.push('/dashboard')
  }, [sessionId, router])

  const { completedSets, totalSets } = useMemo(() => {
    let completed = 0
    let total = 0
    exerciseBlocks.forEach(block => {
      block.sets.forEach(s => {
        total++
        if (s.completed) completed++
      })
    })
    return { completedSets: completed, totalSets: total }
  }, [exerciseBlocks])

  if (sessionStartTime === null) {
    return (
      <div className="max-w-md mx-auto p-4 pb-32 space-y-6 w-full min-h-[100dvh] flex flex-col justify-start">
        {/* Lobby Header */}
        <div className="text-center pt-8 pb-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/60 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <Barbell weight="fill" className="h-9 w-9 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">开始训练！</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5 font-medium">准备好记录今天的训练成果了吗？</p>
        </div>

        {/* Start Empty Workout Card */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartEmptyWorkout}
          className="relative overflow-hidden rounded-2xl gradient-accent p-6 shadow-xl border border-white/10 group cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 blur-xl transition-transform duration-300 group-hover:scale-110" />
          <div className="relative flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md mb-2">
                快速开始
              </span>
              <p className="text-white text-xl font-black tracking-tight">开始空白训练</p>
              <p className="text-white/80 text-[11px] font-medium mt-0.5">新建一个空白训练并开始实时记录</p>
            </div>
            <div className="h-11 w-11 rounded-full bg-white text-[var(--accent)] flex items-center justify-center shadow-md">
              {saving ? (
                <div className="h-5 w-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play weight="bold" className="h-5 w-5 fill-current ml-0.5" />
              )}
            </div>
          </div>
        </motion.div>

        {/* AI Plan Banner */}
        {aiPlan && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartAiWorkout}
            className="cursor-pointer border border-purple-500/30 rounded-2xl p-5 bg-gradient-to-br from-purple-500/10 to-transparent hover:border-purple-500/50 transition-all flex items-center justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Lightning weight="fill" className="h-5 w-5 text-purple-400 animate-pulse" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-purple-300 uppercase tracking-wider leading-none">AI 计划已就绪</p>
                <p className="text-white font-black text-[16px] mt-1">{aiPlan.name || 'AI 健身计划'}</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-medium leading-tight">{aiPlan.description || '您的 AI 教练生成的专属健身方案'}</p>
              </div>
            </div>
            <div className="h-9 w-9 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
              {saving ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play weight="bold" className="h-4 w-4 fill-current ml-0.5" />
              )}
            </div>
          </motion.div>
        )}

        {/* Saved Templates Section */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-1.5 px-1">
            <CalendarBlank weight="bold" className="h-4 w-4 text-[var(--text-secondary)]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-secondary)]">您的训练模板</h2>
          </div>

          {templates.length === 0 ? (
            <div className="border border-dashed border-white/5 bg-[var(--surface-1)] rounded-2xl p-8 text-center text-[var(--text-tertiary)]">
              <p className="text-sm font-semibold">暂无已保存的模板</p>
              <p className="text-[11px] mt-0.5">您可以在日常训练中将动作组合保存为模板，或使用 AI 计划加载。</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {templates.map(template => (
                <motion.div
                  key={template.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => handleStartTemplateWorkout(template)}
                  className="cursor-pointer card-surface bg-[var(--surface-1)] border-[var(--border-default)] rounded-xl p-4 flex items-center justify-between hover:border-[var(--border-hover)] transition-all group"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="font-extrabold text-white text-sm truncate">{template.name}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate leading-relaxed">
                      {template.description || '自定义健身模板'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2.5">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-[var(--surface-3)] px-2 py-0.5 rounded text-[var(--accent)] border border-white/5">
                        {template.exercises?.length || 0} 个动作
                      </span>
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-[var(--surface-3)] border border-white/5 text-white flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)] group-hover:border-0 group-hover:text-white transition-all shadow-md">
                    {saving ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play weight="bold" className="h-4.5 w-4.5 fill-current ml-0.5 transition-transform group-hover:scale-110" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-32 space-y-4 w-full overflow-hidden min-h-[100dvh]">
      {/* Premium Workout Session Control Console */}
      <Card className="bg-gradient-to-br from-[var(--surface-1)] to-[var(--surface-2)] border-[var(--border-default)] rounded-2xl shadow-xl overflow-hidden relative border border-white/5">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent)]/5 rounded-full blur-xl pointer-events-none" />
        <CardContent className="p-4.5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full shrink-0 ${isSessionPaused ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'}`} />
              <p className="text-[11px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">
                {isSessionPaused ? '训练已暂停' : '当前训练记录中'}
              </p>
            </div>
            
            {/* Rest Timer Small Badge */}
            {timeLeft > 0 && (
              <Badge variant="outline" className="text-[10px] font-extrabold uppercase px-2 py-0.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-400 gap-1 rounded-md animate-pulse animate-none">
                <Timer className="h-3 w-3" />
                休息: {formatTime(timeLeft)}
              </Badge>
            )}
          </div>

          <div className="flex items-baseline justify-between">
            {/* Session Timer Readout */}
            <div>
              <p className="text-3xl font-black tracking-tight text-white data-number leading-none">
                {formatSessionTime(elapsedTime)}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5 font-bold uppercase tracking-wider">
                累计时长
              </p>
            </div>

            {/* Set Progression */}
            <div className="text-right">
              <p className="text-lg font-black text-white data-number leading-none">
                {completedSets} / {totalSets}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5 font-bold uppercase tracking-wider">
                已完成组数
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {totalSets > 0 && (
            <div className="h-1 bg-[var(--surface-3)] w-full rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--accent)] to-blue-400 transition-all duration-300 rounded-full"
                style={{ width: `${(completedSets / totalSets) * 100}%` }}
              />
            </div>
          )}

          {/* Action Row */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            {/* Pause/Resume button */}
            <Button
              variant={isSessionPaused ? "default" : "outline"}
              onClick={() => setIsSessionPaused(!isSessionPaused)}
              className={`h-11 rounded-xl text-xs font-bold gap-1.5 border border-white/5 active:scale-95 transition-all ${
                isSessionPaused 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white border-0' 
                  : 'bg-[var(--surface-3)] text-white hover:bg-[var(--surface-3)]/80'
              }`}
            >
              {isSessionPaused ? (
                <>
                  <Play weight="fill" className="h-4 w-4 shrink-0" />
                  继续
                </>
              ) : (
                <>
                  <Pause weight="fill" className="h-4 w-4 shrink-0" />
                  暂停
                </>
              )}
            </Button>

            {/* Add Exercise */}
            <Button
              variant="outline"
              onClick={() => setShowExercisePicker(true)}
              className="h-11 rounded-xl text-xs font-bold gap-1.5 bg-[var(--surface-3)] text-white hover:bg-[var(--surface-3)]/80 border border-white/5 active:scale-95 transition-all"
            >
              <Plus weight="bold" className="h-4 w-4 shrink-0" />
              加动作
            </Button>

            {/* Finish Workout */}
            <Button
              onClick={finishWorkout}
              disabled={saving || totalSets === 0}
              className="h-11 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[var(--accent)] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md active:scale-95 transition-all"
            >
              <Check weight="bold" className="h-4 w-4 shrink-0" />
              结束
            </Button>

            {/* Discard Workout */}
            <Button
              variant="outline"
              onClick={() => setShowDiscardConfirm(true)}
              className="h-11 rounded-xl text-xs font-bold gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
            >
              <Trash weight="bold" className="h-4 w-4 shrink-0" />
              放弃
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Blocks */}
      <div className="space-y-3.5">
        {exerciseBlocks.map((block, blockIndex) => (
          <Card key={blockIndex} className="card-surface bg-[var(--surface-1)] border-[var(--border-default)] rounded-2xl overflow-hidden shadow-md">
            <CardHeader className="pb-3.5 pt-4 px-4 flex-row items-center justify-between space-y-0">
              <div 
                className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0" 
                onClick={() => toggleCollapse(blockIndex)}
              >
                <div className="h-7 w-7 rounded-lg bg-[var(--surface-3)] flex items-center justify-center border border-white/5 shrink-0">
                  {block.collapsed ? <CaretDown weight="bold" className="h-4 w-4 text-[var(--text-secondary)]" /> : <CaretUp weight="bold" className="h-4 w-4 text-[var(--text-secondary)]" />}
                </div>
                <div className="truncate">
                  <CardTitle className="text-[15px] font-bold text-white truncate leading-tight">{block.exercise.name}</CardTitle>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)] mt-0.5 inline-block">
                    {block.exercise.muscle_group}
                  </span>
                </div>
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => removeExercise(blockIndex)} 
                className="h-9 w-9 p-0 text-[var(--danger)] hover:bg-red-500/10 hover:text-[var(--danger)] rounded-lg active:scale-90"
              >
                <Trash className="h-4.5 w-4.5" />
              </Button>
            </CardHeader>
            
            <AnimatePresence initial={false}>
              {!block.collapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                >
                  <CardContent className="pt-0 px-4 pb-4 overflow-hidden">
                    {/* Previous Workout stats indicator */}
                    {block.previousData && block.previousData.length > 0 && (
                      <div className="mb-4 p-3 bg-[var(--surface-2)] border border-white/5 rounded-xl">
                        <p className="text-[11px] font-bold text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">历史成绩</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {block.previousData.map((prev, i) => (
                            <Badge key={i} variant="outline" className="text-[11px] font-bold px-2 py-0.5 data-number bg-[var(--surface-3)] border-white/5 text-[var(--text-secondary)]">
                              第 {i + 1} 组: {prev.weight}kg x {prev.reps}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      {/* Grid Header */}
                      <div className="grid grid-cols-[32px_1fr_1fr_1fr_42px] gap-2 text-[10px] font-extrabold uppercase text-[var(--text-disabled)] tracking-wider px-1 text-center">
                        <div>组</div>
                        <div className="text-left pl-1">公斤</div>
                        <div className="text-left pl-1">次数</div>
                        <div className="text-left pl-1">RPE</div>
                        <div>状态</div>
                      </div>

                      {/* Sets list */}
                      <div className="space-y-2">
                        {block.sets.map((set, setIndex) => (
                          <motion.div
                            key={set.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: setIndex * 0.05 }}
                            className={`grid grid-cols-[32px_1fr_1fr_1fr_42px] gap-2 items-center p-1.5 rounded-xl transition-all duration-200 border ${
                              set.completed 
                                ? 'bg-emerald-500/10 border-emerald-500/25 shadow-sm' 
                                : 'bg-[var(--surface-2)] border-white/5 hover:border-white/10'
                            }`}
                          >
                            {/* Set Number */}
                            <div className="text-xs font-bold text-center text-[var(--text-tertiary)] data-number">{setIndex + 1}</div>
                            
                            {/* Weight input */}
                            <Input
                              type="number"
                              placeholder="0"
                              value={set.weight}
                              onChange={(e) => updateSet(blockIndex, setIndex, 'weight', e.target.value)}
                              className="h-10 text-center text-sm bg-[var(--surface-3)] border-white/5 focus-visible:ring-[var(--accent)] rounded-lg text-white font-bold data-number"
                              inputMode="decimal"
                            />
                            
                            {/* Reps input */}
                            <Input
                              type="number"
                              placeholder="0"
                              value={set.reps}
                              onChange={(e) => updateSet(blockIndex, setIndex, 'reps', e.target.value)}
                              className="h-10 text-center text-sm bg-[var(--surface-3)] border-white/5 focus-visible:ring-[var(--accent)] rounded-lg text-white font-bold data-number"
                              inputMode="numeric"
                            />
                            
                            {/* RPE input */}
                            <Input
                              type="number"
                              placeholder="-"
                              value={set.rpe}
                              onChange={(e) => updateSet(blockIndex, setIndex, 'rpe', e.target.value)}
                              className="h-10 text-center text-sm bg-[var(--surface-3)] border-white/5 focus-visible:ring-[var(--accent)] rounded-lg text-white font-bold data-number"
                              min="1" max="10" step="0.5"
                              inputMode="decimal"
                            />
                            
                            {/* Complete trigger button */}
                            <div className="flex items-center justify-center">
                              <Button
                                size="sm"
                                variant={set.completed ? 'default' : 'outline'}
                                onClick={() => toggleSetComplete(blockIndex, setIndex)}
                                className={`w-9 h-9 p-0 rounded-lg shrink-0 transition-transform active:scale-90 ${
                                  set.completed 
                                    ? 'bg-emerald-500 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/20' 
                                    : 'bg-[var(--surface-3)] border-white/5 text-[var(--text-disabled)]'
                                }`}
                              >
                                <Check weight="bold" className="h-4.5 w-4.5" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => addSet(blockIndex)} 
                      className="w-full mt-3.5 h-10 border border-dashed border-white/5 text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] hover:bg-white/5 hover:text-white rounded-xl active:scale-[0.98] transition-transform"
                    >
                      <Plus weight="bold" className="h-3.5 w-3.5 mr-1" />
                      添加一组
                    </Button>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      {/* Templates Button */}
      {templates.length > 0 && exerciseBlocks.length === 0 && (
        <Button 
          variant="outline" 
          className="w-full h-14 border border-white/5 bg-[var(--surface-1)] rounded-2xl text-white font-bold hover:bg-[var(--surface-2)] active:scale-98 transition-transform"
          onClick={() => setShowTemplates(true)}
        >
          <CalendarBlank className="h-5.5 w-5.5 mr-2 text-[var(--accent)]" />
          从模板加载
        </Button>
      )}

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="bg-[var(--surface-1)] border border-white/10 rounded-2xl w-[92vw] max-w-sm p-4 text-white">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-black tracking-tight text-white">已保存的训练模板</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {templates.map(template => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-[var(--surface-3)] bg-[var(--surface-2)] border border-white/5 rounded-xl transition-all active:scale-[0.98]"
                onClick={() => loadTemplate(template)}
              >
                <CardContent className="p-3.5">
                  <div className="font-bold text-white text-sm">{template.name}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-1 font-semibold leading-relaxed">
                    {template.description || '自定义健身模板'}
                  </div>
                  <div className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider mt-3">
                    {template.exercises?.length || 0} 个动作项目
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Exercise */}
      <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
        <DialogTrigger>
          <Button variant="outline" className="w-full h-14 border-2 border-dashed border-white/5 bg-transparent text-[var(--text-secondary)] font-bold hover:bg-[var(--surface-1)] rounded-2xl active:scale-98 transition-all">
            <Plus weight="bold" className="h-5.5 w-5.5 mr-2 text-[var(--accent)]" />
            添加训练动作
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[var(--surface-1)] border border-white/10 rounded-2xl w-[92vw] max-w-sm p-4 text-white">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-black tracking-tight text-white">选择动作</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {exercises.map(exercise => (
              <Card
                key={exercise.id}
                className="cursor-pointer hover:bg-[var(--surface-3)] bg-[var(--surface-2)] border border-white/5 rounded-xl transition-all active:scale-[0.98]"
                onClick={() => addExercise(exercise)}
              >
                <CardContent className="p-3.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{exercise.name}</div>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-tertiary)] mt-0.5">{exercise.muscle_group}</div>
                  </div>
                  <div className="h-7 w-7 rounded-lg bg-[var(--surface-3)] border border-white/5 flex items-center justify-center">
                    <Plus className="h-4.5 w-4.5 text-[var(--accent)]" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Finish */}
      {exerciseBlocks.length > 0 && (
        <Button 
          className="w-full h-14 text-sm font-bold tracking-wider uppercase rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/90 hover:from-[var(--accent-hover)] text-white shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 active:scale-98 transition-transform mt-6 border border-white/10"
          onClick={finishWorkout}
          disabled={saving}
        >
          <FloppyDisk weight="fill" className="h-5 w-5 mr-2" />
          {saving ? '正在保存...' : '结束并保存训练'}
        </Button>
      )}

      {/* Discard Confirmation Dialog */}
      <Dialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <DialogContent className="bg-[var(--surface-1)] border border-white/10 rounded-2xl w-[92vw] max-w-sm p-5 text-white">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-black tracking-tight text-white">放弃本次训练？</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed mb-4">
            您确定要放弃本次训练吗？所有已记录的动作和动作组都将被永久删除，此操作无法撤销。
          </p>
          <div className="flex gap-2.5">
            <Button 
              variant="outline" 
              className="flex-1 h-11 bg-[var(--surface-3)] border-white/5 text-white font-bold rounded-xl"
              onClick={() => setShowDiscardConfirm(false)}
            >
              取消
            </Button>
            <Button 
              className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl"
              onClick={handleDiscardWorkout}
              disabled={saving}
            >
              {saving ? '正在放弃...' : '确定放弃'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Bottom Floating Rest Bar */}
      <AnimatePresence>
        {timeLeft > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-[76px] left-0 right-0 max-w-md mx-auto px-4 z-50 pointer-events-none"
          >
            <div className="w-full bg-[var(--surface-1)]/95 backdrop-blur-md border border-[var(--accent)]/30 rounded-2xl shadow-2xl p-3.5 flex items-center justify-between pointer-events-auto shadow-blue-500/10">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[var(--accent-muted)] flex items-center justify-center animate-pulse">
                  <Timer weight="fill" className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-[12px] font-black text-white leading-none">组间休息中...</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-1 font-semibold">调整呼吸，准备下一组</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-[var(--accent)] data-number tracking-tighter">
                  {formatTime(timeLeft)}
                </span>
                <div className="flex gap-1.5">
                  {/* +30s Button */}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-9 px-2.5 rounded-lg border-white/5 hover:bg-white/5 text-[11px] font-bold text-white data-number active:scale-90" 
                    onClick={() => setTimeLeft(prev => prev + 30)}
                  >
                    +30秒
                  </Button>
                  {/* Skip Button */}
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-9 px-2.5 rounded-lg bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 text-[11px] font-bold active:scale-90" 
                    onClick={() => { setTimeLeft(0); setIsTimerRunning(false) }}
                  >
                    跳过
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
