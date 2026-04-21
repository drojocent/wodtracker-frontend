import { ref } from 'vue'
import { defineStore } from 'pinia'
import prService from '@/services/prService'

export const usePrStore = defineStore('pr', () => {
  const exercises = ref([])
  const currentExercise = ref('')
  const currentPr = ref(null)
  const history = ref([])
  const isLoadingExercises = ref(false)
  const isLoadingCurrentPr = ref(false)
  const isLoadingHistory = ref(false)
  const isSubmittingPr = ref(false)

  function setExercises(nextExercises) {
    exercises.value = Array.isArray(nextExercises) ? nextExercises : []
  }

  function setCurrentExercise(nextExercise) {
    currentExercise.value = nextExercise || ''
  }

  function setCurrentPr(nextPr) {
    currentPr.value = nextPr || null
  }

  function setHistory(nextHistory) {
    history.value = Array.isArray(nextHistory) ? nextHistory : []
  }

  async function loadExercises() {
    isLoadingExercises.value = true

    try {
      const data = await prService.getExercises()
      setExercises(data)
      return data
    } finally {
      isLoadingExercises.value = false
    }
  }

  async function loadCurrentPr(exercise) {
    isLoadingCurrentPr.value = true

    try {
      setCurrentExercise(exercise)
      const data = await prService.getCurrentPr(exercise)
      setCurrentPr(data)
      return data
    } finally {
      isLoadingCurrentPr.value = false
    }
  }

  async function loadHistory(exercise) {
    isLoadingHistory.value = true

    try {
      setCurrentExercise(exercise)
      const data = await prService.getHistory(exercise)
      setHistory(data)
      return data
    } finally {
      isLoadingHistory.value = false
    }
  }

  async function createPr(exercise, payload) {
    isSubmittingPr.value = true

    try {
      const data = await prService.createPr(exercise, payload)
      await Promise.allSettled([loadCurrentPr(exercise), loadHistory(exercise)])
      return data
    } finally {
      isSubmittingPr.value = false
    }
  }

  return {
    exercises,
    currentExercise,
    currentPr,
    history,
    isLoadingExercises,
    isLoadingCurrentPr,
    isLoadingHistory,
    isSubmittingPr,
    setExercises,
    setCurrentExercise,
    setCurrentPr,
    setHistory,
    loadExercises,
    loadCurrentPr,
    loadHistory,
    createPr,
  }
})
