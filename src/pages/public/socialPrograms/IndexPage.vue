<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import SocialProgramCard from '@/components/molecules/SocialProgramCard.vue'
import { usePublishedSocialProgramList } from '@/composables/socialProgram/usePublishedSocialProgramList'
import { useOffsetPagination } from '@/composables/ui/useOffsetPagination'
import BasePagination from '@/components/atoms/BasePagination.vue'
import { Search, Loader2, Check, LogIn } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import PublicConfirmationModal from '@/components/molecules/PublicConfirmationModal.vue'
import type { SocialProgramQueryParams } from '@/types/socialProgram'

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const queryParams = reactive<SocialProgramQueryParams>({
  limit: 6,
  page: 1,
  search: undefined,
  sortBy: undefined,
  status: undefined,
  startDate: undefined,
  endDate: undefined,
})

const { listQuery, socialPrograms, pagination } = usePublishedSocialProgramList(queryParams)
const { goToPage, resetPagination } = useOffsetPagination(queryParams, pagination)

watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

const isInitialLoading = computed(() => listQuery.isPending.value)
const isError = computed(() => listQuery.isError.value)

// Sort & Filter Dropdowns
const showSortDropdown = ref(false)
const showLoginModal = ref(false)

const router = useRouter()
const route = useRoute()

const handleLogin = () => {
  showLoginModal.value = false
  router.push({
    path: '/login',
    query: { redirect: route.fullPath },
  })
}
const showFilterDropdown = ref(false)
const searchContainerRef = ref<HTMLElement | null>(null)

const sortOptions = [
  { label: 'Terbaru', value: 'created_at desc' },
  { label: 'Terlama', value: 'created_at asc' },
  { label: 'Nama (A-Z)', value: 'title asc' },
  { label: 'Nama (Z-A)', value: 'title desc' },
  { label: 'Pelanggan Terbanyak', value: 'total_subscribers desc' },
  { label: 'Pelanggan Paling Sedikit', value: 'total_subscribers asc' },
  { label: 'Donasi Terendah', value: 'minimum_amount asc' },
  { label: 'Donasi Tertinggi', value: 'minimum_amount desc' },
  { label: 'Hari Tagihan Terawal', value: 'billing_day asc' },
]

const toggleSort = () => {
  showSortDropdown.value = !showSortDropdown.value
  showFilterDropdown.value = false
}

const toggleFilter = () => {
  showFilterDropdown.value = !showFilterDropdown.value
  showSortDropdown.value = false

  // Sync local temp state when opening filter dropdown
  if (queryParams.startDate && queryParams.endDate) {
    const range = billingRanges.find(
      (r) => r.startDate === queryParams.startDate && r.endDate === queryParams.endDate,
    )
    tempBillingRange.value = range || null
  } else {
    tempBillingRange.value = null
  }

  tempStatus.value = queryParams.status || null
}

const selectSort = (val: string) => {
  queryParams.sortBy = val
  resetPagination()
  showSortDropdown.value = false
}

// Filter Options (Billing Day)
interface BillingRange {
  label: string
  startDate?: string
  endDate?: string
}

const billingRanges: BillingRange[] = [
  { label: 'Awal Bulan (Tgl 1 - 10)', startDate: '2026-01-01', endDate: '2026-01-10' },
  { label: 'Tengah Bulan (Tgl 11 - 20)', startDate: '2026-01-11', endDate: '2026-01-20' },
  { label: 'Akhir Bulan (Tgl 21 - 31)', startDate: '2026-01-21', endDate: '2026-01-31' },
]

const tempBillingRange = ref<BillingRange | null>(null)
const selectedBillingRangeLabel = ref('')

const selectBillingRange = (range: BillingRange) => {
  if (tempBillingRange.value?.label === range.label) {
    tempBillingRange.value = null // Deselect if already selected
  } else {
    tempBillingRange.value = range
  }
}

