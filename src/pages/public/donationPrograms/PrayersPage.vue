<script setup lang="ts">
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import PublicConfirmationModal from '@/components/organisms/PublicConfirmationModal.vue'
import { Share2, Flag, Heart, ArrowLeft } from 'lucide-vue-next'
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDonationProgramDetail } from '@/composables/donationProgram/useDonationProgramDetail'
import { usePrayerList } from '@/composables/prayer/usePrayerList'
import { usePrayerAmen } from '@/composables/prayer/usePrayerAmen'
import { usePrayerReport } from '@/composables/prayer/usePrayerReport'
import { formatDate } from '@/utils/format'
import type { Prayer } from '@/types/prayer'
import { useAuthStore } from '@/stores/auth'
import AuthRequiredModal from '@/components/organisms/AuthRequiredModal.vue'

const route = useRoute()
const donationSlug = computed(() => route.params.slug as string)
const authStore = useAuthStore()

const { detailQuery } = useDonationProgramDetail(donationSlug)
const program = computed(() => {
  const d = detailQuery.data.value?.data
  if (!d) return null
  return {
    title: d.title,
    slug: d.slug,
  }
})

const queryParams = reactive({
  page: 1,
  limit: 10,
})

const { listQuery, prayers, pagination } = usePrayerList(donationSlug, queryParams)

const accumulatedPrayers = ref<any[]>([])

watch(
  prayers,
  (newPrayers) => {
    if (queryParams.page === 1) {
      accumulatedPrayers.value = [...newPrayers]
    } else {
      const existingIds = new Set(accumulatedPrayers.value.map((p) => p.id))
      for (const pray of newPrayers) {
        if (!existingIds.has(pray.id)) {
          accumulatedPrayers.value.push(pray)
        }
      }
    }
  },
  { immediate: true },
)

