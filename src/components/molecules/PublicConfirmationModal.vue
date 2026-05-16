<script setup lang="ts">
import type { Component } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

interface Props {
  show: boolean
  title: string
  message: string
  icon?: Component
  primaryButtonText?: string
  secondaryButtonText?: string
  dangerButtonText?: string
  primaryButtonLoading?: boolean
  dangerButtonLoading?: boolean
}

withDefaults(defineProps<Props>(), {
  secondaryButtonText: 'Cancel',
  dangerButtonLoading: false,
  primaryButtonLoading: false,
})

const emit = defineEmits<{
  close: []
  primary: []
  secondary: []
  danger: []
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
        <div
          v-if="show"
          class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden font-poppins"
        >
          <!-- Background Decoration -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full -mr-16 -mt-16 opacity-50" />
          
          <!-- Modal Content -->
          <div class="relative text-center py-2">
            <!-- Icon -->
            <div v-if="icon" class="flex items-center justify-center mx-auto mb-6">
              <div class="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center text-primary-500">
                <component :is="icon" :size="40" />
              </div>
            </div>

            <!-- Title -->
            <h2 class="text-2xl font-bold text-gray-900 mb-3">{{ title }}</h2>

            <!-- Message -->
            <p
              class="text-gray-500 text-sm mb-8 whitespace-pre-line text-center leading-relaxed"
            >
              {{ message }}
            </p>

            <!-- Custom Content Slot -->
            <div v-if="$slots.default" class="mb-8">
              <slot />
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-3">
              <BaseButton
                v-if="primaryButtonText"
                variant="primary"
                full-width
                size="lg"
                :loading="primaryButtonLoading"
                @click="emit('primary')"
              >
                {{ primaryButtonText }}
              </BaseButton>

              <BaseButton
                v-if="dangerButtonText"
                variant="danger"
                full-width
                size="lg"
                :loading="dangerButtonLoading"
                @click="emit('danger')"
              >
                {{ dangerButtonText }}
              </BaseButton>

              <BaseButton
                v-if="secondaryButtonText"
                variant="ghost"
                full-width
                size="lg"
                class="text-gray-400 hover:text-gray-600"
                @click="emit('secondary')"
              >
                {{ secondaryButtonText }}
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
