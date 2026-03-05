<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'
import { Share2, Flag, Heart, ArrowLeft } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePublishedDonationDetail } from '@/composables/donation/usePublishedDonationDetail'

const route = useRoute()
const donationSlug = route.params.slug as string
const { publishedDonationDetailQuery, publishedDonationDetailError } =
  usePublishedDonationDetail(donationSlug)
const program = ref({
  title: '',
  slug: '',
  description: '',
  image: '',
  collected: 0,
  target: 0,
  endDate: '',
})

watch(
  () => publishedDonationDetailQuery.data.value,
  (data) => {
    if (data?.data) {
      const d = data.data
      program.value = {
        title: d.title,
        slug: d.slug,
        description: d.description,
        image: d.image_url,
        collected: d.collected_fund,
        target: d.fund_target,
        endDate: d.date_end,
      }
    }
  },
)

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

const formatFund = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

const remainingDays = Math.max(
  0,
  Math.ceil(
    (new Date(program.value.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  ),
)

const progressPercent = Math.min((program.value.collected / program.value.target) * 100, 100)

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
  if (navigator.share) {
    navigator.share({ title: program.value.title, url: window.location.href })
  } else {
    navigator.clipboard.writeText(window.location.href)
  }
}
</script>

<template>
  <!-- Error State -->
  <div
    v-if="publishedDonationDetailQuery.isError.value"
    class="flex items-center justify-center min-h-screen text-red-500 text-center px-6"
  >
    {{ publishedDonationDetailError || 'Gagal memuat detail donasi.' }}
  </div>

  <template v-else>
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
        <p class="text-xl font-bold text-primary-400">{{ formatFund(program.collected) }}</p>
      </div>

      <!-- Target & Remaining Days -->
      <div class="flex justify-between items-end">
        <div>
          <p class="text-sm text-gray-500">Target</p>
          <p class="font-semibold text-gray-700">{{ formatFund(program.target) }}</p>
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
</template>
