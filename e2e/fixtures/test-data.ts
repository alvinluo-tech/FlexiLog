export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'test@example.com',
  password: process.env.TEST_USER_PASSWORD || 'test-password-123',
}

export const TEST_WORKOUT = {
  title: 'E2E Test Workout',
  exercises: [
    { name: 'Bench Press', sets: 3, reps: 10, weight: 60 },
    { name: 'Squat', sets: 3, reps: 8, weight: 80 },
  ],
}

export const TEST_AI_MESSAGE = '帮我制定一个增肌训练计划'
