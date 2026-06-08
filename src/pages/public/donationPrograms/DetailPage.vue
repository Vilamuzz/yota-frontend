<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import PublicConfirmationModal from '@/components/molecules/PublicConfirmationModal.vue'
import { Share2, Flag, Heart, ArrowLeft } from 'lucide-vue-next'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useDonationProgramDetail } from '@/composables/donationProgram/useDonationProgramDetail'
import { usePrayerList } from '@/composables/prayer/usePrayerList'
import { usePrayerAmen } from '@/composables/prayer/usePrayerAmen'
import { usePrayerReport } from '@/composables/prayer/usePrayerReport'
import { formatCurrency, formatDate } from '@/utils/format'
import { DonationProgramStatusEnum } from '@/types/donationProgram'
const route = useRoute()
const donationSlug = computed(() => route.params.slug as string)

const { detailQuery } = useDonationProgramDetail(donationSlug)

const { listQuery, prayers } = usePrayerList(donationSlug, { limit: 6 })

const { createMutation: amenMutation } = usePrayerAmen()
const { createMutation: reportMutation } = usePrayerReport()

const showReportModal = ref(false)
const reportPrayerId = ref<string>('')

const program = computed(() => {
  const d = detailQuery.data.value?.data
  if (!d) return null

  return {
    title: d.title,
    slug: d.slug,
    description: d.description,
    image: d.coverImage,
    collected: d.collectedFund,
    target: d.fundTarget,
    endDate: d.endDate,
    category: d.category,
    status: d.status,
  }
})

const prays = computed(() => {
  return prayers.value.map((pray) => ({
    id: pray.id,
    name: pray.username,
    message: pray.content,
    amenCount: pray.amenCount ?? (pray as any).amen_count,
    isAmen: pray.isAmen ?? (pray as any).is_amen,
    date: formatDate(pray.createdAt ?? (pray as any).created_at),
  }))
})

type PrayerView = {
  id: string
  name: string
  message: string
  amenCount: number
  isAmen: boolean
  date: string
}

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

// Local overrides so initial state comes from API, then user can toggle amen/disamen.
const amenStateOverrides = ref<Record<string, boolean>>({})
const amenCountOverrides = ref<Record<string, number>>({})

const isPrayerAmened = (pray: PrayerView) => {
  const overridden = amenStateOverrides.value[pray.id]
  return overridden ?? pray.isAmen
}

const getPrayerAmenCount = (pray: PrayerView) => {
  const overridden = amenCountOverrides.value[pray.id]
  return overridden ?? pray.amenCount
}

const handleAmenPrayer = async (pray: PrayerView) => {
  const previousState = isPrayerAmened(pray)
  const previousCount = getPrayerAmenCount(pray)

  const nextState = !previousState
  const nextCount = nextState ? previousCount + 1 : Math.max(0, previousCount - 1)

  amenStateOverrides.value[pray.id] = nextState
  amenCountOverrides.value[pray.id] = nextCount

  try {
    await amenMutation.mutateAsync(pray.id)
  } catch {
    amenStateOverrides.value[pray.id] = previousState
    amenCountOverrides.value[pray.id] = previousCount
  }
}

const openReportModal = (prayerId: string) => {
  reportPrayerId.value = prayerId
  showReportModal.value = true
}

const closeReportModal = () => {
  showReportModal.value = false
  reportPrayerId.value = ''
}

