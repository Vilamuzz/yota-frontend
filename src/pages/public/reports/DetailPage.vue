<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { formatCurrency, formatDate } from '@/utils/format'
import {
  ArrowLeft,
  Download,
  Calendar,
  FileText,
  X,
  Receipt,
  TrendingDown,
  Heart,
  Users,
  Baby,
} from 'lucide-vue-next'
import { useReportDetail } from '@/composables/report/useReportDetail'

const route = useRoute()
const router = useRouter()

const type = route.params.type as 'donation' | 'social' | 'foster'
const slug = route.params.slug as string

const showExportModal = ref(false)
const exportDateFrom = ref('')
const exportDateTo = ref('')
const exportFormat = ref<'pdf' | 'xlsx'>('pdf')
const isExporting = ref(false)

const handleExport = () => {
  isExporting.value = true
  setTimeout(() => {
    isExporting.value = false
    showExportModal.value = false
    exportDateFrom.value = ''
    exportDateTo.value = ''
  }, 1800)
}

const { detail, isLoading } = useReportDetail(type, slug)

const accentClasses = computed(() => {
  const c = detail.value?.accentColor ?? 'rose'
  return {
    text: `text-${c}-500`,
    textDark: `text-${c}-600`,
    bg: `bg-${c}-50`,
    border: `border-${c}-100`,
  }
})

// Force Tailwind to keep dynamic classes by referencing them literally in a comment:
// text-rose-500 text-rose-600 bg-rose-50 border-rose-100
// text-blue-500 text-blue-600 bg-blue-50 border-blue-100
// text-emerald-500 text-emerald-600 bg-emerald-50 border-emerald-100

const typeIcon = computed(() => {
  if (type === 'donation') return Heart
  if (type === 'social') return Users
  return Baby
})

const totalByMonth = computed(() => {
  if (!detail.value?.expenses) return []
  const map: Record<string, number> = {}
  for (const exp of detail.value.expenses) {
    const month = exp.expenseDate.slice(0, 7)
    map[month] = (map[month] ?? 0) + exp.amount
  }
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }))
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

          <!-- Monthly Summary -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2
              class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"
            >
              <TrendingDown :size="14" class="text-gray-400" />
              Ringkasan per Bulan
            </h2>
            <div class="flex gap-3 flex-wrap">
              <div
                v-for="item in totalByMonth"
                :key="item.month"
                :class="[accentClasses.bg, accentClasses.border, 'rounded-xl px-4 py-3 border']"
              >
                <p class="text-xs text-gray-400 mb-0.5">{{ item.month }}</p>
                <p :class="['text-base font-bold', accentClasses.textDark]">
                  {{ formatCurrency(item.total) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Expense List -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2
              class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"
            >
              <Receipt :size="14" class="text-gray-400" />
              Rincian Pengeluaran ({{ detail.expenses.length }} item)
            </h2>
            <div class="space-y-3">
              <div
                v-for="(exp, idx) in detail.expenses"
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
                    class="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2"
                >Format File</label
              >
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="fmt in [
                    { key: 'pdf', label: 'PDF' },
                    { key: 'xlsx', label: 'Excel (.xlsx)' },
                  ]"
                  :key="fmt.key"
                  @click="exportFormat = fmt.key as any"
                  class="flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all"
                  :class="
                    exportFormat === fmt.key
                      ? 'border-primary-400 bg-primary-50 text-primary-600'
                      : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                  "
                >
                  <FileText :size="16" />
                  {{ fmt.label }}
                </button>
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
