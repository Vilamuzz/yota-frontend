<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

interface Props {
  to?: RouteLocationRaw
  variant?: 'primary' | 'danger' | 'info' | 'success' | 'warning'
  title?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
  type: 'button',
})

const buttonClasses = computed(() => {
  const base = 'p-2 inline-flex items-center transition-all focus:outline-none rounded'
  const state = props.disabled ? 'opacity-50 cursor-not-allowed text-gray-300' : 'text-gray-400'

  if (props.disabled) {
    return `${base} ${state}`
  }

  const variants = {
    primary: 'hover:text-primary-300',
    danger: 'hover:text-red-500',
    info: 'hover:text-blue-500',
    success: 'hover:text-green-500',
    warning: 'hover:text-yellow-500',
  }

  return `${base} ${state} ${variants[props.variant]}`
})
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="buttonClasses" :title="title">
    <slot />
  </RouterLink>
  <button v-else :type="type" :disabled="disabled" :class="buttonClasses" :title="title">
    <slot />
  </button>
</template>
