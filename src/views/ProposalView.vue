<template>
  <div class="content-grid single-column">
    <div v-if="errorMessage" class="status-message error">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="status-message success">
      {{ successMessage }}
    </div>

    <ProposalForm :loading="wodStore.isSubmittingProposal" @submit="handleSubmitProposal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProposalForm from '@/components/ProposalForm.vue'
import { useWodStore } from '@/stores/wodStore'

const wodStore = useWodStore()
const errorMessage = ref('')
const successMessage = ref('')

async function handleSubmitProposal(payload) {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await wodStore.createProposal(payload)
    successMessage.value = 'Tu propuesta se ha enviado correctamente.'
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>
