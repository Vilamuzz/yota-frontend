<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  MarkAreaComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useTheme } from '@/composables/ui/useTheme'
import { useAdminFinanceRecordSummary } from '@/composables/financeRecord/useFinanceRecordSummary'
import { useAdminFinanceMonthlyTrend } from '@/composables/financeRecord/useFinanceMonthlyTrend'
import { useDonationProgramAdminList } from '@/composables/donationProgram/useDonationProgramAdminList'
import { formatCurrency, formatDate, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { Motion } from 'motion-v'
import type { FinanceModuleType } from '@/types/financeRecord'
import { HandHeart, Briefcase, Baby, ChevronRight, Calendar, AlertCircle } from 'lucide-vue-next'

// Register ECharts modules
use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  MarkAreaComponent,
])

const { isDark } = useTheme()
const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))

// Fetch finance record summary
const { summaryQuery } = useAdminFinanceRecordSummary()
const summary = computed(
  () =>
    summaryQuery.data.value?.data || {
      totalDonationProgram: 0,
      totalSocialProgram: 0,
      totalFosterChildren: 0,
      totalDonationProgramExpense: 0,
      totalSocialProgramExpense: 0,
      totalFosterChildrenExpense: 0,
      totalDonationProgramIncome: 0,
      totalSocialProgramIncome: 0,
      totalFosterChildrenIncome: 0,
    },
)

// Compute net balances
const donationBalance = computed(
  () => (summary.value.totalDonationProgramIncome ?? 0) - summary.value.totalDonationProgramExpense,
)
const socialBalance = computed(
  () => (summary.value.totalSocialProgramIncome ?? 0) - summary.value.totalSocialProgramExpense,
)
const fosterBalance = computed(
  () => (summary.value.totalFosterChildrenIncome ?? 0) - summary.value.totalFosterChildrenExpense,
)

// Fetch recent donation programs (limit to 5, latest first)
const queryParams = ref({
  limit: 5,
  page: 1,
  sortBy: 'created_at desc',
})
const {
  donationPrograms,
  isLoading: isProgramsLoading,
  listQuery,
} = useDonationProgramAdminList(queryParams)

const isLoading = computed(() => summaryQuery.isPending.value || isProgramsLoading.value)

// Progress percentage helper
const getProgressPercentage = (target: number, collected: number) => {
  if (!target || target <= 0) return 0
  return Math.min(100, Math.round((collected / target) * 100))
}

// ── Monthly Trend Chart ────────────────────────────────────────────────────────
const MONTH_TABS: { key: FinanceModuleType; label: string; color: string }[] = [
  { key: 'donation_program', label: 'Program Donasi', color: 'emerald' },
  { key: 'social_program', label: 'Program Sosial', color: 'blue' },
  { key: 'foster_children', label: 'Anak Asuh', color: 'violet' },
]

const activeModule = ref<FinanceModuleType>('donation_program')

const trendParams = computed(() => ({
  module: activeModule.value,
  year: new Date().getFullYear(),
}))

const { trendQuery, trendItems } = useAdminFinanceMonthlyTrend(trendParams)

const isTrendLoading = computed(() => trendQuery.isPending.value)

// Month labels: Jan – Des
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

