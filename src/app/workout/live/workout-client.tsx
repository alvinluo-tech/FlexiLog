'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Play, Pause, ArrowCounterClockwise, Plus, Trash, 
  Timer, CaretDown, CaretUp, Check, Barbell, FloppyDisk, CalendarBlank
} from '@phosphor-icons/react'
import { createWorkoutSession, endWorkoutSession, addWorkoutSet } from '@/app/actions/workout'
import { useRouter } from 'next/navigation'

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
}

export default function WorkoutLiveClient({ exercises, previousData, userId, templates = [] }: WorkoutLiveClientProps) {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlock[]>([])
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [restTime] = useState(90)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [sessionStartTime] = useState(Date.now())
  const [elapsedTime, setElapsedTime] = useState(0)
  const [saving, setSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  // Start session on mount and load AI plan if exists
  useEffect(() => {
    async function startSession() {
      const result = await createWorkoutSession()
      if (result.data) {
        setSessionId(result.data.id)
      }
    }
    startSession()
    
    // Check for AI plan in localStorage
    const savedPlan = localStorage.getItem('ai_plan')
    if (savedPlan) {
      try {
        const plan = JSON.parse(savedPlan)
        if (plan.days && plan.days.length > 0) {
          // Get today's workout (use first day or match by day of week)
          const today = new Date().getDay()
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          const todayName = dayNames[today]
          
          // Find matching day or use first day
          const todayPlan = plan.days.find((d: any) => 
            d.day?.toLowerCase().includes(todayName.toLowerCase())
          ) || plan.days[0]
          
          if (todayPlan?.exercises) {
            const newBlocks: ExerciseBlock[] = todayPlan.exercises.map((ex: any) => ({
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
            }))
            setExerciseBlocks(newBlocks)
          }
        }
        // Clear the plan from localStorage after loading
        localStorage.removeItem('ai_plan')
      } catch (e) {
        console.error('Failed to load AI plan:', e)
      }
    }
  }, [])

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTime) / 1000))
    }, 1000)
    return () => clearInterval(timer)
  }, [sessionStartTime])

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

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">训练中</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            <span className="data-number">{formatTime(elapsedTime)}</span> | <span className="data-number">{completedSets}/{totalSets}</span>组
          </p>
        </div>
        <Badge variant={isTimerRunning ? 'default' : 'secondary'} className="text-sm px-3 py-1 gap-1.5 data-number bg-[var(--surface-3)] border-[var(--border-default)]">
          <Timer className="h-3.5 w-3.5" />
          {formatTime(timeLeft)}
        </Badge>
      </div>

      {/* Rest Timer */}
      {timeLeft > 0 && (
        <Card className="bg-[var(--accent-subtle)] border-[var(--accent)]/20 rounded-[var(--radius-lg)]">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-[var(--accent)]" />
              <span className="font-medium text-[var(--text-secondary)]">组间休息</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-[var(--accent)] data-number">{formatTime(timeLeft)}</span>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsTimerRunning(!isTimerRunning)}>
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => { setTimeLeft(0); setIsTimerRunning(false) }}>
                <ArrowCounterClockwise className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Blocks */}
      {exerciseBlocks.map((block, blockIndex) => (
        <Card key={blockIndex} className="card-surface border rounded-[var(--radius-lg)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleCollapse(blockIndex)}>
                {block.collapsed ? <CaretDown className="h-4 w-4 text-[var(--text-tertiary)]" /> : <CaretUp className="h-4 w-4 text-[var(--text-tertiary)]" />}
                <CardTitle className="text-base font-medium">{block.exercise.name}</CardTitle>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-[var(--surface-3)] border-[var(--border-default)]">
                  {block.exercise.muscle_group}
                </Badge>
              </div>
              <Button size="sm" variant="ghost" onClick={() => removeExercise(blockIndex)} className="h-8 w-8 p-0 text-[var(--danger)]">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          {!block.collapsed && (
            <CardContent className="pt-0">
              {block.previousData && block.previousData.length > 0 && (
                <div className="mb-3 p-2.5 bg-[var(--surface-2)] rounded-[var(--radius-md)]">
                  <p className="text-[11px] text-[var(--text-disabled)] mb-1.5">上次训练</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {block.previousData.map((prev, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 data-number bg-[var(--surface-3)] border-[var(--border-default)]">
                        {prev.weight}kg x {prev.reps}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="grid grid-cols-[36px_1fr_1fr_1fr_44px] gap-2 text-[11px] text-[var(--text-disabled)] font-medium uppercase tracking-wider">
                  <div className="text-center">组</div>
                  <div>重量</div>
                  <div>次数</div>
                  <div>RPE</div>
                  <div></div>
                </div>

                {block.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-[36px_1fr_1fr_1fr_44px] gap-2 items-center p-2 rounded-[var(--radius-md)] transition-colors ${
                      set.completed ? 'bg-[var(--success-muted)]' : ''
                    }`}
                  >
                    <div className="text-xs font-medium text-center text-[var(--text-tertiary)] data-number">{setIndex + 1}</div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={set.weight}
                      onChange={(e) => updateSet(blockIndex, setIndex, 'weight', e.target.value)}
                      className="h-9 text-center text-sm bg-[var(--surface-2)] border-[var(--border-default)] data-number"
                      inputMode="decimal"
                    />
                    <Input
                      type="number"
                      placeholder="0"
                      value={set.reps}
                      onChange={(e) => updateSet(blockIndex, setIndex, 'reps', e.target.value)}
                      className="h-9 text-center text-sm bg-[var(--surface-2)] border-[var(--border-default)] data-number"
                      inputMode="numeric"
                    />
                    <Input
                      type="number"
                      placeholder="-"
                      value={set.rpe}
                      onChange={(e) => updateSet(blockIndex, setIndex, 'rpe', e.target.value)}
                      className="h-9 text-center text-sm bg-[var(--surface-2)] border-[var(--border-default)] data-number"
                      min="1" max="10" step="0.5"
                      inputMode="decimal"
                    />
                    <Button
                      size="sm"
                      variant={set.completed ? 'default' : 'outline'}
                      onClick={() => toggleSetComplete(blockIndex, setIndex)}
                      className={`w-9 h-9 p-0 rounded-[var(--radius-md)] ${
                        set.completed 
                          ? 'bg-[var(--success)] hover:bg-[var(--success)]/90 text-white' 
                          : 'bg-[var(--surface-2)] border-[var(--border-default)]'
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button variant="ghost" size="sm" onClick={() => addSet(blockIndex)} className="w-full mt-2 text-xs text-[var(--text-tertiary)]">
                <Plus className="h-3.5 w-3.5 mr-1" />
                添加一组
              </Button>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Templates Button */}
      {templates.length > 0 && exerciseBlocks.length === 0 && (
        <Button 
          variant="outline" 
          className="w-full h-12 border-[var(--border-default)] bg-[var(--surface-2)] rounded-[var(--radius-lg)]"
          onClick={() => setShowTemplates(true)}
        >
          <CalendarBlank className="h-5 w-5 mr-2 text-[var(--accent)]" />
          Load from Template
        </Button>
      )}

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="bg-[var(--surface-2)] border-[var(--border-default)] rounded-[var(--radius-xl)]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Saved Templates</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {templates.map(template => (
              <Card
                key={template.id}
                className="cursor-pointer hover:bg-[var(--surface-3)] transition-colors bg-transparent border-0 rounded-[var(--radius-md)]"
                onClick={() => loadTemplate(template)}
              >
                <CardContent className="p-3">
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    {template.description || 'Custom template'}
                  </div>
                  <div className="text-xs text-[var(--text-disabled)] mt-2">
                    {template.exercises?.length || 0} training days
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
          <Button variant="outline" className="w-full h-14 border-dashed border-[var(--border-default)] bg-transparent text-[var(--text-tertiary)] rounded-[var(--radius-lg)]">
            <Plus className="h-5 w-5 mr-2" />
            添加动作
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[var(--surface-2)] border-[var(--border-default)] rounded-[var(--radius-xl)]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">选择动作</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
            {exercises.map(exercise => (
              <Card
                key={exercise.id}
                className="cursor-pointer hover:bg-[var(--surface-3)] transition-colors bg-transparent border-0 rounded-[var(--radius-md)]"
                onClick={() => addExercise(exercise)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{exercise.name}</div>
                    <div className="text-xs text-[var(--text-tertiary)]">{exercise.muscle_group}</div>
                  </div>
                  <Plus className="h-4 w-4 text-[var(--text-disabled)]" />
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Finish */}
      {exerciseBlocks.length > 0 && (
        <Button 
          className="w-full h-12 text-sm font-medium rounded-[var(--radius-lg)]"
          onClick={finishWorkout}
          disabled={saving}
        >
          <FloppyDisk className="h-4 w-4 mr-2" />
          {saving ? '保存中...' : '完成训练'}
        </Button>
      )}
    </div>
  )
}
