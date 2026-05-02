<script setup lang="ts">
import { motion } from 'motion-v'

interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Loading...',
})
</script>

<template>
  <div class="flex justify-center items-center py-20 px-10 min-h-[50vh]">
    <div class="flex flex-col items-center gap-6">
      <motion.div
        class="w-12.5 h-12.5 rounded-full border-[5px] border-gray-100 border-t-primary-300 will-change-transform"
        :animate="{ rotate: 360 }"
        :transition="{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }"
      />
      <p v-if="message" class="text-lg font-medium text-gray-600 dark:text-gray-300 animate-pulse">
        {{ message }}
      </p>
    </div>
  </div>
</template>
