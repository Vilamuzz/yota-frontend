<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Props {
  show: boolean
  title: string
  description?: string
  maxWidth?: string
}

withDefaults(defineProps<Props>(), {
  maxWidth: 'max-w-xl',
})

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="show"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full border border-gray-100 dark:border-gray-700 overflow-hidden"
          :class="maxWidth"
        >
          <!-- Header -->
          <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between">
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                {{ title }}
              </h3>
              <p v-if="description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {{ description }}
              </p>
            </div>
            <button
              @click="emit('close')"
              class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-6">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
            <slot name="footer" />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