const handleScroll = () => {
  const bottomOfWindow =
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 200

  if (
    bottomOfWindow &&
    !listQuery.isFetching.value &&
    pagination.value &&
    queryParams.page < pagination.value.totalPages
  ) {
    queryParams.page++
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const { createMutation: amenMutation } = usePrayerAmen()
const { createMutation: reportMutation } = usePrayerReport()

const showReportModal = ref(false)
const showAuthModal = ref(false)
const reportPrayerId = ref<string>('')

const prays = computed(() => {
  return accumulatedPrayers.value.map((pray) => ({
    ...pray,
    date: formatDate(pray.createdAt),
  }))
})

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((word) => word?.[0]?.toUpperCase() ?? '')
    .join('')

const amenStateOverrides = ref<Record<string, boolean>>({})
const amenCountOverrides = ref<Record<string, number>>({})

const isPrayerAmened = (pray: Prayer) => {
  const overridden = amenStateOverrides.value[pray.id]
  return overridden ?? pray.isAmen
}

const getPrayerAmenCount = (pray: Prayer) => {
  const overridden = amenCountOverrides.value[pray.id]
  return overridden ?? pray.amenCount
}

const handleAmenPrayer = async (pray: Prayer) => {
  if (!authStore.isAuthenticated) {
    showAuthModal.value = true
    return
  }

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
  if (!authStore.isAuthenticated) {
    showAuthModal.value = true
    return
  }
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

const handleShare = (pray: Prayer) => {
  const shareTitle = `Doa dari ${pray.username}`
  if (navigator.share) {
    navigator.share({ title: shareTitle, text: pray.content, url: window.location.href })
  } else {
    navigator.clipboard.writeText(`"${pray.content}" - oleh ${pray.username}`)
  }
}
</script>

<template>
  <!-- Loading State -->
  <div v-if="detailQuery.isLoading.value" class="max-w-3xl mx-auto px-6 py-24 space-y-6">
    <div class="flex items-center gap-4">
      <BaseSkeleton class="h-10 w-10 rounded-full" />
      <BaseSkeleton variant="text-lg" class="w-64" />
    </div>
    <div class="grid grid-cols-1 gap-6">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4"
      >
        <div class="flex items-start gap-4">
          <BaseSkeleton variant="avatar" />
          <div class="space-y-2 flex-1">
            <BaseSkeleton variant="text-sm" class="w-32" />
            <BaseSkeleton variant="text-xs" class="w-24" />
          </div>
        </div>
        <BaseSkeleton variant="text-sm" class="w-full" />
        <BaseSkeleton class="h-8 w-24 rounded-full" />
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div
    v-else-if="detailQuery.isError.value || listQuery.isError.value"
    class="flex items-center justify-center min-h-screen text-red-500 text-center px-6"
  >
    Gagal memuat doa-doa program donasi ini.
  </div>

  <!-- Content State -->
  <div v-else class="relative min-h-screen bg-gray-50 pb-24 font-poppins">
    <!-- Sticky Header -->
    <div
      class="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4"
    >
      <!-- Back Button -->
      <button
        class="flex items-center justify-center shrink-0 text-gray-700 hover:text-gray-900 transition p-2 hover:bg-gray-100 rounded-full"
        @click="$router.push(`/donation-programs/${donationSlug}`)"
      >
        <ArrowLeft :size="24" />
      </button>

      <!-- Title -->
      <div>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-wider">Doa-doa Orang Baik</p>
        <h1 class="text-base md:text-lg font-bold text-gray-800 line-clamp-1">
          {{ program?.title }}
        </h1>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-6 py-10">
      <div class="flex items-center justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Semua Doa</h2>
        <span
          class="px-3 py-1 bg-white border border-gray-100 text-gray-500 rounded-full text-xs font-semibold shadow-xs"
        >
          {{ pagination?.total ?? 0 }} Doa
        </span>
      </div>

      <!-- Prayers Grid -->
      <div>
        <div v-if="prays.length > 0" class="grid grid-cols-1 gap-6">
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
                  {{ getInitials(pray.username) }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">{{ pray.username }}</h3>
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

            <p class="text-gray-600 text-sm leading-relaxed italic">"{{ pray.content }}"</p>

            <div class="flex items-center gap-6 pt-2 border-t border-gray-55">
              <button
                class="flex items-center gap-2 text-xs transition-all duration-200 px-3 py-1.5 rounded-full"
                :class="
                  isPrayerAmened(pray)
                    ? 'bg-primary-50 text-primary-500 font-bold'
                    : 'text-gray-400 hover:bg-gray-55 hover:text-primary-500'
                "
                @click="handleAmenPrayer(pray)"
              >
                <Heart :size="16" :fill="isPrayerAmened(pray) ? 'currentColor' : 'none'" />
                <span>{{ getPrayerAmenCount(pray) }} Amen</span>
              </button>
              <button
                class="flex items-center gap-2 text-xs text-gray-400 hover:text-primary-500 transition-colors"
                @click="handleShare(pray)"
              >
                <Share2 :size="16" />
                <span>Bagikan</span>
              </button>
            </div>
          </div>
        </div>

        <div
          v-else-if="!listQuery.isLoading.value"
          class="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm"
        >
          <Heart :size="48" class="mx-auto mb-3 text-gray-300 animate-pulse" />
          <p class="text-gray-500 font-medium">Belum ada doa yang dikirimkan.</p>
        </div>
      </div>
      <!-- Infinite Scroll Loader -->
      <div
        v-if="listQuery.isFetching.value && !listQuery.isLoading.value"
        class="flex justify-center pt-8"
      >
        <div
          class="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"
        ></div>
      </div>
    </div>
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

  <!-- Auth Required Modal -->
  <AuthRequiredModal
    :show="showAuthModal"
    @close="showAuthModal = false"
    title="Akses Terbatas"
    message="Silakan masuk ke akun Anda terlebih dahulu untuk memberikan Amen atau melaporkan doa."
  />
</template>
