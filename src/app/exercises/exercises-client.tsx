'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MagnifyingGlass, Plus, Barbell, ArrowRight, Sparkle, 
  Clock, Lightning, Trophy, BookOpen, Info, Target 
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface Exercise {
  id: string
  name: string
  muscle_group: string
  description: string | null
  tips: string | null
  is_custom: boolean
}

const muscleGroups = [
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背' },
  { value: 'legs', label: '腿' },
  { value: 'shoulders', label: '肩' },
  { value: 'biceps', label: '二头' },
  { value: 'triceps', label: '三头' },
  { value: 'core', label: '核心' },
  { value: 'full_body', label: '全身' },
]

const muscleGroupColors: Record<string, { dot: string; text: string; bg: string; border: string; activeBg: string }> = {
  all: { dot: 'bg-blue-400', text: 'text-[var(--text-secondary)]', bg: 'bg-[var(--surface-2)]/60', border: 'border-white/5', activeBg: 'bg-white text-black' },
  chest: { dot: 'bg-rose-500', text: 'text-rose-300', bg: 'bg-rose-950/10', border: 'border-rose-500/15', activeBg: 'bg-rose-500 text-white' },
  back: { dot: 'bg-blue-500', text: 'text-blue-300', bg: 'bg-blue-950/10', border: 'border-blue-500/15', activeBg: 'bg-blue-500 text-white' },
  legs: { dot: 'bg-violet-500', text: 'text-violet-300', bg: 'bg-violet-950/10', border: 'border-violet-500/15', activeBg: 'bg-violet-500 text-white' },
  shoulders: { dot: 'bg-amber-500', text: 'text-amber-300', bg: 'bg-amber-950/10', border: 'border-amber-500/15', activeBg: 'bg-amber-500 text-black' },
  biceps: { dot: 'bg-emerald-500', text: 'text-emerald-300', bg: 'bg-emerald-950/10', border: 'border-emerald-500/15', activeBg: 'bg-emerald-500 text-white' },
  triceps: { dot: 'bg-teal-500', text: 'text-teal-300', bg: 'bg-teal-950/10', border: 'border-teal-500/15', activeBg: 'bg-teal-500 text-white' },
  core: { dot: 'bg-cyan-500', text: 'text-cyan-300', bg: 'bg-cyan-950/10', border: 'border-cyan-500/15', activeBg: 'bg-cyan-500 text-black' },
  full_body: { dot: 'bg-purple-500', text: 'text-purple-300', bg: 'bg-purple-950/10', border: 'border-purple-500/15', activeBg: 'bg-purple-500 text-white' },
}

