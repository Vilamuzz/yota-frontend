<script setup lang="ts">
import { ref } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'

const searchQuery = ref('')
const reports = [
  {
    id: 1,
    title: 'Laporan Donasi 1',
    description: 'Deskripsi laporan donasi 1',
    date: '2024-01-01',
  },
  {
    id: 2,
    title: 'Laporan Donasi 2',
    description: 'Deskripsi laporan donasi 2',
    date: '2024-02-01',
  },
]
</script>

<template>
  <PublicLayout>
    <BasePublicSearch v-model="searchQuery" />

    <div class="mx-auto mt-10 px-6 md:px-12 lg:px-24">
      <!-- Loading State -->
      <BaseLoading v-if="publishedDonationListQuery.isLoading.value" message="Memuat data..." />

      <!-- Error State -->
      <BaseAlert v-else-if="publishedDonationListQuery.isError.value" type="error">
        {{ publishedDonationListError || 'Gagal memuat data donasi.' }}
      </BaseAlert>

      <!-- Daftar Program Donasi -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2">
        <DonationCard v-for="donation in donations" :key="donation.id" :donation="donation" />

        <!-- Empty State -->
        <div v-if="donations.length === 0" class="col-span-2 text-center py-16 text-gray-400">
          Tidak ada program donasi aktif saat ini.
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
