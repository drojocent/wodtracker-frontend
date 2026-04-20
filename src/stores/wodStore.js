import { ref } from 'vue'
import { defineStore } from 'pinia'
import proposalService from '@/services/proposalService'
import resultService from '@/services/resultService'
import wodService from '@/services/wodService'

export const useWodStore = defineStore('wod', () => {
  const todayWod = ref(null)
  const allWods = ref([])
  const proposals = ref([])
  const isLoadingTodayWod = ref(false)
  const isLoadingAllWods = ref(false)
  const isSubmittingResult = ref(false)
  const isSubmittingProposal = ref(false)
  const isSavingWod = ref(false)
  const isDeletingWod = ref(false)
  const isLoadingProposals = ref(false)
  const isModeratingProposal = ref(false)

  function setTodayWod(wod) {
    todayWod.value = wod
  }

  function setProposals(nextProposals) {
    proposals.value = Array.isArray(nextProposals) ? nextProposals : []
  }

  function setAllWods(nextWods) {
    allWods.value = Array.isArray(nextWods) ? nextWods : []
  }

  async function loadTodayWod() {
    isLoadingTodayWod.value = true

    try {
      const data = await wodService.getTodayWod()
      setTodayWod(data)
      return data
    } finally {
      isLoadingTodayWod.value = false
    }
  }

  async function createResult(payload) {
    isSubmittingResult.value = true

    try {
      return await resultService.createResult(payload)
    } finally {
      isSubmittingResult.value = false
    }
  }

  async function updateResult(id, payload) {
    isSubmittingResult.value = true

    try {
      return await resultService.updateResult(id, payload)
    } finally {
      isSubmittingResult.value = false
    }
  }

  async function createProposal(payload) {
    isSubmittingProposal.value = true

    try {
      return await proposalService.createProposal(payload)
    } finally {
      isSubmittingProposal.value = false
    }
  }

  async function loadAllWods() {
    isLoadingAllWods.value = true

    try {
      const data = await wodService.getAllWods()
      setAllWods(data)
      return data
    } finally {
      isLoadingAllWods.value = false
    }
  }

  async function saveWod(payload, id = '') {
    isSavingWod.value = true

    try {
      const data = id
        ? await wodService.updateWod(id, payload)
        : await wodService.createWod(payload)

      await loadAllWods()
      return data
    } finally {
      isSavingWod.value = false
    }
  }

  async function removeWod(id) {
    isDeletingWod.value = true

    try {
      const data = await wodService.deleteWod(id)
      await loadAllWods()
      return data
    } finally {
      isDeletingWod.value = false
    }
  }

  async function loadPendingProposals() {
    isLoadingProposals.value = true

    try {
      const data = await proposalService.getPendingProposals()
      setProposals(data)
      return data
    } finally {
      isLoadingProposals.value = false
    }
  }

  async function moderateProposal(id, action) {
    isModeratingProposal.value = true

    try {
      const data =
        action === 'approve'
          ? await proposalService.approveProposal(id)
          : await proposalService.rejectProposal(id)

      proposals.value = proposals.value.filter((proposal) => getEntityId(proposal) !== id)
      return data
    } finally {
      isModeratingProposal.value = false
    }
  }

  return {
    todayWod,
    allWods,
    proposals,
    isLoadingTodayWod,
    isLoadingAllWods,
    isSubmittingResult,
    isSubmittingProposal,
    isSavingWod,
    isDeletingWod,
    isLoadingProposals,
    isModeratingProposal,
    setTodayWod,
    setAllWods,
    setProposals,
    loadTodayWod,
    createResult,
    updateResult,
    createProposal,
    loadAllWods,
    saveWod,
    removeWod,
    loadPendingProposals,
    moderateProposal,
  }
})

function getEntityId(entity) {
  return entity?.id || entity?._id || entity?.proposalId || entity?.wodId || ''
}
