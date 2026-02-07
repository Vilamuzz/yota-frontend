<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { forgetPasswordMutation } = useAuth()

const email = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref('')

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  if (!email.value) {
    error.value = 'Please enter your email address'
    return
  }

  isLoading.value = true

  try {
    const result = await forgetPasswordMutation.mutateAsync(email.value)
    success.value = result.message || 'Password reset link has been sent to your email'
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || 'Failed to send reset link. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4"
  >
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
          <p class="text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div
            v-if="error"
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
          >
            {{ error }}
          </div>

          <div
            v-if="success"
            class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
          >
            {{ success }}
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            />
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isLoading">Send Reset Link</span>
            <span v-else class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              Sending...
            </span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <button
            @click="goToLogin"
            class="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition duration-200"
          >
            ← Back to login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional custom styles here if needed */
</style>
