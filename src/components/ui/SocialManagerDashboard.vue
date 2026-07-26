<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
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
import { useSocialProgramList } from '@/composables/socialProgram/useSocialProgramList'
import { useFosterChildrenList } from '@/composables/fosterChildren/useFosterChildrenList'
import { formatCurrency, formatDate, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { Motion } from 'motion-v'
import type { FinanceModuleType } from '@/types/financeRecord'
import { Briefcase, Baby, ChevronRight, AlertCircle } from 'lucide-vue-next'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  MarkAreaComponent,
])

const { isDark } = useTheme()
const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))

// Finance summary
const { summaryQuery } = useAdminFinanceRecordSummary()
const summary = computed(
  () =>
    summaryQuery.data.value?.data || {
      totalSocialProgram: 0,
      totalFosterChildren: 0,
      totalSocialProgramExpense: 0,
      totalFosterChildrenExpense: 0,
      totalSocialProgramIncome: 0,
      totalFosterChildrenIncome: 0,
    },
)

const socialBalance = computed(
  () => (summary.value.totalSocialProgramIncome ?? 0) - summary.value.totalSocialProgramExpense,
)
const fosterBalance = computed(
  () => (summary.value.totalFosterChildrenIncome ?? 0) - summary.value.totalFosterChildrenExpense,
)

// Recent social programs
const queryParams = ref({ limit: 5, page: 1, sortBy: 'created_at desc' })
const { socialPrograms, isLoading: isProgramsLoading } = useSocialProgramList(queryParams)

// Recent foster children
const fosterChildrenParams = ref({ limit: 5, page: 1, sortBy: 'created_at desc' })
const { fosterChildren, isLoading: isFosterLoading } = useFosterChildrenList(fosterChildrenParams, true)

const isLoading = computed(() => summaryQuery.isPending.value || isProgramsLoading.value)

// Monthly Trend Chart
const MONTH_TABS: { key: FinanceModuleType; label: string }[] = [
  { key: 'social_program', label: 'Program Berkelanjutan' },
  { key: 'foster_children', label: 'Anak Asuh' },
]

const activeModule = ref<FinanceModuleType>('social_program')
const currentYear = new Date().getFullYear()
const selectedYear = ref(currentYear)
const availableYears = computed(() => {
  const years = []
  for (let y = currentYear; y >= currentYear - 5; y--) years.push(y)
  return years
})