const tempStatus = ref<string | null>(null)

const selectStatus = (statusValue: string) => {
  if (tempStatus.value === statusValue) {
    tempStatus.value = null
  } else {
    tempStatus.value = statusValue
  }
}

const applyFilters = () => {
  if (tempBillingRange.value) {
    queryParams.startDate = tempBillingRange.value.startDate
    queryParams.endDate = tempBillingRange.value.endDate
    selectedBillingRangeLabel.value = tempBillingRange.value.label
  } else {
    queryParams.startDate = undefined
    queryParams.endDate = undefined
    selectedBillingRangeLabel.value = ''
  }

  queryParams.status = tempStatus.value || undefined

  resetPagination()
  showFilterDropdown.value = false
}

const resetFilters = () => {
  tempBillingRange.value = null
  queryParams.startDate = undefined
  queryParams.endDate = undefined
  selectedBillingRangeLabel.value = ''

  tempStatus.value = null
  queryParams.status = undefined

  resetPagination()
  showFilterDropdown.value = false
}

const clearBillingRangeFilter = () => {
  tempBillingRange.value = null
  queryParams.startDate = undefined
  queryParams.endDate = undefined
  selectedBillingRangeLabel.value = ''
  resetPagination()
}

const clearStatusFilter = () => {
  tempStatus.value = null
  queryParams.status = undefined
  resetPagination()
}

const hasActiveFilters = computed(
  () => !!queryParams.startDate || !!queryParams.endDate || !!queryParams.status,
)

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node
  if (searchContainerRef.value && !searchContainerRef.value.contains(target)) {
    showSortDropdown.value = false
    showFilterDropdown.value = false
  }
}

