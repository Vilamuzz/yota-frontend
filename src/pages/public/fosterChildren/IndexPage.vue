<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ChildrenCard from '@/components/molecules/ChildrenCard.vue'
import { useFosterChildrenList } from '@/composables/fosterChildren/useFosterChildrenList'
import { useOffsetPagination } from '@/composables/ui/useOffsetPagination'
import BasePagination from '@/components/atoms/BasePagination.vue'
import { Users, Search, Loader2, X, ArrowUpRight, Check } from 'lucide-vue-next'
import { type FosterChildrenQueryParams, Gender, Category } from '@/types/fosterChildren'

const router = useRouter()
const searchQuery = ref('')

const queryParams = reactive<FosterChildrenQueryParams>({
  limit: 12,
  page: 1,
  search: undefined,
  gender: undefined,
  category: undefined,
  isGraduated: undefined,
  sortBy: undefined,
})

const {
  listQuery,
  fosterChildren,
  pagination,
  isLoading: isInitialLoading,
} = useFosterChildrenList(queryParams)

const { goToPage, resetPagination } = useOffsetPagination(queryParams, pagination)

const isError = listQuery.isError

// Search functionality
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

// Sort & Filter State
const showSortDropdown = ref(false)
const showFilterDropdown = ref(false)
const searchContainerRef = ref<HTMLElement | null>(null)

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

const toggleFilter = () => {
  showFilterDropdown.value = !showFilterDropdown.value
  showSortDropdown.value = false

  // Sync local temp state when opening filter dropdown
  tempGender.value = queryParams.gender || null
  tempCategory.value = queryParams.category || null
  tempIsGraduated.value = queryParams.isGraduated ?? null
}

const selectSort = (val: string) => {
  queryParams.sortBy = val
  resetPagination()
  showSortDropdown.value = false
}

const tempGender = ref<Gender | null>(null)
const tempCategory = ref<Category | null>(null)
const tempIsGraduated = ref<boolean | null>(null)

const applyFilters = () => {
  queryParams.gender = tempGender.value || undefined
  queryParams.category = tempCategory.value || undefined
  queryParams.isGraduated = tempIsGraduated.value !== null ? tempIsGraduated.value : undefined
  resetPagination()
  showFilterDropdown.value = false
}

const resetFilters = () => {
  tempGender.value = null
  tempCategory.value = null
  tempIsGraduated.value = null
  queryParams.gender = undefined
  queryParams.category = undefined
  queryParams.isGraduated = undefined
  resetPagination()
  showFilterDropdown.value = false
}

const hasActiveFilters = computed(
  () => !!queryParams.gender || !!queryParams.category || queryParams.isGraduated !== undefined,
)