const trendParams = computed(() => ({ module: activeModule.value, year: selectedYear.value }))
const { trendQuery, trendItems } = useAdminFinanceMonthlyTrend(trendParams)
const isTrendLoading = computed(() => trendQuery.isPending.value)

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

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

  const incomeData = Array(12).fill(0)
  const expenseData = Array(12).fill(0)
  trendItems.value.forEach((item) => {
    const idx = parseInt(item.month.split('-')[1] || '', 10) - 1
    if (idx >= 0 && idx < 12) {
      incomeData[idx] = item.income
      expenseData[idx] = item.expense
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
      textStyle: { color: c.text, fontFamily: 'system-ui,sans-serif', fontWeight: '500' },
      bottom: '0%',
    },
    grid: { left: '2%', right: '2%', bottom: '12%', top: '8%', containLabel: true },
    xAxis: [{
      type: 'category',
      data: MONTH_LABELS,
      boundaryGap: false,
      axisLabel: { color: c.text, fontFamily: 'system-ui, sans-serif' },
      axisLine: { lineStyle: { color: c.gridLine } },
      axisTick: { show: false },
    }],
    yAxis: [{
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
    }],
    series: [
      {
        name: 'Pendapatan',
        type: 'bar',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: incomeData,
        lineStyle: { color: c.income, width: 2.5 },
        itemStyle: { color: c.income },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: isDarkMode ? 'rgba(52,211,153,0.25)' : 'rgba(16,185,129,0.18)' },
              { offset: 1, color: 'rgba(0,0,0,0)' },
            ],
          },
        },
      },
      {
        name: 'Pengeluaran',
        type: 'bar',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: expenseData,
        lineStyle: { color: c.expense, width: 2.5 },
        itemStyle: { color: c.expense },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
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
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <h2 class="text-xl font-bold text-gray-950 dark:text-white">Ringkasan Program Berkelanjutan</h2>
    </div>

    <!-- Error State -->
    <div
      v-if="summaryQuery.isError.value"
      class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-4 rounded-xl flex items-start gap-3 text-red-800 dark:text-red-300"
    >
      <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <h4 class="font-semibold">Gagal memuat data</h4>
        <p class="text-sm mt-1">Silakan coba muat ulang halaman atau periksa koneksi internet Anda.</p>
      </div>
    </div>

    <!-- Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div v-for="i in 2" :key="i" class="border border-gray-200/50 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 rounded-2xl space-y-4 shadow-sm">
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
          <div><BaseSkeleton variant="text-xs" class="w-1/2 mb-2" /><BaseSkeleton variant="text-sm" class="w-2/3" /></div>
          <div><BaseSkeleton variant="text-xs" class="w-1/2 mb-2" /><BaseSkeleton variant="text-sm" class="w-2/3" /></div>
        </div>
      </div>
    </div>

    <!-- Metric Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Program Sosial -->
      <Motion
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: 0.05 }"
        class="group relative overflow-hidden border border-blue-100 dark:border-blue-900/10 bg-linear-to-br from-white to-blue-50/5 dark:from-gray-900/60 dark:to-blue-950/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <span class="px-2.5 py-1 text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full border border-blue-100/50 dark:border-blue-800/30">
              Program Berkelanjutan
            </span>
            <div class="p-2 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Briefcase class="w-5 h-5" />
            </div>
          </div>
          <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Net Saldo Program Berkelanjutan</h3>
          <p class="text-2xl font-extrabold text-gray-950 dark:text-white mt-1.5 select-all font-mono">
            {{ formatCurrency(socialBalance) }}
          </p>
        </div>
        <div class="mt-6 pt-4 border-t border-blue-100/50 dark:border-blue-950/50 grid grid-cols-2 gap-4">
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

      <!-- Anak Asuh -->
      <Motion
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: 0.1 }"
        class="group relative overflow-hidden border border-violet-100 dark:border-violet-900/10 bg--to-br from-white to-violet-50/5 dark:from-gray-900/60 dark:to-violet-950/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <span class="px-2.5 py-1 text-xs font-semibold bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 rounded-full border border-violet-100/50 dark:border-violet-800/30">
              Anak Asuh
            </span>
            <div class="p-2 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-xl">
              <Baby class="w-5 h-5" />
            </div>
          </div>
          <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Net Saldo Anak Asuh</h3>
          <p class="text-2xl font-extrabold text-gray-950 dark:text-white mt-1.5 select-all font-mono">
            {{ formatCurrency(fosterBalance) }}
          </p>
        </div>
        <div class="mt-6 pt-4 border-t border-violet-100/50 dark:border-violet-950/50 grid grid-cols-2 gap-4">
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

    <!-- Line Chart -->
    <div class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-white">Pendapatan vs Pengeluaran</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Perbandingan per bulan · {{ selectedYear }}</p>
        </div>
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div class="flex w-full sm:w-auto items-stretch sm:items-center gap-1 p-1 bg-gray-100/80 dark:bg-gray-700/40 rounded-xl self-start sm:self-auto">
            <button
              v-for="tab in MONTH_TABS"
              :key="tab.key"
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
          <div class="relative w-full sm:w-28 shrink-0">
            <select
              v-model="selectedYear"
              class="w-full pl-3 pr-2 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/80 appearance-none cursor-pointer shadow-sm transition-all"
            >
              <option v-for="year in availableYears" :key="year" :value="year">Tahun {{ year }}</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500 dark:text-gray-400">
              <svg class="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div class="h-72 w-full">
        <VChart v-if="!isTrendLoading" class="w-full h-full" :option="monthlyChartOption" :theme="chartTheme" autoresize />
        <div v-else class="w-full h-full">
          <BaseSkeleton variant="image" class="w-full h-full rounded-xl" />
        </div>
      </div>
    </div>

    <!-- Recent Social Programs -->
    <div class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-100 dark:border-gray-700/50 flex flex-wrap justify-between items-start gap-3">
        <div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-white">Program Berkelanjutan Terbaru</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Daftar program berkelanjutan yang berjalan di yayasan.</p>
        </div>
        <RouterLink
          :to="{ name: 'dashboard-social-programs' }"
          class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
        >
          Lihat Semua <ChevronRight class="w-3.5 h-3.5" />
        </RouterLink>
      </div>

      <div v-if="isProgramsLoading" class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-4">
          <BaseSkeleton variant="text-sm" class="w-1/3" />
          <BaseSkeleton variant="text-sm" class="w-1/4" />
          <BaseSkeleton variant="text-sm" class="w-16" />
        </div>
      </div>

      <div v-else-if="socialPrograms.length === 0" class="p-12 text-center text-gray-500 dark:text-gray-400">
        <Briefcase class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p class="font-medium">Tidak ada program berkelanjutan saat ini</p>
      </div>

      <div v-else class="hidden sm:block overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-50/50 dark:bg-gray-800/20 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50">
              <th class="px-6 py-4">Program Berkelanjutan</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Total Pemasukan</th>
              <th class="px-6 py-4 text-center">Pelanggan Aktif</th>
              <th class="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-700/40">
            <tr
              v-for="program in socialPrograms"
              :key="program.id"
              class="hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors duration-150"
            >
              <td class="px-6 py-4 max-w-sm">
                <span class="font-semibold text-gray-900 dark:text-white truncate block" :title="program.title">
                  {{ program.title }}
                </span>
                <span class="text-xs text-gray-400 dark:text-gray-500 mt-1 block">
                  Dibuat {{ formatDate(program.createdAt) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border', getStatusColor(program.status)]">
                  {{ formatStatus(program.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right whitespace-nowrap font-mono text-sm font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(program.collectedFund ?? 0) }}
              </td>
              <td class="px-6 py-4 text-center whitespace-nowrap font-semibold text-gray-700 dark:text-gray-300">
                {{ program.totalSubscribers }}
              </td>
              <td class="px-6 py-4 text-center whitespace-nowrap">
                <RouterLink
                  :to="{ name: 'dashboard-social-programs-detail', params: { id: program.id } }"
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-gray-200 dark:border-gray-700/60 rounded-lg bg-gray-50/50 dark:bg-gray-800/40 hover:bg-primary-50/20 dark:hover:bg-primary-950/10 transition-colors duration-200"
                >
                  Detail <ChevronRight class="w-3.5 h-3.5" />
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recent Foster Children -->
    <div class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm overflow-hidden">
    <div class="p-6 border-b border-gray-100 dark:border-gray-700/50 flex flex-wrap justify-between items-start gap-3">
        <div>
        <h3 class="text-lg font-bold text-gray-950 dark:text-white">Anak Asuh Terbaru</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Daftar anak asuh yang terdaftar di yayasan.</p>
        </div>
        <RouterLink
        :to="{ name: 'dashboard-foster-children' }"
        class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
        >
        Lihat Semua <ChevronRight class="w-3.5 h-3.5" />
        </RouterLink>
    </div>

    <div v-if="isFosterLoading" class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-4">
        <BaseSkeleton variant="text-sm" class="w-1/3" />
        <BaseSkeleton variant="text-sm" class="w-1/4" />
        <BaseSkeleton variant="text-sm" class="w-16" />
        </div>
    </div>

    <div v-else-if="fosterChildren.length === 0" class="p-12 text-center text-gray-500 dark:text-gray-400">
        <Baby class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p class="font-medium">Tidak ada data anak asuh saat ini</p>
    </div>

    <div v-else class="hidden sm:block overflow-x-auto">
        <table class="w-full border-collapse">
        <thead>
            <tr class="bg-gray-50/50 dark:bg-gray-800/20 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50">
            <th class="px-6 py-4">Nama</th>
            <th class="px-6 py-4">Kategori</th>
            <th class="px-6 py-4">Jenis Kelamin</th>
            <th class="px-6 py-4 text-right">Dana Terkumpul</th>
            <th class="px-6 py-4 text-center">Aksi</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-700/40">
            <tr
            v-for="child in fosterChildren"
            :key="child.id"
            class="hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors duration-150"
            >
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                <img
                    :src="child.profilePicture"
                    :alt="child.name"
                    class="w-8 h-8 rounded-full object-cover shrink-0 bg-gray-100"
                />
                <div>
                    <span class="font-semibold text-gray-900 dark:text-white block">{{ child.name }}</span>
                    <span class="text-xs text-gray-400 dark:text-gray-500">Terdaftar {{ formatDate(child.createdAt) }}</span>
                </div>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-100/50 dark:border-violet-800/30 capitalize">
                {{ child.category }}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 capitalize">
                {{ child.gender }}
            </td>
            <td class="px-6 py-4 text-right whitespace-nowrap font-mono text-sm font-bold text-gray-900 dark:text-white">
                {{ formatCurrency(child.collectedFund ?? 0) }}
            </td>
            <td class="px-6 py-4 text-center whitespace-nowrap">
                <RouterLink
                :to="{ name: 'dashboard-foster-children-detail', params: { id: child.id } }"
                class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-gray-200 dark:border-gray-700/60 rounded-lg bg-gray-50/50 dark:bg-gray-800/40 hover:bg-primary-50/20 dark:hover:bg-primary-950/10 transition-colors duration-200"
                >
                Detail <ChevronRight class="w-3.5 h-3.5" />
                </RouterLink>
            </td>
            </tr>
        </tbody>
        </table>
    </div>
    </div>
  </div>
</template>