// Custom Premium Inline SVG Anatomical Graphic System
function MuscleGroupGraphic({ group, size = 'sm' }: { group: string; size?: 'sm' | 'lg' }) {
  const isLarge = size === 'lg'
  const sizeClasses = isLarge ? 'w-full h-44 rounded-2xl' : 'w-14 h-14 rounded-xl'

  let gradientColor = 'from-blue-600/25 to-purple-600/10 border-blue-500/20 text-blue-400'
  let glowColor = 'bg-blue-500/15 shadow-blue-500/30'

  if (group === 'chest') {
    gradientColor = 'from-rose-500/25 to-orange-500/10 border-rose-500/25 text-rose-400'
    glowColor = 'bg-rose-500/15 shadow-rose-500/30'
  } else if (group === 'back') {
    gradientColor = 'from-blue-500/25 to-indigo-500/10 border-blue-500/25 text-blue-400'
    glowColor = 'bg-blue-500/15 shadow-blue-500/30'
  } else if (group === 'legs') {
    gradientColor = 'from-violet-500/25 to-fuchsia-500/10 border-violet-500/25 text-violet-400'
    glowColor = 'bg-violet-500/15 shadow-violet-500/30'
  } else if (group === 'shoulders') {
    gradientColor = 'from-amber-500/25 to-orange-500/10 border-amber-500/25 text-amber-400'
    glowColor = 'bg-amber-500/15 shadow-amber-500/30'
  } else if (group === 'biceps' || group === 'triceps') {
    gradientColor = 'from-emerald-500/25 to-teal-500/10 border-emerald-500/25 text-emerald-400'
    glowColor = 'bg-emerald-500/15 shadow-emerald-500/30'
  } else if (group === 'core') {
    gradientColor = 'from-cyan-500/25 to-blue-500/10 border-cyan-500/25 text-cyan-400'
    glowColor = 'bg-cyan-500/15 shadow-cyan-500/30'
  } else if (group === 'full_body') {
    gradientColor = 'from-purple-500/25 to-blue-500/10 border-purple-500/25 text-purple-400'
    glowColor = 'bg-purple-500/15 shadow-purple-500/30'
  }

  const renderSvgContent = () => {
    const strokeWidth = 2.0
    if (group === 'chest') {
      return (
        <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor">
          <path d="M25 25 C35 22 65 22 75 25 C75 35 70 50 65 65 C60 75 40 75 35 65 C30 50 25 35 25 25 Z" strokeWidth={1} strokeOpacity={0.15} />
          <path d="M50 35 C42 35 34 38 31 43 C31 43 35 56 50 50" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 35 C58 35 66 38 69 43 C69 43 65 56 50 50" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 35 L50 50" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M30 28 C40 31 45 33 50 33 C55 33 60 31 70 28" strokeWidth={1} strokeOpacity={0.35} />
        </svg>
      )
    }

    if (group === 'back') {
      return (
        <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor">
          <path d="M20 20 L80 20 L70 55 L58 75 L42 75 L30 55 Z" strokeWidth={1} strokeOpacity={0.15} />
          <path d="M50 20 L50 75" strokeWidth={1.2} strokeOpacity={0.25} />
          <path d="M50 32 C38 30 32 38 30 48 C28 58 35 64 45 70" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M50 32 C62 30 68 38 70 48 C72 58 65 64 55 70" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M30 20 C42 28 45 30 50 30 C55 30 58 28 70 20" strokeWidth={strokeWidth} strokeLinecap="round" />
        </svg>
      )
    }

    if (group === 'legs') {
      return (
        <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor">
          <path d="M30 25 H70" strokeWidth={1} strokeOpacity={0.15} />
          <path d="M48 27 C42 37 36 50 38 63 C40 73 47 75 48 78" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M52 27 C58 37 64 50 62 63 C60 73 53 75 52 78" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M42 55 C46 59 47 62 48 66" strokeWidth={1.5} />
          <path d="M58 55 C54 59 53 62 52 66" strokeWidth={1.5} />
          <circle cx="43" cy="82" r="2.5" strokeWidth={1} strokeOpacity={0.4} />
          <circle cx="57" cy="82" r="2.5" strokeWidth={1} strokeOpacity={0.4} />
        </svg>
      )
    }

    if (group === 'shoulders') {
      return (
        <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor">
          <path d="M42 20 C45 28 55 28 58 20" strokeWidth={1} strokeOpacity={0.15} />
          <path d="M42 25 C34 26 26 31 23 42 C20 52 26 60 30 63" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M58 25 C66 26 74 31 77 42 C80 52 74 60 70 63" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M30 42 C40 45 45 46 50 46 C55 46 60 45 70 42" strokeWidth={1} strokeOpacity={0.35} strokeLinecap="round" />
        </svg>
      )
    }

    if (group === 'biceps') {
      return (
        <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor">
          <circle cx="25" cy="40" r="3" strokeWidth={1} strokeOpacity={0.15} />
          <path d="M50 65 L75 40" strokeWidth={1} strokeOpacity={0.15} />
          <path d="M27 40 C32 30 44 26 52 38 C56 42 54 52 48 60" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M29 46 C34 50 40 52 44 56" strokeWidth={1.5} strokeOpacity={0.4} />
        </svg>
      )
    }

    if (group === 'triceps') {
      return (
        <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor">
          <path d="M25 35 C35 32 45 35 50 45 L65 75" strokeWidth={1} strokeOpacity={0.15} />
          <path d="M30 38 C24 45 23 54 27 63 C30 68 36 68 40 60" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M30 45 C32 50 35 54 36 58" strokeWidth={1.5} strokeOpacity={0.45} />
        </svg>
      )
    }

    if (group === 'core') {
      return (
        <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor">
          <path d="M35 25 H65 V75 H35 Z" strokeWidth={1} strokeOpacity={0.15} />
          <path d="M50 25 V75" strokeWidth={1} strokeOpacity={0.35} />
          <path d="M38 38 H62" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M38 50 H62" strokeWidth={strokeWidth} strokeLinecap="round" />
          <path d="M38 62 H62" strokeWidth={strokeWidth} strokeLinecap="round" />
        </svg>
      )
    }

    return (
      <svg viewBox="0 0 100 100" className="w-2/3 h-2/3 transition-transform duration-300 group-hover:scale-105" fill="none" stroke="currentColor">
        <circle cx="50" cy="22" r="5" strokeWidth={strokeWidth} />
        <path d="M50 27 V60" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d="M30 36 C40 33 45 33 50 33 C55 33 60 33 70 36" strokeWidth={strokeWidth} strokeLinecap="round" />
        <path d="M30 36 L22 52" strokeWidth={1.5} strokeLinecap="round" />
        <path d="M70 36 L78 52" strokeWidth={1.5} strokeLinecap="round" />
        <path d="M40 76 L50 60 L60 76" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <div className={cn(
      "relative flex items-center justify-center border bg-gradient-to-br shrink-0 shadow-inner group transition-all duration-300",
      gradientColor,
      sizeClasses
    )}>
      <div className={cn("absolute inset-0 blur-xl opacity-35 pointer-events-none rounded-full scale-75", glowColor)} />
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        {renderSvgContent()}
      </div>
    </div>
  )
}

// High-Fidelity Metadata Generation Engine
function getExerciseMeta(name: string, muscleGroup: string) {
  const n = name.toLowerCase()
  let equipment = '自重'
  let difficulty = '入门'
  let secondary: string[] = []

  // Equipment Mapping
  if (n.includes('barbell') || n.includes('bench press') || n.includes('deadlift') || n.includes('squat') || n.includes('overhead press')) {
    equipment = '杠铃'
  } else if (n.includes('dumbbell') || n.includes('lateral raise') || n.includes('hammer')) {
    equipment = '哑铃'
  } else if (n.includes('cable') || n.includes('pulldown') || n.includes('flyes') || n.includes('face pull') || n.includes('pushdown') || n.includes('crunch')) {
    equipment = '绳索器械'
  } else if (n.includes('press') || n.includes('curl') || n.includes('raise')) {
    if (n.includes('machine') || n.includes('leg press') || n.includes('leg curl')) {
      equipment = '固定器械'
    }
  }

  // Difficulty Mapping
  if (n.includes('bench press') || n.includes('squat') || n.includes('pull-up') || n.includes('barbell row') || n.includes('skull crusher')) {
    difficulty = '进阶'
    secondary = ['三角肌前束', '肱三头肌']
  } else if (n.includes('deadlift') || n.includes('clean and press') || n.includes('turkish get-up')) {
    difficulty = '高阶'
    secondary = ['臀大肌', '核心肌群', '腘绳肌', '前臂']
  } else if (n.includes('push-ups') || n.includes('plank') || n.includes('calf') || n.includes('curl')) {
    difficulty = '入门'
    secondary = n.includes('push-ups') ? ['肱三头肌', '三角肌前束'] : []
  } else {
    difficulty = '进阶'
  }

  // Group Backup Mapping for Secondary targets
  if (secondary.length === 0) {
    if (muscleGroup === 'chest') secondary = ['三角肌前束', '肱三头肌']
    else if (muscleGroup === 'back') secondary = ['肱二头肌', '后三角肌', '前臂']
    else if (muscleGroup === 'legs') secondary = ['核心', '小腿', '臀部']
    else if (muscleGroup === 'shoulders') secondary = ['斜方肌', '肱三头肌']
    else if (muscleGroup === 'biceps') secondary = ['前臂', '握力肌']
    else if (muscleGroup === 'triceps') secondary = ['后三角肌', '前锯肌']
    else if (muscleGroup === 'core') secondary = ['竖脊肌', '髋屈肌']
    else if (muscleGroup === 'full_body') secondary = ['全身主要肌群']
  }

  const difficultyColor = 
    difficulty === '入门' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' :
    difficulty === '进阶' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' :
    'text-rose-400 bg-rose-500/10 border-rose-500/20'

  return { equipment, difficulty, secondary, difficultyColor }
}

// Map exercise names to custom AI action demonstration images
const getDemoImage = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('bench press')) return '/images/exercises/bench_press.png'
  if (n.includes('squat') && !n.includes('split squat')) return '/images/exercises/squat.png'
  if (n.includes('deadlift') && !n.includes('romanian')) return '/images/exercises/deadlift.png'
  return null
}

