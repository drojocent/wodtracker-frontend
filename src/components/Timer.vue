<template>
  <div class="panel-card timer-card timer-shell">
    <div class="card-header">
      <div>
        <p class="eyebrow">Timer</p>
        <h2>{{ modeLabel }}</h2>
      </div>
      <span class="badge">{{ badgeText }}</span>
    </div>

    <div class="form-grid">
      <div class="field-group">
        <label for="timer-mode">Formato</label>
        <select id="timer-mode" v-model="mode">
          <option v-for="option in modeOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <template v-if="mode === 'FOR_TIME' || mode === 'AMRAP'">
        <div class="field-group">
          <label for="timer-duration">Tiempo (mm:ss)</label>
          <input
            id="timer-duration"
            v-model="timeInput"
            class="time-input"
            type="text"
            inputmode="numeric"
            placeholder="12:00"
          />
        </div>
      </template>

      <template v-else>
        <div class="timer-config-grid">
          <div class="field-group">
            <label for="emom-intervals">Número de intervalos</label>
            <input id="emom-intervals" v-model.number="emomIntervals" type="number" min="1" />
          </div>

          <div class="field-group">
            <label for="emom-interval-duration">Tiempo por intervalo (mm:ss)</label>
            <input
              id="emom-interval-duration"
              v-model="emomIntervalInput"
              class="time-input"
              type="text"
              inputmode="numeric"
              placeholder="01:00"
            />
          </div>

          <div class="field-group">
            <label for="emom-rest-duration">Descanso entre intervalos (mm:ss)</label>
            <input
              id="emom-rest-duration"
              v-model="emomRestInput"
              class="time-input"
              type="text"
              inputmode="numeric"
              placeholder="00:15"
            />
          </div>
        </div>
      </template>
    </div>

    <div class="timer-display">
      <div class="timer-main">
        <span class="timer-label">{{ primaryLabel }}</span>
        <strong>{{ formattedPrimaryTime }}</strong>
      </div>

      <div v-if="mode === 'EMOM'" class="timer-secondary">
        <div>
          <span class="timer-label">Estado</span>
          <strong>{{ emomPhaseLabel }}</strong>
        </div>
        <div>
          <span class="timer-label">Ronda</span>
          <strong>{{ currentIntervalDisplay }} / {{ emomIntervals }}</strong>
        </div>
      </div>

    </div>

    <div class="timer-actions">
      <button class="primary-button" type="button" :disabled="!canStart" @click="toggleTimer">
        {{ isRunning ? 'Pausar' : hasStarted ? 'Reanudar' : 'Iniciar' }}
      </button>
      <button class="secondary-button" type="button" @click="resetTimer">
        Reiniciar
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'

const modeOptions = [
  { value: 'FOR_TIME', label: 'For Time' },
  { value: 'AMRAP', label: 'AMRAP' },
  { value: 'EMOM', label: 'EMOM' },
]

const mode = ref('FOR_TIME')
const timeInput = ref('10:00')
const emomIntervals = ref(10)
const emomIntervalInput = ref('01:00')
const emomRestInput = ref('00:00')

const remainingSeconds = ref(0)
const completedIntervals = ref(0)
const isRunning = ref(false)
const hasStarted = ref(false)
const emomPhase = ref('work')
let intervalId = null

const configuredTimeInSeconds = computed(() => parseTimeInput(timeInput.value))
const configuredEmomIntervalSeconds = computed(() => parseTimeInput(emomIntervalInput.value))
const configuredEmomRestSeconds = computed(() => parseTimeInput(emomRestInput.value))

const formattedPrimaryTime = computed(() =>
  mode.value === 'EMOM'
    ? formatSeconds(remainingSeconds.value)
    : formatSeconds(remainingSeconds.value),
)
const modeLabel = computed(() => modeOptions.find((item) => item.value === mode.value)?.label || 'Timer')
const primaryLabel = computed(() =>
  mode.value === 'EMOM'
    ? emomPhase.value === 'rest'
      ? 'Tiempo de descanso'
      : 'Tiempo del intervalo'
    : 'Tiempo restante',
)
const badgeText = computed(() =>
  mode.value === 'EMOM'
    ? `Ronda ${currentIntervalDisplay.value}/${emomIntervals.value}`
    : formattedPrimaryTime.value,
)
const canStart = computed(() => {
  if (mode.value === 'EMOM') {
    return emomIntervals.value > 0 && configuredEmomIntervalSeconds.value > 0
  }

  return configuredTimeInSeconds.value > 0
})
const currentIntervalDisplay = computed(() =>
  Math.min(completedIntervals.value + 1, Math.max(emomIntervals.value, 1)),
)
const emomPhaseLabel = computed(() => (emomPhase.value === 'rest' ? 'Descanso' : 'Trabajo'))

function toggleTimer() {
  if (isRunning.value) {
    stopTimer()
    return
  }

  if (!hasStarted.value) {
    initializeTimer()
  }

  if (!canStart.value) {
    return
  }

  isRunning.value = true
  hasStarted.value = true
  intervalId = window.setInterval(() => {
    tick()
  }, 1000)
}

function stopTimer() {
  isRunning.value = false

  if (intervalId) {
    window.clearInterval(intervalId)
    intervalId = null
  }
}

function resetTimer() {
  stopTimer()
  hasStarted.value = false
  initializeTimer()
}

function initializeTimer() {
  if (mode.value === 'EMOM') {
    remainingSeconds.value = configuredEmomIntervalSeconds.value
    completedIntervals.value = 0
    emomPhase.value = 'work'
    return
  }

  remainingSeconds.value = configuredTimeInSeconds.value
  completedIntervals.value = 0
}

function tick() {
  if (remainingSeconds.value <= 0) {
    resetTimer()
    return
  }

  remainingSeconds.value -= 1

  if (mode.value === 'EMOM') {
    if (remainingSeconds.value <= 0) {
      handleEmomPhaseTransition()
    }
    return
  }

  if (remainingSeconds.value <= 0) {
    stopTimer()
  }
}

function handleEmomPhaseTransition() {
  if (emomPhase.value === 'work') {
    completedIntervals.value += 1

    if (completedIntervals.value >= emomIntervals.value) {
      stopTimer()
      remainingSeconds.value = 0
      return
    }

    if (configuredEmomRestSeconds.value > 0) {
      emomPhase.value = 'rest'
      remainingSeconds.value = configuredEmomRestSeconds.value
      return
    }

    emomPhase.value = 'work'
    remainingSeconds.value = configuredEmomIntervalSeconds.value
    return
  }

  emomPhase.value = 'work'
  remainingSeconds.value = configuredEmomIntervalSeconds.value
}

onBeforeUnmount(() => {
  stopTimer()
})

watch(
  [mode, timeInput, emomIntervals, emomIntervalInput, emomRestInput],
  () => {
    resetTimer()
  },
  { immediate: true },
)

function parseTimeInput(value) {
  const normalized = String(value || '').trim()

  if (!/^\d{1,3}:\d{2}$/.test(normalized)) {
    return 0
  }

  const [minutesPart, secondsPart] = normalized.split(':')
  const minutes = Number(minutesPart)
  const seconds = Number(secondsPart)

  if (Number.isNaN(minutes) || Number.isNaN(seconds) || seconds > 59) {
    return 0
  }

  return minutes * 60 + seconds
}

function formatSeconds(totalSeconds) {
  const safeSeconds = Math.max(totalSeconds, 0)
  const hours = Math.floor(safeSeconds / 3600)
  const minutes = Math.floor((safeSeconds % 3600) / 60)
  const seconds = safeSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}
</script>
