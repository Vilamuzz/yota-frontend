<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
</script>

<template>
  <DashboardLayout>
    <template #title>News</template>

    <div class="space-y-6">
      <!-- Page Header -->
      <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Latest News</h2>
        <p class="text-gray-600">Stay updated with the latest news and announcements</p>
      </div>

      <!-- News Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="i in 6"
          :key="i"
          class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-200"
        >
          <div class="h-48 bg-gradient-to-br from-indigo-400 to-purple-500"></div>
          <div class="p-6">
            <div class="text-xs text-gray-500 mb-2">{{ new Date().toLocaleDateString() }}</div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">News Article {{ i }}</h3>
            <p class="text-sm text-gray-600 mb-4">
              This is a brief description of the news article. Click to read more...
            </p>
            <button
              class="text-sm text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-150"
            >
              Read More →
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
