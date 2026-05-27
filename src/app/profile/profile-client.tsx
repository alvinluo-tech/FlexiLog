'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Ruler, Target, Barbell, FloppyDisk } from '@phosphor-icons/react'
import { updateUserProfile } from '@/app/actions/workout'
import { LogoutButton } from '@/components/logout-button'

interface ProfileClientProps {
  user: any
  profile: any
}

export default function ProfileClient({ user, profile }: ProfileClientProps) {
  const [formData, setFormData] = useState({
    gender: profile?.gender || '',
    age: profile?.age?.toString() || '',
    height: profile?.height_cm?.toString() || '',
    weight: profile?.weight_kg?.toString() || '',
    bodyFat: profile?.body_fat_percentage?.toString() || '',
    fitnessYears: profile?.fitness_years?.toString() || '',
    injuries: profile?.injuries || '',
    goal: profile?.goal || '',
    trainingDays: profile?.training_days_per_week?.toString() || '',
    sessionDuration: profile?.session_duration_minutes?.toString() || '',
    equipment: profile?.equipment || '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    const result = await updateUserProfile({
      gender: formData.gender || undefined,
      age: formData.age ? parseInt(formData.age) : undefined,
      height_cm: formData.height ? parseFloat(formData.height) : undefined,
      weight_kg: formData.weight ? parseFloat(formData.weight) : undefined,
      body_fat_percentage: formData.bodyFat ? parseFloat(formData.bodyFat) : undefined,
      fitness_years: formData.fitnessYears ? parseInt(formData.fitnessYears) : undefined,
      injuries: formData.injuries || undefined,
      goal: formData.goal || undefined,
      training_days_per_week: formData.trainingDays ? parseInt(formData.trainingDays) : undefined,
      session_duration_minutes: formData.sessionDuration ? parseInt(formData.sessionDuration) : undefined,
      equipment: formData.equipment || undefined,
    })

    if (result.error) {
      setMessage('保存失败: ' + result.error)
    } else {
      setMessage('保存成功')
    }
    setSaving(false)
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">个人设置</h1>
        <Button 
          size="sm" 
          className="gap-1.5 rounded-[var(--radius-md)]"
          onClick={handleSave}
          disabled={saving}
        >
          <FloppyDisk className="h-4 w-4" />
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>

      {message && (
        <div className={`text-sm p-3 rounded-[var(--radius-md)] ${
          message.includes('成功') 
            ? 'text-[var(--success)] bg-[var(--success-muted)]' 
            : 'text-[var(--danger)] bg-[var(--danger-muted)]'
        }`}>
          {message}
        </div>
      )}

      {/* Avatar */}
      <Card className="card-surface border rounded-[var(--radius-lg)]">
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[var(--surface-3)] flex items-center justify-center">
              <User className="h-8 w-8 text-[var(--text-tertiary)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user.user_metadata?.display_name || user.email?.split('@')[0]}</h2>
              <p className="text-sm text-[var(--text-tertiary)]">{user.email}</p>
            </div>
          </div>
          <LogoutButton />
        </CardContent>
      </Card>

      {/* Body Parameters */}
      <Card className="card-surface border rounded-[var(--radius-lg)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Ruler className="h-4 w-4 text-[var(--text-tertiary)]" />
            身体参数
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--text-tertiary)]">性别</Label>
              <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
                <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-default)]">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--surface-2)] border-[var(--border-default)]">
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--text-tertiary)]">年龄</Label>
              <Input 
                type="number" 
                placeholder="25" 
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                className="bg-[var(--surface-2)] border-[var(--border-default)] data-number" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--text-tertiary)]">身高 (cm)</Label>
              <Input 
                type="number" 
                placeholder="175" 
                value={formData.height}
                onChange={(e) => updateField('height', e.target.value)}
                className="bg-[var(--surface-2)] border-[var(--border-default)] data-number" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--text-tertiary)]">体重 (kg)</Label>
              <Input 
                type="number" 
                placeholder="70" 
                value={formData.weight}
                onChange={(e) => updateField('weight', e.target.value)}
                className="bg-[var(--surface-2)] border-[var(--border-default)] data-number" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--text-tertiary)]">体脂率 (%)</Label>
              <Input 
                type="number" 
                placeholder="15" 
                value={formData.bodyFat}
                onChange={(e) => updateField('bodyFat', e.target.value)}
                className="bg-[var(--surface-2)] border-[var(--border-default)] data-number" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--text-tertiary)]">健身年限</Label>
              <Input 
                type="number" 
                placeholder="2" 
                value={formData.fitnessYears}
                onChange={(e) => updateField('fitnessYears', e.target.value)}
                className="bg-[var(--surface-2)] border-[var(--border-default)] data-number" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--text-tertiary)]">伤病史</Label>
            <Input 
              placeholder="例如：膝盖半月板损伤" 
              value={formData.injuries}
              onChange={(e) => updateField('injuries', e.target.value)}
              className="bg-[var(--surface-2)] border-[var(--border-default)]" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Training Goals */}
      <Card className="card-surface border rounded-[var(--radius-lg)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-[var(--text-tertiary)]" />
            训练目标
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--text-tertiary)]">当前目标</Label>
            <Select value={formData.goal} onValueChange={(v) => updateField('goal', v)}>
              <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-default)]">
                <SelectValue placeholder="选择目标" />
              </SelectTrigger>
              <SelectContent className="bg-[var(--surface-2)] border-[var(--border-default)]">
                <SelectItem value="bulk">增肌</SelectItem>
                <SelectItem value="cut">减脂</SelectItem>
                <SelectItem value="maintain">维持</SelectItem>
                <SelectItem value="strength">提高绝对力量</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--text-tertiary)]">每周训练天数</Label>
              <Select value={formData.trainingDays} onValueChange={(v) => updateField('trainingDays', v)}>
                <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-default)]">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--surface-2)] border-[var(--border-default)]">
                  {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <SelectItem key={day} value={day.toString()}>{day}天</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--text-tertiary)]">单次时长</Label>
              <Select value={formData.sessionDuration} onValueChange={(v) => updateField('sessionDuration', v)}>
                <SelectTrigger className="bg-[var(--surface-2)] border-[var(--border-default)]">
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--surface-2)] border-[var(--border-default)]">
                  <SelectItem value="30">30分钟</SelectItem>
                  <SelectItem value="45">45分钟</SelectItem>
                  <SelectItem value="60">60分钟</SelectItem>
                  <SelectItem value="90">90分钟</SelectItem>
                  <SelectItem value="120">120分钟</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card className="card-surface border rounded-[var(--radius-lg)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Barbell className="h-4 w-4 text-[var(--text-tertiary)]" />
            器械条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'full_gym', label: '商业健身房', desc: '器械齐全' },
              { value: 'dumbbells', label: '哑铃环境', desc: '哑铃为主' },
              { value: 'bodyweight', label: '居家自重', desc: '无器械' },
            ].map(option => (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all rounded-[var(--radius-md)] ${
                  formData.equipment === option.value
                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)]'
                    : 'border-[var(--border-default)] bg-[var(--surface-2)] hover:border-[var(--border-hover)]'
                }`}
                onClick={() => updateField('equipment', option.value)}
              >
                <CardContent className="p-3 text-center">
                  <div className="text-sm font-medium">{option.label}</div>
                  <div className="text-[11px] text-[var(--text-tertiary)]">{option.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
