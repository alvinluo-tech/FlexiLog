'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  MagnifyingGlass, Plus, Barbell, ArrowRight, Sparkle, 
  Clock, Lightning, Trophy, BookOpen, Info, Target, X
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import { createCustomExercise } from '@/app/actions/exercises'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Exercise {
  id: string
  name: string
  muscle_group: string
  description: string | null
  tips: string | null
  rest_seconds?: number | null
  is_custom: boolean
  equipment?: string | null
}

const muscleGroups = [
  { value: 'chest', label: '胸' },
  { value: 'back', label: '背' },
  { value: 'legs', label: '腿' },
  { value: 'shoulders', label: '肩' },
  { value: 'biceps', label: '二头' },
  { value: 'triceps', label: '三头' },
  { value: 'core', label: '核心' },
  { value: 'glutes', label: '臀' },
  { value: 'full_body', label: '全身' },
  { value: 'forearms', label: '前臂' },
  { value: 'traps', label: '斜方' },
  { value: 'cardio', label: '有氧' },
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
  glutes: { dot: 'bg-pink-500', text: 'text-pink-300', bg: 'bg-pink-950/10', border: 'border-pink-500/15', activeBg: 'bg-pink-500 text-white' },
  forearms: { dot: 'bg-orange-500', text: 'text-orange-300', bg: 'bg-orange-950/10', border: 'border-orange-500/15', activeBg: 'bg-orange-500 text-white' },
  traps: { dot: 'bg-lime-500', text: 'text-lime-300', bg: 'bg-lime-950/10', border: 'border-lime-500/15', activeBg: 'bg-lime-500 text-black' },
  cardio: { dot: 'bg-red-500', text: 'text-red-300', bg: 'bg-red-950/10', border: 'border-red-500/15', activeBg: 'bg-red-500 text-white' },
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
function getExerciseMeta(ex: Exercise) {
  const name = ex.name
  const muscleGroup = ex.muscle_group
  const n = name.toLowerCase()
  let equipment = ex.equipment || '自重'
  let difficulty = '入门'
  let secondary: string[] = []

  // Equipment Mapping Fallback
  if (!ex.equipment) {
    if (n.includes('barbell') || n.includes('bench press') || n.includes('deadlift') || n.includes('squat') || n.includes('overhead press')) {
      equipment = '杠铃'
    } else if (n.includes('dumbbell') || n.includes('lateral raise') || n.includes('hammer')) {
      equipment = '哑铃'
    } else if (n.includes('cable') || n.includes('pulldown') || n.includes('flyes') || n.includes('face pull') || n.includes('pushdown') || n.includes('crunch')) {
      equipment = '绳索'
    } else if (n.includes('press') || n.includes('curl') || n.includes('raise')) {
      if (n.includes('machine') || n.includes('leg press') || n.includes('leg curl')) {
        equipment = '器械'
      }
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
    else if (muscleGroup === 'glutes') secondary = ['腘绳肌', '核心']
    else if (muscleGroup === 'forearms') secondary = ['握力肌', '腕部']
    else if (muscleGroup === 'traps') secondary = ['菱形肌', '三角肌后束']
    else if (muscleGroup === 'cardio') secondary = ['心肺耐力', '下肢']
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

// Equipment type detection from exercise name (Chinese)
function getEquipmentType(ex: Exercise): string {
  if (ex.equipment) return ex.equipment;
  const name = ex.name;
  if (/壶铃/.test(name)) return '壶铃'
  if (/杠铃|T杠|曲杠|窄握杠铃|背后杠铃/.test(name)) return '杠铃'
  if (/哑铃/.test(name)) return '哑铃'
  if (/绳索|龙门架|V把/.test(name)) return '绳索'
  if (/器械|史密斯|蝴蝶机|腿屈伸|腿弯举|腿举|哈克|腿外展|腿内收|坐姿|臀外展|反向蝴蝶|握力器|楼梯机|椭圆机|划船机|单车/.test(name)) return '器械'
  if (/俯卧撑|引体|双杠|平板|卷腹|臀桥|波比|登山|开合跳|高抬腿|死虫|鸟狗|V字|仰卧举|仰卧交替|龙旗|蚌式|蛤蜊|消防栓|跪姿后踢|站姿后踢|侧弓步|跳绳|匕式/.test(name)) return '自重'
  return '其他'
}

const equipmentOrder = ['杠铃', '哑铃', '绳索', '器械', '自重', '壶铃', '其他'] as const

const equipmentColors: Record<string, string> = {
  '杠铃': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  '哑铃': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  '绳索': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  '器械': 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  '自重': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  '壶铃': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  '其他': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
}

// Sub-category definitions per muscle group
const subCategories: Record<string, { value: string; label: string }[]> = {
  chest: [
    { value: 'upper', label: '上胸' },
    { value: 'mid', label: '中胸' },
    { value: 'lower', label: '下胸' },
    { value: 'overall', label: '整体' },
  ],
  back: [
    { value: 'upper', label: '上背' },
    { value: 'lower', label: '下背' },
    { value: 'lats', label: '背阔肌' },
    { value: 'overall', label: '整体' },
  ],
  legs: [
    { value: 'quads', label: '股四头' },
    { value: 'hamstrings', label: '腘绳肌' },
    { value: 'glutes', label: '臀部' },
    { value: 'calves', label: '小腿' },
  ],
  shoulders: [
    { value: 'front', label: '前束' },
    { value: 'side', label: '中束' },
    { value: 'rear', label: '后束' },
  ],
  biceps: [{ value: 'all', label: '全部' }],
  triceps: [{ value: 'all', label: '全部' }],
  core: [
    { value: 'upper', label: '上腹' },
    { value: 'lower', label: '下腹' },
    { value: 'obliques', label: '腹斜肌' },
  ],
  glutes: [{ value: 'all', label: '全部' }],
  forearms: [{ value: 'all', label: '全部' }],
  traps: [{ value: 'all', label: '全部' }],
  cardio: [{ value: 'all', label: '全部' }],
  full_body: [{ value: 'all', label: '全部' }],
}

function getSubCategory(name: string, muscleGroup: string): string {
  if (muscleGroup === 'chest') {
    if (/上斜/.test(name)) return 'upper'
    if (/下斜/.test(name)) return 'lower'
    if (/平板|飞鸟/.test(name) && !/上斜|下斜/.test(name)) return 'mid'
    return 'overall'
  }
  if (muscleGroup === 'back') {
    if (/面拉|反向飞鸟|耸肩|直立划船|坐姿划船/.test(name)) return 'upper'
    if (/山羊挺身|硬拉/.test(name) && !/罗马尼亚/.test(name)) return 'lower'
    if (/引体|下拉|背阔/.test(name)) return 'lats'
    return 'overall'
  }
  if (muscleGroup === 'legs') {
    if (/深蹲|腿举|腿屈伸|箭步|分腿蹲/.test(name)) return 'quads'
    if (/腿弯举|罗马尼亚|直腿硬拉/.test(name)) return 'hamstrings'
    if (/臀推|臀桥|后踢|蚌式|蛤蜊/.test(name)) return 'glutes'
    if (/提踵/.test(name)) return 'calves'
    return 'quads'
  }
  if (muscleGroup === 'shoulders') {
    if (/前平举|推举/.test(name)) return 'front'
    if (/侧平举|直立划船/.test(name)) return 'side'
    if (/飞鸟|面拉|反向/.test(name)) return 'rear'
    return 'front'
  }
  if (muscleGroup === 'core') {
    if (/上腹|卷腹|仰卧起坐/.test(name)) return 'upper'
    if (/下腹|仰卧举|反向卷腹/.test(name)) return 'lower'
    if (/腹斜|俄罗斯转体|侧/.test(name)) return 'obliques'
    return 'upper'
  }
  return 'all'
}

export default function ExercisesClient({ exercises, usageCounts = {} }: { exercises: Exercise[]; usageCounts?: Record<string, number> }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('all')
  const [selectedSub, setSelectedSub] = useState('all')
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [showCustom, setShowCustom] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customGroup, setCustomGroup] = useState('chest')
  const [customDesc, setCustomDesc] = useState('')
  const [customTips, setCustomTips] = useState('')
  const [saving, setSaving] = useState(false)

  const filteredExercises = useMemo(() => {
    return exercises.filter(ex => {
      const matchesSearch = !search ||
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        (ex.description && ex.description.toLowerCase().includes(search.toLowerCase())) ||
        (ex.tips && ex.tips.toLowerCase().includes(search.toLowerCase()))
      const matchesGroup = selectedGroup === 'all' || ex.muscle_group === selectedGroup
      const matchesSub = selectedSub === 'all' || getSubCategory(ex.name, ex.muscle_group) === selectedSub
      return matchesSearch && matchesGroup && matchesSub
    })
  }, [exercises, search, selectedGroup, selectedSub])

  const currentSubs = selectedGroup === 'all' ? [] : (subCategories[selectedGroup] || [])

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group)
    setSelectedSub('all')
  }

  const handleCreateCustom = async () => {
    if (!customName.trim()) return
    setSaving(true)
    const result = await createCustomExercise({
      name: customName.trim(),
      muscle_group: customGroup,
      description: customDesc.trim() || undefined,
      tips: customTips.trim() || undefined,
    })
    setSaving(false)
    if (result.data) {
      toast.success('自定义动作已创建')
      setShowCustom(false)
      setCustomName('')
      setCustomDesc('')
      setCustomTips('')
      router.refresh()
    } else if (result.error) {
      toast.error('创建失败', { description: result.error })
    }
  }

  return (
    <div className="w-full h-[calc(100dvh-5rem)] md:h-[100dvh] flex flex-col bg-[var(--surface-0)] overflow-hidden">
      {/* Header - fixed */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between shrink-0">
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
          <Barbell weight="fill" className="h-5.5 w-5.5 text-[var(--accent)]" />
          动作库
        </h1>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setShowCustom(true)}
          className="gap-1.5 h-9 rounded-xl border border-white/5 bg-[var(--surface-2)] text-white hover:bg-[var(--surface-3)] active:scale-95 transition-transform text-xs font-bold"
        >
          <Plus weight="bold" className="h-4 w-4 text-[var(--accent)]" />
          自定义
        </Button>
      </div>

      {/* Search - fixed */}
      <div className="px-4 pb-3 shrink-0">
        <div className="relative">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-disabled)]" />
          <Input
            placeholder="搜索动作..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-[var(--surface-1)] border border-white/5 focus-visible:ring-[var(--accent)] rounded-xl text-sm font-semibold"
          />
        </div>
      </div>

      {/* Main: Sidebar + Content - fills remaining height */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Left Sidebar - scrollable when overflow ── */}
        <div className="w-[72px] shrink-0 border-r border-white/5 bg-[var(--surface-1)] overflow-y-auto min-h-0">
          {/* All button */}
          <button
            onClick={() => handleGroupChange('all')}
            className={cn(
              "w-full py-3 text-center text-[10px] font-bold flex flex-col items-center gap-1 transition-all border-l-2 cursor-pointer",
              selectedGroup === 'all'
                ? "bg-white/5 border-l-white text-white"
                : "border-l-transparent text-[var(--text-tertiary)] hover:text-white hover:bg-white/[0.03]"
            )}
          >
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400 shrink-0" />
            全部
          </button>

          {muscleGroups.map(group => {
            const colors = muscleGroupColors[group.value] || muscleGroupColors.all
            const isActive = selectedGroup === group.value

            return (
              <button
                key={group.value}
                onClick={() => handleGroupChange(group.value)}
                className={cn(
                  "w-full py-3 text-center text-[10px] font-bold flex flex-col items-center gap-1 transition-all border-l-2 cursor-pointer",
                  isActive
                    ? "bg-white/5 border-l-white text-white"
                    : "border-l-transparent text-[var(--text-tertiary)] hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", colors.dot)} />
                {group.label}
              </button>
            )
          })}
        </div>

        {/* ── Right Content - scrollable ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Sub-category chips */}
          {currentSubs.length > 1 && (
            <div className="flex gap-1.5 px-4 py-2.5 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => setSelectedSub('all')}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border",
                  selectedSub === 'all'
                    ? "bg-white text-black border-white"
                    : "bg-[var(--surface-2)] text-[var(--text-secondary)] border-white/5 hover:text-white"
                )}
              >
                全部
              </button>
              {currentSubs.map(sub => (
                <button
                  key={sub.value}
                  onClick={() => setSelectedSub(sub.value)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all cursor-pointer border",
                    selectedSub === sub.value
                      ? "bg-white text-black border-white"
                      : "bg-[var(--surface-2)] text-[var(--text-secondary)] border-white/5 hover:text-white"
                  )}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          )}

          {/* Exercise grid grouped by equipment */}
          <div className="p-4 pb-32">
            <ExerciseList exercises={filteredExercises} onSelect={setSelectedExercise} usageCounts={usageCounts} />
          </div>
        </div>
      </div>

      {/* Details Dialog */}
      {selectedExercise && (
        <Dialog open={!!selectedExercise} onOpenChange={(open) => { if (!open) setSelectedExercise(null) }}>
          <DialogContent showCloseButton={false} className="max-w-md w-[92%] bg-[var(--surface-1)] border border-white/5 rounded-2xl p-0 shadow-2xl">
              {/* Custom close button - above everything */}
              <button
                onClick={() => setSelectedExercise(null)}
                className="absolute top-2 right-2 z-50 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-black/70 transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
              <DialogHeader className="p-0 border-b border-white/5 relative overflow-hidden rounded-t-2xl">
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
                          AI 示范图
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
                  const meta = getExerciseMeta(selectedExercise)
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-2.5">
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
                        <div className="bg-[var(--surface-2)]/60 border border-white/5 rounded-xl p-3 text-center">
                          <p className="text-[10px] text-[var(--text-tertiary)] font-bold uppercase tracking-wider">组间休息</p>
                          <p className="text-sm font-extrabold text-white mt-0.5">{selectedExercise.rest_seconds || 90}s</p>
                        </div>
                      </div>

                      {/* Dynamic instruction builder */}
                      {selectedExercise.description && (
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                            <BookOpen weight="fill" className="h-4.5 w-4.5" /> 动作步骤
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
                            <Sparkle weight="fill" className="h-4.5 w-4.5 text-amber-400 animate-pulse" /> 专业教练提示
                          </h4>
                          <p className="text-xs leading-relaxed text-[var(--text-secondary)] italic font-semibold">"{selectedExercise.tips}"</p>
                        </div>
                      )}

                      {/* Secondary list */}
                      {meta.secondary.length > 1 && (
                        <div className="space-y-2 pt-1">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">辅助参与肌群</h4>
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

      {/* Custom Exercise Dialog */}
      <Dialog open={showCustom} onOpenChange={setShowCustom}>
        <DialogContent showCloseButton={false} className="max-w-sm w-[92%] bg-[var(--surface-1)] border border-white/5 rounded-2xl p-0 overflow-hidden shadow-2xl">
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-black text-white flex items-center gap-2">
                <Plus weight="bold" className="h-5 w-5 text-[var(--accent)]" />
                创建自定义动作
              </DialogTitle>
              <button onClick={() => setShowCustom(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface-3)] transition-colors cursor-pointer">
                <X className="h-4 w-4 text-[var(--text-tertiary)]" />
              </button>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label htmlFor="custom-exercise-name" className="text-[11px] font-bold text-[var(--text-secondary)]">动作名称 *</label>
              <Input
                id="custom-exercise-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="例如：杠铃弯举"
                className="h-10 bg-[var(--surface-2)] border-white/5 focus-visible:border-[var(--accent)] rounded-xl text-sm"
                autoFocus
              />
            </div>

            {/* Muscle Group */}
            <div className="space-y-1.5">
              <label htmlFor="custom-exercise-group" className="text-[11px] font-bold text-[var(--text-secondary)]">目标肌群</label>
              <div className="flex flex-wrap gap-1.5">
                {muscleGroups.map(g => (
                  <button
                    key={g.value}
                    onClick={() => setCustomGroup(g.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer",
                      customGroup === g.value
                        ? "bg-white text-black border-white"
                        : "bg-[var(--surface-2)] text-[var(--text-secondary)] border-white/5"
                    )}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="custom-exercise-desc" className="text-[11px] font-bold text-[var(--text-secondary)]">动作描述</label>
              <textarea
                id="custom-exercise-desc"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="简要描述动作要领..."
                rows={2}
                className="w-full px-3 py-2 bg-[var(--surface-2)] border border-white/5 rounded-xl text-sm text-white placeholder:text-[var(--text-disabled)] focus-visible:border-[var(--accent)] focus-visible:outline-none resize-none"
              />
            </div>

            {/* Tips */}
            <div className="space-y-1.5">
              <label htmlFor="custom-exercise-tips" className="text-[11px] font-bold text-[var(--text-secondary)]">训练提示</label>
              <Input
                id="custom-exercise-tips"
                value={customTips}
                onChange={(e) => setCustomTips(e.target.value)}
                placeholder="例如：保持核心收紧"
                className="h-10 bg-[var(--surface-2)] border-white/5 focus-visible:border-[var(--accent)] rounded-xl text-sm"
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleCreateCustom}
              disabled={!customName.trim() || saving}
              className="w-full h-11 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all disabled:opacity-40"
            >
              {saving ? '创建中...' : '创建动作'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ExerciseList({ exercises, onSelect, usageCounts }: { exercises: Exercise[]; onSelect: (ex: Exercise) => void; usageCounts: Record<string, number> }) {
  if (exercises.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--text-tertiary)]">
        <Barbell className="h-10 w-10 mx-auto mb-3 text-[var(--text-disabled)]" />
        <p className="text-sm font-bold">没有找到匹配的动作</p>
      </div>
    )
  }

  // Group exercises by equipment type
  const grouped = useMemo(() => {
    const map: Record<string, Exercise[]> = {}
    for (const ex of exercises) {
      const eq = getEquipmentType(ex)
      if (!map[eq]) map[eq] = []
      map[eq].push(ex)
    }
    const result: { equipment: string; exercises: Exercise[] }[] = []
    for (const eq of equipmentOrder) {
      if (map[eq]?.length) result.push({ equipment: eq, exercises: map[eq] })
    }
    return result
  }, [exercises])

  return (
    <div className="space-y-5">
      {grouped.map(({ equipment, exercises: groupEx }) => (
        <div key={equipment}>
          {/* Equipment group header */}
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--text-secondary)]">{equipment}</h3>
            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-md border", equipmentColors[equipment] || equipmentColors['其他'])}>
              {groupEx.length}
            </span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* 2-column grid: image + text cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {groupEx.map((exercise) => {
              const count = usageCounts[exercise.id] || 0
              const colors = muscleGroupColors[exercise.muscle_group] || muscleGroupColors.all

              return (
                <Card
                  key={exercise.id}
                  onClick={() => onSelect(exercise)}
                  className="bg-[var(--surface-1)] border border-white/5 rounded-xl cursor-pointer active:scale-[0.97] transition-all hover:border-white/10 overflow-hidden"
                >
                  {/* Image area */}
                  <div className={cn("relative h-24 flex items-center justify-center", colors.bg)}>
                    <MuscleGroupGraphic group={exercise.muscle_group} size="sm" />

                    {/* Practice count badge - top right */}
                    {count > 0 && (
                      <div className="absolute top-1.5 right-1.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                        <Barbell weight="fill" className="h-2.5 w-2.5" />
                        {count}
                      </div>
                    )}
                  </div>

                  {/* Text area */}
                  <div className="p-2.5">
                    <h4 className="text-[11px] font-bold text-white truncate leading-tight">
                      {exercise.name}
                    </h4>
                    <p className="text-[9px] text-[var(--text-disabled)] font-medium mt-0.5 truncate">
                      {muscleGroups.find(g => g.value === exercise.muscle_group)?.label || exercise.muscle_group}
                      {exercise.rest_seconds && <span className="ml-1.5 text-[var(--text-tertiary)]">· {exercise.rest_seconds}s</span>}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
