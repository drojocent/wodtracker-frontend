import { ref } from 'vue'
import { defineStore } from 'pinia'
import benchmarkService from '@/services/benchmarkService'

export const useBenchmarkStore = defineStore('benchmark', () => {
  const benchmarks = ref([])
  const currentBenchmark = ref(null)
  const myResults = ref([])
  const isLoadingBenchmarks = ref(false)
  const isLoadingBenchmark = ref(false)
  const isSavingBenchmark = ref(false)
  const isDeletingBenchmark = ref(false)
  const isSubmittingResult = ref(false)
  const isLoadingMyResults = ref(false)

  function setBenchmarks(nextBenchmarks) {
    benchmarks.value = Array.isArray(nextBenchmarks) ? nextBenchmarks : []
  }

  function setCurrentBenchmark(nextBenchmark) {
    currentBenchmark.value = nextBenchmark || null
  }

  function setMyResults(nextResults) {
    myResults.value = Array.isArray(nextResults) ? nextResults : []
  }

  async function loadBenchmarks() {
    isLoadingBenchmarks.value = true

    try {
      const data = await benchmarkService.getAllBenchmarks()
      setBenchmarks(data)
      return data
    } finally {
      isLoadingBenchmarks.value = false
    }
  }

  async function loadBenchmarkById(id) {
    isLoadingBenchmark.value = true

    try {
      const data = await benchmarkService.getBenchmarkById(id)
      setCurrentBenchmark(data)
      return data
    } finally {
      isLoadingBenchmark.value = false
    }
  }

  async function saveBenchmark(payload, id = '') {
    isSavingBenchmark.value = true

    try {
      const data = id
        ? await benchmarkService.updateBenchmark(id, payload)
        : await benchmarkService.createBenchmark(payload)

      await loadBenchmarks()

      if (String(currentBenchmark.value?.id || '') === String(id || data?.id || '')) {
        setCurrentBenchmark(data)
      }

      return data
    } finally {
      isSavingBenchmark.value = false
    }
  }

  async function removeBenchmark(id) {
    isDeletingBenchmark.value = true

    try {
      const data = await benchmarkService.deleteBenchmark(id)
      await loadBenchmarks()

      if (String(currentBenchmark.value?.id || '') === String(id || '')) {
        setCurrentBenchmark(null)
        setMyResults([])
      }

      return data
    } finally {
      isDeletingBenchmark.value = false
    }
  }

  async function createResult(benchmarkId, payload) {
    isSubmittingResult.value = true

    try {
      const data = await benchmarkService.createResult(benchmarkId, payload)
      await loadMyResults(benchmarkId)
      return data
    } finally {
      isSubmittingResult.value = false
    }
  }

  async function loadMyResults(benchmarkId) {
    isLoadingMyResults.value = true

    try {
      const data = await benchmarkService.getMyResults(benchmarkId)
      setMyResults(data)
      return data
    } finally {
      isLoadingMyResults.value = false
    }
  }

  return {
    benchmarks,
    currentBenchmark,
    myResults,
    isLoadingBenchmarks,
    isLoadingBenchmark,
    isSavingBenchmark,
    isDeletingBenchmark,
    isSubmittingResult,
    isLoadingMyResults,
    setBenchmarks,
    setCurrentBenchmark,
    setMyResults,
    loadBenchmarks,
    loadBenchmarkById,
    saveBenchmark,
    removeBenchmark,
    createResult,
    loadMyResults,
  }
})
