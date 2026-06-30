<script setup lang="ts">
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { useTheme } from '@/composables/ui/useTheme'
import { Motion } from 'motion-v'
import { HandHeart, Baby, AlertCircle } from 'lucide-vue-next'

// ─────────────────────────────────────────────
// ECharts setup
// ─────────────────────────────────────────────
use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const { isDark } = useTheme()
const chartTheme = computed(() => (isDark.value ? 'dark' : 'light'))

// ─────────────────────────────────────────────
// MOCK DATA VALIDASI KETUA
// (ganti API kalau sudah tersedia)
// ─────────────────────────────────────────────
const socialValidationMonthly = ref([
  { month: '2026-01', total: 5 },
  { month: '2026-02', total: 8 },
  { month: '2026-03', total: 4 },
  { month: '2026-04', total: 7 },
])

const fosterValidationMonthly = ref([
  { month: '2026-01', total: 3 },
  { month: '2026-02', total: 6 },
  { month: '2026-03', total: 2 },
  { month: '2026-04', total: 5 },
])

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des']

// ─────────────────────────────────────────────
// CHART VALIDASI
// ─────────────────────────────────────────────
const monthlyChartOption = computed(() => {
  const isDarkMode = isDark.value

  const c = {
    social: isDarkMode ? '#60a5fa' : '#2563eb',
    foster: isDarkMode ? '#a78bfa' : '#7c3aed',
    text: isDarkMode ? '#9ca3af' : '#374151',
    grid: isDarkMode ? '#374151' : '#e5e7eb',
    bg: isDarkMode ? '#111827' : '#ffffff',
    border: isDarkMode ? '#374151' : '#e5e7eb',
  }

  const socialData = Array(12).fill(0)
  const fosterData = Array(12).fill(0)

  socialValidationMonthly.value.forEach((i) => {
    const month = i.month.split('-')[1]
    if (!month) return
    const idx = parseInt(month, 10) - 1
    socialData[idx] = i.total
  })

  fosterValidationMonthly.value.forEach((i) => {
    const month = i.month.split('-')[1]
    if (!month) return
    const idx = parseInt(month, 10) - 1
    fosterData[idx] = i.total
  })

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: c.bg,
      borderColor: c.border,
    },
    legend: {
      data: ['Validasi Sosial', 'Validasi Anak Asuh'],
      textStyle: { color: c.text },
    },
    grid: {
      left: '3%',
      right: '3%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: MONTH_LABELS,
      axisLine: { lineStyle: { color: c.grid } },
      axisLabel: { color: c.text },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: c.grid } },
    },
    series: [
      {
        name: 'Validasi Sosial',
        type: 'line',
        smooth: true,
        data: socialData,
        lineStyle: { color: c.social, width: 3 },
      },
      {
        name: 'Validasi Anak Asuh',
        type: 'line',
        smooth: true,
        data: fosterData,
        lineStyle: { color: c.foster, width: 3 },
      },
    ],
  }
})
</script>

<template>
  <div class="space-y-8 font-poppins">

    <!-- HEADER -->
    <div class="flex justify-between items-center">
      <h2 class="text-xl font-bold text-gray-950 dark:text-white">
        Dashboard Ketua Yayasan
      </h2>
    </div>

    <!-- ERROR STATE -->
    <div class="bg-red-50 dark:bg-red-950/20 p-4 rounded-xl flex gap-3 text-red-700 dark:text-red-300">
      <AlertCircle class="w-5 h-5 mt-0.5" />
      <div>
        <p class="font-semibold">Gagal memuat data</p>
        <p class="text-sm">Silakan cek koneksi atau server backend</p>
      </div>
    </div>

    <!-- SUMMARY -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

      <!-- SOCIAL -->
      <Motion
        :initial="{ opacity: 0, y: 10 }"
        :animate="{ opacity: 1, y: 0 }"
        class="p-6 rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-800"
      >
        <div class="flex justify-between">
          <h3 class="font-semibold text-blue-600">Validasi Program Sosial</h3>
          <HandHeart class="text-blue-500" />
        </div>

        <p class="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
          {{ socialValidationMonthly.reduce((a, b) => a + b.total, 0) }}
        </p>
      </Motion>

      <!-- FOSTER -->
      <Motion
        :initial="{ opacity: 0, y: 10 }"
        :animate="{ opacity: 1, y: 0 }"
        class="p-6 rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-800"
      >
        <div class="flex justify-between">
          <h3 class="font-semibold text-violet-600">Validasi Anak Asuh</h3>
          <Baby class="text-violet-500" />
        </div>

        <p class="text-2xl font-bold mt-4 text-gray-900 dark:text-white">
          {{ fosterValidationMonthly.reduce((a, b) => a + b.total, 0) }}
        </p>
      </Motion>

    </div>

    <!-- CHART -->
    <div class="p-6 rounded-2xl border bg-white dark:bg-gray-900 dark:border-gray-800">
      <h3 class="font-bold text-gray-900 dark:text-white mb-4">
        Tren Validasi Ketua Yayasan
      </h3>

      <div class="h-80">
        <VChart :option="monthlyChartOption" :theme="chartTheme" autoresize />
      </div>
    </div>

  </div>
</template>
