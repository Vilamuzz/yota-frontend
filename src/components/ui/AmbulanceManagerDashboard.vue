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
import { useAmbulanceHistoryMonthlyTrend } from '@/composables/ambulanceHistory/useAmbulanceHistoryMonthlyTrend'
import { useAmbulanceList } from '@/composables/ambulance/useAmbulanceList'
import BaseSkeleton from '@/components/ui/BaseSkeleton.vue'
import { Motion } from 'motion-v'
import { AmbulanceServiceCategory, formatAmbulanceServiceCategory } from '@/types/ambulanceHistory'
import { AmbulanceStatus } from '@/types/ambulance'
import {
  AlertCircle,
  Ambulance,
  Users,
  Wrench,
  ClipboardList,
  Siren,
  HeartPulse,
  Check,
} from 'lucide-vue-next'
import { useAllAmbulanceHistorySummary } from '@/composables/ambulanceHistory/useAllAmbulanceHistorySummary'
import { useQueryClient } from '@tanstack/vue-query'
import { useToast } from '@/composables/ui/useToast'
import { useAmbulanceServiceList } from '@/composables/ambulanceService/useAmbulanceServiceList'
import { useAmbulanceServiceUpdate } from '@/composables/ambulanceService/useAmbulanceServiceUpdate'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { formatPhoneWithDashes } from '@/utils/phone'

// Register ECharts modules
use([CanvasRenderer, BarChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const { isDark } = useTheme()
const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))

// All-ambulances History Summary (Metric Cards)
const { summaryQuery, getCount } = useAllAmbulanceHistorySummary()
const isSummaryLoading = computed(() => summaryQuery.isPending.value)

const socialCount = computed(() => getCount(AmbulanceServiceCategory.SOCIAL_SERVICE))
const mortuaryCount = computed(() => getCount(AmbulanceServiceCategory.MORTUARY_SERVICE))
const patientCount = computed(() => getCount(AmbulanceServiceCategory.PATIENT_SERVICE))
const emergencyCount = computed(() => getCount(AmbulanceServiceCategory.EMERGENCY_SERVICE))
const otherCount = computed(() => getCount(AmbulanceServiceCategory.OTHER_SERVICE))
const totalUrgent = computed(() => emergencyCount.value + patientCount.value)
const totalOther = computed(() => mortuaryCount.value + otherCount.value)

