interface SetLike {
  weight_kg: number
  reps: number
}

export function calculateSessionVolume(sets: SetLike[]): number {
  return sets.reduce((sum, set) => sum + (Number(set.weight_kg) || 0) * (set.reps || 0), 0)
}

export function calculateTotalVolume(sessions: { workout_sets?: SetLike[] }[]): number {
  return sessions.reduce((total, session) => total + calculateSessionVolume(session.workout_sets || []), 0)
}
