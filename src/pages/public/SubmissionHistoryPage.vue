<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import { extractError } from '@/utils/error'
import { useAuthStore } from '@/stores/auth'
import type { ApiError } from '@/types/response'
import { useMyFosterChildrenCandidateList } from '@/composables/fosterChildrenCandidate/useMyFosterChildrenCandidateList'
import { useMyFosterChildrenCandidateCancel } from '@/composables/fosterChildrenCandidate/useMyFosterChildrenCandidateCancel'
import { useMyAmbulanceServiceCandidateList } from '@/composables/ambulanceService/useMyAmbulanceServiceList'
import { useMyAmbulanceServiceCandidateCancel } from '@/composables/ambulanceService/useMyAmbulanceServiceCancel'
import { useToast } from '@/composables/ui/useToast'
import PublicConfirmationModal from '@/components/organisms/PublicConfirmationModal.vue'
import AmbulanceRequestDetailModal from '@/components/organisms/AmbulanceRequestDetailModal.vue'
import FosterChildrenCandidateDetailModal from '@/components/organisms/FosterChildrenCandidateDetailModal.vue'
import {
  Loader2,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  AlertTriangle,
  Baby,
  Ambulance,
} from 'lucide-vue-next'
import { Gender, Category } from '@/types/fosterChildren'
import { formatDate } from '@/utils/format'
import type {
  FosterChildrenCandidate,
  FosterChildrenCandidateQueryParams,
} from '@/types/fosterChildrenCandidate'
import {
  type AmbulanceService,
  type AmbulanceServiceQueryParams,
  AmbulanceServiceStatus,
  formatAmbulanceServiceStatus,
} from '@/types/ambulanceService'

const { showToast } = useToast()
const authStore = useAuthStore()

const activeTab = ref<'foster' | 'ambulance'>('foster')

const tabs = [
  { key: 'foster' as const, label: 'Calon Anak Asuh', icon: Baby },
  { key: 'ambulance' as const, label: 'Layanan Ambulans', icon: Ambulance },
]

const fosterSearchQuery = ref('')
const debouncedFosterSearchQuery = ref('')
const fosterCursor = ref<string | undefined>(undefined)

// Sort & Filter State
const showSortDropdown = ref(false)
const showFilterDropdown = ref(false)
const searchContainerRef = ref<HTMLElement | null>(null)

const sortBy = ref<string | undefined>(undefined)

const sortOptions = [
  { label: 'Terbaru', value: 'created_at desc' },
  { label: 'Terlama', value: 'created_at asc' },
  { label: 'Nama (A-Z)', value: 'name asc' },
  { label: 'Nama (Z-A)', value: 'name desc' },
]

const toggleSort = () => {
  showSortDropdown.value = !showSortDropdown.value
  showFilterDropdown.value = false
}

const selectSort = (val: string) => {
  const newVal = sortBy.value === val ? undefined : val
  if (sortBy.value !== newVal) {
    sortBy.value = newVal
    fosterCursor.value = undefined
    ambulanceCursor.value = undefined
    accumulatedFoster.value = []
    accumulatedAmbulance.value = []
  }
  showSortDropdown.value = false
}

const filterGender = ref<Gender | undefined>(undefined)
const filterCategory = ref<Category | undefined>(undefined)
const filterStatus = ref<string | undefined>(undefined)

const toggleFilter = () => {
  showFilterDropdown.value = !showFilterDropdown.value
  showSortDropdown.value = false
}

const hasActiveFilters = computed(
  () => !!filterGender.value || !!filterCategory.value || !!filterStatus.value,
)

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (searchContainerRef.value && !searchContainerRef.value.contains(target)) {
    showFilterDropdown.value = false
  }
}

onMounted(() => {
  window.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', handleClickOutside)
  if (observer) {
    observer.disconnect()
  }
})

const fosterQueryParams = computed<FosterChildrenCandidateQueryParams>(() => ({
  limit: 10,
  search: debouncedFosterSearchQuery.value || undefined,
  nextCursor: fosterCursor.value,
  gender: filterGender.value,
  category: filterCategory.value,
  status: filterStatus.value,
  sortBy: sortBy.value,
}))

