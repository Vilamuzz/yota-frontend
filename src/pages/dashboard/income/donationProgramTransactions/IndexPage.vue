<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { HandHeart, Plus, XCircle, Download } from 'lucide-vue-next'
import { formatCurrency, formatDate, formatStatus } from '@/utils/format'
import { useDonationProgramTransactionList } from '@/composables/donationProgramTransaction/useDonationProgramTransactionList'
import { useDonationProgramTransactionCancel } from '@/composables/donationProgramTransaction/useDonationProgramTransactionCancel'
import { useDonationProgramMonthlyIncome } from '@/composables/donationProgramTransaction/useDonationProgramMonthlyIncome'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import { useTheme } from '@/composables/ui/useTheme'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseModal from '@/components/organisms/BaseModal.vue'
import ExportCSVModal from '@/components/molecules/ExportCSVModal.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import { donationProgramTransactionService } from '@/services/donationProgramTransaction.service'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { createDonationProgramTransactionSchema } from '@/schemas/donationProgramTransaction.schema'
import { useDonationProgramTransactionCreateOffline } from '@/composables/donationProgramTransaction/useDonationProgramTransactionCreateOffline'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import {
  TransactionStatus,
  type DonationProgramTransactionQueryParams,
} from '@/types/donationProgramTransaction'
import { getStatusColor } from '@/utils/statusColor'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import { useDonationProgramAdminDetail } from '@/composables/donationProgram'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const route = useRoute()
const donationId = route.params.id as string
const { showToast } = useToast()
const { cancelMutation } = useDonationProgramTransactionCancel(donationId)
const { createMutation } = useDonationProgramTransactionCreateOffline(donationId)

const { detailQuery, isDonationLoading } = useDonationProgramAdminDetail(donationId)
const donation = computed(() => detailQuery.data.value?.data)

const isCreateModalOpen = ref(false)
const showExportModal = ref(false)
const isExporting = ref(false)
const donorName = ref('')
const donorEmail = ref('')
const grossAmount = ref('')
const errors = ref<Record<string, string>>({})
const isSubmitting = computed(() => createMutation.isPending.value)

const formatCurrencyPreview = computed(() => {
  const num = Number(grossAmount.value)
  if (!num || isNaN(num)) return ''
  return formatCurrency(num)
})

function resetForm() {
  donorName.value = ''
  donorEmail.value = ''
  grossAmount.value = ''
  errors.value = {}
}

