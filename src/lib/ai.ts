import { createClient } from '@/lib/supabase/server'

interface MiMoResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

interface WorkoutPlanRequest {
  gender?: string
  age?: number
  height_cm?: number
  weight_kg?: number
  body_fat_percentage?: number
  fitness_years?: number
  injuries?: string
  goal?: string
  training_days_per_week?: number
  session_duration_minutes?: number
  equipment?: string
}

interface WorkoutPlan {
  name: string
  description: string
  duration: string
  days: {
    day: string
    focus: string
    exercises: {
      name: string
      sets: number
      reps: string
      rest: string
    }[]
  }[]
}

export async function generateWorkoutPlan(params: WorkoutPlanRequest): Promise<WorkoutPlan> {
  const apiKey = process.env.MIMO_API_KEY
  const baseUrl = process.env.MIMO_BASE_URL || 'https://token-plan-ams.xiaomimimo.com/v1'

  const prompt = `你是一个专业的健身教练。根据以下用户参数生成一个个性化的训练计划。

用户参数：
- 性别: ${params.gender || '未知'}
- 年龄: ${params.age || '未知'}
- 身高: ${params.height_cm || '未知'}cm
- 体重: ${params.weight_kg || '未知'}kg
- 体脂率: ${params.body_fat_percentage || '未知'}%
- 健身年限: ${params.fitness_years || '未知'}年
- 伤病史: ${params.injuries || '无'}
- 目标: ${params.goal || '增肌'}
- 每周训练天数: ${params.training_days_per_week || 5}天
- 单次训练时长: ${params.session_duration_minutes || 60}分钟
- 器械条件: ${params.equipment || '商业健身房'}

请生成一个JSON格式的训练计划，包含：
1. 计划名称 (name)
2. 计划描述 (description)
3. 持续时间 (duration)
4. 每天的训练内容 (days)，每天包含：
   - day: 星期几
   - focus: 训练重点
   - exercises: 动作列表，每个动作包含 name, sets, reps, rest

只返回JSON，不要其他文字。`

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'MiMo-v2.5-Pro',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的健身教练，擅长制定个性化训练计划。请用JSON格式回复。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    throw new Error(`MiMo API error: ${response.status}`)
  }

  const data: MiMoResponse = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content in MiMo response')
  }

  // Parse JSON from response (handle markdown code blocks)
  let jsonStr = content
  if (content.includes('```json')) {
    jsonStr = content.split('```json')[1].split('```')[0].trim()
  } else if (content.includes('```')) {
    jsonStr = content.split('```')[1].split('```')[0].trim()
  }

  return JSON.parse(jsonStr) as WorkoutPlan
}

export async function analyzeWorkoutHistory(userId: string): Promise<string> {
  const supabase = await createClient()
  const apiKey = process.env.MIMO_API_KEY
  const baseUrl = process.env.MIMO_BASE_URL || 'https://token-plan-ams.xiaomimimo.com/v1'

  // Get recent workouts
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select(`
      id,
      started_at,
      ended_at,
      workout_sets (
        exercise_id,
        weight_kg,
        reps,
        rpe,
        exercises (name, muscle_group)
      )
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(10)

  if (!sessions || sessions.length === 0) {
    return '暂无训练数据，请先记录一些训练。'
  }

  const workoutSummary = sessions.map(s => {
    const sets = s.workout_sets || []
    const exercises = [...new Set(sets.map(set => (set.exercises as any)?.name).filter(Boolean))]
    const totalVolume = sets.reduce((sum, set) => sum + (Number(set.weight_kg) || 0) * (set.reps || 0), 0)
    return {
      date: s.started_at?.split('T')[0],
      exercises,
      totalSets: sets.length,
      totalVolume,
    }
  })

  const prompt = `分析以下训练历史数据，给出训练建议：

训练记录：
${JSON.stringify(workoutSummary, null, 2)}

请分析：
1. 训练频率是否合理
2. 各部位训练是否均衡
3. 训练容量趋势
4. 是否存在过度训练或训练不足
5. 具体改进建议

用简洁的中文回答，不超过200字。`

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'MiMo-v2.5-Pro',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的健身数据分析教练。请简洁地分析训练数据并给出建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    throw new Error(`MiMo API error: ${response.status}`)
  }

  const data: MiMoResponse = await response.json()
  return data.choices[0]?.message?.content || '无法生成分析'
}
