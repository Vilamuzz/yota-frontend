<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import DonationCard from '@/components/molecules/DonationCard.vue'
import { useDonationProgramList } from '@/composables/donationProgram/useDonationProgramList'
import { useOffsetPagination } from '@/composables/ui/useOffsetPagination'
import BasePagination from '@/components/atoms/BasePagination.vue'
import { Search, Loader2, Check } from 'lucide-vue-next'
import {
  type DonationProgramQueryParams,
  DonationProgramCategoryEnum,
  DonationProgramStatusEnum,
} from '@/types/donationProgram'

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const queryParams = reactive<DonationProgramQueryParams>({
  limit: 12,
  page: 1,
  search: undefined,
  category: undefined,
  sortBy: undefined,
  status: undefined,
})

const { listQuery, donationPrograms, pagination } = useDonationProgramList(queryParams)

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
const showFilterDropdown = ref(false)
const searchContainerRef = ref<HTMLElement | null>(null)

const sortOptions = [
  { label: 'Terbaru', value: 'created_at desc' },
  { label: 'Terlama', value: 'created_at asc' },
  { label: 'Target Dana Tertinggi', value: 'fund_target desc' },
  { label: 'Target Dana Terendah', value: 'fund_target asc' },
  { label: 'Tanggal Mulai (Terbaru)', value: 'start_date desc' },
  { label: 'Tanggal Mulai (Terlama)', value: 'start_date asc' },
  { label: 'Tanggal Selesai (Terdekat)', value: 'end_date asc' },
  { label: 'Tanggal Selesai (Terlama)', value: 'end_date desc' },
]

const toggleSort = () => {
  showSortDropdown.value = !showSortDropdown.value
  showFilterDropdown.value = false
}

const toggleFilter = () => {
  showFilterDropdown.value = !showFilterDropdown.value
  showSortDropdown.value = false

  // Sync local temp state when opening filter dropdown
  tempCategory.value = queryParams.category || null
  tempStatus.value = queryParams.status || null
}

const selectSort = (val: string) => {
  queryParams.sortBy = val
  resetPagination()
  showSortDropdown.value = false
}

const tempCategory = ref<DonationProgramCategoryEnum | null>(null)
const tempStatus = ref<DonationProgramStatusEnum | null>(null)

const selectStatus = (statusValue: DonationProgramStatusEnum) => {
  if (tempStatus.value === statusValue) {
    tempStatus.value = null
  } else {
    tempStatus.value = statusValue
  }
}

const applyFilters = () => {
  queryParams.category = tempCategory.value || undefined
  queryParams.status = tempStatus.value || undefined
  resetPagination()
  showFilterDropdown.value = false
}

const resetFilters = () => {
  tempCategory.value = null
  queryParams.category = undefined
  tempStatus.value = null
  queryParams.status = undefined
  resetPagination()
  showFilterDropdown.value = false
}

const clearCategoryFilter = () => {
  tempCategory.value = null
  queryParams.category = undefined
  resetPagination()
}

const clearStatusFilter = () => {
  tempStatus.value = null
  queryParams.status = undefined
  resetPagination()
}

const hasActiveFilters = computed(() => !!queryParams.category || !!queryParams.status)

const formatCategory = (cat: DonationProgramCategoryEnum) => {
  if (cat === DonationProgramCategoryEnum.EDUCATION) return 'Pendidikan'
  if (cat === DonationProgramCategoryEnum.HEALTH) return 'Kesehatan'
  if (cat === DonationProgramCategoryEnum.ENVIRONMENT) return 'Lingkungan'
  if (cat === DonationProgramCategoryEnum.SOCIAL) return 'Sosial'
  if (cat === DonationProgramCategoryEnum.DISASTER) return 'Bencana'
  if (cat === DonationProgramCategoryEnum.HUMANITY) return 'Kemanusiaan'
  if (cat === DonationProgramCategoryEnum.OTHER) return 'Lainnya'
  return cat
}

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
        <!-- Title -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-primary-500 mb-3 uppercase">Program Donasi</h1>

          <p class="text-gray-500 max-w-2xl mx-auto">
            Ulurkan tangan, berbagi kebahagiaan. Setiap donasi Anda membawa harapan bagi mereka yang
            membutuhkan.
          </p>
        </div>

        <!-- Search + Sort + Filter -->
        <div class="flex justify-center mb-10">
          <div class="relative w-full max-w-xl" ref="searchContainerRef">
            <BasePublicSearch
              v-model="searchQuery"
              placeholder="Bantu siapa hari ini? Cari program donasi..."
              @on-sort="toggleSort"
              @on-filter="toggleFilter"
            />

            <!-- Sort Dropdown -->
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

            <!-- Filter Dropdown -->
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
                        { label: 'Aktif', value: DonationProgramStatusEnum.ACTIVE },
                        { label: 'Selesai', value: DonationProgramStatusEnum.COMPLETED },
                        { label: 'Kedaluwarsa', value: DonationProgramStatusEnum.EXPIRED },
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

                <!-- Category Filter -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2">Kategori</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="cat in Object.values(DonationProgramCategoryEnum)"
                      :key="cat"
                      @click="tempCategory = tempCategory === cat ? null : cat"
                      class="w-full text-center px-3 py-2 rounded-xl text-xs transition-colors border"
                      :class="
                        tempCategory === cat
                          ? 'border-primary-500 bg-primary-50 text-primary-600 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      "
                    >
                      {{ formatCategory(cat) }}
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

        <!-- Active Filter Chips -->
        <div v-if="hasActiveFilters" class="flex flex-wrap justify-center gap-2 mb-6 -mt-4">
          <div
            v-if="queryParams.category"
            class="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-200 text-primary-600 text-xs font-semibold rounded-full"
          >
            <span>Kategori: {{ formatCategory(queryParams.category) }}</span>
            <button @click="clearCategoryFilter" class="hover:text-primary-800 focus:outline-none">
              &times;
            </button>
          </div>
          <div
            v-if="queryParams.status"
            class="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-200 text-primary-600 text-xs font-semibold rounded-full"
          >
            <span
              >Status:
              {{
                queryParams.status === 'active'
                  ? 'Aktif'
                  : queryParams.status === 'completed'
                    ? 'Selesai'
                    : 'Kedaluwarsa'
              }}</span
            >
            <button @click="clearStatusFilter" class="hover:text-primary-800 focus:outline-none">
              &times;
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isInitialLoading" class="flex flex-col items-center justify-center py-24">
          <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p class="text-gray-500 font-medium animate-pulse">Menyiapkan program donasi...</p>
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
              'Terjadi kesalahan sistem saat mencoba mengambil daftar program donasi.'
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
            v-if="donationPrograms.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <DonationCard
              v-for="donation in donationPrograms"
              :key="donation.id"
              :donation="donation"
              class="transform hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl rounded-2xl border-none ring-1 ring-gray-100"
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
              Maaf, kami tidak dapat menemukan program donasi dengan kata kunci "{{ searchQuery }}".
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
  </PublicLayout>
</template>
