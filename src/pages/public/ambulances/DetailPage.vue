<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import {
  Ambulance as AmbulanceIcon,
  Phone,
  User,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Clock,
  History,
  ChevronLeft,
  ChevronRight,
  Tag,
  CalendarDays,
  UserCircle,
  BarChart3,
  Calendar,
} from 'lucide-vue-next'
import { useAmbulanceDetail } from '@/composables/ambulance/useAmbulanceDetail'
import { useAmbulanceHistoryList } from '@/composables/ambulanceHistory/useAmbulanceHistoryList'
import { useAmbulanceHistorySummary } from '@/composables/ambulanceHistory/useAmbulanceHistorySummary'
import { AmbulanceStatus } from '@/types/ambulance'
import { ambulanceServiceCategoryOptions } from '@/types/ambulanceHistory'
import { formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const id = route.params.id as string

// Ambulance Detail
const { detailQuery, isAmbulanceLoading } = useAmbulanceDetail(id)
const ambulance = computed(() => detailQuery.data.value?.data)

// History List
import { useCursorPagination } from '@/composables/ui/usePagination'
import type { AmbulanceHistoryQueryParams } from '@/types/ambulanceHistory'
import { formatPhoneWithDashes } from '@/utils/phone'

const queryParams = reactive<AmbulanceHistoryQueryParams>({
  limit: 8,
  nextCursor: undefined,
  prevCursor: undefined,
})
const {
  histories,
  pagination,
  isLoading: isHistoryLoading,
} = useAmbulanceHistoryList(id, queryParams)
const { handleNextPage, handlePrevPage } = useCursorPagination(queryParams)

// Summary
const PERIOD_OPTIONS = [
  { value: 'all_time', label: 'Semua Waktu' },
  { value: 'this_week', label: 'Minggu Ini' },
  { value: 'this_month', label: 'Bulan Ini' },
  { value: 'this_year', label: 'Tahun Ini' },
  { value: 'custom', label: 'Kustom' },
] as const

const filterType = ref<'all_time' | 'this_week' | 'this_month' | 'this_year' | 'custom'>('all_time')
const filterStartDate = ref<string>('')
const filterEndDate = ref<string>('')

const setFilter = (type: 'all_time' | 'this_week' | 'this_month' | 'this_year' | 'custom') => {
  filterType.value = type

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const date = now.getDate()

  const formatD = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

  if (type === 'all_time') {
    filterStartDate.value = ''
    filterEndDate.value = ''
  } else if (type === 'this_week') {
    const currentDay = now.getDay()
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
    const monday = new Date(year, month, date + distanceToMonday)
    const sunday = new Date(year, month, date + distanceToMonday + 6)

    filterStartDate.value = formatD(monday)
    filterEndDate.value = formatD(sunday)
  } else if (type === 'this_month') {
    filterStartDate.value = formatD(new Date(year, month, 1))
    filterEndDate.value = formatD(new Date(year, month + 1, 0))
  } else if (type === 'this_year') {
    filterStartDate.value = formatD(new Date(year, 0, 1))
    filterEndDate.value = formatD(new Date(year, 11, 31))
  } else if (type === 'custom') {
    filterStartDate.value = ''
    filterEndDate.value = ''
  }
}

// Initialize the default dates
setFilter(filterType.value)

const summaryParams = computed(() => {
  const params: Record<string, string> = {}

  if (filterType.value === 'custom') {
    if (filterStartDate.value && filterEndDate.value) {
      params.startDate = filterStartDate.value
      params.endDate = filterEndDate.value
    }
    return params
  }

  if (filterStartDate.value) params.startDate = filterStartDate.value
  if (filterEndDate.value) params.endDate = filterEndDate.value

  return params
})

const { summary, isLoading: isSummaryLoading } = useAmbulanceHistorySummary(id, summaryParams)

const statusLabel = (status: AmbulanceStatus) => {
  switch (status) {
    case AmbulanceStatus.Available:
      return 'Tersedia'
    case AmbulanceStatus.InUse:
      return 'Sedang Digunakan'
    case AmbulanceStatus.Maintenance:
      return 'Pemeliharaan'
    default:
      return status
  }
}

const statusBadgeClass = (status: AmbulanceStatus) => {
  switch (status) {
    case AmbulanceStatus.Available:
      return 'bg-green-100 text-green-700 border border-green-200'
    case AmbulanceStatus.InUse:
      return 'bg-blue-100 text-blue-700 border border-blue-200'
    case AmbulanceStatus.Maintenance:
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
}

const statusDotClass = (status: AmbulanceStatus) => {
  switch (status) {
    case AmbulanceStatus.Available:
      return 'bg-green-500'
    case AmbulanceStatus.InUse:
      return 'bg-blue-500'
    case AmbulanceStatus.Maintenance:
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

const getCategoryLabel = (value: string) =>
  ambulanceServiceCategoryOptions.find((o) => o.value === value)?.label ?? value

const categoryBadgeClass = (value: string) => {
  switch (value) {
    case 'emergency_service':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'patient_service':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'mortuary_service':
      return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'social_service':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const categoryBarClass = (value: string) => {
  switch (value) {
    case 'emergency_service':
      return 'bg-red-400'
    case 'patient_service':
      return 'bg-blue-400'
    case 'mortuary_service':
      return 'bg-purple-400'
    case 'social_service':
      return 'bg-green-400'
    default:
      return 'bg-gray-400'
  }
}
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-16 px-4 sm:px-8 font-poppins">
      <div class="max-w-5xl mx-auto">
        <!-- Back Button -->
        <button
          @click="router.back()"
          class="inline-flex items-center gap-2 mb-8 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors group"
        >
          <ArrowLeft :size="16" class="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Daftar Ambulans
        </button>

        <!-- Loading State -->
        <div v-if="isAmbulanceLoading" class="flex flex-col items-center justify-center py-32">
          <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p class="text-gray-500 font-medium animate-pulse">Memuat data ambulans...</p>
        </div>

        <!-- Not Found State -->
        <div
          v-else-if="!ambulance"
          class="flex flex-col items-center justify-center py-32 text-center"
        >
          <div class="p-5 bg-red-50 rounded-full mb-5 text-red-500">
            <AlertCircle :size="48" />
          </div>
          <h2 class="text-xl font-bold text-gray-900 mb-2">Ambulans Tidak Ditemukan</h2>
          <p class="text-gray-500 max-w-sm mb-8">
            Data ambulans yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <RouterLink
            :to="{ name: 'ambulance' }"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft :size="16" />
            Kembali ke Daftar
          </RouterLink>
        </div>

        <!-- Main Content -->
        <template v-else>
          <div class="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden mb-8">
            <!-- Image + Plate overlay -->
            <div class="relative h-64 sm:h-80 bg-gray-100 overflow-hidden">
              <img
                v-if="ambulance.image"
                :src="ambulance.image"
                :alt="`Ambulans ${ambulance.plateNumber}`"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex flex-col items-center justify-center text-gray-300"
              >
                <AmbulanceIcon :size="72" />
                <p class="text-sm mt-3 text-gray-400">Foto tidak tersedia</p>
              </div>

              <!-- Gradient overlay -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              ></div>

              <!-- Plate number -->
              <div class="absolute bottom-5 left-6">
                <p class="text-white text-3xl font-black tracking-widest drop-shadow-lg">
                  {{ ambulance.plateNumber }}
                </p>
              </div>

              <!-- Status badge -->
              <div class="absolute top-4 right-4">
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm"
                  :class="statusBadgeClass(ambulance.status)"
                >
                  <span
                    class="w-1.5 h-1.5 rounded-full"
                    :class="statusDotClass(ambulance.status)"
                  ></span>
                  {{ statusLabel(ambulance.status) }}
                </span>
              </div>
            </div>

            <!-- Info Grid -->
            <div class="p-6 sm:p-8">
              <h1 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AmbulanceIcon :size="20" class="text-primary-500" />
                Informasi Ambulans
              </h1>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <!-- Driver -->
                <div class="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <div class="p-2.5 bg-primary-50 rounded-xl text-primary-500 shrink-0">
                    <User :size="18" />
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-400 mb-0.5 uppercase tracking-wider">
                      Sopir
                    </p>
                    <p class="font-semibold text-gray-900">{{ ambulance.driver.username }}</p>
                  </div>
                </div>

                <!-- Phone -->
                <div class="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <div class="p-2.5 bg-primary-50 rounded-xl text-primary-500 shrink-0">
                    <Phone :size="18" />
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-400 mb-0.5 uppercase tracking-wider">
                      Kontak Sopir
                    </p>
                    <a
                      :href="`https://wa.me/+62${ambulance.driver.phone}`"
                      target="_blank"
                      class="font-semibold text-primary-600 hover:underline"
                    >
                      {{ formatPhoneWithDashes(ambulance.driver.phone) }}
                    </a>
                  </div>
                </div>

                <!-- Status -->
                <div class="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <div class="p-2.5 bg-primary-50 rounded-xl text-primary-500 shrink-0">
                    <Clock :size="18" />
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                      Status Saat Ini
                    </p>
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
                      :class="statusBadgeClass(ambulance.status)"
                    >
                      <span
                        class="w-1.5 h-1.5 rounded-full"
                        :class="statusDotClass(ambulance.status)"
                      ></span>
                      {{ statusLabel(ambulance.status) }}
                    </span>
                  </div>
                </div>

                <!-- Plate -->
                <div class="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                  <div class="p-2.5 bg-primary-50 rounded-xl text-primary-500 shrink-0">
                    <AmbulanceIcon :size="18" />
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-400 mb-0.5 uppercase tracking-wider">
                      Nomor Plat
                    </p>
                    <p class="font-black text-gray-900 tracking-widest text-lg">
                      {{ ambulance.plateNumber }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- CTA -->
              <div class="mt-6 pt-6 border-t border-gray-100">
                <a
                  :href="`tel:${ambulance.driver.phone}`"
                  class="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all duration-200"
                  :class="
                    ambulance.status === AmbulanceStatus.Available
                      ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-200/50 active:scale-95'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  "
                >
                  <Phone :size="16" />
                  {{
                    ambulance.status === AmbulanceStatus.Available
                      ? 'Hubungi Sopir Sekarang'
                      : 'Ambulans Tidak Tersedia'
                  }}
                </a>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden mb-8">
            <!-- Header -->
            <div
              class="px-6 sm:px-8 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3"
            >
              <div class="flex items-center gap-3">
                <div class="p-2 bg-primary-50 rounded-xl text-primary-500">
                  <BarChart3 :size="18" />
                </div>
                <h2 class="text-lg font-bold text-gray-900">Ringkasan Layanan</h2>
              </div>

              <!-- Period filter pills -->
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="opt in PERIOD_OPTIONS"
                  :key="opt.value"
                  @click="setFilter(opt.value)"
                  class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 whitespace-nowrap"
                  :class="
                    filterType === opt.value
                      ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                  "
                >
                  {{ opt.label }}
                </button>
              </div>
            </div>

            <!-- Custom date range -->
            <div
              v-if="filterType === 'custom'"
              class="px-6 sm:px-8 py-4 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center gap-3"
            >
              <div class="flex items-center gap-2 text-gray-500">
                <Calendar :size="15" />
                <span class="text-xs font-medium">Rentang Tanggal:</span>
              </div>
              <div class="flex items-center gap-2">
                <input
                  id="summary-start-date"
                  v-model="filterStartDate"
                  type="date"
                  class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-white text-gray-700"
                />
                <span class="text-gray-400 text-xs">s/d</span>
                <input
                  id="summary-end-date"
                  v-model="filterEndDate"
                  type="date"
                  :min="filterStartDate"
                  class="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 bg-white text-gray-700"
                />
              </div>
              <p
                v-if="filterType === 'custom' && (!filterStartDate || !filterEndDate)"
                class="text-xs text-orange-500 font-medium"
              >
                * Pilih rentang tanggal untuk melihat ringkasan
              </p>
            </div>

            <!-- Summary Loading -->
            <div v-if="isSummaryLoading" class="flex flex-col items-center justify-center py-12">
              <Loader2 class="w-9 h-9 text-primary-500 animate-spin mb-2" />
              <p class="text-gray-400 text-sm animate-pulse">Memuat ringkasan...</p>
            </div>

            <!-- Summary Content -->
            <div v-else-if="summary" class="p-6 sm:p-8">
              <!-- Total count hero -->
              <div class="flex items-center gap-4 mb-6">
                <div class="p-4 bg-primary-50 rounded-2xl">
                  <BarChart3 :size="28" class="text-primary-500" />
                </div>
                <div>
                  <p class="text-xs text-gray-400 uppercase tracking-wider font-medium mb-0.5">
                    Total Layanan
                  </p>
                  <p class="text-4xl font-black text-gray-900">{{ summary.total }}</p>
                </div>
              </div>

              <!-- Category breakdown -->
              <div v-if="summary.categories && summary.categories.length > 0" class="space-y-3">
                <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Rincian per Kategori
                </p>
                <div
                  v-for="item in summary.categories"
                  :key="item.category"
                  class="flex items-center gap-3"
                >
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border w-44 shrink-0"
                    :class="categoryBadgeClass(item.category)"
                  >
                    <Tag :size="10" />
                    {{ getCategoryLabel(item.category) }}
                  </span>
                  <!-- Progress bar -->
                  <div class="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :class="categoryBarClass(item.category)"
                      :style="{
                        width: summary.total > 0 ? `${(item.count / summary.total) * 100}%` : '0%',
                      }"
                    ></div>
                  </div>
                  <span class="text-sm font-bold text-gray-700 w-6 text-right shrink-0">{{
                    item.count
                  }}</span>
                </div>
              </div>
              <p v-else class="text-sm text-gray-400 italic">Tidak ada data untuk periode ini.</p>
            </div>

            <!-- No summary data -->
            <div v-else class="flex flex-col items-center justify-center py-12 text-center px-6">
              <div
                class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3 text-gray-300"
              >
                <BarChart3 :size="24" />
              </div>
              <p class="text-sm text-gray-400">Tidak ada data ringkasan untuk periode ini.</p>
            </div>
          </div>

          <!-- History List -->
          <div class="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div class="px-6 sm:px-8 py-5 border-b border-gray-100 flex items-center gap-3">
              <div class="p-2 bg-primary-50 rounded-xl text-primary-500">
                <History :size="18" />
              </div>
              <h2 class="text-lg font-bold text-gray-900">Riwayat Layanan Ambulans</h2>
            </div>

            <!-- History Loading -->
            <div v-if="isHistoryLoading" class="flex flex-col items-center justify-center py-16">
              <Loader2 class="w-10 h-10 text-primary-500 animate-spin mb-3" />
              <p class="text-gray-400 text-sm animate-pulse">Memuat riwayat layanan...</p>
            </div>

            <!-- History Empty -->
            <div
              v-else-if="histories.length === 0"
              class="flex flex-col items-center justify-center py-16 text-center px-6"
            >
              <div
                class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400"
              >
                <History :size="28" />
              </div>
              <h3 class="font-semibold text-gray-700 mb-1">Belum Ada Riwayat</h3>
              <p class="text-sm text-gray-400 max-w-xs">
                Ambulans ini belum memiliki riwayat layanan yang tercatat.
              </p>
            </div>

            <!-- History Table -->
            <div v-else>
              <!-- Desktop Table -->
              <div class="hidden sm:block overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="bg-gray-50 border-b border-gray-100">
                      <th
                        class="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Tanggal
                      </th>
                      <th
                        class="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Kategori Layanan
                      </th>
                      <th
                        class="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Sopir
                      </th>
                      <th
                        class="text-left px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-50">
                    <tr
                      v-for="history in histories"
                      :key="history.id"
                      class="hover:bg-gray-50/70 transition-colors"
                    >
                      <td class="px-6 py-4 text-gray-600 whitespace-nowrap">
                        <div class="flex items-center gap-2">
                          <CalendarDays :size="14" class="text-gray-400 shrink-0" />
                          {{ formatDate(history.createdAt) }}
                        </div>
                      </td>
                      <td class="px-6 py-4">
                        <span
                          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                          :class="categoryBadgeClass(history.serviceCategory)"
                        >
                          <Tag :size="10" />
                          {{ getCategoryLabel(history.serviceCategory) }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-gray-700">
                        <div class="flex items-center gap-2">
                          <UserCircle :size="14" class="text-gray-400 shrink-0" />
                          {{ history.driver.username }}
                        </div>
                      </td>
                      <td class="px-6 py-4 text-gray-500 max-w-xs">
                        <p class="line-clamp-2">{{ history.note || '-' }}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Mobile Cards -->
              <div class="sm:hidden divide-y divide-gray-100">
                <div v-for="history in histories" :key="history.id" class="px-5 py-4 space-y-2">
                  <div class="flex items-center justify-between">
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
                      :class="categoryBadgeClass(history.serviceCategory)"
                    >
                      <Tag :size="10" />
                      {{ getCategoryLabel(history.serviceCategory) }}
                    </span>
                    <span class="text-xs text-gray-400">{{ formatDate(history.createdAt) }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-xs text-gray-600">
                    <UserCircle :size="13" class="text-gray-400" />
                    {{ history.driver.username }}
                  </div>
                  <p v-if="history.note" class="text-xs text-gray-500 leading-relaxed">
                    {{ history.note }}
                  </p>
                </div>
              </div>

              <!-- Pagination -->
              <div
                v-if="pagination?.nextCursor || pagination?.prevCursor"
                class="px-6 py-4 border-t border-gray-100 flex items-center justify-end"
              >
                <div class="flex items-center gap-2">
                  <button
                    :disabled="!pagination?.prevCursor"
                    @click="handlePrevPage(pagination)"
                    class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft :size="16" />
                  </button>
                  <button
                    :disabled="!pagination?.nextCursor"
                    @click="handleNextPage(pagination)"
                    class="p-2 rounded-lg border border-gray-200 text-gray-500 hover:border-primary-300 hover:text-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </PublicLayout>
</template>
