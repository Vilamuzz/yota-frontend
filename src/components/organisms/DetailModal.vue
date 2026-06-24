<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'

defineProps<{
  show: boolean
  title: string
}>()

const emit = defineEmits(['close'])
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
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700"
        >
          <div class="text-left">
            <h2
              class="text-xl text-center font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-widest"
            >
              {{ title }}
            </h2>

            <div
              class="bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div class="p-5 space-y-4">
                <slot />
              </div>
            </div>

            <div class="mt-8 flex justify-center">
              <BaseButton
                variant="primary"
                size="md"
                class="px-10 rounded-xl"
                @click="emit('close')"
              >
                Tutup
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
