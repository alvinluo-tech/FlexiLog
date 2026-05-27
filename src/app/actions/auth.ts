'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signIn(formData: FormData, redirectTo?: string) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo || '/dashboard')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // If user is created and has session (email confirmation disabled)
  if (data.user && data.session) {
    // Create user profile
    const { error: profileError } = await supabase.from('user_profiles').insert({
      id: data.user.id,
      gender: null,
      age: null,
      height_cm: null,
      weight_kg: null,
      body_fat_percentage: null,
      fitness_years: null,
      injuries: null,
      goal: null,
      training_days_per_week: null,
      session_duration_minutes: null,
      equipment: null,
    })
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
    }
    
    revalidatePath('/', 'layout')
    redirect('/dashboard')
  }
  
  // If email confirmation is required (no session)
  if (data.user && !data.session) {
    return { success: '请检查邮箱确认注册链接' }
  }

  // Fallback
  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function ensureUserProfile(userId: string) {
  const supabase = await createClient()
  
  // Check if profile exists
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .single()
  
  if (!existing) {
    // Create profile if it doesn't exist
    const { error } = await supabase.from('user_profiles').insert({
      id: userId,
      gender: null,
      age: null,
      height_cm: null,
      weight_kg: null,
      body_fat_percentage: null,
      fitness_years: null,
      injuries: null,
      goal: null,
      training_days_per_week: null,
      session_duration_minutes: null,
      equipment: null,
    })
    
    if (error) {
      console.error('ensureUserProfile error:', error)
    }
  }
}
