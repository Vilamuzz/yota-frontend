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
    class="bg-white flex flex-col overflow-hidden rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 group"
  >
    <!-- Cover Image -->
    <div class="relative w-full aspect-[16/9] overflow-hidden flex-shrink-0">
      <img
        :src="donation.coverImage"
        :alt="donation.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <!-- Days remaining badge -->
      <div
        class="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-700 px-2.5 py-1 rounded-full shadow-sm"
      >
        {{ remainingDays }} hari lagi
      </div>
    </div>

    <!-- Card Body -->
    <div class="flex flex-col flex-1 p-5 gap-3 min-w-0">
      <!-- Title: clamp to 2 lines -->
      <h2
        class="text-sm font-bold text-gray-900 leading-snug line-clamp-2 min-h-[2.75rem]"
        :title="donation.title"
      >
        {{ donation.title }}
      </h2>

      <!-- Progress Bar -->
      <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-primary-400 rounded-full transition-all duration-500"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>

      <!-- Stats row -->
      <div class="flex items-end justify-between gap-2 min-w-0">
        <div class="min-w-0 flex-1">
          <p class="text-xs text-gray-400 mb-0.5">Target</p>
          <p
            class="text-sm font-bold text-primary-500 truncate"
            :title="formatCurrency(donation.fundTarget)"
          >
            {{ formatCurrency(donation.fundTarget) }}
          </p>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-xs text-gray-400 mb-0.5">Terkumpul</p>
          <p class="text-sm font-semibold text-gray-700">{{ Math.round(progressPercent) }}%</p>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
