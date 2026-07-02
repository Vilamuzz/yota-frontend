<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { useTheme } from '@/composables/ui/useTheme'
import { useFosterChildrenCandidateList } from '@/composables/fosterChildrenCandidate/useFosterChildrenCandidateList'
import { useSocialProgramList } from '@/composables/socialProgram/useSocialProgramList'
import { FosterChildrenCandidateStatus } from '@/types/fosterChildrenCandidate'
import { SocialProgramStatusEnum } from '@/types/socialProgram'
import { formatDate, formatCurrency } from '@/utils/format'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { Motion } from 'motion-v'
import { NotepadText, Baby, ChevronRight, Calendar, AlertCircle } from 'lucide-vue-next'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const toTitleCase = (str: string) =>
  str.replace(/\b\w/g, (char) => char.toUpperCase())
const { isDark } = useTheme()
const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))

const candidateAcceptedParams = {
  status: FosterChildrenCandidateStatus.SOCIAL_MANAGER_ACCEPTED,
  limit: 1,
  page: 1,
}
const { pagination: candidateAcceptedPagination, listQuery: candidateAcceptedQuery } =
  useFosterChildrenCandidateList(candidateAcceptedParams)

const candidateRejectedParams = {
  status: FosterChildrenCandidateStatus.REJECTED,
  limit: 1,
  page: 1,
}
const { pagination: candidateRejectedPagination, listQuery: candidateRejectedQuery } =
  useFosterChildrenCandidateList(candidateRejectedParams)

const socialProgramAcceptedParams = {
  status: SocialProgramStatusEnum.ACTIVE,
  limit: 1,
  page: 1,
}
const { pagination: socialProgramAcceptedPagination, listQuery: socialProgramAcceptedQuery } =
  useSocialProgramList(socialProgramAcceptedParams)

const socialProgramRejectedParams = {
  status: SocialProgramStatusEnum.REJECTED,
  limit: 1,
  page: 1,
}
const { pagination: socialProgramRejectedPagination, listQuery: socialProgramRejectedQuery } =
  useSocialProgramList(socialProgramRejectedParams)

const totalAcceptedFosterChildren = computed(() => candidateAcceptedPagination.value?.total ?? 0)
const totalRejectedFosterChildren = computed(() => candidateRejectedPagination.value?.total ?? 0)
const totalAcceptedSocialPrograms = computed(() => socialProgramAcceptedPagination.value?.total ?? 0)
const totalRejectedSocialPrograms = computed(() => socialProgramRejectedPagination.value?.total ?? 0)

const isSummaryLoading = computed(
  () =>
    candidateAcceptedQuery.isPending.value ||
    candidateRejectedQuery.isPending.value ||
    socialProgramAcceptedQuery.isPending.value ||
    socialProgramRejectedQuery.isPending.value,
)
const isError = computed(
  () =>
    candidateAcceptedQuery.isError.value ||
    candidateRejectedQuery.isError.value ||
    socialProgramAcceptedQuery.isError.value ||
    socialProgramRejectedQuery.isError.value,
)

const MODULE_TABS: { key: 'social_program' | 'foster_children'; label: string }[] = [
  { key: 'social_program', label: 'Program Berkelanjutan' },
  { key: 'foster_children', label: 'Anak Asuh' },
]
const activeModule = ref<'social_program' | 'foster_children'>('social_program')

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const currentYear = new Date().getFullYear()
const periodOptions = computed(() => {
  const options: { value: number; label: string }[] = []
  for (let y = currentYear; y >= currentYear - 5; y--) {
    options.push({ value: y, label: `Tahun ${y}` })
  }
  return options
})

const selectedYear = ref(currentYear)
const selectedPeriodLabel = computed(
  () => periodOptions.value.find((o) => o.value === selectedYear.value)?.label ?? '',
)

const periodDateRange = computed(() => ({
  startDate: `${selectedYear.value}-01-01`,
  endDate: `${selectedYear.value}-12-31`,
}))

const socialProgramPeriodParams = computed(() => ({
  status: SocialProgramStatusEnum.ACTIVE,
  sortBy: 'created_at desc',
  limit: 100,
  page: 1,
  startDate: periodDateRange.value.startDate,
  endDate: periodDateRange.value.endDate,
}))
const {
  socialPrograms: socialProgramPeriodItems,
  listQuery: socialProgramPeriodQuery,
} = useSocialProgramList(socialProgramPeriodParams)

const fosterCandidatePeriodParams = {
  status: FosterChildrenCandidateStatus.SOCIAL_MANAGER_ACCEPTED,
  sortBy: 'created_at desc',
  limit: 100,
  page: 1,
}
const {
  candidates: fosterCandidateAllItems,
  listQuery: fosterCandidatePeriodQuery,
} = useFosterChildrenCandidateList(fosterCandidatePeriodParams)

const fosterCandidatePeriodItems = computed(() =>
  fosterCandidateAllItems.value.filter((c) => new Date(c.createdAt).getFullYear() === selectedYear.value),
)