onMounted(() => {
  window.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', handleClickOutside)
})
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-12 px-18 font-poppins">
      <div class="max-w-7xl mx-auto">
        <!-- TITLE -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-primary-500 mb-3">PROGRAM SOSIAL</h1>

          <p class="text-gray-500 max-w-2xl mx-auto">
            Mari berpartisipasi dalam berbagai program sosial untuk membantu saudara kita yang
            membutuhkan. Sedekah Anda akan menjadi kebaikan yang terus mengalir.
          </p>
        </div>

        <!-- SEARCH + SORT + FILTER -->
        <div class="flex justify-center mb-10">
          <div class="relative w-full max-w-xl" ref="searchContainerRef">
            <BasePublicSearch
              v-model="searchQuery"
              @on-sort="toggleSort"
              @on-filter="toggleFilter"
            />

            <!-- SORT DROPDOWN -->
            <div
              v-if="showSortDropdown"
              class="absolute right-[3.5rem] top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
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
                    queryParams.sortBy === option.value ||
                    (!queryParams.sortBy && option.value === 'created_at desc')
                      ? 'bg-primary-50 text-primary-600 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  "
                >
                  {{ option.label }}
                  <Check
                    v-if="
                      queryParams.sortBy === option.value ||
                      (!queryParams.sortBy && option.value === 'created_at desc')
                    "
                    :size="16"
                  />
                </button>
              </div>
            </div>

            <!-- FILTER DROPDOWN -->
            <div
              v-if="showFilterDropdown"
              class="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Saring Berdasarkan
              </h4>

              <div class="space-y-4">
                <!-- Status Filter -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2">Status</label>
                  <div class="flex gap-2">
                    <button
                      v-for="statusOpt in [
                        { label: 'Aktif', value: 'active' },
                        { label: 'Selesai', value: 'completed' },
                      ]"
                      :key="statusOpt.value"
                      @click="selectStatus(statusOpt.value)"
                      class="flex-1 text-center py-2.5 rounded-xl text-xs transition-colors border"
                      :class="
                        tempStatus === statusOpt.value
                          ? 'border-primary-500 bg-primary-50 text-primary-600 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      "
                    >
                      {{ statusOpt.label }}
                    </button>
                  </div>
                </div>

                <!-- Billing Day Range Filter -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2">Tanggal Tagihan</label>
                  <div class="space-y-2">
                    <button
                      v-for="range in billingRanges"
                      :key="range.label"
                      @click="selectBillingRange(range)"
                      class="w-full text-left px-3 py-2.5 rounded-xl text-xs transition-colors border"
                      :class="
                        tempBillingRange?.label === range.label
                          ? 'border-primary-500 bg-primary-50 text-primary-600 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      "
                    >
                      {{ range.label }}
                    </button>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    @click="resetFilters"
                    class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    @click="applyFilters"
                    class="flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-xs font-semibold hover:bg-primary-600 transition-colors shadow-sm shadow-primary-500/20"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ACTIVE FILTER CHIPS -->
        <div v-if="hasActiveFilters" class="flex justify-center gap-2 mb-6 -mt-4">
          <div
            v-if="queryParams.startDate && queryParams.endDate"
            class="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-200 text-primary-600 text-xs font-semibold rounded-full"
          >
            <span>Tagihan: {{ selectedBillingRangeLabel }}</span>
            <button @click="clearBillingRangeFilter" class="hover:text-primary-800 focus:outline-none">
              &times;
            </button>
          </div>
          <div
            v-if="queryParams.status"
            class="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-200 text-primary-600 text-xs font-semibold rounded-full"
          >
            <span>Status: {{ queryParams.status === 'active' ? 'Aktif' : 'Selesai' }}</span>
            <button @click="clearStatusFilter" class="hover:text-primary-800 focus:outline-none">
              &times;
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isInitialLoading" class="flex flex-col items-center justify-center py-24">
          <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p class="text-gray-500 font-medium animate-pulse">Menyiapkan program sosial...</p>
        </div>

        <!-- Error State -->
        <div
          v-else-if="isError"
          class="bg-red-50 border border-red-100 rounded-2xl p-8 text-center"
        >
          <div
            class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"
          >
            <Search :size="32" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Gagal Memuat Data</h3>
          <p class="text-gray-600 max-w-md mx-auto">
            {{
              listQuery.error.value?.message ||
              'Terjadi kesalahan sistem saat mencoba mengambil daftar program sosial.'
            }}
          </p>
          <button
            class="mt-6 px-6 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            @click="listQuery.refetch()"
          >
            Coba Lagi
          </button>
        </div>

        <!-- Main Content -->
        <template v-else>
          <div
            v-if="socialPrograms.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <SocialProgramCard
              v-for="program in socialPrograms"
              :key="program.id"
              :program="program"
              @require-login="showLoginModal = true"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="py-24 text-center">
            <div
              class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"
            >
              <Search :size="32" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Program Tidak Ditemukan</h3>
            <p class="text-gray-500 max-w-sm mx-auto">
              Maaf, kami tidak dapat menemukan program sosial dengan kata kunci "{{ searchQuery }}".
            </p>
            <button
              class="mt-8 px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              @click="searchQuery = ''"
            >
              Lihat Semua Program
            </button>
          </div>

          <!-- Pagination -->
          <BasePagination
            v-if="pagination && pagination.totalPages > 1"
            class="mt-16"
            :current-page="queryParams.page ?? 1"
            :total-pages="pagination.totalPages"
            @update:current-page="goToPage"
          />
        </template>
      </div>
    </div>

    <!-- Login Reminder Modal -->
    <PublicConfirmationModal
      :show="showLoginModal"
      title="Yuk, Masuk Dulu!"
      message="Untuk bisa berlangganan program sosial ini, kamu perlu masuk ke akunmu terlebih dahulu."
      primaryButtonText="Masuk Sekarang"
      secondaryButtonText="Nanti Saja"
      :icon="LogIn"
      @close="showLoginModal = false"
      @secondary="showLoginModal = false"
      @primary="handleLogin"
    />
  </PublicLayout>
</template>
