<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleRegister = () => {
  router.push('/register')
}

const handleLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
  >
    <div class="text-center px-4">
      <div class="mb-8">
        <h1 class="text-5xl font-bold text-gray-900 mb-4">Welcome to Yota</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Get started with your journey today. Join thousands of users already using our platform.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
        <button
          @click="handleRegister"
          class="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105 w-full sm:w-auto"
        >
          Register
        </button>
        <button
          @click="handleLogin"
          class="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg shadow-lg border-2 border-indigo-600 hover:bg-indigo-50 transition duration-300 transform hover:scale-105 w-full sm:w-auto"
        >
          Login
        </button>
      </div>

      <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        <div class="p-6 bg-white rounded-lg shadow-md">
          <div class="text-4xl mb-3">🚀</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Fast</h3>
          <p class="text-gray-600">Lightning-fast performance for the best user experience</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-md">
          <div class="text-4xl mb-3">🔒</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Secure</h3>
          <p class="text-gray-600">Your data is protected with top-tier security</p>
        </div>
        <div class="p-6 bg-white rounded-lg shadow-md">
          <div class="text-4xl mb-3">💡</div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Simple</h3>
          <p class="text-gray-600">Easy to use interface designed for everyone</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional custom styles here if needed */
</style>
