'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Play, Pause, RotateCcw, Plus, Trash2, Timer, ChevronDown, ChevronUp, Check } from 'lucide-react'

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
}

interface ExerciseBlock {
  exercise: Exercise
  sets: WorkoutSet[]
  previousData?: { weight: string; reps: string }[]
  collapsed: boolean
}

// Mock exercises for selection
const mockExercises: Exercise[] = [
  { id: '1', name: '卧推', muscle_group: 'chest' },
  { id: '2', name: '上斜哑铃推举', muscle_group: 'chest' },
  { id: '3', name: '绳索飞鸟', muscle_group: 'chest' },
  { id: '4', name: '深蹲', muscle_group: 'legs' },
  { id: '5', name: '硬拉', muscle_group: 'back' },
  { id: '6', name: '杠铃划船', muscle_group: 'back' },
  { id: '7', name: '肩推', muscle_group: 'shoulders' },
  { id: '8', name: '杠铃弯举', muscle_group: 'biceps' },
  { id: '9', name: '绳索下压', muscle_group: 'triceps' },
  { id: '10', name: '平板支撑', muscle_group: 'core' },
]

export default function WorkoutLivePage() {
  const [exerciseBlocks, setExerciseBlocks] = useState<ExerciseBlock[]>([])
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [restTime, setRestTime] = useState(90) // seconds
  const [timeLeft, setTimeLeft] = useState(0)
  const [showExercisePicker, setShowExercisePicker] = useState(false)
  const [sessionStartTime] = useState(new Date())
  const [elapsedTime, setElapsedTime] = useState(0)

  // Session timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000))
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
            // Could add notification here
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isTimerRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const addExercise = (exercise: Exercise) => {
    const newBlock: ExerciseBlock = {
      exercise,
      sets: [{ id: '1', weight: '', reps: '', rpe: '', completed: false }],
      previousData: [
        { weight: '60', reps: '10' },
        { weight: '65', reps: '8' },
        { weight: '65', reps: '8' },
      ],
      collapsed: false,
    }
    setExerciseBlocks([...exerciseBlocks, newBlock])
    setShowExercisePicker(false)
  }

  const addSet = (blockIndex: number) => {
    setExerciseBlocks(prev => {
      const updated = [...prev]
      const block = updated[blockIndex]
      const newSet: WorkoutSet = {
        id: (block.sets.length + 1).toString(),
        weight: '',
        reps: '',
        rpe: '',
        completed: false,
      }
      block.sets = [...block.sets, newSet]
      return updated
    })
  }

  const updateSet = (blockIndex: number, setIndex: number, field: keyof WorkoutSet, value: string | boolean) => {
    setExerciseBlocks(prev => {
      const updated = [...prev]
      const block = updated[blockIndex]
      const sets = [...block.sets]
      sets[setIndex] = { ...sets[setIndex], [field]: value }
      block.sets = sets
      return updated
    })
  }

  const toggleSetComplete = (blockIndex: number, setIndex: number) => {
    const block = exerciseBlocks[blockIndex]
    const set = block.sets[setIndex]
    const newCompleted = !set.completed
    updateSet(blockIndex, setIndex, 'completed', newCompleted)
    
    if (newCompleted) {
      // Start rest timer when completing a set
      setTimeLeft(restTime)
      setIsTimerRunning(true)
    }
  }

  const removeExercise = (blockIndex: number) => {
    setExerciseBlocks(prev => prev.filter((_, i) => i !== blockIndex))
  }

  const toggleCollapse = (blockIndex: number) => {
    setExerciseBlocks(prev => {
      const updated = [...prev]
      updated[blockIndex] = { ...updated[blockIndex], collapsed: !updated[blockIndex].collapsed }
      return updated
    })
  }

  const completedSets = exerciseBlocks.reduce(
    (acc, block) => acc + block.sets.filter(s => s.completed).length,
    0
  )
  const totalSets = exerciseBlocks.reduce((acc, block) => acc + block.sets.length, 0)

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header with timer */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">训练中</h1>
          <p className="text-sm text-muted-foreground">
            已用时 {formatTime(elapsedTime)} · {completedSets}/{totalSets} 组
          </p>
        </div>
        <Badge variant={isTimerRunning ? 'default' : 'outline'} className="text-lg px-3 py-1">
          <Timer className="h-4 w-4 mr-1" />
          {formatTime(timeLeft)}
        </Badge>
      </div>

      {/* Rest Timer Controls */}
      {timeLeft > 0 && (
        <Card className="bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <span className="font-medium">组间休息</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">{formatTime(timeLeft)}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setTimeLeft(0); setIsTimerRunning(false) }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Blocks */}
      {exerciseBlocks.map((block, blockIndex) => (
        <Card key={blockIndex}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleCollapse(blockIndex)}>
                {block.collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                <CardTitle className="text-lg">{block.exercise.name}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {block.exercise.muscle_group}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeExercise(blockIndex)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          {!block.collapsed && (
            <CardContent className="pt-0">
              {/* Previous data hint */}
              {block.previousData && block.previousData.length > 0 && (
                <div className="mb-3 p-2 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">上次训练:</p>
                  <div className="flex gap-2 flex-wrap">
                    {block.previousData.map((prev, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {prev.weight}kg × {prev.reps}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sets table */}
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-[40px_1fr_1fr_1fr_50px] gap-2 text-xs text-muted-foreground">
                  <div>组</div>
                  <div>重量(kg)</div>
                  <div>次数</div>
                  <div>RPE</div>
                  <div></div>
                </div>

                {/* Sets */}
                {block.sets.map((set, setIndex) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-[40px_1fr_1fr_1fr_50px] gap-2 items-center p-2 rounded-lg transition-colors ${
                      set.completed ? 'bg-green-50 dark:bg-green-950/20' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-center">{setIndex + 1}</div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={set.weight}
                      onChange={(e) => updateSet(blockIndex, setIndex, 'weight', e.target.value)}
                      className="h-9 text-center"
                      inputMode="decimal"
                    />
                    <Input
                      type="number"
                      placeholder="0"
                      value={set.reps}
                      onChange={(e) => updateSet(blockIndex, setIndex, 'reps', e.target.value)}
                      className="h-9 text-center"
                      inputMode="numeric"
                    />
                    <Input
                      type="number"
                      placeholder="-"
                      value={set.rpe}
                      onChange={(e) => updateSet(blockIndex, setIndex, 'rpe', e.target.value)}
                      className="h-9 text-center"
                      min="1"
                      max="10"
                      step="0.5"
                      inputMode="decimal"
                    />
                    <Button
                      size="sm"
                      variant={set.completed ? 'default' : 'outline'}
                      onClick={() => toggleSetComplete(blockIndex, setIndex)}
                      className="w-9 h-9 p-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add set button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addSet(blockIndex)}
                className="w-full mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                添加一组
              </Button>
            </CardContent>
          )}
        </Card>
      ))}

      {/* Add Exercise Button */}
      <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
        <DialogTrigger>
          <Button variant="outline" className="w-full h-16 border-dashed">
            <Plus className="h-5 w-5 mr-2" />
            添加动作
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择动作</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {mockExercises.map(exercise => (
              <Card
                key={exercise.id}
                className="cursor-pointer hover:bg-accent"
                onClick={() => addExercise(exercise)}
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{exercise.name}</div>
                    <div className="text-sm text-muted-foreground">{exercise.muscle_group}</div>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Finish Workout Button */}
      {exerciseBlocks.length > 0 && (
        <Button className="w-full h-14 text-lg" size="lg">
          完成训练
        </Button>
      )}
    </div>
  )
}