const isPeriodLoading = computed(() =>
  activeModule.value === 'social_program'
    ? socialProgramPeriodQuery.isPending.value
    : fosterCandidatePeriodQuery.isPending.value,
)

type TableItem = { id: string; title: string; submittedAt: string; extra: string }

const tableItems = computed<TableItem[]>(() => {
  if (activeModule.value === 'social_program') {
    return socialProgramPeriodItems.value.map((s) => ({
      id: s.id,
      title: s.title,
      submittedAt: s.createdAt,
      extra: `${formatCurrency(s.minimumAmount)}`,
    }))
  }
  return fosterCandidatePeriodItems.value.map((c) => ({
    id: c.id,
    title: c.name,
    submittedAt: c.createdAt,
    extra: `${toTitleCase(c.category)}`,
  }))
})

const detailRoute = (item: TableItem) =>
  activeModule.value === 'social_program'
    ? { name: 'dashboard-social-programs-detail', params: { id: item.id } }
    : { name: 'dashboard-foster-children-candidates-detail', params: { id: item.id } }

const chartOption = computed(() => {
  const isDarkMode = isDark.value
  const c = {
    bar: activeModule.value === 'social_program' ? (isDarkMode ? '#60a5fa' : '#2563eb') : isDarkMode ? '#a78bfa' : '#7c3aed',
    text: isDarkMode ? '#9ca3af' : '#374151',
    gridLine: isDarkMode ? '#374151' : '#e5e7eb',
    bg: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    tooltip: isDarkMode ? '#f3f4f6' : '#1f2937',
  }

  const data = Array(12).fill(0)
  tableItems.value.forEach((item) => {
    const month = new Date(item.submittedAt).getMonth()
    data[month] += 1
  })

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.bg,
      borderColor: c.border,
      textStyle: { color: c.tooltip },
    },
    grid: { left: '2%', right: '3%', bottom: '8%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: MONTH_NAMES.map((m) => m.slice(0, 3)),
      axisLabel: { color: c.text, fontFamily: 'system-ui, sans-serif' },
      axisLine: { lineStyle: { color: c.gridLine } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: c.text, fontFamily: 'system-ui, sans-serif' },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: c.gridLine, type: 'dashed' } },
    },
    series: [
      {
        name: activeModule.value === 'social_program' ? 'Program Berkelanjutan' : 'Anak Asuh',
        type: 'bar',
        barWidth: '55%',
        data,
        itemStyle: { color: c.bar, borderRadius: [4, 4, 0, 0] },
      },
    ],
  }
})
</script>

