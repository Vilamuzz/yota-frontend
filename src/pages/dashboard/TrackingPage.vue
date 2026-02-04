<script setup lang="ts">
import AmbulanceMap from '@/components/molecules/AmbulanceMap.vue'
import { useAmbulanceTracking } from '@/composables/useAmbulanceTracking'
const { fetchOnlineAmbulances, refreshAmbulances } = useAmbulanceTracking()

// Fetch online ambulances independently
await fetchOnlineAmbulances()

// Or refresh the list
await refreshAmbulances()
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">🚑 Ambulance Tracking</h1>
          <router-link to="/dashboard" class="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Dashboard
          </router-link>
        </div>
      </div>
    </header>

    <!-- Map Container -->
    <main class="h-[calc(100vh-80px)]">
      <AmbulanceMap />
    </main>
  </div>
</template>
