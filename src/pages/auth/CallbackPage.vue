<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { fetchCurrentUser } = useAuth()
const error = ref('')
const loading = ref(true)

onMounted(async () => {
  try {
    // Get token from URL query parameters
    const token = route.query.token as string

    if (token) {
      // Save token
      authStore.setToken(token)

      // Fetch user data using the token
      const result = await fetchCurrentUser()

      if (result.success) {
        // Redirect to dashboard
        await router.push('/dashboard')
      } else {
        error.value = result.message || 'Failed to fetch user data'
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } else {
      error.value = 'Authentication failed. No token received.'
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  } catch (err: any) {
    error.value = err.message || 'Authentication failed'
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100"
  >
    <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <div v-if="loading" class="text-center">
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

      <div v-else-if="error" class="text-center">
        <div class="text-red-500 text-5xl mb-4">⚠️</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Authentication Failed</h2>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <p class="text-gray-600 text-sm">Redirecting to login...</p>
      </div>

      <div v-else class="text-center">
        <div class="text-green-500 text-5xl mb-4">✓</div>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
        <p class="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  </div>
</template>
