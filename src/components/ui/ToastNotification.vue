<script setup lang="ts">
import { useToast } from '@/composables/ui/useToast'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-vue-next'
import { Motion, AnimatePresence } from 'motion-v'

const { toasts, removeToast } = useToast()

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return CheckCircle
    case 'error':
      return AlertCircle
    case 'warning':
      return AlertTriangle
    default:
      return Info
  }
}

const getToastClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-white border-l-4 border-green-500 text-gray-800'
    case 'error':
      return 'bg-white border-l-4 border-red-500 text-gray-800'
    case 'warning':
      return 'bg-white border-l-4 border-yellow-500 text-gray-800'
    default:
      return 'bg-white border-l-4 border-blue-500 text-gray-800'
  }
}

const getIconClasses = (type: string) => {
  switch (type) {
    case 'success':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'warning':
      return 'text-yellow-500'
    default:
      return 'text-blue-500'
  }
}
</script>

<template>
  <div class="fixed bottom-6 right-6 z-100 flex flex-col gap-3 pointer-events-none">
    <AnimatePresence>
      <Motion
        v-for="toast in toasts"
        :key="toast.id"
        :initial="{ opacity: 0, x: 20 }"
        :animate="{ opacity: 1, x: 0 }"
        :exit="{ opacity: 0, x: 20, scale: 0.95 }"
        :transition="{ duration: 0.3 }"
        layout
        class="pointer-events-auto flex items-start gap-3 w-80 p-4 shadow-lg rounded-r-lg border border-y border-r border-gray-100"
        :class="getToastClasses(toast.type)"
      >
        <component
          :is="getIcon(toast.type)"
          :class="['shrink-0 w-5 h-5 mt-0.5', getIconClasses(toast.type)]"
        />
        <p class="flex-1 text-sm font-medium leading-relaxed font-sf-pro">{{ toast.message }}</p>
        <button
          @click="removeToast(toast.id)"
          class="shrink-0 text-gray-400 hover:text-gray-600 transition-colors bg-black/5 hover:bg-black/10 rounded-full p-1"
        >
          <X class="w-4 h-4" />
        </button>
      </Motion>
    </AnimatePresence>
  </div>
</template>
