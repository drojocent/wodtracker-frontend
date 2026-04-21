<template>
  <section class="panel-card">
    <div class="card-header">
      <div>
        <p class="eyebrow">Progreso</p>
        <h2>Gráfica de evolución</h2>
      </div>
    </div>

    <div v-if="!normalizedPoints.length" class="muted-text">
      Necesitas al menos un resultado para ver la evolución.
    </div>

    <div v-else class="pr-chart-shell">
      <svg class="pr-chart" viewBox="0 0 360 200" role="img" aria-label="Evolución del peso">
        <line x1="36" y1="20" x2="36" y2="164" class="chart-axis" />
        <line x1="36" y1="164" x2="336" y2="164" class="chart-axis" />
        <polyline :points="polylinePoints" class="chart-line" />
        <circle
          v-for="point in normalizedPoints"
          :key="point.id"
          :cx="point.x"
          :cy="point.y"
          r="4"
          :class="['chart-dot', { 'chart-dot-pr': point.isPeak }]"
        />
        <text
          v-for="point in xAxisPoints"
          :key="`${point.id}-label`"
          :x="point.x"
          y="184"
          text-anchor="middle"
          class="chart-x-label"
        >
          {{ point.shortDate }}
        </text>
      </svg>

      <div class="pr-chart-labels">
        <span>{{ minLabel }}</span>
        <span>{{ maxLabel }}</span>
      </div>

      <div v-if="peakPoint" class="chart-highlight">
        <strong>Mejor marca:</strong> {{ formatWeight(peakPoint.weight) }}
        <span>{{ formatLongDate(peakPoint.createdAt) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  history: {
    type: Array,
    default: () => [],
  },
})

const normalizedPoints = computed(() => {
  const records = [...props.history]
    .map((item) => ({
      id: item?.id || `${item?.createdAt}-${item?.weight}`,
      weight: Number(item?.weight || 0),
      createdAt: item?.createdAt,
    }))
    .filter((item) => Number.isFinite(item.weight) && item.weight > 0 && item.createdAt)
    .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime())

  if (!records.length) {
    return []
  }

  const minWeight = Math.min(...records.map((item) => item.weight))
  const maxWeight = Math.max(...records.map((item) => item.weight))
  const safeRange = maxWeight - minWeight || 1
  const maxIndex = records.length - 1 || 1
  const peakRecordId = [...records]
    .sort((left, right) => {
      if (right.weight !== left.weight) {
        return right.weight - left.weight
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })[0]?.id

  return records.map((record, index) => ({
    ...record,
    x: 36 + (300 * index) / maxIndex,
    y: 164 - ((record.weight - minWeight) / safeRange) * 120,
    shortDate: formatShortDate(record.createdAt),
    isPeak: record.id === peakRecordId,
  }))
})

const polylinePoints = computed(() =>
  normalizedPoints.value.map((point) => `${point.x},${point.y}`).join(' '),
)

const xAxisPoints = computed(() => {
  if (normalizedPoints.value.length <= 3) {
    return normalizedPoints.value
  }

  return [
    normalizedPoints.value[0],
    normalizedPoints.value[Math.floor(normalizedPoints.value.length / 2)],
    normalizedPoints.value[normalizedPoints.value.length - 1],
  ]
})

const minLabel = computed(() => {
  if (!normalizedPoints.value.length) {
    return ''
  }

  return formatWeight(Math.min(...normalizedPoints.value.map((item) => item.weight)))
})

const maxLabel = computed(() => {
  if (!normalizedPoints.value.length) {
    return ''
  }

  return formatWeight(Math.max(...normalizedPoints.value.map((item) => item.weight)))
})

const peakPoint = computed(() => normalizedPoints.value.find((point) => point.isPeak) || null)

function formatWeight(value) {
  return `${new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)} kg`
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value))
}

function formatLongDate(value) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}
</script>

<style scoped>
.pr-chart-shell {
  display: grid;
  gap: 0.75rem;
}

.pr-chart {
  width: 100%;
  height: auto;
  overflow: visible;
}

.chart-axis {
  stroke: rgba(255, 255, 255, 0.24);
  stroke-width: 1.5;
}

.chart-line {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-dot {
  fill: #fff;
  stroke: var(--color-accent);
  stroke-width: 2;
}

.chart-dot-pr {
  fill: #ffd166;
  stroke: #fff2b3;
  stroke-width: 2.5;
}

.chart-x-label {
  fill: var(--color-text-muted);
  font-size: 10px;
}

.pr-chart-labels {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.chart-highlight {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  background: rgba(255, 209, 102, 0.12);
  border: 1px solid rgba(255, 209, 102, 0.22);
}
</style>
