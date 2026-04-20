<template>
  <section class="content-grid single-column">
    <div v-if="errorMessage" class="status-message error">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="status-message success">
      {{ successMessage }}
    </div>

    <section class="panel-card">
      <div class="card-header card-header-spaced">
        <div>
          <p class="eyebrow">Revisión</p>
          <h2>Propuestas pendientes</h2>
        </div>
      </div>

      <p v-if="wodStore.isLoadingProposals" class="muted-text">Cargando propuestas...</p>

      <div v-else-if="enrichedProposals.length" class="content-column">
        <ProposalReviewCard
          v-for="proposal in enrichedProposals"
          :key="getProposalId(proposal)"
          :proposal="proposal"
          :loading="wodStore.isModeratingProposal"
          @approve="handleModeration(proposal, 'approve')"
          @reject="handleModeration(proposal, 'reject')"
        />
      </div>

      <p v-else class="muted-text">No hay propuestas pendientes en este momento.</p>
    </section>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import ProposalReviewCard from '@/components/ProposalReviewCard.vue'
import userService from '@/services/userService'
import { useWodStore } from '@/stores/wodStore'

const wodStore = useWodStore()
const errorMessage = ref('')
const successMessage = ref('')
const authorsByUserId = ref({})

const enrichedProposals = computed(() =>
  wodStore.proposals.map((proposal) => ({
    ...proposal,
    authorName: authorsByUserId.value[proposal.userId] || proposal.authorName,
  })),
)

onMounted(async () => {
  try {
    await wodStore.loadPendingProposals()
    await hydrateProposalAuthors()
  } catch (error) {
    errorMessage.value = error.message
  }
})

async function handleModeration(proposal, action) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await wodStore.moderateProposal(getProposalId(proposal), action)
    successMessage.value =
      action === 'approve'
        ? 'La propuesta se ha aprobado correctamente.'
        : 'La propuesta se ha rechazado correctamente.'
  } catch (error) {
    errorMessage.value = error.message
  }
}

function getProposalId(proposal) {
  return proposal?.id || proposal?._id || proposal?.proposalId || ''
}

async function hydrateProposalAuthors() {
  const uniqueUserIds = [...new Set(wodStore.proposals.map((proposal) => proposal.userId).filter(Boolean))]

  await Promise.all(
    uniqueUserIds.map(async (userId) => {
      if (authorsByUserId.value[userId]) {
        return
      }

      try {
        const user = await userService.getUserById(userId)
        authorsByUserId.value = {
          ...authorsByUserId.value,
          [userId]: user?.name || user?.email || `Usuario #${userId}`,
        }
      } catch {
        authorsByUserId.value = {
          ...authorsByUserId.value,
          [userId]: `Usuario #${userId}`,
        }
      }
    }),
  )
}
</script>
