<script setup lang="ts">
import { useCurrentUser } from '@/composables/account/useCurrentUser'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const { user } = useCurrentUser()
</script>

<template>
  <DashboardLayout>
    <template #title>Dashboard</template>

    <div class="space-y-6">
      <!-- Welcome Card -->
      <div
        class="bg-white rounded-xl shadow-md p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
      >
        <h2 class="text-3xl font-bold text-gray-900 mb-2 dark:text-white">
          Welcome back, {{ user?.username }}! 👋
        </h2>
        <p class="text-gray-600 dark:text-gray-400">
          Here's what's happening with your account today.
        </p>
      </div>
    </div>
  </DashboardLayout>
</template>
