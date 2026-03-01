<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'

interface Props {
  show: boolean
  title: string
  message: string
  icon?: any
  primaryButtonText?: string
  secondaryButtonText?: string
  primaryButtonLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  primaryButtonText: 'Confirm',
  secondaryButtonText: 'Cancel',
  primaryButtonLoading: false,
})

const emit = defineEmits<{
  close: []
  primary: []
  secondary: []
}>()
</script>

<template>
  <!-- Modal Overlay -->
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
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="emit('close')"
    >
      <!-- Modal Content -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="show" class="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative">
          <!-- Modal Content -->
          <div class="text-center py-4">
            <!-- Icon -->
            <div v-if="icon" class="flex items-center justify-center mx-auto mb-4">
              <component :is="icon" :size="48" class="text-green-600" />
            </div>

            <!-- Title -->
            <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ title }}</h2>

            <!-- Message -->
            <p class="text-gray-600 text-sm mb-6">
              {{ message }}
            </p>

            <!-- Custom Content Slot -->
            <div v-if="$slots.default" class="mb-6">
              <slot />
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-row gap-3">
              <BaseButton
                v-if="secondaryButtonText"
                variant="outline"
                full-width
                @click="emit('secondary')"
              >
                {{ secondaryButtonText }}
              </BaseButton>

              <BaseButton
                variant="primary"
                full-width
                :loading="primaryButtonLoading"
                @click="emit('primary')"
              >
                <template #loading>Loading...</template>
                {{ primaryButtonText }}
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
