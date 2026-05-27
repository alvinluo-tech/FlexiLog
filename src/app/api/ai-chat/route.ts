import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { message, conversationId, currentPlan } = body

    // Get user profile for context
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Validate conversation ownership - ensure it belongs to this user
    if (conversationId) {
      const { data: conversation } = await supabase
        .from('ai_conversations')
        .select('user_id')
        .eq('id', conversationId)
        .single()

      if (!conversation || conversation.user_id !== user.id) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      }
    }

    // Get conversation history
    const { data: history } = await supabase
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20)

    // Build context for AI
    const systemPrompt = `你是一个专业的健身教练AI助手。你的任务是帮助用户制定和调整训练计划。

用户信息：
- 性别: ${profile?.gender || '未知'}
- 年龄: ${profile?.age || '未知'}
- 身高: ${profile?.height_cm || '未知'}cm
- 体重: ${profile?.weight_kg || '未知'}kg
- 目标: ${profile?.goal || '增肌'}
- 健身年限: ${profile?.fitness_years || '未知'}年
- 每周训练: ${profile?.training_days_per_week || 5}天
- 器械: ${profile?.equipment || '商业健身房'}

${currentPlan ? '当前计划：\n' + JSON.stringify(currentPlan, null, 2) : ''}

你的回复应该：
1. 简洁专业
2. 如果用户要求修改计划，直接返回修改后的完整计划JSON
3. 如果是讨论性对话，给出专业建议
4. 使用中文回复

当需要返回计划时，使用以下JSON格式：
{
  "name": "计划名称",
  "description": "描述",
  "duration": "持续时间",
  "days": [
    {
      "day": "周一",
      "focus": "训练部位",
      "exercises": [
        {"name": "动作名", "sets": 3, "reps": "10", "weight_kg": 60, "rest": "90s"}
      ]
    }
  ]
}

注意：weight_kg 是推荐起始重量（kg），必须根据用户体重和健身年限给出合理建议。
重量建议原则：新手(1年以下): 体重的30-50%，中级(1-3年): 体重的50-80%，高级(3年以上): 体重的80-120%。`

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ]

    // Call MiMo API
    const apiKey = process.env.MIMO_API_KEY
    const baseUrl = process.env.MIMO_BASE_URL || 'https://token-plan-ams.xiaomimimo.com/v1'

    const response = await fetch(baseUrl + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model: 'mimo-v2.5-pro',
        messages,
        max_tokens: 4000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('MiMo API error:', error)
      return NextResponse.json({ error: 'AI service error' }, { status: 500 })
    }

    const data = await response.json()
    let aiContent = data.choices[0]?.message?.content || ''
    const reasoningContent = data.choices[0]?.message?.reasoning_content || ''

    // If content is empty, try reasoning_content
    if (!aiContent && reasoningContent) {
      aiContent = reasoningContent
    }

    if (!aiContent) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    // Check if response contains a plan (JSON)
    let extractedPlan = null
    const jsonMatch = aiContent.match(/\{[\s\S]*"days"[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const rawPlan = JSON.parse(jsonMatch[0])
        // Normalize: ensure exercises have weight_kg field
        if (rawPlan.days) {
          rawPlan.days = rawPlan.days.map((day: any) => ({
            ...day,
            exercises: (day.exercises || []).map((ex: any) => ({
              ...ex,
              weight_kg: ex.weight_kg ?? ex.weight ?? undefined,
            })),
          }))
        }
        extractedPlan = rawPlan
      } catch {}
    }

    // Save user message
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message,
    })

    // Save AI response
    await supabase.from('ai_messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: aiContent,
      metadata: extractedPlan ? { plan: extractedPlan } : {},
    })

    return NextResponse.json({ 
      content: aiContent,
      plan: extractedPlan,
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
