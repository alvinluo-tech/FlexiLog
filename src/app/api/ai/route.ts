import { NextRequest, NextResponse } from 'next/server'
import { generateWorkoutPlan, analyzeWorkoutHistory } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    // Rate limiting
    if (!rateLimit(user.id, 20, 60000)) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 })
    }

    const body = await request.json()
    const { type, params } = body

    if (type === 'generate_plan') {
      // Get user profile for better recommendations
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      const planParams = {
        ...profile,
        ...params,
      }

      
      const plan = await generateWorkoutPlan(planParams);

      // Save the plan
      const { error: saveError } = await supabase.from('ai_plans').insert({
        user_id: user.id,
        plan_type: 'weekly',
        plan_data: plan,
      })

      if (saveError) {
        console.error('Failed to save plan:', saveError)
      }

      return NextResponse.json({ plan })
    }

    if (type === 'analyze_history') {
      const analysis = await analyzeWorkoutHistory(user.id)
      return NextResponse.json({ analysis })
    }

    return NextResponse.json({ error: '未知请求类型' }, { status: 400 })
  } catch (error: any) {
    console.error('AI API error:', error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'AI 服务暂时不可用' },
      { status: 500 }
    )
  }
}
