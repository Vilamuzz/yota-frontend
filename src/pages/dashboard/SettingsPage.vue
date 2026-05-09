<script setup lang="ts">
import { computed } from 'vue'
import { useCurrentUser } from '@/composables/account/useCurrentUser'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const { user, currentUserQuery } = useCurrentUser()
const error = computed(() => (currentUserQuery.error.value as any)?.message || '')
const loading = computed(() => currentUserQuery.isPending.value)
</script>

<template>
  <DashboardLayout>
    <template #title>Setting</template>

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
        @click="currentUserQuery.refetch()"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
      >
        Retry
      </button>
    </div>

    <!-- Success State -->
    <div v-else class="space-y-6">
      <!-- Welcome Card -->
      <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {{ user?.username }}! 👋
        </h2>
        <p class="text-gray-600">Here's what's happening with your account today.</p>
      </div>
    </div>
  </DashboardLayout>
</template>