const formatCategory = (cat: Category) => {
  if (cat === Category.yatim) return 'Yatim'
  if (cat === Category.piatu) return 'Piatu'
  if (cat === Category.yatimPiatu) return 'Yatim Piatu'
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
        <!-- TITLE -->
        <div class="text-center mb-12">
          <h1 class="text-3xl font-black text-gray-900 uppercase leading-tight mb-3">
            Masa Depan Mereka, <span class="text-primary-500">Kepedulian Kita</span>
          </h1>
          <p class="text-gray-500 max-w-2xl mx-auto">
            Mari bersama-sama memberikan harapan dan masa depan yang lebih baik bagi anak-anak asuh
            kita. Setiap bantuan Anda sangat berarti bagi mereka.
          </p>
        </div>

        <!-- SEARCH + SORT + FILTER -->
        <div class="flex justify-center mb-10">
          <div class="relative w-full max-w-xl" ref="searchContainerRef">
            <BasePublicSearch
              v-model="searchQuery"
              placeholder="Cari nama anak asuh..."
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
                <!-- Gender Filter -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2">Jenis Kelamin</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="gender in [Gender.male, Gender.female]"
                      :key="gender"
                      @click="tempGender = tempGender === gender ? null : gender"
                      class="w-full text-center px-3 py-2 rounded-xl text-xs transition-colors border"
                      :class="
                        tempGender === gender
                          ? 'border-primary-500 bg-primary-50 text-primary-600 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      "
                    >
                      {{ gender === Gender.male ? 'Laki-laki' : 'Perempuan' }}
                    </button>
                  </div>
                </div>

                <!-- Category Filter -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2">Kategori</label>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      v-for="cat in [Category.yatim, Category.piatu, Category.yatimPiatu]"
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

                <!-- Status Filter -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2">Status Kelulusan</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      @click="tempIsGraduated = tempIsGraduated === true ? null : true"
                      class="w-full text-center px-3 py-2 rounded-xl text-xs transition-colors border"
                      :class="
                        tempIsGraduated === true
                          ? 'border-primary-500 bg-primary-50 text-primary-600 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      "
                    >
                      Lulus
                    </button>
                    <button
                      @click="tempIsGraduated = tempIsGraduated === false ? null : false"
                      class="w-full text-center px-3 py-2 rounded-xl text-xs transition-colors border"
                      :class="
                        tempIsGraduated === false
                          ? 'border-primary-500 bg-primary-50 text-primary-600 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      "
                    >
                      Belum Lulus
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
        <div v-if="hasActiveFilters" class="flex flex-wrap justify-center gap-2 mb-6 -mt-4">
          <div
            v-if="queryParams.gender"
            class="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-200 text-primary-600 text-xs font-semibold rounded-full"
          >
            <span
              >Gender: {{ queryParams.gender === Gender.male ? 'Laki-laki' : 'Perempuan' }}</span
            >
            <button
              @click="((queryParams.gender = undefined), resetPagination())"
              class="hover:text-primary-800 focus:outline-none"
            >
              &times;
            </button>
          </div>
          <div
            v-if="queryParams.category"
            class="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-200 text-primary-600 text-xs font-semibold rounded-full"
          >
            <span>Kategori: {{ formatCategory(queryParams.category) }}</span>
            <button
              @click="((queryParams.category = undefined), resetPagination())"
              class="hover:text-primary-800 focus:outline-none"
            >
              &times;
            </button>
          </div>
          <div
            v-if="queryParams.isGraduated !== undefined"
            class="flex items-center gap-1.5 px-3 py-1 bg-primary-50 border border-primary-200 text-primary-600 text-xs font-semibold rounded-full"
          >
            <span>Status: {{ queryParams.isGraduated ? 'Lulus' : 'Belum Lulus' }}</span>
            <button
              @click="((queryParams.isGraduated = undefined), resetPagination())"
              class="hover:text-primary-800 focus:outline-none"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isInitialLoading" class="flex flex-col items-center justify-center py-24">
          <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p class="text-gray-500 font-medium animate-pulse">Menyiapkan data anak asuh...</p>
        </div>

        <!-- Error State -->
        <div
          v-else-if="isError"
          class="bg-red-50 border border-red-100 rounded-2xl p-8 text-center"
        >
          <div
            class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"
          >
            <X :size="32" />
          </div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Gagal Memuat Data</h3>
          <p class="text-gray-600 max-w-md mx-auto">
            {{
              listQuery.error.value?.message ||
              'Terjadi kesalahan sistem saat mencoba mengambil daftar anak asuh.'
            }}
          </p>
          <BaseButton variant="outline" class="mt-6" @click="listQuery.refetch()">
            Coba Lagi
          </BaseButton>
        </div>

        <!-- Main Content -->
        <template v-else>
          <div
            v-if="fosterChildren.length > 0"
            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          >
            <ChildrenCard
              v-for="child in fosterChildren"
              :key="child.id"
              :fosterChildren="child"
              :to="{ name: 'foster-children-detail', params: { slug: child.slug } }"
              class="transform hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl rounded-2xl border-none ring-1 ring-gray-100"
            />
          </div>

          <!-- Search Empty State -->
          <div v-else-if="searchQuery" class="py-24 text-center">
            <div
              class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"
            >
              <Search :size="32" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Hasil Tidak Ditemukan</h3>
            <p class="text-gray-500 max-w-sm mx-auto mb-8">
              Maaf, kami tidak dapat menemukan anak asuh dengan kata kunci "{{ searchQuery }}".
            </p>
            <BaseButton variant="outline" @click="searchQuery = ''">
              Bersihkan Pencarian
            </BaseButton>
          </div>

          <!-- General Empty State -->
          <div v-else class="py-24 text-center">
            <div
              class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"
            >
              <Users :size="32" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Data Belum Tersedia</h3>
            <p class="text-gray-500 max-w-sm mx-auto">
              Saat ini belum ada data anak asuh yang dapat ditampilkan. Silakan kembali lagi nanti.
            </p>
          </div>

          <!-- Pagination -->
          <BasePagination
            v-if="pagination && pagination.totalPages > 1"
            class="mt-16"
            :current-page="queryParams.page ?? 1"
            :total-pages="pagination.totalPages"
            @update:current-page="goToPage"
          />

          <!-- PERSUASIVE SECTION -->
          <div
            class="mt-20 bg-gray-900 rounded-[3rem] p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group"
          >
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(52,211,153,0.1),transparent)]"
            ></div>
            <Users
              class="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000"
            />

            <div class="relative z-10 text-center md:text-left max-w-lg">
              <h2 class="text-3xl font-black mb-4 leading-tight">
                Bantu Mereka Mendapatkan Masa Depan
              </h2>
              <p class="text-gray-400 text-lg font-medium leading-relaxed">
                Kenal anak yatim atau dhuafa yang membutuhkan bantuan pendidikan? Daftarkan mereka
                sebagai calon anak asuh untuk mendapatkan bantuan.
              </p>
            </div>

            <BaseButton
              variant="primary"
              class="relative z-10 !px-10 !py-5 !rounded-2xl !font-black !text-sm shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-all duration-500 flex items-center gap-3 active:scale-95 group/btn"
              @click="router.push({ name: 'foster-children-candidate-submission' })"
            >
              AJUKAN CALON ANAK ASUH
              <ArrowUpRight
                :size="20"
                class="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"
              />
            </BaseButton>
          </div>
        </template>
      </div>
    </div>
  </PublicLayout>
</template>
