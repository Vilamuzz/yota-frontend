<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseSkeleton from '@/components/atoms/BaseSkeleton.vue'
import { Share2, Flag, Heart, ArrowLeft } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePublishedDonationDetail } from '@/composables/donation/usePublishedDonationDetail'
import { formatCurrency } from '@/utils/format'

const route = useRoute()
const donationSlug = computed(() => route.params.slug as string)

const { publishedDonationDetailQuery, publishedDonationDetailError } =
  usePublishedDonationDetail(donationSlug)

const program = computed(() => {
  const d = publishedDonationDetailQuery.data.value?.data
  if (!d) return null

  return {
    title: d.title,
    slug: d.slug,
    description: d.description,
    image: d.image_url,
    collected: d.collected_fund,
    target: d.fund_target,
    endDate: d.date_end,
  }
})

const prays = [
  {
    name: 'Andi Kurniawan',
    message: 'Semoga program ini sukses dan banyak anak yang terbantu!',
    date: '2024-06-01',
  },
  {
    name: 'Siti Aminah',
    message: 'Saya ikut berdonasi, semoga bisa memberikan manfaat besar.',
    date: '2024-06-02',
  },
  {
    name: 'Budi Santoso',
    message: 'Terima kasih sudah menginisiasi program yang luar biasa ini!',
    date: '2024-06-03',
  },
]

const remainingDays = computed(() => {
  const endDate = program.value?.endDate
  if (!endDate) return 0

  const endTime = new Date(endDate).getTime()
  if (Number.isNaN(endTime)) return 0

  const diffMs = endTime - Date.now()
  const dayMs = 1000 * 60 * 60 * 24
  return Math.max(0, Math.ceil(diffMs / dayMs))
})

const progressPercent = computed(() => {
  const collected = program.value?.collected ?? 0
  const target = program.value?.target ?? 0
  if (!target || target <= 0) return 0
  return Math.min((collected / target) * 100, 100)
})

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((word) => word?.[0]?.toUpperCase() ?? '')
    .join('')

const aminCounts = ref<Record<number, number>>(Object.fromEntries(prays.map((_, i) => [i, 0])))
const aminPublished = ref<Record<number, boolean>>(
  Object.fromEntries(prays.map((_, i) => [i, false])),
)

const toggleAmin = (index: number) => {
  if (aminPublished.value[index]) {
    aminCounts.value[index] = (aminCounts.value[index] ?? 0) - 1
    aminPublished.value[index] = false
  } else {
    aminCounts.value[index] = (aminCounts.value[index] ?? 0) + 1
    aminPublished.value[index] = true
  }
}

const handleShare = () => {
  const shareTitle = program.value?.title ?? 'Donasi'
  if (navigator.share) {
    navigator.share({ title: shareTitle, url: window.location.href })
  } else {
    navigator.clipboard.writeText(window.location.href)
  }
}
</script>