function handleCreateTransaction() {
  const result = createDonationProgramTransactionSchema.safeParse({
    grossAmount: Number(grossAmount.value),
    donorName: donorName.value.trim(),
    donorEmail: donorEmail.value.trim(),
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors
  if (!result.success) return

  createMutation.mutate(
    {
      id: donationId,
      data: {
        grossAmount: Number(grossAmount.value),
        donorName: donorName.value.trim() || undefined,
        donorEmail: donorEmail.value.trim() || undefined,
      },
    },
    {
      onSuccess: () => {
        showToast('Transaksi offline berhasil dibuat!', 'success')
        isCreateModalOpen.value = false
        resetForm()
      },
      onError: (err) => {
        const apiValidation = err.response?.data?.validation
        if (apiValidation) {
          const messages = Object.values(apiValidation).join(', ')
          if (messages) {
            showToast(messages, 'error')
            return
          }
        }
        showToast(
          extractError(err, 'Gagal membuat transaksi offline. Silahkan coba lagi.'),
          'error',
        )
      },
    },
  )
}

const queryParams = reactive<DonationProgramTransactionQueryParams>({
  limit: 10,
  status: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
  sortBy: undefined,
})

const limitOptions = [10, 25, 50, 100]
const isCancelModalOpen = ref(false)
const selectedTransactionId = ref<string | null>(null)

const transactionSortOptions = [
  { value: 'created_at desc', label: 'Tanggal Transaksi (Terbaru)' },
  { value: 'created_at asc', label: 'Tanggal Transaksi (Terlama)' },
  { value: 'gross_amount desc', label: 'Nominal Transaksi (Tertinggi)' },
  { value: 'gross_amount asc', label: 'Nominal Transaksi (Terendah)' },
]

const { donationProgramTransactions, pagination, isLoading } = useDonationProgramTransactionList(
  donationId,
  queryParams,
)

const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

const hasActiveFilters = computed(
  () => queryParams.sortBy !== undefined || queryParams.status !== undefined,
)

watch(
  () => [queryParams.limit, queryParams.sortBy, queryParams.status],
  () => resetPagination(),
)

function openCancelModal(id: string) {
  selectedTransactionId.value = id
  isCancelModalOpen.value = true
}

function handleConfirmCancel() {
  if (selectedTransactionId.value) {
    cancelMutation.mutate(selectedTransactionId.value, {
      onSuccess: () => {
        showToast('Transaksi berhasil dibatalkan', 'success')
        isCancelModalOpen.value = false
        selectedTransactionId.value = null
      },
      onError: () => {
        showToast('Gagal membatalkan transaksi', 'error')
      },
    })
  }
}

const handleExport = async (payload: { startDate: string; endDate: string; sortBy: string }) => {
  isExporting.value = true
  try {
    const blob = await donationProgramTransactionService.exportDonationProgramTransactionCSV(
      donationId,
      {
        startDate: payload.startDate,
        endDate: payload.endDate,
        sortBy: payload.sortBy,
      },
    )

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    const nameSlug = donation.value?.slug || donationId
    link.setAttribute(
      'download',
      `transactions_${nameSlug}_${payload.startDate}_to_${payload.endDate}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    showExportModal.value = false
    showToast('Laporan berhasil diunduh', 'success')
  } catch {
    showToast('Gagal mengunduh laporan', 'error')
  } finally {
    isExporting.value = false
  }
}

// ── Monthly Income Chart ────────────────────────────────────────────────────────
const { isDark } = useTheme()
const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))

const { incomeQuery, incomeItems } = useDonationProgramMonthlyIncome(donationId)
const isChartLoading = computed(() => incomeQuery.isPending.value)

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]

const incomeChartOption = computed(() => {
  const isDarkMode = isDark.value
  const c = {
    income: isDarkMode ? '#34d399' : '#10b981',
    text: isDarkMode ? '#9ca3af' : '#374151',
    gridLine: isDarkMode ? '#374151' : '#e5e7eb',
    bg: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    tooltip: isDarkMode ? '#f3f4f6' : '#1f2937',
  }

  const data = Array(12).fill(0)
  incomeItems.value.forEach((item) => {
    const idx = parseInt(item.month.split('-')[1] || '', 10) - 1
    if (idx >= 0 && idx < 12) data[idx] = item.income
  })

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.bg,
      borderColor: c.border,
      textStyle: { color: c.tooltip },
      formatter: (params: any) => {
        const p = params[0]
        return `<div style="font-size:12px;padding:4px">
          <b style="display:block;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid ${c.border}">${p.name}</b>
          <div style="display:flex;justify-content:space-between;gap:16px">
            <span>${p.marker} Pemasukan</span>
            <b style="font-family:monospace">${formatCurrency(p.value)}</b>
          </div></div>`
      },
    },
    grid: { left: '2%', right: '2%', bottom: '4%', top: '8%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: MONTH_LABELS,
        boundaryGap: false,
        axisLabel: { color: c.text, fontFamily: 'system-ui, sans-serif', fontSize: 11 },
        axisLine: { lineStyle: { color: c.gridLine } },
        axisTick: { show: false },
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: c.text,
          fontFamily: 'system-ui, sans-serif',
          fontSize: 11,
          formatter: (v: number) => {
            if (v >= 1e9) return `${(v / 1e9).toFixed(1)}M`
            if (v >= 1e6) return `${(v / 1e6).toFixed(1)}jt`
            if (v >= 1e3) return `${(v / 1e3).toFixed(0)}rb`
            return `${v}`
          },
        },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: c.gridLine, type: 'dashed' } },
      },
    ],
    series: [
      {
        name: 'Pemasukan',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data,
        lineStyle: { color: c.income, width: 2.5 },
        itemStyle: { color: c.income },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: isDarkMode ? 'rgba(52,211,153,0.28)' : 'rgba(16,185,129,0.20)',
              },
              { offset: 1, color: 'rgba(0,0,0,0)' },
            ],
          },
        },
      },
    ],
  }
})
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Transaksi Donasi</template>

    <div class="space-y-6">
      <!-- Stats Grid -->
      <div v-if="!isDonationLoading && donation" class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div
          class="md:col-span-12 lg:col-span-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ donation.title }}
          </h1>
          <p class="text-sm text-gray-400 mt-1">Program Donasi</p>
        </div>

        <div
          class="md:col-span-6 lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm min-w-0"
        >
          <h3
            class="text-2xl sm:text-3xl lg:text-2xl xl:text-3xl font-bold text-green-700 dark:text-green-500 truncate"
            :title="formatCurrency(donation.collectedFund)"
          >
            {{ formatCurrency(donation.collectedFund) }}
          </h3>
          <p class="text-sm text-gray-400 mt-1">Total Donasi</p>
        </div>

        <div
          class="md:col-span-6 lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm min-w-0"
        >
          <div class="flex items-baseline gap-2 truncate">
            <span
              :class="[
                'inline-flex items-center gap-1 px-3.5 py-0.5 rounded-full text-lg sm:text-xl lg:text-lg xl:text-xl font-medium border truncate',
                getStatusColor(donation.status),
              ]"
              :title="formatStatus(donation.status)"
            >
              {{ formatStatus(donation.status) }}
            </span>
          </div>
          <p class="text-sm text-gray-400 mt-1">Status Program Donasi</p>
        </div>
      </div>
      <div v-else-if="isDonationLoading" class="animate-pulse flex gap-5">
        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
      </div>

      <!-- Monthly Income Chart -->
      <div
        class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-sm flex flex-col gap-3"
      >
        <div>
          <h3 class="text-base font-bold text-gray-950 dark:text-white">Pemasukan Bulanan</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Total donasi masuk per bulan · {{ new Date().getFullYear() }}
          </p>
        </div>

        <div class="h-60 w-full">
          <VChart
            v-if="!isChartLoading"
            class="w-full h-full"
            :option="incomeChartOption"
            :theme="chartTheme"
            autoresize
          />
          <div v-else class="w-full h-full">
            <BaseSkeleton variant="image" class="w-full h-full rounded-xl" />
          </div>
        </div>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div class="flex flex-row gap-3 w-full md:w-auto">
          <BaseFilter align="left" :has-active-filters="hasActiveFilters" class="w-auto shrink-0">
            <template #default>
              <div class="space-y-4 w-64">
                <!-- Sort filter -->
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider text-left"
                  >
                    Urutkan
                  </label>
                  <select
                    v-model="queryParams.sortBy"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Bawaan (Terbaru)</option>
                    <option value="created_at asc">Terlama Dibuat</option>
                    <option value="gross_amount desc">Nominal Tertinggi</option>
                    <option value="gross_amount asc">Nominal Terendah</option>
                  </select>
                </div>

                <!-- Status filter -->
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider text-left"
                  >
                    Status
                  </label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Status</option>
                    <option value="pending">Tertunda</option>
                    <option value="settlement">Sukses</option>
                    <option value="cancel">Dibatalkan</option>
                    <option value="expired">Kedaluwarsa</option>
                  </select>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <BaseButton
            variant="outline"
            class="w-full sm:w-auto justify-center"
            @click="showExportModal = true"
          >
            <Download :size="20" class="mr-1" />
            Ekspor CSV
          </BaseButton>
          <BaseButton
            variant="primary"
            class="w-full sm:w-auto justify-center"
            @click="isCreateModalOpen = true"
          >
            <Plus :size="20" class="mr-1" />
            Tambah Transaksi Donasi
          </BaseButton>
        </div>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat transaksi donasi..."
        :is-empty="donationProgramTransactions.length === 0"
        empty-message="Tidak ada data transaksi donasi"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <HandHeart :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Donatur</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Metode</th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Net Nominal</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(transaction, index) in donationProgramTransactions"
            :key="transaction.id"
            class="hover:bg-gray-50 transition-colors duration-150 dark:hover:bg-gray-700"
          >
            <td class="px-6 py-2 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td
              class="px-6 py-2 whitespace-nowrap font-semibold max-w-50 truncate text-gray-900 dark:text-white"
            >
              {{ transaction.donorName }}
            </td>
            <td
              class="px-6 py-2 whitespace-nowrap font-medium text-center text-gray-600 dark:text-gray-200"
            >
              {{ transaction.isOnline ? 'Online' : 'Offline' }}
            </td>
            <td
              class="px-6 py-2 whitespace-nowrap font-bold text-right text-gray-900 dark:text-white"
            >
              {{ formatCurrency(transaction.netAmount) }}
            </td>
            <td class="px-6 py-2 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(transaction.transactionStatus),
                ]"
              >
                {{ formatStatus(transaction.transactionStatus) }}
              </span>
            </td>
            <td class="px-6 py-2 whitespace-nowrap font-medium text-gray-500 dark:text-gray-400">
              {{ formatDate(transaction.createdAt) }}
            </td>
            <td class="px-6 py-2 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  v-if="
                    transaction.transactionStatus !== TransactionStatus.CANCEL &&
                    !transaction.isOnline
                  "
                  variant="danger"
                  @click="openCancelModal(transaction.id)"
                  title="Batalkan"
                >
                  <XCircle :size="18" />
                </BaseIconButton>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>

    <!-- Cancel Confirmation Modal -->
    <ConfirmationModal
      :show="isCancelModalOpen"
      title="Batalkan Transaksi"
      message="Apakah Anda yakin ingin membatalkan transaksi ini? Saldo program donasi dan catatan keuangan akan disesuaikan secara otomatis."
      danger-button-text="Ya, Batalkan"
      :danger-button-loading="cancelMutation.isPending.value"
      @close="isCancelModalOpen = false"
      @danger="handleConfirmCancel"
      @secondary="isCancelModalOpen = false"
    />

    <!-- Create Transaction Modal -->
    <BaseModal
      :show="isCreateModalOpen"
      title="Tambah Transaksi Offline"
      description="Catat donasi yang diterima secara langsung."
      @close="isCreateModalOpen = false"
    >
      <form @submit.prevent="handleCreateTransaction" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="space-y-5">
            <!-- Amount -->
            <div>
              <label
                for="gross-amount"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Nominal (IDR) <span class="text-red-500">*</span>
              </label>
              <input
                id="gross-amount"
                v-model="grossAmount"
                type="number"
                min="1000"
                placeholder="e.g. 100000"
                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100 outline-none"
                :class="
                  errors.grossAmount
                    ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500 dark:focus:ring-red-500/50'
                    : ''
                "
              />
              <p v-if="formatCurrencyPreview" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ≈ {{ formatCurrencyPreview }}
              </p>
              <p v-if="errors.grossAmount" class="mt-1 text-xs text-red-600">
                {{ errors.grossAmount }}
              </p>
            </div>

            <p class="text-xs text-gray-500 dark:text-gray-400">
              Detail ini akan dicatat sebagai transaksi offline langsung ke sistem.
            </p>
          </div>

          <div class="space-y-5">
            <!-- Donor Name -->
            <BaseInput
              id="donor-name"
              v-model="donorName"
              label="Donor Name (Optional)"
              placeholder="e.g. Hamba Allah"
              :error="errors.donorName"
            />

            <!-- Donor Email -->
            <BaseInput
              id="donor-email"
              v-model="donorEmail"
              label="Donor Email (Optional)"
              placeholder="e.g. email@example.com"
              :error="errors.donorEmail"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <BaseButton
            type="button"
            variant="outline"
            :disabled="isSubmitting"
            @click="isCreateModalOpen = false"
          >
            Batal
          </BaseButton>
          <BaseButton type="submit" variant="primary" :loading="isSubmitting">
            Catat Transaksi
          </BaseButton>
        </div>
      </form>
    </BaseModal>

    <!-- Export CSV Modal -->
    <ExportCSVModal
      :show="showExportModal"
      :title="donation?.title"
      :is-exporting="isExporting"
      :sort-by-options="transactionSortOptions"
      @close="showExportModal = false"
      @export="handleExport"
    />
  </DashboardLayout>
</template>