// Monthly Trend Chart
const trendYear = ref(new Date().getFullYear())
const trendParams = computed(() => ({ year: trendYear.value }))
const { trendQuery, trendItems } = useAmbulanceHistoryMonthlyTrend(trendParams)
const isChartLoading = computed(() => trendQuery.isPending.value)

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
    text: isDarkMode ? '#9ca3af' : '#374151',
    gridLine: isDarkMode ? '#374151' : '#e5e7eb',
    bg: isDarkMode ? '#1f2937' : '#ffffff',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    tooltip: isDarkMode ? '#f3f4f6' : '#1f2937',
    social: isDarkMode ? '#34d399' : '#10b981',
    mortuary: isDarkMode ? '#94a3b8' : '#64748b',
    patient: isDarkMode ? '#60a5fa' : '#3b82f6',
    emergency: isDarkMode ? '#f87171' : '#ef4444',
    other: isDarkMode ? '#c084fc' : '#a855f7',
  }

  // Build 12-element arrays per category
  const social = Array(12).fill(0)
  const mortuary = Array(12).fill(0)
  const patient = Array(12).fill(0)
  const emergency = Array(12).fill(0)
  const other = Array(12).fill(0)

  trendItems.value.forEach((item) => {
    const idx = parseInt(item.month.split('-')[1] || '', 10) - 1
    if (idx >= 0 && idx < 12) {
      social[idx] = item.socialService
      mortuary[idx] = item.mortuaryService
      patient[idx] = item.patientService
      emergency[idx] = item.emergencyService
      other[idx] = item.otherService
    }
  })

  const makeBar = (name: string, data: number[], color: string) => ({
    name,
    type: 'bar',
    stack: 'total',
    emphasis: { focus: 'series' },
    barMaxWidth: 36,
    data,
    itemStyle: { color, borderRadius: [0, 0, 0, 0] },
    label: { show: false },
  })

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: c.bg,
      borderColor: c.border,
      textStyle: { color: c.tooltip },
      formatter: (params: any) => {
        let res = `<div style="font-size:12px;padding:4px"><b style="display:block;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid ${c.border}">${params[0].name}</b>`
        let total = 0
        params.forEach((p: any) => {
          if (p.value > 0) {
            res += `<div style="display:flex;justify-content:space-between;gap:16px;margin:2px 0">
              <span>${p.marker} ${p.seriesName}</span>
              <b style="font-family:monospace">${p.value}</b>
            </div>`
            total += p.value
          }
        })
        res += `<div style="display:flex;justify-content:space-between;gap:16px;margin:4px 0;padding-top:4px;border-top:1px solid ${c.border}">
          <b>Total</b><b style="font-family:monospace">${total}</b>
        </div>`
        return res + '</div>'
      },
    },
    legend: {
      data: [
        'Layanan Sosial',
        'Layanan Jenazah',
        'Layanan Pasien',
        'Layanan Darurat',
        'Layanan Lainnya',
      ],
      textStyle: { color: c.text, fontFamily: 'system-ui, sans-serif', fontSize: 11 },
      bottom: '0%',
      itemWidth: 12,
      itemHeight: 12,
    },
    grid: { left: '2%', right: '2%', bottom: '14%', top: '4%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: MONTH_LABELS,
        axisLabel: { color: c.text, fontFamily: 'system-ui, sans-serif', fontSize: 11 },
        axisLine: { lineStyle: { color: c.gridLine } },
        axisTick: { show: false },
      },
    ],
    yAxis: [
      {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: c.text, fontFamily: 'system-ui, sans-serif', fontSize: 11 },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: c.gridLine, type: 'dashed' } },
      },
    ],
    series: [
      makeBar('Layanan Sosial', social, c.social),
      makeBar('Layanan Jenazah', mortuary, c.mortuary),
      makeBar('Layanan Pasien', patient, c.patient),
      makeBar('Layanan Darurat', emergency, c.emergency),
      makeBar('Layanan Lainnya', other, c.other),
    ],
  }
})

// Ambulance Tables (3 status groups)
const availableParams = ref({ limit: 5, status: AmbulanceStatus.Available })
const inUseParams = ref({ limit: 5, status: AmbulanceStatus.InUse })
const maintenanceParams = ref({ limit: 5, status: AmbulanceStatus.Maintenance })

const {
  ambulances: availableAmbulances,
  isLoading: isAvailableLoading,
  listQuery: availableQuery,
} = useAmbulanceList(availableParams)
const {
  ambulances: inUseAmbulances,
  isLoading: isInUseLoading,
  listQuery: inUseQuery,
} = useAmbulanceList(inUseParams)
const {
  ambulances: maintenanceAmbulances,
  isLoading: isMaintenanceLoading,
  listQuery: maintenanceQuery,
} = useAmbulanceList(maintenanceParams)

const isAnyError = computed(
  () =>
    summaryQuery.isError.value ||
    availableQuery.isError.value ||
    inUseQuery.isError.value ||
    maintenanceQuery.isError.value ||
    emergencyRequestsQuery.isError.value,
)

// Dispatch Emergency Requests
const { showToast } = useToast()
const queryClient = useQueryClient()

const emergencyParams = ref({
  limit: 5,
  status: 'pending',
  serviceCategory: AmbulanceServiceCategory.EMERGENCY_SERVICE,
})

const {
  ambulanceServices: emergencyRequests,
  isLoading: isEmergencyLoading,
  listQuery: emergencyRequestsQuery,
} = useAmbulanceServiceList(emergencyParams)

const { acceptMutation } = useAmbulanceServiceUpdate()

const isAssignModalOpen = ref(false)
const selectedRequestId = ref<string | null>(null)
const selectedAmbulanceId = ref('')

function openAssignModal(requestId: string) {
  selectedRequestId.value = requestId
  selectedAmbulanceId.value = ''
  isAssignModalOpen.value = true
}

