<script setup lang="ts">
import { computed } from 'vue'
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
import { formatDate } from '@/utils/format'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { Motion } from 'motion-v'
import { HandHeart, Baby, ClipboardCheck, ChevronRight, Calendar, AlertCircle } from 'lucide-vue-next'

use([CanvasRenderer, BarChart, GridComponent, TooltipComponent])

const { isDark } = useTheme()
const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))

const candidateParams = {
  status: FosterChildrenCandidateStatus.SOCIAL_MANAGER_ACCEPTED,
  sortBy: 'created_at desc',
  limit: 5,
  page: 1,
}
const { candidates, pagination: candidatePagination, listQuery: candidateQuery } =
  useFosterChildrenCandidateList(candidateParams)

const socialProgramParams = {
  status: SocialProgramStatusEnum.ACTIVE,
  sortBy: 'created_at desc',
  limit: 5,
  page: 1,
}
const { socialPrograms, pagination: socialProgramPagination, listQuery: socialProgramQuery } =
  useSocialProgramList(socialProgramParams)

const isLoading = computed(() => candidateQuery.isPending.value || socialProgramQuery.isPending.value)
const isError = computed(() => candidateQuery.isError.value || socialProgramQuery.isError.value)

const totalAcceptedFosterChildren = computed(() => candidatePagination.value?.total ?? 0)
const totalAcceptedSocialPrograms = computed(() => socialProgramPagination.value?.total ?? 0)
const totalAccepted = computed(() => totalAcceptedFosterChildren.value + totalAcceptedSocialPrograms.value)

type AcceptedType = 'foster_children' | 'social_program'
interface AcceptedItem {
  id: string
  title: string
  type: AcceptedType
  submittedAt: string
}

const acceptedItems = computed<AcceptedItem[]>(() => {
  const fosterItems: AcceptedItem[] = candidates.value.map((c) => ({
    id: c.id,
    title: c.name,
    type: 'foster_children',
    submittedAt: c.createdAt,
  }))
  const socialItems: AcceptedItem[] = socialPrograms.value.map((s) => ({
    id: s.id,
    title: s.title,
    type: 'social_program',
    submittedAt: s.createdAt,
  }))
  return [...fosterItems, ...socialItems]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 8)
})

const typeLabel = (type: AcceptedType) => (type === 'social_program' ? 'Program Sosial' : 'Anak Asuh')

const typeColor = (type: AcceptedType) =>
  type === 'social_program'
    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100/50 dark:border-blue-800/30'
    : 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-100/50 dark:border-violet-800/30'

const detailRoute = (item: AcceptedItem) =>
  item.type === 'social_program'
    ? { name: 'dashboard-social-programs-detail', params: { id: item.id } }
    : { name: 'dashboard-foster-children-candidates-detail', params: { id: item.id } }