const { listQuery: fosterListQuery, isLoading: isFosterLoading } = useMyFosterChildrenCandidateList(
  fosterQueryParams,
  { enabled: computed(() => activeTab.value === 'foster' && authStore.isAuthenticated) },
)

const { cancelMutation: fosterCancelMutation } = useMyFosterChildrenCandidateCancel()

const accumulatedFoster = ref<FosterChildrenCandidate[]>([])

let fosterSearchTimeout: ReturnType<typeof setTimeout>
watch(fosterSearchQuery, (val) => {
  clearTimeout(fosterSearchTimeout)
  fosterSearchTimeout = setTimeout(() => {
    if (debouncedFosterSearchQuery.value !== val) {
      fosterCursor.value = undefined
      accumulatedFoster.value = []
      debouncedFosterSearchQuery.value = val
    }
  }, 400)
})

const ambulanceSearchQuery = ref('')
const debouncedAmbulanceSearchQuery = ref('')
const ambulanceCursor = ref<string | undefined>(undefined)

const ambulanceQueryParams = computed<AmbulanceServiceQueryParams>(() => {
  let sortVal = sortBy.value
  if (sortVal) {
    if (sortVal.startsWith('name ')) {
      sortVal = sortVal.replace('name ', 'applicant_name ')
    }
  }
  return {
    limit: 10,
    search: debouncedAmbulanceSearchQuery.value || undefined,
    nextCursor: ambulanceCursor.value,
    status: filterStatus.value,
    sortBy: sortVal,
  }
})

const { listQuery: ambulanceListQuery, isLoading: isAmbulanceLoading } =
  useMyAmbulanceServiceCandidateList(ambulanceQueryParams, {
    enabled: computed(() => activeTab.value === 'ambulance' && authStore.isAuthenticated),
  })

const { cancelMutation: ambulanceCancelMutation } = useMyAmbulanceServiceCandidateCancel()

const accumulatedAmbulance = ref<AmbulanceService[]>([])

let ambulanceSearchTimeout: ReturnType<typeof setTimeout>
watch(ambulanceSearchQuery, (val) => {
  clearTimeout(ambulanceSearchTimeout)
  ambulanceSearchTimeout = setTimeout(() => {
    if (debouncedAmbulanceSearchQuery.value !== val) {
      ambulanceCursor.value = undefined
      accumulatedAmbulance.value = []
      debouncedAmbulanceSearchQuery.value = val
    }
  }, 400)
})

const setActiveTab = (tab: 'foster' | 'ambulance') => {
  if (activeTab.value !== tab) {
    activeTab.value = tab
  }
}

watch(
  [() => fosterListQuery.data.value, activeTab, fosterCursor],
  ([newData, tab, cursor]) => {
    if (tab === 'foster' && newData?.data?.fosterChildrenCandidates) {
      if (cursor) {
        const existingIds = new Set(accumulatedFoster.value.map((c) => c.id))
        const newItems = newData.data.fosterChildrenCandidates.filter((c) => !existingIds.has(c.id))
        accumulatedFoster.value.push(...newItems)
      } else {
        accumulatedFoster.value = [...newData.data.fosterChildrenCandidates]
      }
    }
  },
  { immediate: true },
)

watch(
  [() => ambulanceListQuery.data.value, activeTab, ambulanceCursor],
  ([newData, tab, cursor]) => {
    if (tab === 'ambulance' && newData?.data?.requests) {
      if (cursor) {
        const existingIds = new Set(accumulatedAmbulance.value.map((s) => s.id))
        const newItems = newData.data.requests.filter((s) => !existingIds.has(s.id))
        accumulatedAmbulance.value.push(...newItems)
      } else {
        accumulatedAmbulance.value = [...newData.data.requests]
      }
    }
  },
  { immediate: true },
)

const isLoading = computed(() =>
  activeTab.value === 'foster' ? isFosterLoading.value : isAmbulanceLoading.value,
)

const isAnyFetching = computed(() =>
  activeTab.value === 'foster'
    ? fosterListQuery.isFetching.value
    : ambulanceListQuery.isFetching.value,
)

