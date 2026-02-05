<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { user, fetchCurrentUser, logout } = useAuth()
const error = ref('')
const loading = ref(false)

// Fetch current user data
const getUserData = async () => {
  loading.value = true
  error.value = ''

  const result = await fetchCurrentUser()

  if (result.isError) {
    error.value = result.error?.message || 'Failed to fetch user data'
  }

  loading.value = false
}

const handleLogout = async () => {
  await logout()
}

// Fetch user data on component mount
onMounted(() => {
  getUserData()
})
</script>

<template>
  <div class="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
    <nav class="bg-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-indigo-600">Yota Dashboard</h1>
          </div>
          <div class="flex items-center">
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <svg
          class="animate-spin h-12 w-12 text-indigo-600"
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
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg"
      >
        <h2 class="text-lg font-semibold mb-2">Error loading user data</h2>
        <p>{{ error }}</p>
        <button
          @click="getUserData"
          class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
        >
          Retry
        </button>
      </div>

      <!-- Success State -->
      <div v-else class="space-y-6">
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Welcome, {{ user?.username }}! 👋</h2>
          <div class="space-y-2">
            <p class="text-gray-600"><span class="font-semibold">Email:</span> {{ user?.email }}</p>
            <p class="text-gray-600"><span class="font-semibold">User ID:</span> {{ user?.id }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="text-4xl mb-3">📊</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
            <p class="text-gray-600">View your statistics and insights</p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="text-4xl mb-3">⚙️</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Settings</h3>
            <p class="text-gray-600">Manage your account preferences</p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <div class="text-4xl mb-3">📝</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Activity</h3>
            <p class="text-gray-600">Track your recent activity</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
