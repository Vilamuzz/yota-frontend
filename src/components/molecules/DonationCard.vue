<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { formatCurrency } from '@/utils/format'
import type { DonationProgram } from '@/types/donationProgram'

const props = defineProps<{
  donation: DonationProgram
}>()

const progressPercent = computed(() => {
  if (!props.donation.fundTarget || props.donation.fundTarget === 0) return 0
  return Math.min(100, (props.donation.collectedFund / props.donation.fundTarget) * 100)
})

const remainingDays = computed(() =>
  Math.max(
    0,
    Math.ceil(
      (new Date(props.donation.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    ),
  ),
)
</script>

<template>
  <RouterLink
    :to="{ name: 'donation-program-detail', params: { slug: donation.slug } }"
    class="bg-white overflow-hidden flex space-x-6 flex-row p-8 border-gray-200 border-b-2 hover:bg-gray-50 transition-colors"
  >
    <img
      :src="donation.coverImage"
      :alt="donation.title"
      class="w-1/2 h-auto rounded-xl object-cover"
    />
    <div class="w-1/2 space-y-4">
      <h2 class="text-lg font-bold text-gray-900">{{ donation.title }}</h2>

      <!-- Progress Bar -->
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-primary-400 rounded-full transition-all duration-500"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>

      <div class="flex flex-row justify-between">
        <div>
          <p class="text-sm text-gray-500">Target</p>
          <span class="font-semibold text-primary-500">{{
            formatCurrency(donation.fundTarget)
          }}</span>
        </div>
        <div>
          <p class="text-sm text-gray-500">Sisa Hari</p>
          <span class="font-bold">{{ remainingDays }}</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