const hasNextPage = computed(() => {
  if (activeTab.value === 'foster') {
    return !!fosterListQuery.data.value?.data?.pagination?.nextCursor
  }
  return !!ambulanceListQuery.data.value?.data?.pagination?.nextCursor
})

const loadNextPage = () => {
  if (isAnyFetching.value) return

  if (activeTab.value === 'foster') {
    const next = fosterListQuery.data.value?.data?.pagination?.nextCursor
    if (next && next !== fosterCursor.value) {
      fosterCursor.value = next
    }
  } else {
    const next = ambulanceListQuery.data.value?.data?.pagination?.nextCursor
    if (next && next !== ambulanceCursor.value) {
      ambulanceCursor.value = next
    }
  }
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

const isError = computed(() =>
  activeTab.value === 'foster' ? fosterListQuery.isError.value : ambulanceListQuery.isError.value,
)

const errorValue = computed(() =>
  activeTab.value === 'foster' ? fosterListQuery.error.value : ambulanceListQuery.error.value,
)

const searchQuery = computed({
  get: () => (activeTab.value === 'foster' ? fosterSearchQuery.value : ambulanceSearchQuery.value),
  set: (val) => {
    if (activeTab.value === 'foster') fosterSearchQuery.value = val
    else ambulanceSearchQuery.value = val
  },
})

const showCancelModal = ref(false)
const itemToCancel = ref<{ id: string; name: string; type: 'foster' | 'ambulance' } | null>(null)
const selectedAmbulanceId = ref<string | null>(null)
const selectedFosterId = ref<string | null>(null)

const isCancelLoading = computed(() =>
  itemToCancel.value?.type === 'foster'
    ? fosterCancelMutation.isPending.value
    : ambulanceCancelMutation.isPending.value,
)

const openCancelModal = (id: string, name: string, type: 'foster' | 'ambulance') => {
  itemToCancel.value = { id, name, type }
  showCancelModal.value = true
}

const confirmCancel = () => {
  if (!itemToCancel.value) return
  const { id, type } = itemToCancel.value

  const onSuccess = () => {
    showToast('Pengajuan berhasil dibatalkan.', 'success')
    showCancelModal.value = false
    itemToCancel.value = null
    if (type === 'foster') {
      fosterCursor.value = undefined
      accumulatedFoster.value = []
    } else {
      ambulanceCursor.value = undefined
      accumulatedAmbulance.value = []
    }
  }
  const onError = (err: ApiError) => {
    showToast(extractError(err, 'Gagal membatalkan pengajuan.'), 'error')
    showCancelModal.value = false
    itemToCancel.value = null
  }

  if (type === 'foster') {
    fosterCancelMutation.mutate(id, { onSuccess, onError })
  } else {
    ambulanceCancelMutation.mutate(id, { onSuccess, onError })
  }
}

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'accepted':
      return {
        icon: CheckCircle2,
        class: 'bg-green-50 text-green-700 border-green-200',
        label: 'Diterima',
      }
    case 'done':
      return {
        icon: CheckCircle2,
        class: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'Selesai',
      }
    case 'in_service':
      return {
        icon: Ambulance,
        class: 'bg-primary-50 text-primary-700 border-primary-200',
        label: 'Dalam Perjalanan',
      }
    case 'rejected':
      return {
        icon: XCircle,
        class: 'bg-red-50 text-red-700 border-red-200',
        label: 'Ditolak',
      }
    case 'cancelled':
    case 'canceled':
      return {
        icon: XCircle,
        class: 'bg-gray-50 text-gray-700 border-gray-200',
        label: 'Dibatalkan',
      }
    case 'pending':
    default:
      return {
        icon: Clock,
        class: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        label: 'Menunggu',
      }
  }
}
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-16 font-poppins">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <!-- Page Header -->
        <div class="mb-10 text-center md:text-left">
          <h1 class="text-4xl font-black text-gray-900 uppercase tracking-tight">
            Riwayat Pengajuan
          </h1>
          <p class="text-gray-500 mt-1 text-lg">
            Pantau status semua pengajuan layanan Anda di sini.
          </p>
        </div>

        <template v-if="authStore.isAuthenticated">
        <!-- Category Tabs (InvoicePage style) -->
        <div class="flex flex-col md:flex-row justify-center md:justify-start gap-4 mb-8">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="setActiveTab(tab.key)"
            class="flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-black transition-all duration-500 border-2"
            :class="
              activeTab === tab.key
                ? 'bg-primary-400 border-primary-400 text-white shadow-xl shadow-primary-400/20 translate-y-1'
                : 'bg-white border-gray-100 text-gray-500 hover:border-primary-200 hover:text-primary-400'
            "
          >
            <component :is="tab.icon" :size="20" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Sub-bar: search + count (InvoicePage toolbar style) -->
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"
            >
              <component :is="tabs.find((t) => t.key === activeTab)!.icon" :size="20" />
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Jenis Pengajuan
              </p>
              <h3 class="text-sm font-black text-gray-900">
                {{ tabs.find((t) => t.key === activeTab)!.label }}
              </h3>
            </div>
          </div>

          <div class="relative w-full md:w-80" ref="searchContainerRef">
            <BasePublicSearch
              v-model="searchQuery"
              :placeholder="activeTab === 'foster' ? 'Cari nama calon...' : 'Cari nama pemohon...'"
              @on-sort="toggleSort"
              @on-filter="toggleFilter"
            />

            <!-- SORT DROPDOWN -->
            <div
              v-if="showSortDropdown"
              class="absolute right-0 sm:right-[3.5rem] top-full mt-2 w-64 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50"
            >
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Urutkan Berdasarkan
              </h4>
              <div class="space-y-1">
                <button
                  v-for="option in sortOptions"
                  :key="option.value"
                  @click="selectSort(option.value)"
                  class="w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between"
                  :class="
                    sortBy === option.value || (!sortBy && option.value === 'created_at desc')
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  "
                >
                  {{ option.label }}
                  <Check
                    v-if="
                      sortBy === option.value || (!sortBy && option.value === 'created_at desc')
                    "
                    :size="16"
                  />
                </button>
              </div>
            </div>

            <!-- FILTER DROPDOWN -->
            <div
              v-if="showFilterDropdown"
              class="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Saring Berdasarkan
              </h4>

              <div class="space-y-4">
                <!-- Status Filter -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2">Status Pengajuan</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="status in activeTab === 'ambulance'
                        ? Object.values(AmbulanceServiceStatus)
                        : ['pending', 'accepted', 'rejected', 'cancelled']"
                      :key="status"
                      @click="
                        () => {
                          filterStatus = filterStatus === status ? undefined : status
                          fosterCursor = undefined
                          ambulanceCursor = undefined
                          accumulatedFoster = []
                          accumulatedAmbulance = []
                        }
                      "
                      class="w-full text-center px-2 py-2 rounded-xl text-[10px] sm:text-xs transition-colors border"
                      :class="
                        filterStatus === status
                          ? 'border-primary-500 bg-primary-50 text-primary-600 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      "
                    >
                      {{
                        activeTab === 'ambulance'
                          ? formatAmbulanceServiceStatus(status as AmbulanceServiceStatus)
                          : status === 'pending'
                            ? 'Menunggu'
                            : status === 'accepted'
                              ? 'Diterima'
                              : status === 'rejected'
                                ? 'Ditolak'
                                : 'Dibatalkan'
                      }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ACTIVE FILTER CHIPS -->
        <div
          v-if="hasActiveFilters"
          class="flex flex-wrap justify-center md:justify-start gap-2 mb-6 -mt-4"
        >
          <div
            v-if="activeTab === 'foster' ? fosterQueryParams.status : ambulanceQueryParams.status"
            class="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-200 text-primary-600 text-xs font-semibold rounded-full"
          >
            <span
              >Status:
              {{
                activeTab === 'ambulance'
                  ? formatAmbulanceServiceStatus(
                      ambulanceQueryParams.status as AmbulanceServiceStatus,
                    )
                  : fosterQueryParams.status === 'pending'
                    ? 'Menunggu'
                    : fosterQueryParams.status === 'accepted'
                      ? 'Diterima'
                      : fosterQueryParams.status === 'rejected'
                        ? 'Ditolak'
                        : 'Dibatalkan'
              }}</span
            >
            <button
              @click="
                activeTab === 'foster'
                  ? ((filterStatus = undefined),
                    (fosterCursor = undefined),
                    (accumulatedFoster = []))
                  : ((filterStatus = undefined),
                    (ambulanceCursor = undefined),
                    (accumulatedAmbulance = []))
              "
              class="hover:text-primary-800 focus:outline-none"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-24">
          <Loader2 class="w-12 h-12 text-primary-400 animate-spin mb-4" />
          <p class="text-gray-500 font-medium animate-pulse">Memuat riwayat pengajuan...</p>
        </div>

        <!-- Error -->
        <div
          v-else-if="isError"
          class="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-24 text-center"
        >
          <div
            class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500 animate-pulse"
          >
            <X :size="48" />
          </div>
          <h3 class="text-2xl font-black text-gray-900 mb-3">Gagal Memuat Data</h3>
          <p class="text-gray-500 max-w-sm mx-auto text-base leading-relaxed">
            {{
              errorValue
                ? extractError(
                    errorValue as unknown as ApiError,
                    'Terjadi kesalahan saat mengambil riwayat. Silakan coba lagi.',
                  )
                : 'Terjadi kesalahan saat mengambil riwayat. Silakan coba lagi.'
            }}
          </p>
        </div>

        <template v-else-if="activeTab === 'foster'">
          <div v-if="accumulatedFoster.length > 0" class="grid grid-cols-1 gap-6">
            <div
              v-for="candidate in accumulatedFoster"
              :key="candidate.id"
              @click="selectedFosterId = candidate.id"
              class="group bg-white rounded-4xl border border-gray-100 p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer"
            >
              <!-- Status left stripe -->
              <div
                class="absolute top-0 left-0 w-2 h-full transition-all duration-500"
                :class="
                  candidate.status === 'accepted'
                    ? 'bg-green-500'
                    : candidate.status === 'rejected'
                      ? 'bg-red-500'
                      : candidate.status === 'cancelled'
                        ? 'bg-gray-400'
                        : 'bg-primary-400'
                "
              ></div>

              <div class="flex items-start gap-6 relative z-10">
                <img
                  :src="candidate.profilePicture"
                  :alt="candidate.name"
                  class="w-16 h-16 rounded-2xl object-cover bg-gray-100 shrink-0 border border-gray-100 group-hover:rotate-3 transition-transform duration-500"
                />
                <div class="space-y-1.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      {{ candidate.id.slice(0, 8) }}...
                    </span>
                    <div class="h-1 w-1 rounded-full bg-gray-200"></div>
                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {{ formatDate(candidate.createdAt) }}
                    </span>
                  </div>
                  <h3
                    class="text-xl font-black text-gray-900 leading-tight group-hover:text-primary-400 transition-colors duration-300"
                  >
                    {{ candidate.name }}
                  </h3>
                  <div class="flex flex-wrap items-center gap-4 pt-1">
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
                      :class="getStatusConfig(candidate.status).class"
                    >
                      <component :is="getStatusConfig(candidate.status).icon" :size="12" />
                      {{ getStatusConfig(candidate.status).label }}
                    </span>
                    <div class="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <FileText :size="14" />
                      <span class="capitalize">{{ candidate.category }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action -->
              <div
                class="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-6 md:pt-0 relative z-10 shrink-0"
              >
                <button
                  v-if="candidate.status.toLowerCase() === 'pending'"
                  @click.stop="openCancelModal(candidate.id, candidate.name, 'foster')"
                  :disabled="fosterCancelMutation.isPending.value"
                  class="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Batalkan Pengajuan"
                >
                  <X :size="22" />
                </button>
                <div
                  v-else-if="candidate.status === 'accepted'"
                  class="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shadow-sm"
                >
                  <CheckCircle2 :size="24" />
                </div>
                <div
                  v-else
                  class="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center shadow-sm"
                >
                  <XCircle :size="24" />
                </div>
              </div>
            </div>
          </div>

          <!-- Foster empty: search -->
          <div v-else-if="fosterSearchQuery" class="py-24 text-center">
            <div
              class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300 animate-pulse"
            >
              <Search :size="40" />
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-3">Hasil Tidak Ditemukan</h3>
            <p class="text-gray-500 max-w-sm mx-auto text-base leading-relaxed">
              Tidak ada pengajuan yang cocok dengan
              <span class="font-bold text-gray-900">"{{ fosterSearchQuery }}"</span>.
            </p>
          </div>

          <!-- Foster empty: no data -->
          <div
            v-else
            class="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-24 text-center"
          >
            <div
              class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300 animate-pulse"
            >
              <Baby :size="48" />
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-3">Belum Ada Pengajuan</h3>
            <p class="text-gray-500 max-w-sm mx-auto text-base leading-relaxed">
              Anda belum pernah mengajukan calon anak asuh. Ajukan sekarang untuk membantu mereka.
            </p>
          </div>

          <!-- Foster pagination -->
          <div
            v-if="hasNextPage"
            ref="loadMoreTrigger"
            class="h-20 w-full flex items-center justify-center mt-6"
          >
            <Loader2 class="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        </template>

        <template v-else>
          <div v-if="accumulatedAmbulance.length > 0" class="grid grid-cols-1 gap-6">
            <div
              v-for="service in accumulatedAmbulance"
              :key="service.id"
              @click="selectedAmbulanceId = service.id"
              class="group bg-white rounded-4xl border border-gray-100 p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl hover:border-primary-200 hover:-translate-y-0.5 transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8 cursor-pointer"
            >
              <!-- Status left stripe -->
              <div
                class="absolute top-0 left-0 w-2 h-full transition-all duration-500"
                :class="
                  service.status === AmbulanceServiceStatus.ACCEPTED
                    ? 'bg-green-500'
                    : service.status === AmbulanceServiceStatus.DONE
                      ? 'bg-blue-500'
                      : service.status === AmbulanceServiceStatus.IN_SERVICE
                        ? 'bg-primary-500'
                        : service.status === AmbulanceServiceStatus.REJECTED
                          ? 'bg-red-500'
                          : service.status === AmbulanceServiceStatus.CANCELLED
                            ? 'bg-gray-400'
                            : 'bg-primary-400'
                "
              ></div>

              <div class="flex items-start gap-6 relative z-10">
                <div
                  class="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:rotate-6"
                  :class="
                    service.status === AmbulanceServiceStatus.ACCEPTED
                      ? 'bg-green-50 text-green-600'
                      : service.status === AmbulanceServiceStatus.DONE
                        ? 'bg-blue-50 text-blue-600'
                        : service.status === AmbulanceServiceStatus.IN_SERVICE
                          ? 'bg-primary-50 text-primary-600'
                          : service.status === AmbulanceServiceStatus.REJECTED
                            ? 'bg-red-50 text-red-500'
                            : service.status === AmbulanceServiceStatus.CANCELLED
                              ? 'bg-gray-50 text-gray-400'
                              : 'bg-primary-50 text-primary-400'
                  "
                >
                  <Ambulance :size="32" />
                </div>
                <div class="space-y-1.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      {{ service.id.slice(0, 8) }}...
                    </span>
                    <div class="h-1 w-1 rounded-full bg-gray-200"></div>
                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {{ formatDate(service.pickupDate) }}
                    </span>
                  </div>
                  <h3
                    class="text-xl font-black text-gray-900 leading-tight group-hover:text-primary-400 transition-colors duration-300"
                  >
                    {{ service.submitterName }}
                  </h3>
                  <div class="flex flex-wrap items-center gap-4 pt-1">
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
                      :class="getStatusConfig(service.status).class"
                    >
                      <component :is="getStatusConfig(service.status).icon" :size="12" />
                      {{ getStatusConfig(service.status).label }}
                    </span>
                    <div class="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <Clock :size="14" />
                      Diajukan: {{ formatDate(service.createdAt) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Action -->
              <div
                class="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-6 md:pt-0 relative z-10 shrink-0"
              >
                <button
                  v-if="service.status === AmbulanceServiceStatus.PENDING"
                  @click.stop="openCancelModal(service.id, service.submitterName, 'ambulance')"
                  :disabled="ambulanceCancelMutation.isPending.value"
                  class="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Batalkan Permintaan"
                >
                  <X :size="22" />
                </button>
                <div
                  v-else-if="
                    service.status === AmbulanceServiceStatus.ACCEPTED ||
                    service.status === AmbulanceServiceStatus.DONE
                  "
                  class="w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm"
                  :class="
                    service.status === AmbulanceServiceStatus.DONE
                      ? 'bg-blue-50 text-blue-500'
                      : 'bg-green-50 text-green-500'
                  "
                >
                  <CheckCircle2 :size="24" />
                </div>
                <div
                  v-else-if="service.status === AmbulanceServiceStatus.IN_SERVICE"
                  class="w-14 h-14 bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center shadow-sm"
                >
                  <Ambulance :size="24" />
                </div>
                <div
                  v-else
                  class="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center shadow-sm"
                >
                  <XCircle :size="24" />
                </div>
              </div>
            </div>
          </div>

          <!-- Ambulance empty: search -->
          <div v-else-if="ambulanceSearchQuery" class="py-24 text-center">
            <div
              class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300 animate-pulse"
            >
              <Search :size="40" />
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-3">Hasil Tidak Ditemukan</h3>
            <p class="text-gray-500 max-w-sm mx-auto text-base leading-relaxed">
              Tidak ada permintaan yang cocok dengan
              <span class="font-bold text-gray-900">"{{ ambulanceSearchQuery }}"</span>.
            </p>
          </div>

          <!-- Ambulance empty: no data -->
          <div
            v-else
            class="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-24 text-center"
          >
            <div
              class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300 animate-pulse"
            >
              <Ambulance :size="48" />
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-3">Belum Ada Permintaan</h3>
            <p class="text-gray-500 max-w-sm mx-auto text-base leading-relaxed">
              Anda belum pernah mengajukan permintaan layanan ambulans.
            </p>
          </div>

          <!-- Ambulance pagination -->
          <div
            v-if="hasNextPage"
            ref="loadMoreTrigger"
            class="h-20 w-full flex items-center justify-center mt-6"
          >
            <Loader2 class="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        </template>
        </template>

        <template v-else>
          <div class="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-12 md:p-24 text-center mt-12">
            <div class="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-8 text-primary-300">
              <FileText :size="48" />
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-3">Akses Terbatas</h3>
            <p class="text-gray-500 max-w-md mx-auto text-base leading-relaxed mb-8">
              Silakan masuk terlebih dahulu untuk melihat riwayat pengajuan layanan Anda.
            </p>
            <div class="flex items-center justify-center gap-4">
              <RouterLink
                to="/login"
                class="px-8 py-4 bg-primary-500 text-white font-bold rounded-2xl hover:bg-primary-600 transition shadow-lg shadow-primary-500/20"
              >
                Masuk ke Akun
              </RouterLink>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <PublicConfirmationModal
      :show="showCancelModal"
      :title="
        itemToCancel?.type === 'foster'
          ? 'Batalkan Pengajuan Anak Asuh'
          : 'Batalkan Permintaan Ambulans'
      "
      :message="`Apakah Anda yakin ingin membatalkan ${itemToCancel?.type === 'foster' ? 'pengajuan' : 'permintaan'} untuk ${itemToCancel?.name}? Tindakan ini tidak dapat dibatalkan.`"
      :icon="AlertTriangle"
      secondary-button-text="Tutup"
      danger-button-text="Ya, Batalkan"
      :danger-button-loading="isCancelLoading"
      @secondary="showCancelModal = false"
      @danger="confirmCancel"
      @close="showCancelModal = false"
    />

    <!-- Ambulance Request Detail Modal -->
    <AmbulanceRequestDetailModal
      :show="!!selectedAmbulanceId"
      :id="selectedAmbulanceId || ''"
      @close="selectedAmbulanceId = null"
    />

    <!-- Foster Child Candidate Detail Modal -->
    <FosterChildrenCandidateDetailModal
      :show="!!selectedFosterId"
      :id="selectedFosterId || ''"
      @close="selectedFosterId = null"
    />
  </PublicLayout>
</template>
