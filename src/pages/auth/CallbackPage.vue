<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOAuthCallback } from '@/composables/auth/useOAuthCallback'
import { CircleCheck, CircleX } from 'lucide-vue-next'
import { motion } from 'motion-v'

const route = useRoute()
const { handleOAuthCallback, callbackError, callbackLoading } = useOAuthCallback()

onMounted(() => {
  handleOAuthCallback(route.query.token as string | undefined)
})
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4"
  >
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <!-- Loading State -->
        <div v-if="callbackLoading" class="text-center">
          <div class="flex justify-center items-center mb-4">
            <motion.div
              class="spinner"
              :animate="{ transform: 'rotate(360deg)' }"
              :transition="{
                duration: 1.5,
                repeat: Infinity,
                ease: 'linear',
              }"
            />
          </div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Authenticating...</h2>
          <p class="text-gray-600">Please wait while we sign you in</p>
        </div>

        <!-- Success State -->
        <div v-else-if="!callbackError" class="text-center flex flex-col items-center">
          <CircleCheck :stroke-width="1.5" :size="48" class="text-green-500 text-5xl mb-4" />
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
          <p class="text-gray-600 text-sm">Redirecting to dashboard...</p>
        </div>

        <!-- Error State -->
        <div v-else class="text-center flex flex-col items-center">
          <CircleX :stroke-width="1.5" :size="48" class="text-red-500 text-5xl mb-4" />
          <h2 class="text-xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
          <p class="text-gray-600 text-sm mb-6">{{ callbackError }}</p>
          <p class="text-gray-600 text-sm">Redirecting to login...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 4px solid #e5e7eb;
  border-top-color: #0e733b;
  will-change: transform;
}
</style>
