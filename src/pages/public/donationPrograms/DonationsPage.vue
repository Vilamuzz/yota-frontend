<script setup lang="ts">
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { ArrowLeft, Coins } from 'lucide-vue-next'
import { ref, computed, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useDonationProgramDetail } from '@/composables/donationProgram/useDonationProgramDetail'
import { usePublicDonationProgramTransactionList } from '@/composables/donationProgramTransaction'
import { formatCurrency, formatDate } from '@/utils/format'

const route = useRoute()
const donationSlug = computed(() => route.params.slug as string)

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
  limit: 10,
  nextCursor: undefined as string | undefined,
})

const { listQuery, transactions, pagination } = usePublicDonationProgramTransactionList(
  donationSlug,
  queryParams,
)

const accumulatedTransactions = ref<any[]>([])

watch(
  transactions,
  (newTransactions) => {
    if (!queryParams.nextCursor) {
      accumulatedTransactions.value = [...newTransactions]
    } else {
      const existingIds = new Set(accumulatedTransactions.value.map((t) => t.id))
      for (const tx of newTransactions) {
        if (!existingIds.has(tx.id)) {
          accumulatedTransactions.value.push(tx)
        }
      }
    }
  },
  { immediate: true },
)

const handleScroll = () => {
  const bottomOfWindow =
    window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 200

  if (bottomOfWindow && !listQuery.isFetching.value && pagination.value?.nextCursor) {
    queryParams.nextCursor = pagination.value.nextCursor
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const txList = computed(() => {
  return accumulatedTransactions.value.map((tx) => ({
    id: tx.id,
    name: tx.donorName || 'Hamba Allah',
    amount: tx.grossAmount,
    date: formatDate(tx.createdAt),
  }))
})
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
      </div>
    </div>
  </div>

  <!-- Error State -->
  <div
    v-else-if="detailQuery.isError.value || listQuery.isError.value"
    class="flex items-center justify-center min-h-screen text-red-500 text-center px-6"
  >
    Gagal memuat riwayat donasi program ini.
  </div>

  <!-- Content State -->
  <div v-else class="relative min-h-screen bg-gray-50 pb-24 font-poppins">
    <!-- Sticky Header -->
    <div
      class="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4"
    >
      <!-- Back Button -->
      <button
        class="flex items-center justify-center shrink-0 text-gray-700 hover:text-gray-900 transition p-2 hover:bg-gray-100 rounded-full cursor-pointer"
        @click="$router.push(`/donation-programs/${donationSlug}`)"
      >
        <ArrowLeft :size="24" />
      </button>

      <!-- Title -->
      <div>
        <p class="text-xs text-gray-400 font-medium uppercase tracking-wider">Donatur Baik</p>
        <h1 class="text-base md:text-lg font-bold text-gray-800 line-clamp-1">
          {{ program?.title }}
        </h1>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-6 py-10">
      <div class="flex items-center justify-left mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Riwayat Donasi</h2>
      </div>

      <!-- Donations Grid -->
      <div>
        <div v-if="txList.length > 0" class="grid grid-cols-1 gap-4">
          <div
            v-for="tx in txList"
            :key="tx.id"
            class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-full bg-linear-to-br from-primary-100 to-primary-200 text-primary-600 flex items-center justify-center text-lg font-bold shadow-sm"
              >
                <Coins :size="24" />
              </div>
              <div>
                <h3 class="font-bold text-gray-900">{{ tx.name }}</h3>
                <p class="text-xs text-gray-400">{{ tx.date }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-black text-primary-600 text-base md:text-lg">
                {{ formatCurrency(tx.amount) }}
              </p>
            </div>
          </div>
        </div>

        <div
          v-else-if="!listQuery.isLoading.value"
          class="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm"
        >
          <Coins :size="48" class="mx-auto mb-3 text-gray-300 animate-pulse" />
          <p class="text-gray-500 font-medium">Belum ada donasi terkumpul.</p>
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
</template>
