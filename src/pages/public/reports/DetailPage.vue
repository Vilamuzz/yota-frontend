<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { formatCurrency, formatDate } from '@/utils/format'
import {
  ArrowLeft,
  Download,
  Calendar,
  X,
  Receipt,
  Heart,
  Users,
  Baby,
  Loader2,
} from 'lucide-vue-next'
import { useReportDetail } from '@/composables/report/useReportDetail'
import { useToast } from '@/composables/ui/useToast'

const route = useRoute()
const router = useRouter()

const type = route.params.type as 'donation' | 'social' | 'foster'
const slug = route.params.slug as string

const showExportModal = ref(false)
const exportDateFrom = ref('')
const exportDateTo = ref('')
const isExporting = ref(false)
const exportFilterType = ref<'this_month' | 'last_month' | 'custom'>('custom')

const setExportFilter = (type: 'this_month' | 'last_month' | 'custom') => {
  exportFilterType.value = type
  const now = new Date()
  if (type === 'this_month') {
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    exportDateFrom.value = `${year}-${month}-01`

    const lastDayVal = new Date(year, now.getMonth() + 1, 0).getDate()
    exportDateTo.value = `${year}-${month}-${String(lastDayVal).padStart(2, '0')}`
  } else if (type === 'last_month') {
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const monthVal = now.getMonth() === 0 ? 12 : now.getMonth()
    const month = String(monthVal).padStart(2, '0')
    exportDateFrom.value = `${year}-${month}-01`

    const lastDayVal = new Date(year, monthVal, 0).getDate()
    exportDateTo.value = `${year}-${month}-${String(lastDayVal).padStart(2, '0')}`
  } else if (type === 'custom') {
    exportDateFrom.value = ''
    exportDateTo.value = ''
  }
}

watch(showExportModal, (val) => {
  if (val) {
    exportFilterType.value = 'custom'
    exportDateFrom.value = ''
    exportDateTo.value = ''
  }
})

const { showToast } = useToast()

const nextCursor = ref<string | undefined>(undefined)
const filterType = ref<'all' | 'this_month' | 'last_month' | 'custom'>('all')
const filterStartDate = ref<string>('')
const filterEndDate = ref<string>('')

const expenseParams = computed(() => {
  const params: any = {
    limit: 10,
    nextCursor: nextCursor.value,
  }
  if (filterStartDate.value) {
    params.startDate = filterStartDate.value
  }
  if (filterEndDate.value) {
    params.endDate = filterEndDate.value
  }
  return params
})

const setFilter = (type: 'all' | 'this_month' | 'last_month' | 'custom') => {
  if (filterType.value === type && type !== 'custom') {
    filterType.value = 'all'
    filterStartDate.value = ''
    filterEndDate.value = ''
    return
  }

  filterType.value = type

  const now = new Date()
  if (type === 'all') {
    filterStartDate.value = ''
    filterEndDate.value = ''
  } else if (type === 'this_month') {
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    filterStartDate.value = `${year}-${month}-01`

    const lastDayVal = new Date(year, now.getMonth() + 1, 0).getDate()
    filterEndDate.value = `${year}-${month}-${String(lastDayVal).padStart(2, '0')}`
  } else if (type === 'last_month') {
    const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()
    const monthVal = now.getMonth() === 0 ? 12 : now.getMonth()
    const month = String(monthVal).padStart(2, '0')
    filterStartDate.value = `${year}-${month}-01`

    const lastDayVal = new Date(year, monthVal, 0).getDate()
    filterEndDate.value = `${year}-${month}-${String(lastDayVal).padStart(2, '0')}`
  }
}

watch(
  () => [filterStartDate.value, filterEndDate.value],
  () => {
    nextCursor.value = undefined
    accumulatedExpenses.value = []
  },
)

const { detail, isLoading, exportExpenses, expensePagination, isExpenseFetching, expenseData } =
  useReportDetail(type, slug, expenseParams)

const accumulatedExpenses = ref<any[]>([])

watch(
  expenseData,
  (newExpenses) => {
    if (newExpenses) {
      if (!nextCursor.value) {
        accumulatedExpenses.value = [...newExpenses]
      } else {
        const existingIds = new Set(accumulatedExpenses.value.map((e) => e.id))
        const newItems = newExpenses.filter((e) => !existingIds.has(e.id))
        accumulatedExpenses.value.push(...newItems)
      }
    }
  },
  { immediate: true },
)

watch(
  () => [type, slug],
  () => {
    nextCursor.value = undefined
    accumulatedExpenses.value = []
    filterType.value = 'all'
    filterStartDate.value = ''
    filterEndDate.value = ''
  },
)

const hasNextPage = computed(() => !!expensePagination.value?.nextCursor)

const loadNextPage = () => {
  if (isExpenseFetching.value || !hasNextPage.value) return
  nextCursor.value = expensePagination.value?.nextCursor
}

const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

watch(loadMoreTrigger, (el) => {
  if (observer) {
    observer.disconnect()
  }
  if (el) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadNextPage()
        }
      },
      {
        rootMargin: '100px',
      },
    )
    observer.observe(el)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})

