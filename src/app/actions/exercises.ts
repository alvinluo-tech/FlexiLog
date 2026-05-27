'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createCustomExercise(data: {
  name: string
  muscle_group: string
  description?: string
  tips?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '未登录' }
  }

  const { data: exercise, error } = await supabase
    .from('exercises')
    .insert({
      name: data.name,
      muscle_group: data.muscle_group,
      description: data.description || null,
      tips: data.tips || null,
      is_custom: true,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/exercises')
  return { data: exercise }
}

export async function deleteCustomExercise(exerciseId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: '未登录' }
  }

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId)
    .eq('is_custom', true)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/exercises')
  return { success: true }
}