<template>
  <!-- Loading State -->
  <template v-if="publishedDonationDetailQuery.isLoading.value">
    <!-- Skeleton Hero Image -->
    <div class="w-full overflow-hidden">
      <BaseSkeleton variant="image" class="h-[60vh] w-full rounded-none" />
    </div>

    <!-- Skeleton Content -->
    <div class="px-6 md:px-12 lg:px-24 py-8 space-y-6">
      <!-- Title Skeleton -->
      <div class="space-y-3">
        <BaseSkeleton variant="text-2xl" class="w-3/4" />
        <BaseSkeleton variant="text-sm" class="w-1/2" />
      </div>

      <!-- Collected Fund Skeleton -->
      <div class="space-y-2">
        <BaseSkeleton variant="text-sm" class="w-24" />
        <BaseSkeleton variant="text-xl" class="w-40" />
      </div>

      <!-- Target & Remaining Days Skeleton -->
      <div class="flex justify-between">
        <div class="space-y-2">
          <BaseSkeleton variant="text-sm" class="w-20" />
          <BaseSkeleton variant="text-lg" class="w-32" />
        </div>
        <div class="space-y-2 text-right">
          <BaseSkeleton variant="text-sm" class="w-20 ml-auto" />
          <BaseSkeleton variant="text-lg" class="w-16 ml-auto" />
        </div>
      </div>

      <!-- Progress Bar Skeleton -->
      <BaseSkeleton class="h-2.5 w-full rounded-full" />

      <!-- Buttons Skeleton -->
      <div class="flex gap-3 pt-2">
        <BaseSkeleton class="h-10 w-32 rounded-lg" />
        <BaseSkeleton class="h-10 flex-1 rounded-lg" />
      </div>

      <!-- Description Skeleton -->
      <div class="mt-8 pt-6 border-t border-gray-200 space-y-3">
        <BaseSkeleton variant="text-lg" class="w-48" />
        <BaseSkeleton variant="text-sm" class="w-full" />
        <BaseSkeleton variant="text-sm" class="w-full" />
        <BaseSkeleton variant="text-sm" class="w-3/4" />
      </div>

      <!-- Comments Skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div
          v-for="i in 2"
          :key="i"
          class="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-3 flex-1">
              <BaseSkeleton variant="avatar" class="shrink-0" />
              <div class="space-y-2 flex-1">
                <BaseSkeleton variant="text-sm" class="w-32" />
                <BaseSkeleton variant="text-xs" class="w-24" />
              </div>
            </div>
            <BaseSkeleton class="w-4 h-4 rounded" />
          </div>
          <BaseSkeleton variant="text-sm" class="w-full" />
          <BaseSkeleton variant="text-xs" class="w-40" />
        </div>
      </div>
    </div>
  </template>

  <!-- Error State -->
  <div
    v-else-if="publishedDonationDetailQuery.isError.value"
    class="flex items-center justify-center min-h-screen text-red-500 text-center px-6"
  >
    {{ publishedDonationDetailError || 'Gagal memuat detail donasi.' }}
  </div>

  <!-- Content State -->
  <template v-else-if="program">
    <!-- Hero Image -->
    <div class="w-full overflow-hidden">
      <button class="absolute top-4 left-4 z-10" @click="$router.back()">
        <ArrowLeft :size="36" class="text-white" />
      </button>
      <img
        :src="program.image"
        :alt="program.title"
        class="w-full h-[60vh] object-cover object-center"
      />
    </div>

    <!-- Content -->
    <div class="px-6 md:px-12 lg:px-24 py-8 space-y-4">
      <!-- Title -->
      <h1 class="text-2xl font-bold text-gray-900 leading-snug">{{ program.title }}</h1>

      <!-- Collected Fund -->
      <div>
        <p class="text-sm text-gray-500">Terkumpul</p>
        <p class="text-xl font-bold text-primary-400">{{ formatCurrency(program.collected) }}</p>
      </div>

      <!-- Target & Remaining Days -->
      <div class="flex justify-between items-end">
        <div>
          <p class="text-sm text-gray-500">Target</p>
          <p class="font-semibold text-gray-700">{{ formatCurrency(program.target) }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">Sisa Hari</p>
          <p class="font-bold text-gray-900">{{ remainingDays }}</p>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-primary-400 rounded-full transition-all duration-500"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-2">
        <BaseButton variant="outline" size="lg" @click="handleShare">
          <Share2 :size="16" class="mr-2" />
          Bagikan
        </BaseButton>
        <BaseButton
          variant="primary"
          size="lg"
          class="flex-1"
          @click="$router.push(`/donation/${program.slug}/form`)"
        >
          Donasi Sekarang
        </BaseButton>
      </div>

      <!-- Description -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <h2 class="text-lg font-bold text-gray-800 mb-3">Tentang Program</h2>
        <p
          v-for="(paragraph, index) in program.description.trim().split('\n\n')"
          :key="index"
          class="text-gray-600 leading-relaxed mb-4 last:mb-0"
        >
          {{ paragraph }}
        </p>
      </div>

      <!-- Prays(Comments) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        <div
          v-for="(pray, index) in prays"
          :key="index"
          class="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col gap-3"
        >
          <!-- Top: Avatar + Name/Date + Report -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3">
              <!-- Initials Avatar -->
              <div
                class="w-9 h-9 rounded-full bg-primary-400 text-white flex items-center justify-center text-sm font-bold shrink-0"
              >
                {{ getInitials(pray.name) }}
              </div>
              <!-- Name & Date -->
              <div>
                <h3 class="font-semibold text-gray-800 leading-tight">{{ pray.name }}</h3>
                <span class="text-xs text-gray-400">{{ pray.date }}</span>
              </div>
            </div>
            <!-- Report Button -->
            <button
              class="text-gray-400 hover:text-red-500 transition-colors duration-200 shrink-0 mt-0.5"
              title="Laporkan"
            >
              <Flag :size="15" />
            </button>
          </div>

          <!-- Message -->
          <p class="text-gray-600 text-sm leading-relaxed pl-12">{{ pray.message }}</p>

          <!-- Bottom Actions -->
          <div class="flex items-center gap-4 pl-12">
            <button
              class="flex items-center gap-1.5 text-xs transition-colors duration-200"
              :class="
                aminPublished[index]
                  ? 'text-primary-400 font-semibold'
                  : 'text-gray-400 hover:text-primary-400'
              "
              @click="toggleAmin(index)"
            >
              <Heart :size="14" :fill="aminPublished[index] ? 'currentColor' : 'none'" />
              <span>Amin{{ (aminCounts[index] ?? 0) > 0 ? ` · ${aminCounts[index]}` : '' }}</span>
            </button>
            <button
              class="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-400 transition-colors duration-200"
            >
              <Share2 :size="14" />
              <span>Bagikan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>

  <!-- No Data State -->
  <div v-else class="flex items-center justify-center min-h-screen text-gray-500 text-center px-6">
    Data donasi tidak ditemukan.
  </div>
</template>
