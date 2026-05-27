import { createClient } from '@/lib/supabase/server'
import ExercisesClient from './exercises-client'

export default async function ExercisesPage() {
  const supabase = await createClient()

  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .order('muscle_group')
    .order('name')

  return <ExercisesClient exercises={exercises || []} />
}
