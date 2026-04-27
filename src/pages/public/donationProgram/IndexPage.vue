<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import BaseLoading from '@/components/atoms/BaseLoading.vue'
import BaseAlert from '@/components/atoms/BaseAlert.vue'
import DonationCard from '@/components/molecules/DonationCard.vue'
import { computed, ref } from 'vue'
import { usePublishedDonationProgramList } from '@/composables/donationProgram/usePublishedDonationProgramList'

const searchQuery = ref('')

const params = computed(() => ({
  search: searchQuery.value || undefined,
}))

const { publishedDonationListQuery, publishedDonationPrograms } = usePublishedDonationProgramList(params)
</script>

<template>
  <PublicLayout>
    <BasePublicSearch v-model="searchQuery" />

    <div class="mx-auto mt-10 px-6 md:px-12 lg:px-24">
      <!-- Loading State -->
      <BaseLoading v-if="publishedDonationListQuery.isLoading.value" message="Memuat data..." />

      <!-- Error State -->
      <BaseAlert v-else-if="publishedDonationListQuery.isError.value" type="error">
        {{ publishedDonationListQuery.error.value?.message || 'Gagal memuat data donasi.' }}
      </BaseAlert>

      <!-- Daftar Program Donasi -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2">
        <DonationCard v-for="donation in publishedDonationPrograms" :key="donation.id" :donation="donation" />

        <!-- Empty State -->
        <div v-if="publishedDonationPrograms.length === 0" class="col-span-2 text-center py-16 text-gray-400">
          Tidak ada program donasi aktif saat ini.
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