function handleConfirmAssign() {
  if (!selectedRequestId.value || !selectedAmbulanceId.value) return
  acceptMutation.mutate(
    {
      id: selectedRequestId.value,
      payload: { ambulanceId: selectedAmbulanceId.value },
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ambulances'] })
        queryClient.invalidateQueries({ queryKey: ['allAmbulanceHistorySummary'] })
        queryClient.invalidateQueries({ queryKey: ['ambulanceHistoryMonthlyTrend'] })
        showToast('Ambulans berhasil ditugaskan', 'success')
        isAssignModalOpen.value = false
        selectedRequestId.value = null
      },
      onError: () => {
        showToast('Gagal menugaskan ambulans', 'error')
      },
    },
  )
}
</script>

<template>
  <div class="space-y-8 font-poppins">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center">
      <h2 class="text-xl font-bold text-gray-950 dark:text-white">Ringkasan Layanan Ambulans</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
        Data layanan dan status armada ambulans
      </p>
    </div>

    <!-- Error State -->
    <div
      v-if="isAnyError"
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

    <!-- Skeleton for Metric Cards -->
    <div v-if="isSummaryLoading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div
        v-for="i in 3"
        :key="i"
        class="border border-gray-200/50 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 rounded-2xl space-y-4 shadow-sm animate-pulse"
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
      <!-- 1. Layanan Sosial -->
      <Motion
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: 0.05 }"
        class="group relative overflow-hidden border border-emerald-100 dark:border-emerald-900/20 bg-gradient-to-br from-white to-emerald-50/10 dark:from-gray-900/60 dark:to-emerald-950/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <span
              class="px-2.5 py-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-100/50 dark:border-emerald-800/30"
            >
              Layanan Sosial
            </span>
            <div
              class="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl"
            >
              <Users class="w-5 h-5" />
            </div>
          </div>

          <h3
            class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
          >
            Total Layanan Sosial
          </h3>
          <p
            class="text-3xl font-extrabold text-gray-950 dark:text-white mt-1.5 font-mono tabular-nums"
          >
            {{ socialCount.toLocaleString() }}
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">kali layanan tercatat</p>
        </div>

        <div class="mt-6 pt-4 border-t border-emerald-100/50 dark:border-emerald-950/50">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{
              formatAmbulanceServiceCategory(AmbulanceServiceCategory.SOCIAL_SERVICE)
            }}</span>
          </div>
        </div>
      </Motion>

      <!-- 2. Layanan Darurat & Pasien -->
      <Motion
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: 0.1 }"
        class="group relative overflow-hidden border border-rose-100 dark:border-rose-900/20 bg-gradient-to-br from-white to-rose-50/10 dark:from-gray-900/60 dark:to-rose-950/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <span
              class="px-2.5 py-1 text-xs font-semibold bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 rounded-full border border-rose-100/50 dark:border-rose-800/30"
            >
              Darurat & Pasien
            </span>
            <div
              class="p-2 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-xl"
            >
              <Siren class="w-5 h-5" />
            </div>
          </div>

          <h3
            class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
          >
            Total Layanan Darurat & Pasien
          </h3>
          <p
            class="text-3xl font-extrabold text-gray-950 dark:text-white mt-1.5 font-mono tabular-nums"
          >
            {{ totalUrgent.toLocaleString() }}
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">kali layanan tercatat</p>
        </div>

        <div
          class="mt-6 pt-4 border-t border-rose-100/50 dark:border-rose-950/50 grid grid-cols-2 gap-3"
        >
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              Darurat
            </span>
            <p class="font-bold text-sm text-rose-600 dark:text-rose-400 font-mono">
              {{ emergencyCount.toLocaleString() }}
            </p>
          </div>
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Pasien
            </span>
            <p class="font-bold text-sm text-blue-600 dark:text-blue-400 font-mono">
              {{ patientCount.toLocaleString() }}
            </p>
          </div>
        </div>
      </Motion>

      <!-- 3. Layanan Jenazah & Lainnya -->
      <Motion
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.3, delay: 0.15 }"
        class="group relative overflow-hidden border border-slate-200 dark:border-slate-800/40 bg-gradient-to-br from-white to-slate-50/10 dark:from-gray-900/60 dark:to-slate-900/10 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <div>
          <div class="flex justify-between items-start mb-4">
            <span
              class="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800/40 text-slate-700 dark:text-slate-400 rounded-full border border-slate-200/70 dark:border-slate-700/40"
            >
              Jenazah & Lainnya
            </span>
            <div
              class="p-2 bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 rounded-xl"
            >
              <ClipboardList class="w-5 h-5" />
            </div>
          </div>

          <h3
            class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider"
          >
            Total Layanan Jenazah & Lainnya
          </h3>
          <p
            class="text-3xl font-extrabold text-gray-950 dark:text-white mt-1.5 font-mono tabular-nums"
          >
            {{ totalOther.toLocaleString() }}
          </p>
          <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">kali layanan tercatat</p>
        </div>

        <div
          class="mt-6 pt-4 border-t border-slate-100/50 dark:border-slate-800/50 grid grid-cols-2 gap-3"
        >
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              Jenazah
            </span>
            <p class="font-bold text-sm text-slate-600 dark:text-slate-400 font-mono">
              {{ mortuaryCount.toLocaleString() }}
            </p>
          </div>
          <div class="space-y-0.5">
            <span class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
              Lainnya
            </span>
            <p class="font-bold text-sm text-violet-600 dark:text-violet-400 font-mono">
              {{ otherCount.toLocaleString() }}
            </p>
          </div>
        </div>
      </Motion>
    </div>

    <!-- Stacked Bar Chart Card -->
    <div
      class="border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 p-6 rounded-2xl shadow-sm flex flex-col gap-4"
    >
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-white">
            Layanan Bulanan per Kategori
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Jumlah layanan per kategori per bulan · {{ trendYear }}
          </p>
        </div>

        <!-- Year Picker -->
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            @click="trendYear--"
            class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-bold"
            :disabled="trendYear <= 2020"
          >
            ‹
          </button>
          <span
            class="text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[3rem] text-center"
            >{{ trendYear }}</span
          >
          <button
            @click="trendYear++"
            class="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm font-bold"
            :disabled="trendYear >= new Date().getFullYear()"
          >
            ›
          </button>
        </div>
      </div>

      <!-- ECharts Stacked Bar Chart -->
      <div class="h-72 w-full">
        <VChart
          v-if="!isChartLoading"
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

    <!-- Emergency Requests Dispatch Section -->
    <div class="space-y-4">
      <div class="flex flex-col items-start">
        <h3 class="text-lg font-bold text-gray-955 dark:text-white">
          Permintaan Darurat Menunggu Penugasan
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Daftar permintaan darurat aktif yang membutuhkan armada segera
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="isEmergencyLoading"
        class="border border-red-100 dark:border-red-900/30 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm p-5 space-y-4 animate-pulse"
      >
        <div v-for="i in 3" :key="i" class="flex justify-between gap-4">
          <BaseSkeleton variant="text-sm" class="w-1/12" />
          <BaseSkeleton variant="text-sm" class="w-2/12" />
          <BaseSkeleton variant="text-sm" class="w-5/12" />
          <BaseSkeleton variant="text-sm" class="w-2/12" />
          <BaseSkeleton variant="text-sm" class="w-2/12" />
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="emergencyRequests.length === 0"
        class="border border-dashed border-red-100 dark:border-red-900/30 bg-red-50/10 dark:bg-red-950/5 rounded-2xl p-8 text-center"
      >
        <AlertCircle class="w-8 h-8 text-red-400 dark:text-red-500/60 mx-auto mb-2" />
        <p class="text-sm text-red-700 dark:text-red-400 font-semibold">
          Tidak ada permintaan layanan darurat yang masuk.
        </p>
        <p class="text-xs text-gray-450 mt-0.5">
          Semua permintaan darurat telah berhasil ditugaskan.
        </p>
      </div>

      <!-- Table State -->
      <div
        v-else
        class="border border-red-100 dark:border-red-900/30 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm overflow-hidden"
      >
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr
                class="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/40 bg-red-50/20 dark:bg-red-950/5"
              >
                <th class="px-5 py-3.5 w-16 text-center">No</th>
                <th class="px-5 py-3.5">Pemohon</th>
                <th class="px-5 py-3.5">Alamat Penjemputan</th>
                <th class="px-5 py-3.5">Waktu Pengajuan</th>
                <th class="px-5 py-3.5 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-700/30">
              <tr
                v-for="(req, index) in emergencyRequests"
                :key="req.id"
                class="hover:bg-red-50/10 dark:hover:bg-red-950/5 transition-colors duration-150"
              >
                <td
                  class="px-5 py-4 text-center font-mono text-sm text-gray-600 dark:text-gray-400"
                >
                  {{ index + 1 }}
                </td>
                <td class="px-5 py-4">
                  <div class="font-bold text-gray-950 dark:text-white text-sm">
                    {{ req.submitterName }}
                  </div>
                  <a
                    :href="`https://wa.me/62${req.submitterPhone.replace(/^(\+62|62|0)/, '')}`"
                    target="_blank"
                    class="text-xs text-primary-200 hover:underline font-semibold"
                  >
                    {{ formatPhoneWithDashes(req.submitterPhone) }}
                  </a>
                </td>
                <td
                  class="px-5 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate"
                  :title="req.patientAddress"
                >
                  {{ req.patientAddress }}
                </td>
                <td class="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {{
                    new Date(req.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  }}
                </td>
                <td class="px-5 py-4 text-center">
                  <button
                    @click="openAssignModal(req.id)"
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150 shadow-sm cursor-pointer"
                  >
                    <Siren class="w-3.5 h-3.5 animate-pulse" />
                    Tugaskan
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Ambulance Status Tables -->
    <div class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-lg font-bold text-gray-950 dark:text-white">Status Armada Ambulans</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Pantau status ketersediaan ambulans saat ini
          </p>
        </div>
        <RouterLink
          :to="{ name: 'dashboard-ambulance' }"
          class="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 rounded-xl transition-colors"
        >
          Lihat lebih banyak
          <span aria-hidden="true">&rarr;</span>
        </RouterLink>
      </div>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <!-- Table 1: Available -->
      <div
        class="border border-emerald-100 dark:border-emerald-900/30 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm overflow-hidden"
      >
        <div
          class="px-5 py-4 border-b border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-950/10"
        >
          <div class="flex items-center gap-2.5">
            <div class="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Ambulance class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">Tersedia</h3>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isAvailableLoading" class="p-4 space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-3">
            <BaseSkeleton variant="text-sm" class="w-1/3" />
            <BaseSkeleton variant="text-sm" class="w-1/3" />
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else-if="availableAmbulances.length === 0"
          class="p-8 text-center text-gray-400 dark:text-gray-500"
        >
          <Ambulance class="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p class="text-xs">Tidak ada ambulans tersedia</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr
                class="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/40"
              >
                <th class="px-4 py-3">No. Plat</th>
                <th class="px-4 py-3">Pengemudi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-700/30">
              <tr
                v-for="amb in availableAmbulances"
                :key="amb.id"
                class="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10 transition-colors"
              >
                <td class="px-4 py-3 font-mono text-sm font-bold text-gray-900 dark:text-white">
                  <RouterLink
                    :to="{ name: 'dashboard-ambulance-detail', params: { id: amb.id } }"
                    class="hover:underline hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    {{ amb.plateNumber }}
                  </RouterLink>
                </td>
                <td
                  class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[120px]"
                >
                  {{ amb.driver?.username || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Table 2: In Use -->
      <div
        class="border border-amber-100 dark:border-amber-900/30 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm overflow-hidden"
      >
        <div
          class="px-5 py-4 border-b border-amber-100 dark:border-amber-900/30 flex items-center justify-between bg-amber-50/50 dark:bg-amber-950/10"
        >
          <div class="flex items-center gap-2.5">
            <div class="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <HeartPulse class="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">Sedang Digunakan</h3>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isInUseLoading" class="p-4 space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-3">
            <BaseSkeleton variant="text-sm" class="w-1/3" />
            <BaseSkeleton variant="text-sm" class="w-1/3" />
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else-if="inUseAmbulances.length === 0"
          class="p-8 text-center text-gray-400 dark:text-gray-500"
        >
          <HeartPulse class="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p class="text-xs">Tidak ada ambulans yang sedang digunakan</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr
                class="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/40"
              >
                <th class="px-4 py-3">No. Plat</th>
                <th class="px-4 py-3">Pengemudi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-700/30">
              <tr
                v-for="amb in inUseAmbulances"
                :key="amb.id"
                class="hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors"
              >
                <td class="px-4 py-3 font-mono text-sm font-bold text-gray-900 dark:text-white">
                  <RouterLink
                    :to="{ name: 'dashboard-ambulance-detail', params: { id: amb.id } }"
                    class="hover:underline hover:text-amber-600 dark:hover:text-amber-400"
                  >
                    {{ amb.plateNumber }}
                  </RouterLink>
                </td>
                <td
                  class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[120px]"
                >
                  {{ amb.driver?.username || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Table 3: Maintenance -->
      <div
        class="border border-rose-100 dark:border-rose-900/30 bg-white dark:bg-gray-800/40 rounded-2xl shadow-sm overflow-hidden"
      >
        <div
          class="px-5 py-4 border-b border-rose-100 dark:border-rose-900/30 flex items-center justify-between bg-rose-50/50 dark:bg-rose-950/10"
        >
          <div class="flex items-center gap-2.5">
            <div class="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <Wrench class="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white">Pemeliharaan</h3>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isMaintenanceLoading" class="p-4 space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center justify-between gap-3">
            <BaseSkeleton variant="text-sm" class="w-1/3" />
            <BaseSkeleton variant="text-sm" class="w-1/3" />
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else-if="maintenanceAmbulances.length === 0"
          class="p-8 text-center text-gray-400 dark:text-gray-500"
        >
          <Wrench class="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p class="text-xs">Tidak ada ambulans dalam pemeliharaan</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr
                class="text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700/40"
              >
                <th class="px-4 py-3">No. Plat</th>
                <th class="px-4 py-3">Pengemudi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50 dark:divide-gray-700/30">
              <tr
                v-for="amb in maintenanceAmbulances"
                :key="amb.id"
                class="hover:bg-rose-50/30 dark:hover:bg-rose-950/10 transition-colors"
              >
                <td class="px-4 py-3 font-mono text-sm font-bold text-gray-900 dark:text-white">
                  <RouterLink
                    :to="{ name: 'dashboard-ambulance-detail', params: { id: amb.id } }"
                    class="hover:underline hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    {{ amb.plateNumber }}
                  </RouterLink>
                </td>
                <td
                  class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 truncate max-w-[120px]"
                >
                  {{ amb.driver?.username || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Assign Ambulance Modal -->
    <ConfirmationModal
      :show="isAssignModalOpen"
      title="Tugaskan Ambulans"
      message="Pilih ambulans yang akan ditugaskan untuk melayani permintaan darurat ini:"
      primary-button-text="Tugaskan Sekarang"
      secondary-button-text="Batal"
      :icon="Check"
      :primary-button-loading="acceptMutation.isPending.value"
      @primary="handleConfirmAssign"
      @secondary="isAssignModalOpen = false"
      @close="isAssignModalOpen = false"
    >
      <div class="mt-4 text-left">
        <label
          for="assign-ambulance-select"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Pilih Ambulans Tersedia
        </label>
        <select
          id="assign-ambulance-select"
          v-model="selectedAmbulanceId"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
        >
          <option value="" disabled>-- Pilih Ambulans --</option>
          <option
            v-for="ambulance in availableAmbulances"
            :key="ambulance.id"
            :value="ambulance.id"
          >
            {{ ambulance.plateNumber }} - {{ ambulance.driver?.username || 'Tanpa Sopir' }}
          </option>
        </select>
        <p v-if="availableAmbulances.length === 0" class="text-xs text-red-650 mt-2 font-medium">
          Tidak ada ambulans yang berstatus "Tersedia" saat ini! Silakan ubah status ambulans
          terlebih dahulu.
        </p>
      </div>
    </ConfirmationModal>
  </div>
</template>