export default function ExercisesClient({ exercises }: { exercises: Exercise[] }) {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchesSearch = !search || 
        ex.name.toLowerCase().includes(search.toLowerCase()) || 
        (ex.description && ex.description.toLowerCase().includes(search.toLowerCase())) ||
        (ex.tips && ex.tips.toLowerCase().includes(search.toLowerCase()))
      const matchesGroup = selectedGroup === 'all' || ex.muscle_group === selectedGroup
      return matchesSearch && matchesGroup
    })
  }, [exercises, search, selectedGroup])

  return (
    <div className="max-w-md mx-auto p-4 pb-32 space-y-4.5 w-full min-h-[100dvh] pt-2">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Barbell weight="fill" className="h-5.5 w-5.5 text-[var(--accent)]" />
          动作库 <span className="text-xs text-[var(--text-tertiary)] font-bold tracking-widest uppercase">Library</span>
        </h1>
        <Button 
          size="sm" 
          variant="secondary" 
          className="gap-1.5 h-9 rounded-xl border border-white/5 bg-[var(--surface-2)] text-white hover:bg-[var(--surface-3)] active:scale-95 transition-transform text-xs font-bold"
        >
          <Plus weight="bold" className="h-4 w-4 text-[var(--accent)]" />
          自定义
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-[var(--text-disabled)]" />
        <Input
          placeholder="搜索动作名称、描述或诀窍..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-11 bg-[var(--surface-1)] border border-white/5 focus-visible:ring-[var(--accent)] rounded-xl text-sm font-semibold transition-all shadow-inner"
        />
      </div>

      {/* Muscle Group Tabs */}
      <Tabs defaultValue="all" value={selectedGroup} onValueChange={setSelectedGroup} className="w-full">
        {/* Swipeable Tab List */}
        <TabsList className="w-full flex justify-start gap-1.5 bg-transparent border-0 p-0 overflow-x-auto scrollbar-none pb-2.5 h-auto">
          <TabsTrigger 
            value="all" 
            className={cn(
              "flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95",
              selectedGroup === 'all' 
                ? "bg-white text-black border-white shadow-md font-black" 
                : "bg-[var(--surface-2)]/60 text-[var(--text-secondary)] border-white/5 hover:text-white"
            )}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            全部 ({exercises.length})
          </TabsTrigger>
          {muscleGroups.map(group => {
            const count = exercises.filter(e => e.muscle_group === group.value).length
            const colors = muscleGroupColors[group.value] || muscleGroupColors.all
            const isActive = selectedGroup === group.value

            return (
              <TabsTrigger 
                key={group.value} 
                value={group.value} 
                className={cn(
                  "flex-shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all border flex items-center gap-1.5 cursor-pointer active:scale-95",
                  isActive 
                    ? colors.activeBg + " border-transparent shadow-md font-black" 
                    : `${colors.bg} ${colors.text} ${colors.border} hover:text-white`
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full transition-transform", colors.dot, isActive && "scale-125")} />
                {group.label} ({count})
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="all" className="mt-1 focus-visible:outline-none">
          <ExerciseList exercises={filteredExercises} onSelect={setSelectedExercise} />
        </TabsContent>
        {muscleGroups.map(group => (
          <TabsContent key={group.value} value={group.value} className="mt-1 focus-visible:outline-none">
            <ExerciseList exercises={filteredExercises} onSelect={setSelectedExercise} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Details Sheet Dialog */}
      <AnimatePresence>
        {selectedExercise && (
          <Dialog open={!!selectedExercise} onOpenChange={(open) => { if (!open) setSelectedExercise(null) }}>
            <DialogContent className="max-w-md w-[92%] bg-[var(--surface-1)] border border-white/5 rounded-2xl p-0 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <DialogHeader className="p-0 border-b border-white/5 relative">
                {(() => {
                  const demoImg = getDemoImage(selectedExercise.name)
                  if (demoImg) {
                    return (
                      <div className="relative w-full h-44 overflow-hidden bg-[var(--surface-0)] flex items-center justify-center border-b border-white/5">
                        <img 
                          src={demoImg} 
                          alt={selectedExercise.name} 
                          className="w-full h-full object-contain opacity-95 p-1.5"
                        />
                        {/* Category badge floating */}
                        <Badge className="absolute bottom-3 left-3 bg-purple-500/90 text-white border border-white/10 px-2 py-0.5 rounded-md font-bold text-[9px] tracking-wider uppercase">
                          AI 示范图 (Live Demo)
                        </Badge>
                      </div>
                    )
                  }
                  return <MuscleGroupGraphic group={selectedExercise.muscle_group} size="lg" />
                })()}
              </DialogHeader>

              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <DialogTitle className="text-xl font-black text-white flex items-center gap-2">
                    {selectedExercise.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-[var(--text-tertiary)] font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5" />
                    主目标肌群：{muscleGroups.find(g => g.value === selectedExercise.muscle_group)?.label || selectedExercise.muscle_group}
                  </DialogDescription>
                </div>

                {/* Meta details Stats Bar */}
                {(() => {
                  const meta = getExerciseMeta(selectedExercise.name, selectedExercise.muscle_group)
                  return (
                    <>
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="bg-[var(--surface-2)]/60 border border-white/5 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">推荐器械</p>
                          <p className="text-sm font-extrabold text-white mt-0.5">{meta.equipment}</p>
                        </div>
                        <div className={cn("border rounded-xl p-3 text-center flex flex-col justify-center items-center", meta.difficultyColor.split(' ')[1] + ' ' + meta.difficultyColor.split(' ')[2])}>
                          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">训练难度</p>
                          <p className={cn("text-sm font-extrabold mt-0.5", meta.difficultyColor.split(' ')[0])}>{meta.difficulty}</p>
                        </div>
                        <div className="bg-[var(--surface-2)]/60 border border-white/5 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">辅助肌群</p>
                          <p className="text-sm font-extrabold text-white mt-0.5 truncate">{meta.secondary[0] || '无'}</p>
                        </div>
                      </div>

                      {/* Dynamic instruction builder */}
                      {selectedExercise.description && (
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                            <BookOpen weight="fill" className="h-4.5 w-4.5" /> 动作指南 / Steps
                          </h4>
                          {(() => {
                            const steps = selectedExercise.description
                              .split(/(?:\.|\?|!|。|；|;)\s*/)
                              .map(s => s.trim())
                              .filter(s => s.length > 0)
                            
                            if (steps.length > 1) {
                              return (
                                <div className="space-y-2">
                                  {steps.map((step, idx) => (
                                    <div key={idx} className="flex gap-3 p-3 bg-[var(--surface-2)]/40 border border-white/5 rounded-xl items-start">
                                      <span className="h-5 w-5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                                      <p className="text-xs leading-relaxed text-[var(--text-secondary)] font-medium">{step}</p>
                                    </div>
                                  ))}
                                </div>
                              )
                            }
                            
                            return (
                              <Card className="bg-[var(--surface-2)]/40 border border-white/5 rounded-xl">
                                <CardContent className="p-3.5 text-xs leading-relaxed text-[var(--text-secondary)] font-medium">
                                  {selectedExercise.description}
                                </CardContent>
                              </Card>
                            )
                          })()}
                        </div>
                      )}

                      {/* Tips Bubble */}
                      {selectedExercise.tips && (
                        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/15 p-4 rounded-xl shadow-inner">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
                            <Sparkle weight="fill" className="h-4.5 w-4.5 text-amber-400 animate-pulse" /> 专业教练提示 / Coach Tips
                          </h4>
                          <p className="text-xs leading-relaxed text-[var(--text-secondary)] italic font-semibold">"{selectedExercise.tips}"</p>
                        </div>
                      )}

                      {/* Secondary list */}
                      {meta.secondary.length > 1 && (
                        <div className="space-y-2 pt-1">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">辅助参与肌群 (Secondary Targets)</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {meta.secondary.map(m => (
                              <Badge key={m} variant="secondary" className="text-[9px] font-bold px-2 py-0.5 bg-[var(--surface-2)] border border-white/5 text-[var(--text-secondary)] rounded-md">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>

              {/* Detail Footer */}
              <div className="p-4 border-t border-white/5 bg-[var(--surface-2)]/40 flex gap-2">
                <Button 
                  onClick={() => setSelectedExercise(null)}
                  className="w-full h-11 bg-white hover:bg-white/90 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  关闭窗口
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}

function ExerciseList({ exercises, onSelect }: { exercises: Exercise[]; onSelect: (ex: Exercise) => void }) {
  if (exercises.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16 text-[var(--text-tertiary)] bg-[var(--surface-1)] border border-white/5 rounded-2xl"
      >
        <Barbell className="h-10 w-10 mx-auto mb-3 text-[var(--text-disabled)]" />
        <p className="text-sm font-bold">没有找到匹配的动作</p>
      </motion.div>
    )
  }

  const getGroupLabel = (group: string) => {
    return muscleGroups.find(g => g.value === group)?.label || group
  }

  return (
    <div className="space-y-2.5">
      <AnimatePresence>
        {exercises.map((exercise, index) => {
          const meta = getExerciseMeta(exercise.name, exercise.muscle_group)
          return (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28, delay: Math.min(index * 0.02, 0.2) }}
            >
              <Card 
                className="card-surface bg-[var(--surface-1)] border border-white/5 rounded-xl cursor-pointer group active:scale-[0.98] transition-all hover:border-white/10 shadow-sm"
                onClick={() => onSelect(exercise)}
              >
                <CardContent className="p-3 flex items-center gap-3.5">
                  {/* Left SVG Illustration or AI Live Demo Image preview */}
                  {(() => {
                    const demoImg = getDemoImage(exercise.name)
                    if (demoImg) {
                      return (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-black border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                          <img 
                            src={demoImg} 
                            alt={exercise.name} 
                            className="w-full h-full object-cover opacity-90"
                          />
                          {/* Pulsing micro indicator for live demo */}
                          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-purple-500 border border-black shadow animate-pulse" />
                        </div>
                      )
                    }
                    return <MuscleGroupGraphic group={exercise.muscle_group} size="sm" />
                  })()}

                  {/* Middle Content */}
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-bold text-white truncate leading-tight group-hover:text-[var(--accent)] transition-colors">
                        {exercise.name}
                      </h3>
                      {exercise.is_custom && (
                        <Badge className="text-[8px] font-black px-1.5 py-0 bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0 rounded-md">
                          CUSTOM
                        </Badge>
                      )}
                    </div>

                    {/* Metadata Row */}
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--surface-2)] border border-white/5 px-1.5 py-0.5 rounded-md leading-none">
                        {getGroupLabel(exercise.muscle_group)}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--text-tertiary)] leading-none">•</span>
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] bg-[var(--surface-2)] border border-white/5 px-1.5 py-0.5 rounded-md leading-none">
                        {meta.equipment}
                      </span>
                      <span className="text-[10px] font-bold text-[var(--text-tertiary)] leading-none">•</span>
                      <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-md border leading-none uppercase tracking-wider", meta.difficultyColor)}>
                        {meta.difficulty}
                      </span>
                    </div>

                    {/* Sub-text snippet */}
                    {exercise.tips && (
                      <p className="text-[11px] text-[var(--text-tertiary)] truncate leading-relaxed mt-1 font-medium">
                        {exercise.tips}
                      </p>
                    )}
                  </div>

                  {/* Right Action Chevron */}
                  <ArrowRight weight="bold" className="h-4 w-4 text-[var(--text-disabled)] shrink-0 group-hover:text-white transition-colors mr-1" />
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
