<script setup lang="ts">
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-vue-next'
import { computed } from 'vue'

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: false,
})

const emit = defineEmits<{
  dismiss: []
}>()

const alertClasses = computed(() => {
  const base = 'px-4 py-3 rounded-lg text-sm border'

  const types = {
    success: 'bg-green-50 border-green-200 text-green-700',
    error: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  }

  return `${base} ${types[props.type]}`
})

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}
</script>

<template>
  <div :class="alertClasses" class="flex items-start justify-between gap-2">
    <div class="flex-1">
      <div v-if="title" class="flex items-center gap-2 font-semibold mb-1">
        <component :is="iconMap[type]" class="w-4 h-4 shrink-0" />
        <span>{{ title }}</span>
      </div>
      <slot />
    </div>

    <button
      v-if="dismissible"
      @click="emit('dismiss')"
      class="text-current hover:opacity-70 transition-opacity"
      aria-label="Dismiss"
    >
      ✕
    </button>
  </div>
</template>
