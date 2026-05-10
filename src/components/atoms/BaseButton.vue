<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'

interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'white'
  size?: 'sm' | 'md' | 'lg'
  to?: RouteLocationRaw
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
  type: 'button',
})

const buttonClasses = computed(() => {
  const base =
    'font-sf-pro rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center'

  const variants = {
    primary: 'bg-primary-300 text-white hover:bg-primary-400 focus:ring-primary-300',
    secondary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    danger: 'bg-danger-500 text-white hover:bg-red-700 focus:ring-red-500',
    white: 'bg-white text-primary-300 hover:bg-gray-300',
    outline: 'bg-white text-gray-600 hover:bg-gray-300',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const width = props.fullWidth ? 'w-full' : ''

  return `${base} ${variants[props.variant]} ${sizes[props.size]} ${width}`
})
</script>

<template>
  <router-link v-if="to" :to="to" :class="buttonClasses"> <slot /></router-link>
  <button v-else :type="type" :disabled="disabled || loading" :class="buttonClasses">
    <span v-if="loading" class="flex items-center justify-center">
      <svg
        class="animate-spin -ml-1 mr-2 h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <slot name="loading" />
    </span>
    <slot v-else />
  </button>
</template>
