'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { User, Ruler, Weight, Target, Dumbbell, Save } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    gender: '',
    age: '',
    height: '',
    weight: '',
    bodyFat: '',
    fitnessYears: '',
    injuries: '',
    goal: '',
    trainingDays: '',
    sessionDuration: '',
    equipment: '',
  })

  const updateProfile = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">个人设置</h1>
        <Button>
          <Save className="h-4 w-4 mr-2" />
          保存
        </Button>
      </div>

      {/* Avatar Section */}
      <Card>
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">健身爱好者</h2>
            <p className="text-muted-foreground">FlexiLog 用户</p>
          </div>
        </CardContent>
      </Card>

      {/* Body Parameters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            身体参数
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">性别</Label>
              <Select value={profile.gender} onValueChange={(v) => updateProfile('gender', v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">年龄</Label>
              <Input
                id="age"
                type="number"
                placeholder="25"
                value={profile.age}
                onChange={(e) => updateProfile('age', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="height">身高 (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="175"
                value={profile.height}
                onChange={(e) => updateProfile('height', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">体重 (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="70"
                value={profile.weight}
                onChange={(e) => updateProfile('weight', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bodyFat">体脂率 (%)</Label>
              <Input
                id="bodyFat"
                type="number"
                placeholder="15"
                value={profile.bodyFat}
                onChange={(e) => updateProfile('bodyFat', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fitnessYears">健身年限</Label>
              <Input
                id="fitnessYears"
                type="number"
                placeholder="2"
                value={profile.fitnessYears}
                onChange={(e) => updateProfile('fitnessYears', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="injuries">伤病史</Label>
            <Input
              id="injuries"
              placeholder="例如：膝盖半月板损伤"
              value={profile.injuries}
              onChange={(e) => updateProfile('injuries', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Training Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            训练目标
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal">当前目标</Label>
            <Select value={profile.goal} onValueChange={(v) => updateProfile('goal', v ?? '')}>
              <SelectTrigger>
                <SelectValue placeholder="选择目标" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulk">增肌</SelectItem>
                <SelectItem value="cut">减脂</SelectItem>
                <SelectItem value="maintain">维持</SelectItem>
                <SelectItem value="strength">提高绝对力量</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="trainingDays">每周训练天数</Label>
              <Select value={profile.trainingDays} onValueChange={(v) => updateProfile('trainingDays', v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <SelectItem key={day} value={day.toString()}>{day} 天</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">单次时长</Label>
              <Select value={profile.sessionDuration} onValueChange={(v) => updateProfile('sessionDuration', v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 分钟</SelectItem>
                  <SelectItem value="45">45 分钟</SelectItem>
                  <SelectItem value="60">60 分钟</SelectItem>
                  <SelectItem value="90">90 分钟</SelectItem>
                  <SelectItem value="120">120 分钟</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5" />
            器械条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'full_gym', label: '商业健身房', desc: '器械齐全' },
              { value: 'dumbbells', label: '哑铃环境', desc: '哑铃为主' },
              { value: 'bodyweight', label: '居家自重', desc: '无器械' },
            ].map(option => (
              <Card
                key={option.value}
                className={`cursor-pointer transition-all ${
                  profile.equipment === option.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => updateProfile('equipment', option.value)}
              >
                <CardContent className="p-4 text-center">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
