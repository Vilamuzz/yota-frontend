<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Users, TrendingUp, TrendingDown, Eye } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import { useSocialProgramDetail } from '@/composables/socialProgram/useSocialProgramDetail'
import { useSocialProgramSubscriptionList } from '@/composables/socialProgramSubscription/useSocialProgramSubscriptionList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { formatCurrency, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import { SocialProgramSubscriptionStatus } from '@/types/socialProgramSubscription'
import type { SocialProgramSubscriptionQueryParams } from '@/types/socialProgramSubscription'

const router = useRouter()
const route = useRoute()
const programId = route.params.id as string

const { detailQuery } = useSocialProgramDetail(programId)
const program = computed(() => detailQuery.data.value?.data || null)
const isLoading = detailQuery.isLoading

// Subscription table
const queryParams = reactive<SocialProgramSubscriptionQueryParams>({
  limit: 10,
  search: undefined,
  status: undefined,
  sortBy: undefined,
})

const { subscriptions, pagination, isLoading: subLoading } =
  useSocialProgramSubscriptionList(programId, queryParams)

const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

const limitOptions = [10, 25, 50, 100]

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(
  () => [queryParams.status, queryParams.sortBy, queryParams.limit],
  () => resetPagination(),
)

const hasActiveFilters = computed(
  () => queryParams.status !== undefined || queryParams.sortBy !== undefined,
)

const totalCollectedFund = computed(() => program.value?.collectedFund ?? 0)
const totalExpense = computed(() => program.value?.totalExpense ?? 0)
const totalSubscribers = computed(() => program.value?.totalSubscribers ?? 0)

const handleBack = () => router.push({ name: 'dashboard-social-programs-income' })
</script>

<template>
  <DashboardLayout>
    <template #title>Detail Pemasukan Program Sosial</template>

    <div class="max-w-full mx-auto space-y-6">
      <div v-if="isLoading && !program" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500 text-sm animate-pulse">Memuat detail program...</p>
      </div>

      <template v-else-if="program">
        <!-- Header ringkas -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ program.title }}</h2>
            <div :class="['mt-2 px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider w-fit', getStatusColor(program.status)]">
              {{ formatStatus(program.status) }}
            </div>
          </div>
          <BaseButton variant="outline" @click="handleBack">Kembali</BaseButton>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4">
            <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <TrendingUp :size="24" class="text-green-500" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Pemasukan</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(totalCollectedFund) }}</p>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4">
            <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <TrendingDown :size="24" class="text-red-500" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Total Pengeluaran</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatCurrency(totalExpense) }}</p>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4">
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <Users :size="24" class="text-blue-500" />
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Pelanggan Aktif</p>
              <p class="text-xl font-bold text-gray-900 dark:text-white">{{ totalSubscribers }}</p>
            </div>
          </div>
        </div>

        <!-- Tabel Pelanggan -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
            <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
              <Users :size="20" />
            </div>
            <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Daftar Pelanggan</h3>
          </div>

          <div class="flex flex-row gap-3 w-full md:w-auto">
            <BaseSearch v-model="searchQuery" placeholder="Cari Pelanggan..." class="flex-1 w-full" />
            <BaseFilter :has-active-filters="hasActiveFilters" class="w-auto shrink-0">
              <template #default>
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                    <select v-model="queryParams.status" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800">
                      <option :value="undefined">Semua</option>
                      <option :value="SocialProgramSubscriptionStatus.ACTIVE">Aktif</option>
                      <option :value="SocialProgramSubscriptionStatus.INACTIVE">Berhenti</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Urutkan</label>
                    <select v-model="queryParams.sortBy" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white">
                      <option :value="undefined">Bawaan (Terbaru)</option>
                      <option value="total_donation desc">Donasi Tertinggi</option>
                      <option value="total_donation asc">Donasi Terendah</option>
                      <option value="total_paid_periods desc">Periode Bayar Terbanyak</option>
                      <option value="total_paid_periods asc">Periode Bayar Tersedikit</option>
                    </select>
                  </div>
                </div>
              </template>
            </BaseFilter>
          </div>

          <BaseTable
            :loading="subLoading"
            loading-message="Memuat data pelanggan..."
            :is-empty="subscriptions.length === 0"
            empty-message="Belum ada pelanggan untuk program ini"
            :has-prev="!!pagination?.prevCursor"
            :has-next="!!pagination?.nextCursor"
            v-model:limit="queryParams.limit"
            :limit-options="limitOptions"
            @prev="handlePrevPage(pagination)"
            @next="handleNextPage(pagination)"
          >
            <template #empty-icon><Users :size="96" class="mx-auto mb-2 text-gray-300" /></template>
            <template #headers>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Pelanggan</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Lama Berlangganan</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Total Donasi</th>
              <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">Aksi</th>
            </template>
            <template #rows>
              <tr v-for="(sub, index) in subscriptions" :key="sub.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">{{ pageOffset * queryParams.limit! + index + 1 }}</td>
                <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{{ sub.username }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider', getStatusColor(sub.status)]">
                    {{ formatStatus(sub.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-300">{{ sub.totalPaidPeriods }} periode</td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-300">{{ formatCurrency(sub.totalDonation) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <BaseIconButton
                    :to="{ name: 'dashboard-social-programs-income-invoices', params: { id: programId, subscriptionId: sub.id } }"
                    title="Lihat riwayat tagihan"
                    variant="info"
                  >
                    <Eye :size="18" />
                  </BaseIconButton>
                </td>
              </tr>
            </template>
          </BaseTable>
        </div>
      </template>

      <div v-else class="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
        <p class="text-gray-500">Program tidak ditemukan atau terjadi kesalahan saat memuat data.</p>
        <BaseButton variant="primary" class="mt-4" @click="handleBack">Kembali ke Daftar</BaseButton>
      </div>
    </div>
  </DashboardLayout>
</template>
