export const EXERCISE_LABELS = {
  BACK_SQUAT: 'Back Squat',
  FRONT_SQUAT: 'Front Squat',
  DEADLIFT: 'Deadlift',
  BENCH_PRESS: 'Bench Press',
  STRICT_PRESS: 'Strict Press',
  PUSH_PRESS: 'Push Press',
  PUSH_JERK: 'Push Jerk',
  SPLIT_JERK: 'Split Jerk',
  CLEAN: 'Clean',
  SNATCH: 'Snatch',
  CLEAN_AND_JERK: 'Clean and Jerk',
  OVERHEAD_SQUAT: 'Overhead Squat',
}

export function getExerciseLabel(exercise) {
  return EXERCISE_LABELS[exercise] || exercise || 'Ejercicio'
}