const handleExport = async () => {
  if (!exportDateFrom.value || !exportDateTo.value) return

  isExporting.value = true
  try {
    const blob = await exportExpenses({
      startDate: exportDateFrom.value,
      endDate: exportDateTo.value,
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `expenses_${slug}_${exportDateFrom.value}_to_${exportDateTo.value}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    showExportModal.value = false
    exportDateFrom.value = ''
    exportDateTo.value = ''
    showToast('Laporan berhasil diunduh', 'success')
  } catch {
    showToast('Gagal mengunduh laporan', 'error')
  } finally {
    isExporting.value = false
  }
}

const accentClasses = computed(() => {
  const c = detail.value?.accentColor ?? 'rose'
  return {
    text: `text-${c}-500`,
    textDark: `text-${c}-600`,
    bg: `bg-${c}-50`,
    border: `border-${c}-100`,
  }
})

const typeIcon = computed(() => {
  if (type === 'donation') return Heart
  if (type === 'social') return Users
  return Baby
})
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-16 px-4 sm:px-8 lg:px-18 font-poppins">
      <div class="max-w-5xl mx-auto">
        <!-- Back -->
        <button
          @click="router.back()"
          class="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft :size="16" />
          Kembali ke Daftar Laporan
        </button>

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-24">
          <p class="text-gray-400 text-lg animate-pulse">Memuat data...</p>
        </div>

        <!-- Not Found -->
        <div v-else-if="!detail" class="text-center py-24">
          <p class="text-gray-400 text-lg">Data tidak ditemukan.</p>
        </div>

        <template v-else>
          <!-- Hero Card -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div class="flex flex-col md:flex-row gap-6 p-6">
              <!-- Image / Avatar -->
              <div class="shrink-0">
                <img
                  :src="detail.coverImage"
                  :alt="detail.title"
                  :class="
                    detail.isAvatar
                      ? 'w-24 h-24 rounded-full border-4 border-emerald-100 object-cover'
                      : 'w-full md:w-48 h-36 rounded-xl object-cover'
                  "
                />
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <span
                    :class="[
                      accentClasses.bg,
                      accentClasses.textDark,
                      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold',
                    ]"
                  >
                    <component :is="typeIcon" :size="12" />
                    {{ detail.meta }}
                  </span>
                  <span
                    v-if="detail.category"
                    class="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold"
                  >
                    {{ detail.category }}
                  </span>
                </div>
                <h1 class="text-2xl font-black text-gray-900 mb-4">{{ detail.title }}</h1>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <p class="text-xs text-gray-400 mb-0.5">Total Pengeluaran</p>
                    <p :class="['text-xl font-black', accentClasses.text]">
                      {{ formatCurrency(detail.totalExpense) }}
                    </p>
                  </div>
                  <div v-if="detail.fundTarget">
                    <p class="text-xs text-gray-400 mb-0.5">Target Dana</p>
                    <p class="text-xl font-black text-gray-700">
                      {{ formatCurrency(detail.fundTarget) }}
                    </p>
                  </div>
                  <div v-if="detail.collectedFund">
                    <p class="text-xs text-gray-400 mb-0.5">Terkumpul</p>
                    <p class="text-xl font-black text-gray-700">
                      {{ formatCurrency(detail.collectedFund) }}
                    </p>
                  </div>
                  <div v-if="detail.totalSubscribers">
                    <p class="text-xs text-gray-400 mb-0.5">Pelanggan Aktif</p>
                    <p class="text-xl font-black text-gray-700">{{ detail.totalSubscribers }}</p>
                  </div>
                </div>
              </div>

              <!-- Export Button -->
              <div class="shrink-0 flex items-start">
                <button
                  @click="showExportModal = true"
                  class="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-semibold hover:bg-primary-600 transition-colors shadow-sm whitespace-nowrap"
                >
                  <Download :size="15" />
                  Ekspor Laporan
                </button>
              </div>
            </div>
          </div>

          <!-- Expense List -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2
                  class="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"
                >
                  <Receipt :size="14" class="text-gray-400" />
                  Rincian Pengeluaran ({{ accumulatedExpenses.length }} item)
                </h2>

                <!-- Filter Buttons -->
                <div class="flex flex-wrap gap-2 text-xs font-semibold">
                  <button
                    @click="setFilter('this_month')"
                    :class="[
                      filterType === 'this_month'
                        ? `${accentClasses.bg} ${accentClasses.textDark} border-current`
                        : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100',
                      'px-3 py-1.5 rounded-lg border transition font-medium',
                    ]"
                  >
                    Bulan Ini
                  </button>
                  <button
                    @click="setFilter('last_month')"
                    :class="[
                      filterType === 'last_month'
                        ? `${accentClasses.bg} ${accentClasses.textDark} border-current`
                        : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100',
                      'px-3 py-1.5 rounded-lg border transition font-medium',
                    ]"
                  >
                    Bulan Lalu
                  </button>
                  <button
                    @click="setFilter('custom')"
                    :class="[
                      filterType === 'custom'
                        ? `${accentClasses.bg} ${accentClasses.textDark} border-current`
                        : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100',
                      'px-3 py-1.5 rounded-lg border transition font-medium',
                    ]"
                  >
                    Pilih Tanggal
                  </button>
                  <button
                    v-if="filterType !== 'all'"
                    @click="setFilter('all')"
                    class="px-2 py-1.5 text-gray-400 hover:text-gray-600 transition flex items-center gap-1"
                  >
                    <X :size="12" />
                    Reset
                  </button>
                </div>
              </div>

              <!-- Custom Date Inputs -->
              <div
                v-if="filterType === 'custom'"
                class="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm"
              >
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >Mulai:</span
                  >
                  <input
                    v-model="filterStartDate"
                    type="date"
                    class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-400"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >Sampai:</span
                  >
                  <input
                    v-model="filterEndDate"
                    type="date"
                    :min="filterStartDate"
                    class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary-400"
                  />
                </div>
              </div>
            </div>
            <div class="space-y-3">
              <div
                v-for="(exp, idx) in accumulatedExpenses"
                :key="exp.id"
                class="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/70 transition"
              >
                <div class="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    :class="[
                      accentClasses.bg,
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                    ]"
                  >
                    <span :class="['text-xs font-bold', accentClasses.textDark]">{{
                      idx + 1
                    }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900">{{ exp.title }}</p>
                    <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(exp.expenseDate) }}</p>
                    <p v-if="exp.note" class="text-xs text-gray-500 mt-1 italic">{{ exp.note }}</p>
                  </div>
                </div>
                <p :class="['text-sm font-bold shrink-0 ml-4', accentClasses.text]">
                  {{ formatCurrency(exp.amount) }}
                </p>
              </div>
            </div>

            <!-- Total Row -->
            <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <p class="text-sm font-bold text-gray-500">Total</p>
              <p :class="['text-lg font-black', accentClasses.text]">
                {{ formatCurrency(detail.totalExpense) }}
              </p>
            </div>

            <!-- Scroll Loading Trigger -->
            <div ref="loadMoreTrigger" class="h-10 flex items-center justify-center mt-6">
              <Loader2 v-if="isExpenseFetching" class="animate-spin text-primary-500" />
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Export Modal -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showExportModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="showExportModal = false"
      >
        <Transition
          enter-active-class="transition ease-out duration-300"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
        >
          <div
            v-if="showExportModal"
            class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-7 font-poppins"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Download :size="20" class="text-primary-500" />
                </div>
                <div>
                  <h2 class="text-lg font-bold text-gray-900">Ekspor Laporan</h2>
                  <p class="text-xs text-gray-400 truncate max-w-48">{{ detail?.title }}</p>
                </div>
              </div>
              <button
                @click="showExportModal = false"
                class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X :size="18" />
              </button>
            </div>

            <!-- Filter Type Buttons for Export -->
            <div class="flex gap-2 text-xs font-semibold mb-4">
              <button
                type="button"
                @click="setExportFilter('this_month')"
                :class="[
                  exportFilterType === 'this_month'
                    ? `${accentClasses.bg} ${accentClasses.textDark} border-current`
                    : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100',
                  'px-3 py-1.5 rounded-lg border transition font-medium flex-1 text-center',
                ]"
              >
                Bulan Ini
              </button>
              <button
                type="button"
                @click="setExportFilter('last_month')"
                :class="[
                  exportFilterType === 'last_month'
                    ? `${accentClasses.bg} ${accentClasses.textDark} border-current`
                    : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100',
                  'px-3 py-1.5 rounded-lg border transition font-medium flex-1 text-center',
                ]"
              >
                Bulan Lalu
              </button>
              <button
                type="button"
                @click="setExportFilter('custom')"
                :class="[
                  exportFilterType === 'custom'
                    ? `${accentClasses.bg} ${accentClasses.textDark} border-current`
                    : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100',
                  'px-3 py-1.5 rounded-lg border transition font-medium flex-1 text-center',
                ]"
              >
                Pilih Tanggal
              </button>
            </div>

            <div class="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                  >Dari Tanggal</label
                >
                <div class="relative">
                  <Calendar
                    :size="14"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    v-model="exportDateFrom"
                    type="date"
                    @input="exportFilterType = 'custom'"
                    class="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label
                  class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                  >Sampai Tanggal</label
                >
                <div class="relative">
                  <Calendar
                    :size="14"
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    v-model="exportDateTo"
                    type="date"
                    :min="exportDateFrom"
                    @input="exportFilterType = 'custom'"
                    class="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div class="flex gap-3">
              <button
                @click="showExportModal = false"
                class="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition"
              >
                Batal
              </button>
              <button
                @click="handleExport"
                :disabled="!exportDateFrom || !exportDateTo || isExporting"
                class="flex-1 py-3 rounded-xl bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <template v-if="isExporting">
                  <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Mengunduh...
                </template>
                <template v-else>
                  <Download :size="15" />
                  Unduh Laporan
                </template>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </PublicLayout>
</template>
