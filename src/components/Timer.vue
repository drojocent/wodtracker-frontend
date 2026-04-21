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
        <div class="timer-duration-control">
          <span class="timer-duration-label">Tiempo</span>
          <div class="timer-duration-grid">
            <div class="field-group">
              <label for="timer-duration-minutes">Minutos</label>
              <input
                id="timer-duration-minutes"
                v-model.number="durationMinutes"
                class="time-input"
                type="number"
                min="0"
                max="999"
                inputmode="numeric"
              />
            </div>
            <div class="field-group">
              <label for="timer-duration-seconds">Segundos</label>
              <input
                id="timer-duration-seconds"
                v-model.number="durationSeconds"
                class="time-input"
                type="number"
                min="0"
                max="59"
                @input="limitSecondsInput($event, 'duration')"
                inputmode="numeric"
              />
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="timer-config-grid">
          <div class="field-group">
            <label for="emom-intervals">Número de intervalos</label>
            <input id="emom-intervals" v-model.number="emomIntervals" type="number" min="1" />
          </div>

          <div class="timer-duration-control">
            <span class="timer-duration-label">Tiempo por intervalo</span>
            <div class="timer-duration-grid">
              <div class="field-group">
                <label for="emom-interval-minutes">Minutos</label>
                <input
                  id="emom-interval-minutes"
                  v-model.number="emomIntervalMinutes"
                  class="time-input"
                  type="number"
                  min="0"
                  max="999"
                  inputmode="numeric"
                />
              </div>
              <div class="field-group">
                <label for="emom-interval-seconds">Segundos</label>
                <input
                  id="emom-interval-seconds"
                  v-model.number="emomIntervalSeconds"
                  class="time-input"
                  type="number"
                  min="0"
                  max="59"
                  @input="limitSecondsInput($event, 'emomInterval')"
                  inputmode="numeric"
                />
              </div>
            </div>
          </div>

          <div class="timer-duration-control">
            <span class="timer-duration-label">Descanso entre intervalos</span>
            <div class="timer-duration-grid">
              <div class="field-group">
                <label for="emom-rest-minutes">Minutos</label>
                <input
                  id="emom-rest-minutes"
                  v-model.number="emomRestMinutes"
                  class="time-input"
                  type="number"
                  min="0"
                  max="999"
                  inputmode="numeric"
                />
              </div>
              <div class="field-group">
                <label for="emom-rest-seconds">Segundos</label>
                <input
                  id="emom-rest-seconds"
                  v-model.number="emomRestSeconds"
                  class="time-input"
                  type="number"
                  min="0"
                  max="59"
                  @input="limitSecondsInput($event, 'emomRest')"
                  inputmode="numeric"
                />
              </div>
            </div>
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

    <div
      v-if="isFinished"
      class="timer-finished"
      role="alert"
      aria-live="assertive"
    >
      <div class="timer-finished-panel">
        <p class="eyebrow">Timer</p>
        <h2>Tiempo terminado</h2>
        <p>{{ finishedMessage }}</p>
        <button class="primary-button" type="button" @click="resetTimer">
          Aceptar
        </button>
      </div>
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
const durationMinutes = ref(10)
const durationSeconds = ref(0)
const emomIntervals = ref(10)
const emomIntervalMinutes = ref(1)
const emomIntervalSeconds = ref(0)
const emomRestMinutes = ref(0)
const emomRestSeconds = ref(0)

const remainingSeconds = ref(0)
const completedIntervals = ref(0)
const isRunning = ref(false)
const hasStarted = ref(false)
const isFinished = ref(false)
const emomPhase = ref('work')
let intervalId = null

const configuredTimeInSeconds = computed(() => timePartsToSeconds(durationMinutes.value, durationSeconds.value))
const configuredEmomIntervalSeconds = computed(() =>
  timePartsToSeconds(emomIntervalMinutes.value, emomIntervalSeconds.value),
)
const configuredEmomRestSeconds = computed(() => timePartsToSeconds(emomRestMinutes.value, emomRestSeconds.value))

const formattedPrimaryTime = computed(() => formatSeconds(remainingSeconds.value))
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
const finishedMessage = computed(() =>
  mode.value === 'EMOM'
    ? 'Has completado todos los intervalos.'
    : 'El tiempo del entrenamiento ha terminado.',
)

function toggleTimer() {
  if (isRunning.value) {
    stopTimer()
    return
  }

  if (!hasStarted.value) {
    isFinished.value = false
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
  isFinished.value = false
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
    finishTimer()
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
    finishTimer()
  }
}

function handleEmomPhaseTransition() {
  if (emomPhase.value === 'work') {
    completedIntervals.value += 1

    if (completedIntervals.value >= emomIntervals.value) {
      remainingSeconds.value = 0
      finishTimer()
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
  [
    mode,
    durationMinutes,
    durationSeconds,
    emomIntervals,
    emomIntervalMinutes,
    emomIntervalSeconds,
    emomRestMinutes,
    emomRestSeconds,
  ],
  () => {
    resetTimer()
  },
  { immediate: true },
)

function finishTimer() {
  if (isFinished.value) {
    return
  }

  stopTimer()
  hasStarted.value = false
  isFinished.value = true
  playFinishSound()
}

function playFinishSound() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext

  if (!AudioContextConstructor) {
    return
  }

  try {
    const audioContext = new AudioContextConstructor()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    const now = audioContext.currentTime

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, now)
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.28, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(now)
    oscillator.stop(now + 0.6)
  } catch {
    // Some browsers block audio even after interaction; the visual alert still works.
  }
}

function timePartsToSeconds(minutesValue, secondsValue) {
  const minutes = normalizeNumber(minutesValue, 0, 999)
  const seconds = normalizeNumber(secondsValue, 0, 59)
  return minutes * 60 + seconds
}

function normalizeNumber(value, min, max) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return min
  }

  return Math.min(Math.max(Math.trunc(numberValue), min), max)
}

function limitSecondsInput(event, field) {
  const digits = String(event.target.value || '').replace(/\D/g, '').slice(0, 2)
  const seconds = digits === '' ? 0 : Number(digits)
  event.target.value = digits

  if (field === 'duration') {
    durationSeconds.value = seconds
    return
  }

  if (field === 'emomInterval') {
    emomIntervalSeconds.value = seconds
    return
  }

  emomRestSeconds.value = seconds
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
