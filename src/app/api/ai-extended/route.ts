import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { type, params } = body

    const apiKey = process.env.MIMO_API_KEY
    const baseUrl = process.env.MIMO_BASE_URL || 'https://token-plan-ams.xiaomimimo.com/v1'

    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get recent workouts
    const { data: recentSessions } = await supabase
      .from('workout_sessions')
      .select('*, workout_sets (*, exercises (name, muscle_group))')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false })
      .limit(5)

    let systemPrompt = ''
    let userPrompt = ''

    if (type === 'exercise_recommendation') {
      const { targetMuscle, equipment, experience } = params || {}
      
      systemPrompt = `你是一个专业的健身教练。根据用户的需求推荐合适的动作。
返回JSON格式：
{
  "recommendations": [
    {
      "name": "动作名称",
      "muscle_group": "目标肌群",
      "description": "动作描述",
      "tips": "训练要点",
      "sets": "推荐组数",
      "reps": "推荐次数",
      "difficulty": "难度(初级/中级/高级)"
    }
  ]
}`

      userPrompt = `用户信息：
- 健身年限: ${profile?.fitness_years || '未知'}年
- 器械条件: ${profile?.equipment || '商业健身房'}
- 目标肌群: ${targetMuscle || '未指定'}

最近训练记录:
${JSON.stringify(recentSessions?.slice(0, 3).map(s => ({
  date: s.started_at?.split('T')[0],
  exercises: [...new Set((s.workout_sets || []).map((set: any) => set.exercises?.name).filter(Boolean))]
})), null, 2)}

请推荐3-5个适合的动作，考虑用户的训练历史避免重复。`

    } else if (type === 'recovery_advice') {
      systemPrompt = `你是一个专业的运动恢复专家。根据用户的训练情况给出恢复建议。
返回JSON格式：
{
  "status": "恢复状态评估",
  "risk_level": "低/中/高",
  "recommendations": [
    {
      "category": "类别(休息/营养/拉伸/睡眠)",
      "advice": "具体建议",
      "priority": "优先级(高/中/低)"
    }
  ],
  "next_workout": "下次训练建议"
}`

      const workoutSummary = recentSessions?.map(s => {
        const sets = s.workout_sets || []
        const volume = sets.reduce((sum: number, set: any) => sum + (Number(set.weight_kg) || 0) * (set.reps || 0), 0)
        return {
          date: s.started_at?.split('T')[0],
          exercises: [...new Set(sets.map((set: any) => set.exercises?.name).filter(Boolean))],
          volume,
          setCount: sets.length,
        }
      }) || []

      userPrompt = `用户信息：
- 年龄: ${profile?.age || '未知'}
- 伤病史: ${profile?.injuries || '无'}

最近训练记录:
${JSON.stringify(workoutSummary, null, 2)}

请分析训练负荷，评估恢复状态，给出具体的恢复建议。`

    } else {
      return NextResponse.json({ error: 'Unknown type' }, { status: 400 })
    }

    // Call MiMo API
    const response = await fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: 'mimo-v2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error('MiMo API error: ' + response.status)
    }

    const data = await response.json()
    let content = data.choices[0]?.message?.content || ''
    const reasoning = data.choices[0]?.message?.reasoning_content || ''

    if (!content && reasoning) content = reasoning
    if (!content) throw new Error('No AI response')

    // Extract JSON
    let result = null
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]) } catch {}
    }

    return NextResponse.json({ result, raw: content })
  } catch (error: any) {
    console.error('AI Extended error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
