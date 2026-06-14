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
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useTheme } from '@/composables/ui/useTheme'
import { useAdminFinanceRecordSummary } from '@/composables/financeRecord/useFinanceRecordSummary'
import { useDonationProgramAdminList } from '@/composables/donationProgram/useDonationProgramAdminList'
import { formatCurrency, formatDate, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { Motion } from 'motion-v'
import {
  HandHeart,
  Briefcase,
  Baby,
  ChevronRight,
  Calendar,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-vue-next'

// Register ECharts modules
use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

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

// Nav links setup
const navLinks = [
  {
    label: 'Program Donasi',
    routeName: 'dashboard-donation-programs',
    icon: HandHeart,
  },
  {
    label: 'Riwayat Donasi',
    routeName: 'dashboard-donation-programs-income',
    icon: TrendingUp,
  },
  {
    label: 'Pengeluaran Donasi',
    routeName: 'dashboard-donation-programs-expense',
    icon: TrendingDown,
  },
  {
    label: 'Pengeluaran Program Sosial',
    routeName: 'dashboard-social-programs-expense',
    icon: Briefcase,
  },
  {
    label: 'Pengeluaran Anak Asuh',
    routeName: 'dashboard-foster-children-expense',
    icon: Baby,
  },
]

// ECharts configurations
const chartOption = computed(() => {
  const isDarkMode = isDark.value

  const lightColors = {
    income: '#10b981', // emerald-500
    expense: '#f43f5e', // rose-500
    text: '#374151', // gray-700
    gridLine: '#e5e7eb', // gray-200
  }

  const darkColors = {
    income: '#34d399', // emerald-400
    expense: '#fb7185', // rose-400
    text: '#9ca3af', // gray-400
    gridLine: '#374151', // gray-700
  }

  const themeColors = isDarkMode ? darkColors : lightColors

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
      borderColor: isDarkMode ? '#374151' : '#e5e7eb',
      textStyle: {
        color: isDarkMode ? '#f3f4f6' : '#1f2937',
      },
      formatter: (params: any) => {
        let res = `<div class="font-sans text-xs p-1"><span class="font-bold block mb-1 text-sm border-b border-gray-200 dark:border-gray-700 pb-1">${params[0].name}</span>`
        params.forEach((item: any) => {
          const val = formatCurrency(item.value)
          res += `<div class="flex items-center justify-between gap-4 my-1">
            <span class="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">${item.marker} ${item.seriesName}</span>
            <span class="font-bold font-mono text-gray-900 dark:text-white">${val}</span>
          </div>`
        })
        res += '</div>'
        return res
      },
    },
    legend: {
      data: ['Pendapatan (Donasi)', 'Pengeluaran (Realisasi)'],
      textStyle: {
        color: themeColors.text,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: '500',
      },
      bottom: '0%',
    },
    grid: {
      left: '2%',
      right: '2%',
      bottom: '12%',
      top: '8%',
      containLabel: true,
    },
    xAxis: [
      {
        type: 'category',
        data: ['Program Donasi', 'Program Sosial', 'Anak Asuh'],
        axisLabel: {
          color: themeColors.text,
          fontFamily: 'system-ui, sans-serif',
          fontWeight: '500',
        },
        axisLine: {
          lineStyle: {
            color: themeColors.gridLine,
          },
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          color: themeColors.text,
          fontFamily: 'system-ui, sans-serif',
          formatter: (value: number) => {
            if (value >= 1e6) {
              return `Rp ${(value / 1e6).toFixed(1)}jt`
            }
            if (value >= 1e3) {
              return `Rp ${(value / 1e3).toFixed(0)}rb`
            }
            return `Rp ${value}`
          },
        },
        axisLine: {
          show: false,
        },
        splitLine: {
          lineStyle: {
            color: themeColors.gridLine,
            type: 'dashed',
          },
        },
      },
    ],
    series: [
      {
        name: 'Pendapatan (Donasi)',
        type: 'bar',
        barWidth: '24%',
        barGap: '35%',
        data: [
          summary.value.totalDonationProgramIncome,
          summary.value.totalSocialProgramIncome,
          summary.value.totalFosterChildrenIncome,
        ],
        itemStyle: {
          color: themeColors.income,
          borderRadius: [4, 4, 0, 0],
        },
      },
      {
        name: 'Pengeluaran (Realisasi)',
        type: 'bar',
        barWidth: '24%',
        data: [
          summary.value.totalDonationProgramExpense,
          summary.value.totalSocialProgramExpense,
          summary.value.totalFosterChildrenExpense,
        ],
        itemStyle: {
          color: themeColors.expense,
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  }
})
</script>

<template>
  <div class="space-y-8 font-poppins">
    <!-- Header Summary Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 class="text-xl font-bold text-gray-950 dark:text-white flex items-center gap-2">
          Ringkasan Keuangan
        </h2>
      </div>
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
    <div v-if="isLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

    <!-- Chart & Quick Links -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Chart Card (Span 2) -->
      <div
        class="lg:col-span-2 border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-sm flex flex-col justify-between"
      >
        <div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-white">
            Perbandingan Pendapatan dan Pengeluaran
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualisasi realisasi anggaran pilar utama yayasan.
          </p>
        </div>

        <!-- ECharts Wrapper -->
        <div class="h-80 w-full mt-4 flex items-center justify-center">
          <VChart
            v-if="!isLoading"
            class="w-full h-full"
            :option="chartOption"
            :theme="chartTheme"
            autoresize
          />
          <div v-else class="w-full h-full">
            <BaseSkeleton variant="image" class="w-full h-full rounded-xl" />
          </div>
        </div>
      </div>

      <!-- Quick Navigation (Span 1) -->
      <div
        class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-sm flex flex-col justify-between"
      >
        <div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-white mb-1">Navigasi Keuangan</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Akses cepat menu pengelolaan keuangan.
          </p>

          <div class="space-y-3">
            <RouterLink
              v-for="link in navLinks"
              :key="link.routeName"
              :to="{ name: link.routeName }"
              class="group flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700/40 hover:border-primary-100 dark:hover:border-primary-900/40 hover:bg-primary-50/20 dark:hover:bg-primary-950/10 transition-all duration-300"
            >
              <div class="flex items-center gap-3">
                <div
                  class="p-2 rounded-lg bg-gray-50 dark:bg-gray-750 text-gray-600 dark:text-gray-400 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300"
                >
                  <component :is="link.icon" class="w-4 h-4" />
                </div>
                <span
                  class="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-300"
                >
                  {{ link.label }}
                </span>
              </div>
              <ChevronRight
                class="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all duration-300"
              />
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Donation Programs -->
    <div
      class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm overflow-hidden"
    >
      <div
        class="p-6 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center"
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
      <div v-else class="overflow-x-auto">
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
</template>
