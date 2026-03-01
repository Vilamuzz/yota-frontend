<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOAuthCallback } from '@/composables/auth/useOAuthCallback'
import { CircleCheck, CircleX } from 'lucide-vue-next'

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
          <svg
            class="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4"
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
