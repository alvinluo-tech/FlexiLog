import { createClient } from '@/lib/supabase/server'
import { AI_REQUEST_TIMEOUT_MS, AI_MAX_TOKENS, AI_TEMPERATURE, AI_MODEL_NAME } from '@/lib/constants'
import { calculateSessionVolume } from '@/lib/volume-utils'

interface MiMoResponse {
  choices: {
    message: {
      content: string
      reasoning_content?: string
    }
    finish_reason: string
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
      weight_kg?: number
      rest: string
    }[]
  }[]
}

export async function generateWorkoutPlan(params: WorkoutPlanRequest): Promise<WorkoutPlan> {
  const apiKey = process.env.MIMO_API_KEY
  const baseUrl = process.env.MIMO_BASE_URL || 'https://token-plan-ams.xiaomimimo.com/v1'

  if (!apiKey) {
    throw new Error('MIMO_API_KEY not configured')
  }

  const prompt = `生成一个训练计划，严格按JSON格式返回，不要有其他文字。

用户信息：
- 性别: ${params.gender || '未知'}
- 年龄: ${params.age || '未知'}岁
- 体重: ${params.weight_kg || '未知'}kg
- 目标: ${params.goal || '增肌'}
- 每周${params.training_days_per_week || 5}天，每次${params.session_duration_minutes || 60}分钟
- 器械: ${params.equipment || '商业健身房'}
- 健身年限: ${params.fitness_years || 1}年

要求：
1. plan_name: 计划名称
2. plan_desc: 简短描述
3. plan_duration: 持续时间
4. training_days: 数组，每天包含day(周一到周日)、focus(训练部位)、exercises数组
5. 每个exercise包含：
   - name: 中文动作名
   - sets: 组数
   - reps: 次数范围（如"8-12"）
   - weight_kg: 推荐起始重量（kg），根据用户体重和健身年限给出合理建议
   - rest: 组间休息秒数（纯数字，如90）

重量建议原则：
- 新手(1年以下): 体重的30-50%
- 中级(1-3年): 体重的50-80%
- 高级(3年以上): 体重的80-120%
- 根据不同动作调整（深蹲/硬拉>卧推>肩推>弯举）

直接返回JSON，不要markdown代码块。`

  
  const response = await fetch(baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    signal: AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      model: AI_MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: '你是健身教练，只返回JSON格式的训练计划，不要有任何其他文字。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: AI_MAX_TOKENS,
      temperature: AI_TEMPERATURE,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    console.error('MiMo API error:', response.status, errorBody)
    throw new Error('MiMo API error: ' + response.status)
  }

  const data: MiMoResponse = await response.json()
  
  // Try to get content from multiple sources
  let content = data.choices[0]?.message?.content || ''
  const reasoningContent = data.choices[0]?.message?.reasoning_content || ''
  const finishReason = data.choices[0]?.finish_reason || ''

  // If content is empty but reasoning has content, try to extract JSON from reasoning
  if (!content && reasoningContent) {
    // Try to find JSON in reasoning content
    const jsonMatch = reasoningContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      content = jsonMatch[0]
    }
  }

  if (!content) {
    throw new Error('No content in MiMo response')
  }

  // Parse JSON from response
  let jsonStr = content.trim()
  
  // Remove markdown code blocks if present
  if (jsonStr.includes('```json')) {
    jsonStr = jsonStr.split('```json')[1].split('```')[0].trim()
  } else if (jsonStr.includes('```')) {
    jsonStr = jsonStr.split('```')[1].split('```')[0].trim()
  }

  try {
    const parsed = JSON.parse(jsonStr)
    
    // Normalize the response to match our interface
    const plan: WorkoutPlan = {
      name: parsed.name || parsed.plan_name || '训练计划',
      description: parsed.description || parsed.plan_desc || '个性化训练计划',
      duration: parsed.duration || parsed.plan_duration || '4周',
      days: (parsed.days || parsed.training_days || []).map((day: DayPlan) => ({
        day: day.day || '',
        focus: day.focus || '',
        exercises: (day.exercises || []).map((ex: ExercisePlan) => ({
          name: ex.name || '',
          sets: ex.sets || 3,
          reps: String(ex.reps || '10'),
          weight_kg: ex.weight_kg ?? ex.weight ?? ex.weight_ref ?? undefined,
          rest: ex.rest || '90s',
        })),
      })),
    }
    
    return plan
  } catch (parseError) {
    console.error('JSON parse error:', parseError)
    console.error('Raw content:', jsonStr)
    throw new Error('Failed to parse AI response as JSON')
  }
}

export async function analyzeWorkoutHistory(userId: string): Promise<string> {
  const supabase = await createClient()
  const apiKey = process.env.MIMO_API_KEY
  const baseUrl = process.env.MIMO_BASE_URL || 'https://token-plan-ams.xiaomimimo.com/v1'

  if (!apiKey) {
    throw new Error('MIMO_API_KEY not configured')
  }

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const workoutSummary = sessions.map((s: any) => {
    const sets = s.workout_sets || []
    const exerciseNames = [...new Set(sets.map((set: Record<string, any>) => set.exercises?.name).filter(Boolean))]
    const totalVolume = calculateSessionVolume(sets)
    return {
      date: s.started_at?.split('T')[0],
      exercises: exerciseNames,
      totalSets: sets.length,
      totalVolume,
    }
  })

  const prompt = '分析以下训练数据并给出建议：\n' + JSON.stringify(workoutSummary, null, 2) + '\n\n请简洁分析（不超过150字）：1.训练频率 2.容量趋势 3.改进建议'

  const response = await fetch(baseUrl + '/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    signal: AbortSignal.timeout(AI_REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      model: AI_MODEL_NAME,
      messages: [
        {
          role: 'system',
          content: '你是健身数据分析教练，简洁分析训练数据。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: AI_TEMPERATURE,
    }),
  })

  if (!response.ok) {
    throw new Error('MiMo API error: ' + response.status)
  }

  const data: MiMoResponse = await response.json()
  const content = data.choices[0]?.message?.content || data.choices[0]?.message?.reasoning_content || '无法生成分析'
  return content
}
