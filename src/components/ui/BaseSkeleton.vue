<template>
  <div
    :class="[
      'animate-pulse bg-gray-300 rounded',
      {
        'h-2': variant === 'text-xs',
        'h-4': variant === 'text-sm',
        'h-6': variant === 'text-lg',
        'h-8': variant === 'text-xl',
        'h-12': variant === 'text-2xl',
        'h-64': variant === 'image',
        'rounded-full w-10 h-10': variant === 'avatar',
      },
    ]"
  />
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'text-xs' | 'text-sm' | 'text-lg' | 'text-xl' | 'text-2xl' | 'image' | 'avatar'
}>()
</script>