const monthlyChartOption = computed(() => {
  const isDarkMode = isDark.value

  const c = {
    income: isDarkMode ? '#34d399' : '#10b981',
    expense: isDarkMode ? '#fb7185' : '#f43f5e',
    text: isDarkMode ? '#9ca3af' : '#374151',
    gridLine: isDarkMode ? '#374151' : '#e5e7eb',
    bg: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    tooltip: isDarkMode ? '#f3f4f6' : '#1f2937',
  }

  // Build full 12-month arrays, filling 0 for missing months
  const incomeData = Array(12).fill(0)
  const expenseData = Array(12).fill(0)
  trendItems.value.forEach((item) => {
    const monthIndex = parseInt(item.month.split('-')[1] || '', 10) - 1
    if (monthIndex >= 0 && monthIndex < 12) {
      incomeData[monthIndex] = item.income
      expenseData[monthIndex] = item.expense
    }
  })

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.bg,
      borderColor: c.border,
      textStyle: { color: c.tooltip },
      formatter: (params: any) => {
        let res = `<div style="font-size:12px;padding:4px"><b style="display:block;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid ${c.border}">${params[0].name}</b>`
        params.forEach((p: any) => {
          res += `<div style="display:flex;justify-content:space-between;gap:16px;margin:3px 0">
            <span>${p.marker} ${p.seriesName}</span>
            <b style="font-family:monospace">${formatCurrency(p.value)}</b>
          </div>`
        })
        return res + '</div>'
      },
    },
    legend: {
      data: ['Pendapatan', 'Pengeluaran'],
      textStyle: { color: c.text, fontFamily: 'system-ui, sans-serif', fontWeight: '500' },
      bottom: '0%',
    },
    grid: { left: '2%', right: '2%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: MONTH_LABELS,
        boundaryGap: false,
        axisLabel: { color: c.text, fontFamily: 'system-ui, sans-serif' },
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
        name: 'Pendapatan',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: incomeData,
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
              { offset: 0, color: isDarkMode ? 'rgba(52,211,153,0.25)' : 'rgba(16,185,129,0.18)' },
              { offset: 1, color: 'rgba(0,0,0,0)' },
            ],
          },
        },
      },
      {
        name: 'Pengeluaran',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: expenseData,
        lineStyle: { color: c.expense, width: 2.5 },
        itemStyle: { color: c.expense },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: isDarkMode ? 'rgba(251,113,133,0.25)' : 'rgba(244,63,94,0.12)' },
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
  <div class="space-y-8 font-poppins">
    <!-- Header Summary Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <h2 class="text-xl font-bold text-gray-950 dark:text-white">Ringkasan Keuangan</h2>
    </div>

    <!-- Error State -->
    <div
      v-if="summaryQuery.isError.value || listQuery.isError.value"
      class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-4 rounded-xl flex items-start gap-3 text-red-800 dark:text-red-300"
    >
      <AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        <h4 class="font-semibold">Gagal memuat data</h4>
        <p class="text-sm mt-1">
          Silakan coba muat ulang halaman atau periksa koneksi internet Anda.
        </p>
      </div>
    </div>

    <!-- Skeleton Loaders -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="i in 3"
        :key="i"
        class="border border-gray-200/50 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 rounded-2xl space-y-4 shadow-sm"
      >
        <div class="flex justify-between items-center">
          <BaseSkeleton variant="text-lg" class="w-1/3" />
          <BaseSkeleton variant="avatar" />
        </div>
        <div class="space-y-2 pt-2">
          <BaseSkeleton variant="text-sm" class="w-1/2" />
          <BaseSkeleton variant="text-2xl" class="w-3/4" />
        </div>
        <hr class="border-gray-100 dark:border-gray-800/80 my-4" />
        <div class="grid grid-cols-2 gap-4">
          <div>
            <BaseSkeleton variant="text-xs" class="w-1/2 mb-2" />
            <BaseSkeleton variant="text-sm" class="w-2/3" />
          </div>
          <div>
            <BaseSkeleton variant="text-xs" class="w-1/2 mb-2" />
            <BaseSkeleton variant="text-sm" class="w-2/3" />
          </div>
        </div>
      </div>
    </div>

    <!-- Metric Cards Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- 1. Donation Programs Column -->
      <Motion
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: 0.05 }"
        class="group relative overflow-hidden border border-emerald-100 dark:border-emerald-900/10 bg-gradient-to-br from-white to-emerald-50/5 dark:from-gray-900/60 dark:to-emerald-950/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <span
              class="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100/50 dark:border-emerald-800/30"
            >
              Pilar 1: Donasi
            </span>
            <div
              class="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl"
            >
              <HandHeart class="w-5 h-5" />
            </div>
          </div>

          <h3
            class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
          >
            Net Saldo Program Donasi
          </h3>
          <p
            class="text-2xl font-extrabold text-gray-950 dark:text-white mt-1.5 select-all font-mono"
          >
            {{ formatCurrency(donationBalance) }}
          </p>
        </div>

        <div
          class="mt-6 pt-4 border-t border-emerald-100/50 dark:border-emerald-950/50 grid grid-cols-2 gap-4"
        >
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Pendapatan
            </span>
            <p class="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
              {{ formatCurrency(summary.totalDonationProgramIncome ?? 0) }}
            </p>
          </div>
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Pengeluaran
            </span>
            <p class="font-bold text-sm text-rose-600 dark:text-rose-400 font-mono">
              {{ formatCurrency(summary.totalDonationProgramExpense) }}
            </p>
          </div>
        </div>
      </Motion>

      <!-- 2. Social Programs Column -->
      <Motion
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: 0.1 }"
        class="group relative overflow-hidden border border-blue-100 dark:border-blue-900/10 bg-gradient-to-br from-white to-blue-50/5 dark:from-gray-900/60 dark:to-blue-950/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <span
              class="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full border border-blue-100/50 dark:border-blue-800/30"
            >
              Pilar 2: Sosial
            </span>
            <div
              class="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl"
            >
              <Briefcase class="w-5 h-5" />
            </div>
          </div>

          <h3
            class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
          >
            Net Saldo Program Sosial
          </h3>
          <p
            class="text-2xl font-extrabold text-gray-950 dark:text-white mt-1.5 select-all font-mono"
          >
            {{ formatCurrency(socialBalance) }}
          </p>
        </div>

        <div
          class="mt-6 pt-4 border-t border-blue-100/50 dark:border-blue-950/50 grid grid-cols-2 gap-4"
        >
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Pendapatan
            </span>
            <p class="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono">
              {{ formatCurrency(summary.totalSocialProgramIncome ?? 0) }}
            </p>
          </div>
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Pengeluaran
            </span>
            <p class="font-bold text-sm text-orange-600 dark:text-orange-400 font-mono">
              {{ formatCurrency(summary.totalSocialProgramExpense) }}
            </p>
          </div>
        </div>
      </Motion>

      <!-- 3. Foster Children Column -->
      <Motion
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: 0.15 }"
        class="group relative overflow-hidden border border-violet-100 dark:border-violet-900/10 bg-gradient-to-br from-white to-violet-50/5 dark:from-gray-900/60 dark:to-violet-950/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <span
              class="px-2.5 py-1 text-xs font-semibold bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 rounded-full border border-violet-100/50 dark:border-violet-800/30"
            >
              Pilar 3: Anak Asuh
            </span>
            <div
              class="p-2 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-xl"
            >
              <Baby class="w-5 h-5" />
            </div>
          </div>

          <h3
            class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
          >
            Net Saldo Anak Asuh
          </h3>
          <p
            class="text-2xl font-extrabold text-gray-950 dark:text-white mt-1.5 select-all font-mono"
          >
            {{ formatCurrency(fosterBalance) }}
          </p>
        </div>

        <div
          class="mt-6 pt-4 border-t border-violet-100/50 dark:border-violet-950/50 grid grid-cols-2 gap-4"
        >
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-violet-500"></span> Pendapatan
            </span>
            <p class="font-bold text-sm text-violet-600 dark:text-violet-400 font-mono">
              {{ formatCurrency(summary.totalFosterChildrenIncome ?? 0) }}
            </p>
          </div>
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pengeluaran
            </span>
            <p class="font-bold text-sm text-amber-600 dark:text-amber-400 font-mono">
              {{ formatCurrency(summary.totalFosterChildrenExpense) }}
            </p>
          </div>
        </div>
      </Motion>
    </div>

    <!-- Line Chart Card -->
    <div
      class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-sm flex flex-col gap-4"
    >
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-white">Pendapatan vs Pengeluaran</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Perbandingan per bulan · {{ new Date().getFullYear() }}
          </p>
        </div>

        <!-- Module Tabs -->
        <div
          class="flex flex-col md:flex-row w-full sm:w-auto items-stretch sm:items-center gap-1 p-1 bg-gray-100/80 dark:bg-gray-700/40 rounded-xl self-start sm:self-auto"
        >
          <button
            v-for="tab in MONTH_TABS"
            :key="tab.key"
            :id="`chart-tab-${tab.key}`"
            @click="activeModule = tab.key"
            :class="[
              'w-full sm:w-auto text-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 whitespace-nowrap',
              activeModule === tab.key
                ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            ]"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- ECharts Line Chart -->
      <div class="h-72 w-full">
        <VChart
          v-if="!isTrendLoading"
          class="w-full h-full"
          :option="monthlyChartOption"
          :theme="chartTheme"
          autoresize
        />
        <div v-else class="w-full h-full">
          <BaseSkeleton variant="image" class="w-full h-full rounded-xl" />
        </div>
      </div>
    </div>

    <!-- Recent Donation Programs -->
    <div
      class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm overflow-hidden"
    >
      <div
        class="p-6 border-b border-gray-100 dark:border-gray-700/50 flex flex-wrap justify-between items-start gap-3"
      >
        <div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-white">Program Donasi Terbaru</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Daftar program donasi yang aktif di yayasan.
          </p>
        </div>
        <RouterLink
          :to="{ name: 'dashboard-donation-programs' }"
          class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
        >
          Lihat Semua
          <ChevronRight class="w-3.5 h-3.5" />
        </RouterLink>
      </div>

      <!-- Loading State -->
      <div v-if="isProgramsLoading" class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-4">
          <BaseSkeleton variant="text-sm" class="w-1/3" />
          <BaseSkeleton variant="text-sm" class="w-1/4" />
          <BaseSkeleton variant="text-sm" class="w-16" />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="donationPrograms.length === 0"
        class="p-12 text-center text-gray-500 dark:text-gray-400"
      >
        <HandHeart class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p class="font-medium">Tidak ada program donasi saat ini</p>
      </div>

      <!-- Table / List -->
      <div v-else>
        <!-- Mobile card list (< sm) -->
        <div class="sm:hidden divide-y divide-gray-100 dark:divide-gray-700/40">
          <div v-for="program in donationPrograms" :key="program.id" class="p-4 space-y-3">
            <!-- Title + Status -->
            <div class="flex items-start justify-between gap-2">
              <div class="flex flex-col min-w-0">
                <span
                  class="font-semibold text-gray-900 dark:text-white truncate"
                  :title="program.title"
                >
                  {{ program.title }}
                </span>
                <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                  <Calendar class="w-3.5 h-3.5 flex-shrink-0" />
                  {{ formatDate(program.startDate) }} – {{ formatDate(program.endDate) }}
                </span>
              </div>
              <span
                :class="[
                  'shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                  getStatusColor(program.status),
                ]"
              >
                {{ formatStatus(program.status) }}
              </span>
            </div>

            <!-- Progress bar -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Terkumpul</span>
                <span class="font-bold font-mono text-gray-900 dark:text-white">
                  {{ getProgressPercentage(program.fundTarget, program.collectedFund) }}%
                </span>
              </div>
              <div class="w-full bg-gray-100 dark:bg-gray-700/60 h-2 rounded-full overflow-hidden">
                <div
                  class="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  :style="{
                    width: `${getProgressPercentage(program.fundTarget, program.collectedFund)}%`,
                  }"
                />
              </div>
            </div>

            <!-- Fund amounts + action -->
            <div class="flex items-center justify-between gap-3">
              <div class="font-mono text-sm">
                <span class="font-bold text-gray-900 dark:text-white">
                  {{ formatCurrency(program.collectedFund) }}
                </span>
                <span class="text-xs text-gray-400 dark:text-gray-500 block">
                  Target: {{ formatCurrency(program.fundTarget) }}
                </span>
              </div>
              <RouterLink
                :to="{ name: 'dashboard-donation-programs-detail', params: { id: program.id } }"
                class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-gray-200 dark:border-gray-700/60 rounded-lg bg-gray-50/50 dark:bg-gray-800/40 hover:bg-primary-50/20 dark:hover:bg-primary-950/10 transition-colors duration-200"
              >
                Detail
                <ChevronRight class="w-3.5 h-3.5" />
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Desktop table (>= sm) -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr
                class="bg-gray-50/50 dark:bg-gray-800/20 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50"
              >
                <th class="px-6 py-4">Program Donasi</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Terkumpul / Target</th>
                <th class="px-6 py-4">Persentase</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/40">
              <tr
                v-for="program in donationPrograms"
                :key="program.id"
                class="hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors duration-150"
              >
                <td class="px-6 py-4 max-w-sm">
                  <div class="flex flex-col">
                    <span
                      class="font-semibold text-gray-900 dark:text-white truncate"
                      :title="program.title"
                    >
                      {{ program.title }}
                    </span>
                    <span
                      class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1"
                    >
                      <Calendar class="w-3.5 h-3.5" />
                      {{ formatDate(program.startDate) }} - {{ formatDate(program.endDate) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                      getStatusColor(program.status),
                    ]"
                  >
                    {{ formatStatus(program.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap font-mono text-sm">
                  <div class="flex flex-col">
                    <span class="font-bold text-gray-900 dark:text-white">
                      {{ formatCurrency(program.collectedFund) }}
                    </span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">
                      Target: {{ formatCurrency(program.fundTarget) }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="w-32 flex items-center gap-3">
                    <div
                      class="w-full bg-gray-100 dark:bg-gray-700/60 h-2 rounded-full overflow-hidden"
                    >
                      <div
                        class="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        :style="{
                          width: `${getProgressPercentage(program.fundTarget, program.collectedFund)}%`,
                        }"
                      ></div>
                    </div>
                    <span class="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono">
                      {{ getProgressPercentage(program.fundTarget, program.collectedFund) }}%
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <RouterLink
                    :to="{ name: 'dashboard-donation-programs-detail', params: { id: program.id } }"
                    class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-gray-150 dark:border-gray-700/60 rounded-lg bg-gray-50/50 dark:bg-gray-800/40 hover:bg-primary-50/20 dark:hover:bg-primary-950/10 transition-colors duration-200"
                  >
                    Detail
                    <ChevronRight class="w-3.5 h-3.5" />
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