<template>
  <div class="space-y-8 font-poppins">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <h2 class="text-xl font-bold text-gray-950 dark:text-white">Dashboard Ketua Yayasan</h2>
    </div>

    <!-- Error State -->
    <div
      v-if="isError"
      class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-4 rounded-xl flex items-start gap-3 text-red-800 dark:text-red-300"
    >
      <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
      <div>
        <h4 class="font-semibold">Gagal memuat data</h4>
        <p class="text-sm mt-1">Silakan coba muat ulang halaman atau periksa koneksi internet Anda.</p>
      </div>
    </div>

    <!-- Skeleton Loaders -->
    <div v-if="isSummaryLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="i in 2"
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

    <!-- Summary Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Social Program -->
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
              <HandHeart class="w-5 h-5" />
            </div>
          </div>
          <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Ajuan Program Berkelanjutan
          </h3>
        </div>

        <div class="mt-6 pt-4 border-t border-blue-100/50 dark:border-blue-950/50 grid grid-cols-2 gap-4">
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Diterima
            </span>
            <p class="font-bold text-xl text-emerald-600 dark:text-emerald-400 font-mono">
              {{ totalAcceptedSocialPrograms }}
            </p>
          </div>
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Ditolak
            </span>
            <p class="font-bold text-xl text-rose-600 dark:text-rose-400 font-mono">
              {{ totalRejectedSocialPrograms }}
            </p>
          </div>
        </div>
      </Motion>

      <!-- Foster Children -->
      <Motion
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: 0.1 }"
        class="group relative overflow-hidden border border-violet-100 dark:border-violet-900/10 bg-linear-to-br from-white to-violet-50/5 dark:from-gray-900/60 dark:to-violet-950/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
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
          <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Ajuan Anak Asuh
          </h3>
        </div>

        <div class="mt-6 pt-4 border-t border-violet-100/50 dark:border-violet-950/50 grid grid-cols-2 gap-4">
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Diterima
            </span>
            <p class="font-bold text-xl text-emerald-600 dark:text-emerald-400 font-mono">
              {{ totalAcceptedFosterChildren }}
            </p>
          </div>
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Ditolak
            </span>
            <p class="font-bold text-xl text-rose-600 dark:text-rose-400 font-mono">
              {{ totalRejectedFosterChildren }}
            </p>
          </div>
        </div>
      </Motion>
    </div>

    <!-- Chart Card: Tab modul + dropdown bulan-tahun -->
    <div class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-white">
            Tren {{ activeModule === 'social_program' ? 'Program Berkelanjutan' : 'Anak Asuh' }} Tervalidasi
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Jumlah tervalidasi per bulan · {{ selectedPeriodLabel }}</p>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <!-- Module Tabs -->
          <div class="flex flex-col md:flex-row w-full sm:w-auto items-stretch sm:items-center gap-1 p-1 bg-gray-100/80 dark:bg-gray-700/40 rounded-xl self-start sm:self-auto">
            <button
              v-for="tab in MODULE_TABS"
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

          <!-- Month-Year Dropdown -->
          <div class="relative w-full sm:w-44 shrink-0">
            <select
              v-model="selectedYear"
              class="w-full pl-3 pr-8 py-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/80 appearance-none cursor-pointer shadow-sm transition-all"
            >
              <option v-for="opt in periodOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
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
        <VChart v-if="!isPeriodLoading" class="w-full h-full" :option="chartOption" :theme="chartTheme" autoresize />
        <div v-else class="w-full h-full">
          <BaseSkeleton variant="image" class="w-full h-full rounded-xl" />
        </div>
      </div>
    </div>

    <!-- Table Card: mengikuti tab aktif -->
    <div class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-100 dark:border-gray-700/50 flex flex-wrap justify-between items-start gap-3">
        <div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-white">
            {{ activeModule === 'social_program' ? 'Program Berkelanjutan Tervalidasi' : 'Anak Asuh Tervalidasi' }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Daftar {{ activeModule === 'social_program' ? 'program berkelanjutan' : 'calon anak asuh' }} tervalidasi pada {{ selectedPeriodLabel }}.
          </p>
        </div>
        <RouterLink
          :to="
            activeModule === 'social_program'
              ? { name: 'dashboard-social-programs' }
              : { name: 'dashboard-foster-children-candidates' }
          "
          class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
        >
          Lihat Semua
          <ChevronRight class="w-3.5 h-3.5" />
        </RouterLink>
      </div>

      <!-- Loading -->
      <div v-if="isPeriodLoading" class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-4">
          <BaseSkeleton variant="text-sm" class="w-1/3" />
          <BaseSkeleton variant="text-sm" class="w-1/4" />
          <BaseSkeleton variant="text-sm" class="w-16" />
        </div>
      </div>

      <!-- Empty -->
      <div v-else-if="tableItems.length === 0" class="p-12 text-center text-gray-500 dark:text-gray-400">
        <component :is="activeModule === 'social_program' ? NotepadText : Baby" class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p class="font-medium">
          Tidak ada {{ activeModule === 'social_program' ? 'program berkelanjutan' : 'anak asuh' }} tervalidasi pada {{ selectedPeriodLabel }}
        </p>
      </div>

      <div v-else>
        <!-- Mobile card list -->
        <div class="sm:hidden divide-y divide-gray-100 dark:divide-gray-700/40">
          <div v-for="item in tableItems" :key="item.id" class="p-4 space-y-3">
            <div class="flex items-start justify-between gap-2">
              <div class="flex flex-col min-w-0">
                <span class="font-semibold text-gray-900 dark:text-white truncate" :title="item.title">
                  {{ item.title }}
                </span>
                <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
                  <Calendar class="w-3.5 h-3.5 shrink-0" />
                  {{ formatDate(item.submittedAt) }}
                </span>
              </div>
              <span class="shrink-0 text-xs text-gray-500 dark:text-gray-400">{{ item.extra }}</span>
            </div>
            <RouterLink
              :to="detailRoute(item)"
              class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-gray-200 dark:border-gray-700/60 rounded-lg bg-gray-50/50 dark:bg-gray-800/40 hover:bg-primary-50/20 dark:hover:bg-primary-950/10 transition-colors duration-200"
            >
              Detail
              <ChevronRight class="w-3.5 h-3.5" />
            </RouterLink>
          </div>
        </div>

        <!-- Desktop table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/20 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50">
                <th class="px-6 py-4">{{ activeModule === 'social_program' ? 'Program' : 'Nama' }}</th>
                <th class="px-6 py-4">{{ activeModule === 'social_program' ? 'Nominal Minimal' : 'Kategori' }}</th>
                <th class="px-6 py-4">Tervalidasi</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/40">
              <tr
                v-for="item in tableItems"
                :key="item.id"
                class="hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors duration-150"
              >
                <td class="px-6 py-4 max-w-sm">
                  <span class="font-semibold text-gray-900 dark:text-white truncate" :title="item.title">
                    {{ item.title }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ item.extra }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center gap-1.5">
                    <Calendar class="w-3.5 h-3.5" />
                    {{ formatDate(item.submittedAt) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center whitespace-nowrap">
                  <RouterLink
                    :to="detailRoute(item)"
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
