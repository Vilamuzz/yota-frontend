<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const router = useRouter()
const route = useRoute()

const transactionId = route.params.id as string

const isLoading = computed(() => false)

const handleSubmit = () => {
  // TODO: Implement edit functionality
  router.push('/dashboard/income/donation-transactions')
}

const handleCancel = () => {
  router.back()
}
</script>

<template>
  <DashboardLayout>
    <div class="container mx-auto py-8">
      <h1 class="text-3xl font-bold mb-6">Edit Donation Transaction</h1>

      <div class="bg-white rounded-lg shadow p-6">
        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <p class="text-gray-600">Transaction ID: {{ transactionId }}</p>
          </div>

          <div class="flex gap-4">
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              :disabled="isLoading"
            >
              Save Changes
            </button>
            <button
              type="button"
              class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              @click="handleCancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>
