<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()

const { registerMutation, resendVerificationMutation } = useAuth()
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const registeredEmail = ref('')

const handleRegister = async () => {
  error.value = ''
  success.value = false

  // Validation
  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return
  }

  loading.value = true

  try {
    const result = await registerMutation.mutateAsync({
      username: username.value,
      email: email.value,
      password: password.value,
    })

    // Show success message
    success.value = true
    registeredEmail.value = result.data?.email || email.value
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleResendVerification = async () => {
  error.value = ''
  loading.value = true

  try {
    await resendVerificationMutation.mutateAsync(registeredEmail.value)
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      'Failed to resend verification email. Please try again.'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4 py-12"
  >
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <!-- Success State -->
        <div v-if="success" class="text-center">
          <div class="text-green-500 text-5xl mb-4">✓</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <div
            class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4"
          >
            <p class="font-semibold mb-2">Please verify your email</p>
            <p>We've sent a verification link to:</p>
            <p class="font-mono text-xs mt-1">{{ registeredEmail }}</p>
          </div>
          <p class="text-gray-600 text-sm mb-6">
            Click the link in the email to activate your account. If you don't see it, check your
            spam folder.
          </p>
          <div class="space-y-3">
            <button
              @click="goToLogin"
              class="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition duration-200"
            >
              Go to Login
            </button>
            <button
              @click="handleResendVerification"
              class="w-full px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition duration-200"
            >
              Resend Verification Email
            </button>
          </div>
        </div>

        <!-- Registration Form -->
        <div v-else>
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p class="text-gray-600">Sign up to get started</p>
          </div>

          <form @submit.prevent="handleRegister" class="space-y-5">
            <div
              v-if="error"
              class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
            >
              {{ error }}
            </div>

            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                v-model="username"
                type="text"
                required
                autocomplete="username"
                placeholder="johndoe"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              />
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

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              />
              <p class="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              />
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="!loading">Create Account</span>
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
                Creating account...
              </span>
            </button>
          </form>

          <div class="mt-6 text-center">
            <p class="text-sm text-gray-600">
              Already have an account?
              <button
                @click="goToLogin"
                class="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-200"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional custom styles here if needed */
</style>
