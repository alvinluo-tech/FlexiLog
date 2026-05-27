'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Play, Plus, Trash, X,
  Timer, Check, Barbell, FloppyDisk, CalendarBlank, Lightning,
  MagnifyingGlass
} from '@phosphor-icons/react'
import { createWorkoutSession, endWorkoutSession, addWorkoutSet, discardWorkoutSession, updateWorkoutSet, deleteWorkoutSet } from '@/app/actions/workout'
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
  completed: boolean
  saved: boolean
}

interface ExerciseBlock {
  exercise: Exercise
  sets: WorkoutSet[]
  previousData?: { weight: string; reps: string }[]
  restSeconds: number
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
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlock[]>(() => {
    // Migrate initial blocks to include restSeconds
    return initialExerciseBlocks.map((b: any) => ({ ...b, restSeconds: b.restSeconds ?? 90 }))
  })
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [exerciseSearch, setExerciseSearch] = useState('')
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(initialSessionStartTime)
  const [elapsedTime, setElapsedTime] = useState(
    initialSessionStartTime ? Math.floor((Date.now() - initialSessionStartTime) / 1000) : 0
  )
  const [saving, setSaving] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)
  const [aiPlan, setAiPlan] = useState<any | null>(null)
  
  // Workout phase: idle -> preparing -> active -> completed
  const [workoutPhase, setWorkoutPhase] = useState<'idle' | 'preparing' | 'active' | 'completed'>(() => {
    // Restore phase from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('workout_phase')
      if (saved === 'active' || saved === 'preparing') return saved
    }
    return initialSessionId ? 'active' : 'idle'
  })

  // Rest timer state
  const [restTimeLeft, setRestTimeLeft] = useState(0)
  const [isRestRunning, setIsRestRunning] = useState(false)

  const mountedRef = useRef(true)
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null)
  const restTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Load AI plan and restore workout state from localStorage
  useEffect(() => {
    // Load AI plan
    const savedPlan = localStorage.getItem('ai_plan')
    if (savedPlan) {
      try { setAiPlan(JSON.parse(savedPlan)) } catch {}
    }
    
    // Restore exercise blocks if returning to page
    const savedBlocks = localStorage.getItem('workout_exercises')
    if (savedBlocks && exerciseBlocks.length === 0) {
      try {
        const blocks = JSON.parse(savedBlocks)
        if (blocks.length > 0) {
          setExerciseBlocks(blocks.map((b: any) => ({ ...b, restSeconds: b.restSeconds ?? 90 })))
        }
      } catch {}
    }
  }, [])

  // Persist exercise blocks to localStorage whenever they change
  useEffect(() => {
    if (exerciseBlocks.length > 0) {
      localStorage.setItem('workout_exercises', JSON.stringify(exerciseBlocks))
    } else {
      localStorage.removeItem('workout_exercises')
    }
  }, [exerciseBlocks])

  // Persist workout phase
  useEffect(() => {
    localStorage.setItem('workout_phase', workoutPhase)
  }, [workoutPhase])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
      if (restTimerRef.current) clearInterval(restTimerRef.current)
    }
  }, [])

  // Session elapsed timer
  useEffect(() => {
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
    if (!sessionStartTime) return
    
    sessionTimerRef.current = setInterval(() => {
      if (mountedRef.current) {
        setElapsedTime(prev => prev + 1)
      }
    }, 1000)
    
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current)
    }
  }, [sessionStartTime])

  // Rest countdown timer
  useEffect(() => {
    if (restTimerRef.current) clearInterval(restTimerRef.current)
    if (!isRestRunning || restTimeLeft <= 0) return
    
    restTimerRef.current = setInterval(() => {
      if (!mountedRef.current) return
      setRestTimeLeft(prev => {
        if (prev <= 1) {
          setIsRestRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current)
    }
  }, [isRestRunning, restTimeLeft])

  // ── Formatters ──
  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }, [])

  const formatSessionTime = useCallback((totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`
  }, [])

  // ── Session Actions ──
  const handleStartEmptyWorkout = async () => {
    setExerciseBlocks([])
    setWorkoutPhase('preparing')
  }

  const handleStartTemplateWorkout = async (template: any) => {
    setSaving(true)
    try {
        const plan = template.exercises
        if (plan?.length > 0) {
          const today = new Date().getDay()
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          const todayPlan = plan.find((d: any) => d.day?.toLowerCase().includes(dayNames[today].toLowerCase())) || plan[0]
          
          if (todayPlan?.exercises) {
            const newBlocks: ExerciseBlock[] = todayPlan.exercises.map((ex: any) => {
              const matched = exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase())
              return {
                exercise: matched 
                  ? { id: matched.id, name: matched.name, muscle_group: matched.muscle_group }
                  : { id: 'template-' + ex.name, name: ex.name, muscle_group: todayPlan.focus || 'general' },
                sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
                  id: 'set-' + Date.now() + '-' + i,
                  weight: '', reps: ex.reps || '', completed: false, saved: false
                })),
                previousData: matched ? (previousData[matched.id] || []) : [],
                restSeconds: 90
              }
            })
            setExerciseBlocks(newBlocks)
            setWorkoutPhase('preparing')
          }
        }
    } catch (e) {
      console.error('Failed to load template:', e)
    } finally {
      setSaving(false)
    }
  }

  const handleStartAiWorkout = async () => {
    if (!aiPlan) return
    setSaving(true)
    try {
      const result = await createWorkoutSession()
      if (result.data) {
        setSessionId(result.data.id)
        setSessionStartTime(Date.now())
        setElapsedTime(0)
        
        if (aiPlan.days?.length > 0) {
          const today = new Date().getDay()
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          const todayPlan = aiPlan.days.find((d: any) => d.day?.toLowerCase().includes(dayNames[today].toLowerCase())) || aiPlan.days[0]
          
          if (todayPlan?.exercises) {
            const newBlocks: ExerciseBlock[] = todayPlan.exercises.map((ex: any) => {
              const matched = exercises.find(e => e.name.toLowerCase() === ex.name.toLowerCase())
              return {
                exercise: matched
                  ? { id: matched.id, name: matched.name, muscle_group: matched.muscle_group }
                  : { id: 'ai-' + ex.name, name: ex.name, muscle_group: todayPlan.focus || 'general' },
                sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
                  id: 'set-' + Date.now() + '-' + i,
                  weight: '', reps: '', completed: false, saved: false
                })),
                previousData: matched ? (previousData[matched.id] || []) : [],
                restSeconds: 90
              }
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

  // Start the actual workout (create session and start timer)
  const handleStartWorkout = async () => {
    if (exerciseBlocks.length === 0) return
    
    setSaving(true)
    const result = await createWorkoutSession()
    if (result.data) {
      setSessionId(result.data.id)
      setSessionStartTime(Date.now())
      setElapsedTime(0)
      setWorkoutPhase('active')
    }
    setSaving(false)
  }

  const handleDiscardWorkout = async () => {
    setSaving(true)
    try {
      // If there's a session, delete it from database
      if (sessionId) {
        const result = await discardWorkoutSession(sessionId)
        if (!result.success) {
          console.error('Failed to delete session:', result.error)
        }
      }
    } catch (e) {
      console.error('Failed to delete session:', e)
    }
    
    // Always reset state regardless of API result
    if (sessionTimerRef.current) { clearInterval(sessionTimerRef.current); sessionTimerRef.current = null }
    if (restTimerRef.current) { clearInterval(restTimerRef.current); restTimerRef.current = null }
    
    setSessionId(null)
    setSessionStartTime(null)
    setElapsedTime(0)
    setExerciseBlocks([])
    setIsRestRunning(false)
    setRestTimeLeft(0)
    setWorkoutPhase('idle')
    
    localStorage.removeItem('active_workout_session')
    localStorage.removeItem('ai_plan')
    localStorage.removeItem('workout_exercises')
    localStorage.removeItem('workout_phase')
    
    setSaving(false)
    setShowDiscardConfirm(false)
  }

  const finishWorkout = useCallback(async () => {
    if (!sessionId) return
    setSaving(true)
    await endWorkoutSession(sessionId)
    router.push('/dashboard')
  }, [sessionId, router])

  // ── Exercise & Set Management ──
  const getSetPlaceholder = useCallback((block: ExerciseBlock, setIndex: number) => {
    const prevWeight = block.previousData?.[setIndex]?.weight || (setIndex > 0 ? block.sets[setIndex-1]?.weight : '') || ''
    const prevReps = block.previousData?.[setIndex]?.reps || (setIndex > 0 ? block.sets[setIndex-1]?.reps : '') || ''
    return {
      weight: prevWeight || '0',
      reps: prevReps || '0'
    }
  }, [])

  const addExercise = useCallback((exercise: Exercise) => {
    const prev = previousData[exercise.id]
    const newBlock: ExerciseBlock = {
      exercise,
      sets: [{ id: `set-${Date.now()}`, weight: '', reps: '', completed: false, saved: false }],
      previousData: prev || [],
      restSeconds: 90,
    }
    setExerciseBlocks(prev => [...prev, newBlock])
    setShowExercisePicker(false)
    setExerciseSearch('')
  }, [previousData])

  const addSet = useCallback((blockIndex: number) => {
    setExerciseBlocks(prev => {
      const updated = [...prev]
      const block = { ...updated[blockIndex] }
      block.sets = [...block.sets, {
        id: `set-${Date.now()}`, weight: '', reps: '', completed: false, saved: false,
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

  const handleSetInputBlur = useCallback(async (blockIndex: number, setIndex: number) => {
    const block = exerciseBlocks[blockIndex]
    const set = block.sets[setIndex]
    
    if (set.completed && set.saved && set.id && !set.id.startsWith('set-')) {
      const weight = parseFloat(set.weight) || 0
      const reps = parseInt(set.reps) || 0
      
      await updateWorkoutSet(set.id, {
        weight_kg: weight,
        reps,
      })
    }
  }, [exerciseBlocks])

  const toggleSetComplete = useCallback(async (blockIndex: number, setIndex: number) => {
    const block = exerciseBlocks[blockIndex]
    const set = block.sets[setIndex]
    const newCompleted = !set.completed

    if (newCompleted) {
      // Auto-fill values if empty, using placeholders
      let weightStr = set.weight
      let repsStr = set.reps
      
      if (!weightStr || !repsStr) {
        const placeholders = getSetPlaceholder(block, setIndex)
        if (!weightStr) weightStr = placeholders.weight !== '0' ? placeholders.weight : ''
        if (!repsStr) repsStr = placeholders.reps !== '0' ? placeholders.reps : ''
        
        // Update state with auto-filled values
        updateSet(blockIndex, setIndex, 'weight', weightStr)
        updateSet(blockIndex, setIndex, 'reps', repsStr)
      }

      const weight = parseFloat(weightStr) || 0
      const reps = parseInt(repsStr) || 0

      if (weight > 0 && reps > 0) {
        if (sessionId) {
          if (!set.saved || set.id.startsWith('set-')) {
            // Save new set to database
            const result = await addWorkoutSet(sessionId, block.exercise.id, {
              set_number: setIndex + 1,
              weight_kg: weight,
              reps,
            })
            
            if (result.data) {
              // Update set ID to database UUID and set saved to true
              setExerciseBlocks(prev => {
                const updated = [...prev]
                const b = { ...updated[blockIndex] }
                const s = [...b.sets]
                s[setIndex] = { 
                  ...s[setIndex], 
                  id: result.data.id, 
                  completed: true, 
                  saved: true,
                  weight: weightStr,
                  reps: repsStr
                }
                b.sets = s
                updated[blockIndex] = b
                return updated
              })
            }
          } else {
            // If already saved, just update completed state in database
            await updateWorkoutSet(set.id, { completed: true })
            updateSet(blockIndex, setIndex, 'completed', true)
          }
        } else {
          // No active session (should not happen), just update UI
          updateSet(blockIndex, setIndex, 'completed', true)
        }
        
        // Auto-trigger rest timer
        setRestTimeLeft(block.restSeconds)
        setIsRestRunning(true)
      } else {
        alert('请先输入重量和次数')
        return
      }
      
    } else {
      // Toggled to INCOMPLETE
      if (sessionId && set.saved && set.id && !set.id.startsWith('set-')) {
        await updateWorkoutSet(set.id, { completed: false })
      }
      updateSet(blockIndex, setIndex, 'completed', false)
    }
  }, [exerciseBlocks, sessionId, updateSet, getSetPlaceholder])

  const removeExercise = useCallback((blockIndex: number) => {
    setExerciseBlocks(prev => prev.filter((_, i) => i !== blockIndex))
  }, [])

  const removeSet = useCallback(async (blockIndex: number, setIndex: number) => {
    const block = exerciseBlocks[blockIndex]
    const set = block.sets[setIndex]
    
    if (sessionId && set.saved && set.id && !set.id.startsWith('set-')) {
      await deleteWorkoutSet(set.id)
    }

    setExerciseBlocks(prev => {
      const updated = [...prev]
      const b = { ...updated[blockIndex] }
      b.sets = b.sets.filter((_, i) => i !== setIndex)
      updated[blockIndex] = b
      return updated
    })
  }, [exerciseBlocks, sessionId])

  const { completedSets, totalSets } = useMemo(() => {
    let completed = 0, total = 0
    exerciseBlocks.forEach(block => {
      block.sets.forEach(s => {
        total++
        if (s.completed) completed++
      })
    })
    return { completedSets: completed, totalSets: total }
  }, [exerciseBlocks])

  // Filtered exercises for picker
  const filteredExercises = useMemo(() => {
    if (!exerciseSearch.trim()) return exercises
    const q = exerciseSearch.toLowerCase()
    return exercises.filter(e => 
      e.name.toLowerCase().includes(q) || e.muscle_group.toLowerCase().includes(q)
    )
  }, [exercises, exerciseSearch])

  // Group exercises by muscle group for picker
  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {}
    filteredExercises.forEach(ex => {
      if (!groups[ex.muscle_group]) groups[ex.muscle_group] = []
      groups[ex.muscle_group].push(ex)
    })
    return groups
  }, [filteredExercises])

  // ════════════════════════════════════════
  //  LOBBY SCREEN (idle - no exercises loaded)
  // ════════════════════════════════════════
  if (workoutPhase === 'idle') {
    return (
      <div className="max-w-md mx-auto p-4 pb-32 space-y-5 w-full min-h-[100dvh]">
        {/* Header */}
        <div className="pt-8 pb-2">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-11 w-11 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center">
              <Barbell weight="fill" className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">开始训练</h1>
              <p className="text-xs text-[var(--text-tertiary)] font-medium">选择方式开始今天的训练</p>
            </div>
          </div>
        </div>

        {/* Start Empty Workout */}
        <button
          onClick={handleStartEmptyWorkout}
          disabled={saving}
          className="w-full gradient-accent rounded-2xl p-5 text-left relative overflow-hidden group active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-lg font-bold">空白训练</p>
              <p className="text-white/70 text-xs font-medium mt-0.5">自由添加动作，开始记录</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
              {saving ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play weight="fill" className="h-5 w-5 text-white ml-0.5" />
              )}
            </div>
          </div>
        </button>

        {/* AI Plan */}
        {aiPlan && (
          <button
            onClick={handleStartAiWorkout}
            disabled={saving}
            className="w-full border border-purple-500/25 rounded-2xl p-4 bg-purple-500/5 text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-purple-500/15 flex items-center justify-center">
                  <Lightning weight="fill" className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-purple-300">AI 计划就绪</p>
                  <p className="text-white font-bold text-[15px]">{aiPlan.name || 'AI 健身计划'}</p>
                </div>
              </div>
              <Play weight="fill" className="h-4 w-4 text-purple-400" />
            </div>
          </button>
        )}

        {/* Templates */}
        {templates.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 px-1">
              <CalendarBlank weight="bold" className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">训练模板</h2>
            </div>
            <div className="space-y-2">
              {templates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleStartTemplateWorkout(template)}
                  disabled={saving}
                  className="w-full bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl p-3.5 flex items-center justify-between text-left hover:border-[var(--border-hover)] active:scale-[0.98] transition-all"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="font-bold text-white text-sm truncate">{template.name}</p>
                    <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">{template.description || '自定义模板'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[var(--text-tertiary)]">
                      {template.exercises?.length || 0} 项
                    </span>
                    <Play weight="fill" className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {templates.length === 0 && (
          <div className="border border-dashed border-[var(--border-default)] rounded-xl p-6 text-center">
            <p className="text-sm text-[var(--text-tertiary)] font-medium">暂无训练模板</p>
            <p className="text-[11px] text-[var(--text-disabled)] mt-1">在 AI 教练中生成计划，或手动创建模板</p>
          </div>
        )}
      </div>
    )
  }

  // ════════════════════════════════════════
  //  PREPARING SCREEN (exercises loaded, waiting to start)
  // ════════════════════════════════════════
  if (workoutPhase === 'preparing') {
    return (
      <div className="max-w-md mx-auto p-4 pb-32 space-y-4 w-full min-h-[100dvh]">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">准备训练</h1>
            <p className="text-xs text-[var(--text-tertiary)]">{exerciseBlocks.length} 个动作已添加</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setWorkoutPhase('idle')
              setExerciseBlocks([])
              localStorage.removeItem('workout_exercises')
              localStorage.removeItem('workout_phase')
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Exercise List */}
        <div className="space-y-3">
          {exerciseBlocks.map((block, blockIndex) => (
            <div key={blockIndex} className="bg-[var(--surface-2)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[var(--surface-3)] flex items-center justify-center">
                    <Barbell className="h-4 w-4 text-[var(--text-tertiary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{block.exercise.name}</p>
                    <p className="text-xs text-[var(--text-disabled)]">{block.exercise.muscle_group}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setExerciseBlocks(prev => prev.filter((_, i) => i !== blockIndex))
                  }}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-3)] text-[var(--text-disabled)]"
                >
                  <Trash className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-[var(--text-tertiary)]">
                {block.sets.length} 组 x {block.sets[0]?.reps || '-'} 次
              </div>
            </div>
          ))}
        </div>

        {/* Add More Exercises */}
        <button
          onClick={() => setShowExercisePicker(true)}
          className="w-full h-14 rounded-xl border border-dashed border-[var(--border-default)] flex items-center justify-center gap-2 text-sm text-[var(--text-tertiary)]"
        >
          <Plus className="h-5 w-5" />
          添加动作
        </button>

        {/* Start Button */}
        <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-80">
          <Button 
            className="w-full h-14 text-lg font-bold rounded-xl gradient-accent"
            onClick={handleStartWorkout}
            disabled={saving || exerciseBlocks.length === 0}
          >
            {saving ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <Play weight="fill" className="h-5 w-5 mr-2" />
            )}
            开始训练
          </Button>
        </div>

        {/* Exercise Picker Dialog */}
        <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
          <DialogContent className="bg-[var(--surface-2)] border-[var(--border-default)] rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle>选择动作</DialogTitle>
            </DialogHeader>
            <div className="relative mb-3">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-disabled)]" />
              <Input
                placeholder="搜索动作..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="pl-10 bg-[var(--surface-1)] border-[var(--border-default)]"
              />
            </div>
            <div className="space-y-1 max-h-[50vh] overflow-y-auto">
              {filteredExercises.map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => {
                    addExercise(exercise)
                    setShowExercisePicker(false)
                    setExerciseSearch('')
                  }}
                  className="w-full p-3 rounded-lg text-left hover:bg-[var(--surface-3)] transition-colors"
                >
                  <p className="text-sm font-medium">{exercise.name}</p>
                  <p className="text-xs text-[var(--text-disabled)]">{exercise.muscle_group}</p>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }



  // ════════════════════════════════════════
  //  ACTIVE WORKOUT SCREEN
  // ════════════════════════════════════════
  return (
    <div className="max-w-md mx-auto w-full min-h-[100dvh] pb-32">
      
      {/* ── Sticky Header Bar (Strong/Hevy style) ── */}
      <div className="sticky top-0 z-40 bg-[var(--surface-0)]/95 backdrop-blur-md border-b border-[var(--border-default)]">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Discard */}
          <button 
            onClick={() => setShowDiscardConfirm(true)}
            className="text-[var(--danger)] text-sm font-semibold active:opacity-60 transition-opacity"
          >
            放弃
          </button>
          
          {/* Center: Timer + Progress */}
          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-sm data-number tabular-nums">
              {formatSessionTime(elapsedTime)}
            </span>
            <span className="text-[var(--text-disabled)]">·</span>
            <span className="text-[var(--text-secondary)] text-sm font-medium data-number">
              {completedSets}/{totalSets} 组
            </span>
          </div>
          
          {/* Right: Finish */}
          <button 
            onClick={finishWorkout}
            disabled={saving || completedSets === 0}
            className="text-[var(--accent)] text-sm font-bold disabled:opacity-30 active:opacity-60 transition-opacity"
          >
            完成
          </button>
        </div>
      </div>

      {/* ── Exercise Blocks ── */}
      <div className="px-4 pt-3 space-y-3">
        {exerciseBlocks.map((block, blockIndex) => (
          <div 
            key={blockIndex} 
            className="bg-[var(--surface-1)] border border-[var(--border-default)] rounded-xl overflow-hidden"
          >
            {/* Exercise Header */}
            <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-[var(--accent)] truncate">{block.exercise.name}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-disabled)] mt-0.5">
                  {block.exercise.muscle_group}
                </p>
              </div>
              <button 
                onClick={() => removeExercise(blockIndex)} 
                className="h-8 w-8 flex items-center justify-center text-[var(--text-disabled)] hover:text-[var(--danger)] rounded-lg active:scale-90 transition-all"
              >
                <Trash className="h-4 w-4" />
              </button>
            </div>
            
            {/* Set Table */}
            <div className="px-3.5 pb-3.5">
              {/* Table Header */}
              <div className="grid grid-cols-[24px_1.1fr_1fr_1fr_32px_32px] gap-1.5 text-[10px] font-bold uppercase text-[var(--text-disabled)] tracking-wider mb-1.5 px-0.5">
                <div className="text-center">组</div>
                <div>上次</div>
                <div>公斤</div>
                <div>次数</div>
                <div className="text-center"></div>
                <div className="text-center"></div>
              </div>
              
              {/* Set Rows */}
              <div className="space-y-1.5">
                {block.sets.map((set, setIndex) => {
                  const placeholders = getSetPlaceholder(block, setIndex);
                  return (
                    <div
                      key={set.id}
                      className={`grid grid-cols-[24px_1.1fr_1fr_1fr_32px_32px] gap-1.5 items-center rounded-lg px-0.5 py-0.5 transition-colors ${
                        set.completed 
                          ? 'bg-[var(--success)]/8' 
                          : ''
                      }`}
                    >
                      {/* Set Number */}
                      <div className="text-xs font-bold text-center text-[var(--text-disabled)] data-number">
                        {setIndex + 1}
                      </div>
                      
                      {/* Previous */}
                      <div className="text-xs text-[var(--text-disabled)] font-medium data-number truncate">
                        {block.previousData?.[setIndex] 
                          ? `${block.previousData[setIndex].weight}×${block.previousData[setIndex].reps}`
                          : '—'
                        }
                      </div>
                      
                      {/* Weight Input */}
                      <Input
                        type="number"
                        placeholder={placeholders.weight !== '0' ? placeholders.weight : '0'}
                        value={set.weight}
                        onChange={(e) => updateSet(blockIndex, setIndex, 'weight', e.target.value)}
                        onBlur={() => handleSetInputBlur(blockIndex, setIndex)}
                        className="h-9 text-center text-sm bg-[var(--surface-2)] border-transparent focus-visible:border-[var(--accent)] focus-visible:ring-0 rounded-lg text-white font-bold data-number"
                        inputMode="decimal"
                      />
                      
                      {/* Reps Input */}
                      <Input
                        type="number"
                        placeholder={placeholders.reps !== '0' ? placeholders.reps : '0'}
                        value={set.reps}
                        onChange={(e) => updateSet(blockIndex, setIndex, 'reps', e.target.value)}
                        onBlur={() => handleSetInputBlur(blockIndex, setIndex)}
                        className="h-9 text-center text-sm bg-[var(--surface-2)] border-transparent focus-visible:border-[var(--accent)] focus-visible:ring-0 rounded-lg text-white font-bold data-number"
                        inputMode="numeric"
                      />
                      
                      {/* Delete Button */}
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => removeSet(blockIndex, setIndex)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-disabled)] hover:text-[var(--danger)] hover:bg-red-500/10 active:scale-90 transition-all"
                          title="删除此组"
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      
                      {/* Complete Button */}
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => toggleSetComplete(blockIndex, setIndex)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                            set.completed 
                              ? 'bg-[var(--success)] text-white' 
                              : 'bg-[var(--surface-3)] text-[var(--text-disabled)] border border-[var(--border-default)]'
                          }`}
                        >
                          <Check weight="bold" className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Add Set */}
              <button 
                onClick={() => addSet(blockIndex)} 
                className="w-full mt-2.5 h-9 border border-dashed border-[var(--border-default)] text-[11px] font-semibold text-[var(--text-tertiary)] hover:text-white hover:border-[var(--border-hover)] rounded-lg active:scale-[0.98] transition-all flex items-center justify-center gap-1"
              >
                <Plus weight="bold" className="h-3 w-3" />
                添加一组
              </button>
            </div>
          </div>
        ))}

        {/* Add Exercise Button */}
        <button
          onClick={() => setShowExercisePicker(true)}
          className="w-full h-12 border border-dashed border-[var(--border-default)] bg-transparent text-[var(--text-secondary)] font-semibold text-sm hover:border-[var(--border-hover)] hover:text-white rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Plus weight="bold" className="h-4.5 w-4.5 text-[var(--accent)]" />
          添加训练动作
        </button>
      </div>

      {/* ── Exercise Picker Dialog (with search) ── */}
      <Dialog open={showExercisePicker} onOpenChange={(open) => {
        setShowExercisePicker(open)
        if (!open) setExerciseSearch('')
      }}>
        <DialogContent className="bg-[var(--surface-1)] border border-white/10 rounded-2xl w-[92vw] max-w-sm p-0 text-white max-h-[70vh] flex flex-col overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-lg font-bold text-white">选择动作</DialogTitle>
          </DialogHeader>
          
          {/* Search */}
          <div className="px-4 py-2.5">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-disabled)]" />
              <Input
                placeholder="搜索动作名称或肌群..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="pl-9 h-10 bg-[var(--surface-2)] border-transparent focus-visible:border-[var(--accent)] focus-visible:ring-0 rounded-lg text-sm text-white placeholder:text-[var(--text-disabled)]"
                autoFocus
              />
            </div>
          </div>
          
          {/* Exercise List (grouped by muscle) */}
          <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-3">
            {Object.entries(groupedExercises).map(([group, exs]) => (
              <div key={group}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-disabled)] mb-1.5 px-0.5">
                  {group}
                </p>
                <div className="space-y-1">
                  {exs.map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => addExercise(exercise)}
                      className="w-full text-left px-3 py-2.5 rounded-lg bg-[var(--surface-2)] hover:bg-[var(--surface-3)] active:scale-[0.98] transition-all flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-white">{exercise.name}</span>
                      <Plus className="h-4 w-4 text-[var(--accent)]" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredExercises.length === 0 && (
              <p className="text-center text-[var(--text-disabled)] text-sm py-8">未找到匹配的动作</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Discard Confirmation ── */}
      <Dialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <DialogContent className="bg-[var(--surface-1)] border border-white/10 rounded-2xl w-[92vw] max-w-sm p-5 text-white">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-bold text-white">放弃本次训练？</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed mb-4">
            所有已记录的数据将被永久删除，此操作无法撤销。
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

      {/* ── Floating Rest Timer Bar ── */}
      <AnimatePresence>
        {restTimeLeft > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-[76px] left-0 right-0 max-w-md mx-auto px-4 z-50 pointer-events-none"
          >
            <div className="w-full bg-[var(--surface-1)]/95 backdrop-blur-md border border-[var(--accent)]/20 rounded-2xl shadow-2xl p-3.5 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-[var(--accent-muted)] flex items-center justify-center">
                  <Timer weight="fill" className="h-5 w-5 text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-white leading-none">组间休息</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5 font-medium">准备下一组</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl font-black text-[var(--accent)] data-number tracking-tighter">
                  {formatTime(restTimeLeft)}
                </span>
                <div className="flex gap-1.5">
                  <button 
                    className="h-8 px-2 rounded-md border border-[var(--border-default)] text-[11px] font-bold text-white data-number active:scale-90 transition-transform hover:bg-white/5" 
                    onClick={() => setRestTimeLeft(prev => prev + 30)}
                  >
                    +30s
                  </button>
                  <button 
                    className="h-8 px-2 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold active:scale-90 transition-transform hover:bg-red-500/20" 
                    onClick={() => { setRestTimeLeft(0); setIsRestRunning(false) }}
                  >
                    跳过
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
