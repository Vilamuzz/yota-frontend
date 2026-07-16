<script setup lang="ts">
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { ArrowLeft, Coins } from 'lucide-vue-next'
import { ref, computed, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useDonationProgramDetail } from '@/composables/donationProgram/useDonationProgramDetail'
import { usePublicDonationProgramTransactionList } from '@/composables/donationProgramTransaction'
import { useOffsetPagination } from '@/composables/ui/useOffsetPagination'
import BasePagination from '@/components/atoms/BasePagination.vue'
import { formatCurrency, formatDate } from '@/utils/format'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'

const route = useRoute()
const donationSlug = computed(() => route.params.slug as string)

const { detailQuery } = useDonationProgramDetail(donationSlug)
const program = computed(() => {
  const d = detailQuery.data.value?.data
  if (!d) return null
  return {
    title: d.title,
    slug: d.slug,
    collectedFund: d.collectedFund || 0,
    fundTarget: d.fundTarget || 0,
  }
})

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const queryParams = reactive({
  limit: 10,
  page: 1,
  search: undefined as string | undefined,
})

const { listQuery, transactions, pagination } = usePublicDonationProgramTransactionList(
  donationSlug,
  queryParams,
)

const { goToPage, resetPagination } = useOffsetPagination(queryParams, pagination)

watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

const txList = computed(() => {
  return transactions.value.map((tx) => ({
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
      class="sticky top-0 z-40 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center gap-4"
    >
      <!-- Back Button -->
      <div class="flex flex-row">
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
      <div v-if="program" class="text-right hidden sm:block">
        <p class="text-xs text-gray-400 font-medium uppercase tracking-wider">Terkumpul</p>
        <h1 class="text-sm font-bold text-primary-500">
          {{ formatCurrency(program.collectedFund) }}
          <span class="text-gray-400 text-xs font-medium"
            >/ {{ formatCurrency(program.fundTarget) }}</span
          >
        </h1>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-4xl mx-auto px-6 py-10">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <h2 class="text-2xl font-bold text-gray-800 shrink-0">Riwayat Donasi</h2>
        <div class="w-full md:max-w-sm">
          <BasePublicSearch
            v-model="searchQuery"
            placeholder="Cari nama anda dalam daftar donatur..."
            :show-sort="false"
            :show-filter="false"
          />
        </div>
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

      <!-- Pagination -->
      <BasePagination
        v-if="pagination && pagination.totalPages > 1"
        class="mt-16"
        :current-page="queryParams.page ?? 1"
        :total-pages="pagination.totalPages"
        @update:current-page="goToPage"
      />
    </div>
  </div>
</template>