const handleReportPrayer = async () => {
  await reportMutation.mutateAsync({
    prayerID: reportPrayerId.value,
  })
  closeReportModal()
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
  <template v-if="detailQuery.isLoading.value">
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
    v-else-if="detailQuery.isError.value"
    class="flex items-center justify-center min-h-screen text-red-500 text-center px-6"
  >
    {{ detailQuery.error.value?.message || 'Gagal memuat detail donasi.' }}
  </div>

  <!-- Content State -->
  <template v-else-if="program">
    <!-- Sticky Header -->
    <div
      class="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 font-poppins"
    >
      <!-- Back Button -->
      <RouterLink
        to="/donation-programs"
        class="flex items-center justify-center shrink-0 text-gray-700 hover:text-gray-900 transition"
      >
        <ArrowLeft :size="28" />
      </RouterLink>

      <!-- Title -->
      <h1 class="text-lg md:text-xl font-bold text-primary-500 line-clamp-1">
        {{ program.title }}
      </h1>
    </div>

    <div class="relative min-h-screen bg-white pb-24 md:pb-8">
      <!-- Hero Image Section -->
      <div class="relative w-full h-[50vh] md:h-[65vh] overflow-hidden">
        <!-- Gradient Overlay -->
        <div
          class="absolute inset-0 z-10 bg-linear-to-t from-black/60 via-transparent to-transparent"
        />

        <img
          :src="program.image"
          :alt="program.title"
          class="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
        />

        <!-- Title Over Image (Mobile Only) -->
        <div class="absolute bottom-6 left-6 right-6 z-20 md:hidden">
          <span
            class="inline-block px-3 py-1 mb-3 rounded-full bg-primary-400 text-white text-[10px] font-bold uppercase tracking-wider"
          >
            {{ program.category }}
          </span>
          <h1 class="text-2xl font-bold text-white leading-tight shadow-text">
            {{ program.title }}
          </h1>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-10">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Left Column: Details -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Title Section (Desktop Only) -->
            <div class="hidden md:block space-y-3">
              <span
                class="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold uppercase tracking-wider"
              >
                {{ program.category }}
              </span>
              <h1 class="text-4xl font-extrabold text-gray-900 leading-tight">
                {{ program.title }}
              </h1>
            </div>

            <!-- Stats Card (Vibrant Info) -->
            <div
              class="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6"
            >
              <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div class="space-y-1">
                  <p class="text-sm text-gray-500 font-medium">Dana Terkumpul</p>
                  <p class="text-3xl md:text-4xl font-black text-primary-500">
                    {{ formatCurrency(program.collected) }}
                  </p>
                </div>
                <div
                  class="flex items-center gap-8 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-8"
                >
                  <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Target</p>
                    <p class="font-bold text-gray-800">{{ formatCurrency(program.target) }}</p>
                  </div>
                  <div class="text-right md:text-left">
                    <p class="text-xs text-gray-500 uppercase tracking-wider mb-1">Sisa Hari</p>
                    <p class="font-bold text-gray-900">{{ remainingDays }}</p>
                  </div>
                </div>
              </div>

              <!-- Premium Progress Bar -->
              <div class="space-y-2">
                <div class="flex justify-between items-end">
                  <div class="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-linear-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out"
                      :style="{ width: `${progressPercent}%` }"
                    />
                  </div>
                </div>
                <div class="flex justify-between items-center text-sm font-bold">
                  <button
                    @click="$router.push(`/donation-programs/${program?.slug}/donations`)"
                    class="text-primary-600 hover:text-primary-700 font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    Lihat Donatur
                  </button>
                  <p class="text-primary-600">{{ Math.round(progressPercent) }}% Tercapai</p>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="space-y-4">
              <div class="flex items-center gap-2 mb-2">
                <div class="h-6 w-1.5 bg-primary-400 rounded-full"></div>
                <h2 class="text-xl font-bold text-gray-800">Tentang Program</h2>
              </div>
              <div class="prose prose-primary max-w-none">
                <p
                  v-for="(paragraph, index) in program.description.trim().split('\n\n')"
                  :key="index"
                  class="text-gray-600 leading-relaxed text-lg mb-6 last:mb-0"
                >
                  {{ paragraph }}
                </p>
              </div>
            </div>

            <!-- Prayers Section -->
            <div class="space-y-6 pt-8 border-t border-gray-100">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="h-6 w-1.5 bg-primary-400 rounded-full"></div>
                  <h2 class="text-xl font-bold text-gray-800">Doa-doa Orang Baik</h2>
                </div>
                <div
                  v-if="(listQuery.data.value?.data?.pagination.total ?? 0) < 6"
                  class="flex justify-center pt-2"
                >
                  <BaseButton
                    variant="outline"
                    size="md"
                    :to="`/donation-programs/${program?.slug}/prayers`"
                    class="font-semibold"
                  >
                    Lihat Semua Doa
                  </BaseButton>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  v-for="pray in prays"
                  :key="pray.id"
                  class="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex items-center gap-4">
                      <div
                        class="w-12 h-12 rounded-full bg-linear-to-br from-primary-300 to-primary-500 text-white flex items-center justify-center text-lg font-bold shadow-sm shadow-primary-200"
                      >
                        {{ getInitials(pray.name) }}
                      </div>
                      <div>
                        <h3 class="font-bold text-gray-900">{{ pray.name }}</h3>
                        <p class="text-xs text-gray-400">{{ pray.date }}</p>
                      </div>
                    </div>
                    <button
                      class="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      @click="openReportModal(pray.id)"
                    >
                      <Flag :size="16" />
                    </button>
                  </div>

                  <p class="text-gray-600 text-sm leading-relaxed italic">"{{ pray.message }}"</p>

                  <div class="flex items-center gap-6 pt-2 border-t border-gray-50">
                    <button
                      class="flex items-center gap-2 text-xs transition-all duration-200 px-3 py-1.5 rounded-full"
                      :class="
                        isPrayerAmened(pray)
                          ? 'bg-primary-50 text-primary-500 font-bold'
                          : 'text-gray-400 hover:bg-gray-50 hover:text-primary-500'
                      "
                      @click="handleAmenPrayer(pray)"
                    >
                      <Heart :size="16" :fill="isPrayerAmened(pray) ? 'currentColor' : 'none'" />
                      <span>{{ getPrayerAmenCount(pray) }} Amen</span>
                    </button>
                    <button
                      class="flex items-center gap-2 text-xs text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      <Share2 :size="16" />
                      <span>Bagikan</span>
                    </button>
                  </div>
                </div>
              </div>

              <div
                v-if="!listQuery.isLoading.value && prays.length === 0"
                class="bg-gray-50 rounded-2xl p-10 text-center border border-dashed border-gray-200"
              >
                <Heart :size="48" class="mx-auto mb-3 text-gray-300" />
                <p class="text-gray-500 font-medium">Jadilah yang pertama mendoakan program ini.</p>
              </div>
            </div>
          </div>

          <!-- Right Column: Quick Info (Sticky on Desktop) -->
          <div class="hidden lg:block">
            <div class="sticky top-24 space-y-6">
              <div
                class="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-100/50 space-y-6"
              >
                <h3 class="text-xl font-bold text-gray-900">Dukung Program Ini</h3>
                <p class="text-gray-500 text-sm leading-relaxed">
                  Bantuan Anda sangat berarti untuk mewujudkan program ini. Mari berbagi kebaikan
                  bersama kami.
                </p>
                <div class="space-y-3">
                  <BaseButton
                    v-if="program.status === DonationProgramStatusEnum.ACTIVE"
                    variant="primary"
                    size="lg"
                    full-width
                    class="h-14 text-lg font-bold shadow-lg shadow-primary-200"
                    @click="$router.push(`/donation-programs/${program.slug}/form`)"
                  >
                    Donasi Sekarang
                  </BaseButton>
                  <BaseButton
                    variant="outline"
                    size="lg"
                    full-width
                    class="h-14 font-semibold"
                    @click="handleShare"
                  >
                    Bagikan
                  </BaseButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Sticky CTA -->
      <div
        class="fixed bottom-0 left-0 right-0 z-30 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 md:hidden flex gap-3 shadow-2xl"
      >
        <button
          @click="handleShare"
          class="p-4 rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Share2 :size="24" />
        </button>
        <BaseButton
          v-if="program.status === DonationProgramStatusEnum.ACTIVE"
          variant="primary"
          size="lg"
          class="flex-1 h-14 font-bold shadow-lg shadow-primary-200"
          @click="$router.push(`/donation-programs/${program.slug}/form`)"
        >
          Donasi Sekarang
        </BaseButton>
      </div>
    </div>
  </template>

  <!-- No Data State -->
  <div v-else class="flex items-center justify-center min-h-screen text-gray-500 text-center px-6">
    Data donasi tidak ditemukan.
  </div>

  <!-- Report Modal -->
  <PublicConfirmationModal
    :show="showReportModal"
    title="Laporkan Doa"
    message="Apakah Anda yakin ingin melaporkan doa ini?"
    :icon="Flag"
    primary-button-text="Kirim Laporan"
    secondary-button-text="Batal"
    :primary-button-loading="reportMutation.isPending.value"
    @primary="handleReportPrayer"
    @secondary="closeReportModal"
    @close="closeReportModal"
  >
    <div v-if="reportMutation.isError.value" class="mt-4">
      <p class="text-red-500 text-sm">Gagal mengirim laporan</p>
    </div>
  </PublicConfirmationModal>
</template>