const comparisonChartOption = computed(() => {
  const isDarkMode = isDark.value
  const c = {
    social: isDarkMode ? '#60a5fa' : '#2563eb',
    foster: isDarkMode ? '#a78bfa' : '#7c3aed',
    text: isDarkMode ? '#9ca3af' : '#374151',
    gridLine: isDarkMode ? '#374151' : '#e5e7eb',
    bg: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#e5e7eb',
  }

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.bg,
      borderColor: c.border,
      textStyle: { color: isDarkMode ? '#f3f4f6' : '#1f2937' },
    },
    grid: { left: '3%', right: '4%', bottom: '6%', top: '6%', containLabel: true },
    xAxis: {
      type: 'value',
      axisLabel: { color: c.text },
      axisLine: { show: false },
      splitLine: { lineStyle: { color: c.gridLine, type: 'dashed' } },
    },
    yAxis: {
      type: 'category',
      data: ['Program Sosial', 'Anak Asuh'],
      axisLabel: { color: c.text, fontFamily: 'system-ui, sans-serif' },
      axisLine: { lineStyle: { color: c.gridLine } },
      axisTick: { show: false },
    },
    series: [
      {
        type: 'bar',
        barWidth: 28,
        data: [
          { value: totalAcceptedSocialPrograms.value, itemStyle: { color: c.social, borderRadius: [0, 6, 6, 0] } },
          { value: totalAcceptedFosterChildren.value, itemStyle: { color: c.foster, borderRadius: [0, 6, 6, 0] } },
        ],
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
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>
    </div>

    <!-- Summary Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            Program Berkelanjutan Tervalidasi
          </h3>
          <p class="text-2xl font-extrabold text-gray-950 dark:text-white mt-1.5 select-all font-mono">
            {{ totalAcceptedSocialPrograms }}
          </p>
        </div>
        <RouterLink
          :to="{ name: 'dashboard-social-programs' }"
          class="mt-4 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
        >
          Lihat semua ajuan
          <ChevronRight class="w-3.5 h-3.5" />
        </RouterLink>
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
            Ajuan Anak Asuh Tervalidasi
          </h3>
          <p class="text-2xl font-extrabold text-gray-950 dark:text-white mt-1.5 select-all font-mono">
            {{ totalAcceptedFosterChildren }}
          </p>
        </div>
        <RouterLink
          :to="{ name: 'dashboard-foster-children-candidates' }"
          class="mt-4 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 flex items-center gap-1"
        >
          Lihat semua ajuan
          <ChevronRight class="w-3.5 h-3.5" />
        </RouterLink>
      </Motion>

      <!-- Total Pending -->
      <Motion
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: 0.15 }"
        class="group relative overflow-hidden border border-amber-100 dark:border-amber-900/10 bg-linear-to-br from-white to-amber-50/5 dark:from-gray-900/60 dark:to-amber-950/5 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <span class="px-2.5 py-1 text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full border border-amber-100/50 dark:border-amber-800/30">
              Total
            </span>
            <div class="p-2 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <ClipboardCheck class="w-5 h-5" />
            </div>
          </div>
          <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Seluruh Ajuan Diterima
          </h3>
          <p class="text-2xl font-extrabold text-gray-950 dark:text-white mt-1.5 select-all font-mono">
            {{ totalAccepted }}
          </p>
        </div>
      </Motion>
    </div>

    <!-- Comparison Chart -->
    <div class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
      <div>
        <h3 class="text-lg font-bold text-gray-950 dark:text-white">Ajuan Menunggu Validasi</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Perbandingan jumlah ajuan per modul saat ini</p>
      </div>

      <div class="h-56 w-full">
        <VChart v-if="!isLoading" class="w-full h-full" :option="comparisonChartOption" :theme="chartTheme" autoresize />
        <div v-else class="w-full h-full">
          <BaseSkeleton variant="image" class="w-full h-full rounded-xl" />
        </div>
      </div>
    </div>

    <!-- Pending Items Table -->
    <div class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-100 dark:border-gray-700/50">
        <h3 class="text-lg font-bold text-gray-950 dark:text-white">Ajuan Terbaru Menunggu Validasi</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Daftar ajuan program sosial dan anak asuh yang perlu Anda tinjau.
        </p>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && acceptedItems.length === 0" class="p-12 text-center text-gray-500 dark:text-gray-400">
        <ClipboardCheck class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <p class="font-medium">Tidak ada ajuan yang diterima</p>
      </div>

      <!-- Loading -->
      <div v-else-if="isLoading" class="p-6 space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-4">
          <BaseSkeleton variant="text-sm" class="w-1/3" />
          <BaseSkeleton variant="text-sm" class="w-1/4" />
          <BaseSkeleton variant="text-sm" class="w-16" />
        </div>
      </div>

      <div v-else>
        <!-- Mobile card list -->
        <div class="sm:hidden divide-y divide-gray-100 dark:divide-gray-700/40">
          <div v-for="item in acceptedItems" :key="`${item.type}-${item.id}`" class="p-4 space-y-3">
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
              <span :class="['shrink-0 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border', typeColor(item.type)]">
                {{ typeLabel(item.type) }}
              </span>
            </div>
            <RouterLink
              :to="detailRoute(item)"
              class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 border border-gray-200 dark:border-gray-700/60 rounded-lg bg-gray-50/50 dark:bg-gray-800/40 hover:bg-primary-50/20 dark:hover:bg-primary-950/10 transition-colors duration-200"
            >
              Tinjau
              <ChevronRight class="w-3.5 h-3.5" />
            </RouterLink>
          </div>
        </div>

        <!-- Desktop table -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-50/50 dark:bg-gray-800/20 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/50">
                <th class="px-6 py-4">Nama Ajuan</th>
                <th class="px-6 py-4">Modul</th>
                <th class="px-6 py-4">Diajukan</th>
                <th class="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700/40">
              <tr
                v-for="item in acceptedItems"
                :key="`${item.type}-${item.id}`"
                class="hover:bg-gray-50/40 dark:hover:bg-gray-800/10 transition-colors duration-150"
              >
                <td class="px-6 py-4 max-w-sm">
                  <span class="font-semibold text-gray-900 dark:text-white truncate" :title="item.title">
                    {{ item.title }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border', typeColor(item.type)]">
                    {{ typeLabel(item.type) }}
                  </span>
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
                    Tinjau
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
