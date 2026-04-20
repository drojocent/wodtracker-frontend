<template>
  <form class="panel-card stacked-form" @submit.prevent="submitForm">
    <div class="card-header">
      <div>
        <p class="eyebrow">Perfil</p>
        <h2>Actualizar datos</h2>
      </div>
    </div>

    <div class="form-grid two-columns">
      <div class="field-group">
        <label for="profile-name">Nombre</label>
        <input id="profile-name" v-model="form.name" type="text" required />
      </div>

      <div class="field-group">
        <label for="profile-email">Email</label>
        <input id="profile-email" v-model="form.email" type="email" disabled />
      </div>

      <div class="field-group">
        <label for="profile-weight">Peso (kg)</label>
        <input id="profile-weight" v-model="form.weight" type="number" min="0" step="0.1" />
      </div>

      <div class="field-group">
        <label for="profile-height">Altura (cm)</label>
        <input id="profile-height" v-model="form.height" type="number" min="0" />
      </div>
    </div>

    <button class="primary-button align-start" type="submit" :disabled="loading">
      {{ loading ? 'Guardando...' : 'Guardar cambios' }}
    </button>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  profile: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit'])

const form = reactive({
  name: '',
  email: '',
  weight: '',
  height: '',
})

watch(
  () => props.profile,
  (profile) => {
    form.name = profile?.name || profile?.fullName || ''
    form.email = profile?.email || ''
    form.weight = profile?.weight ?? ''
    form.height = profile?.height ?? ''
  },
  { immediate: true },
)

function submitForm() {
  emit('submit', {
    name: form.name,
    weight: form.weight,
    height: form.height,
  })
}
</script>
