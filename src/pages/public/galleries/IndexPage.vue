<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import GalleryCard from '@/components/molecules/GalleryCard.vue'
import { usePublishedGalleryList } from '@/composables/gallery/useGalleryList'
import { useOffsetPagination } from '@/composables/ui/useOffsetPagination'
import BasePagination from '@/components/atoms/BasePagination.vue'
import { Image as ImageIcon, Search, Loader2, X, Check } from 'lucide-vue-next'
import type { GalleryQueryParams } from '@/types/gallery'
import { MediaCategory } from '@/types/media'

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const queryParams = reactive<GalleryQueryParams>({
  limit: 6,
  page: 1,
  search: undefined,
})

const { listQuery, galleries, pagination } = usePublishedGalleryList(queryParams)
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
  { label: 'Viewer Terbanyak', value: 'views desc' },
  { label: 'Viewer Terendah', value: 'views asc' },
  { label: 'Judul (A-Z)', value: 'title asc' },
  { label: 'Judul (Z-A)', value: 'title desc' },
]

const toggleSort = () => {
  showSortDropdown.value = !showSortDropdown.value
  showFilterDropdown.value = false
}

const toggleFilter = () => {
  showFilterDropdown.value = !showFilterDropdown.value
  showSortDropdown.value = false
}

const selectSort = (val: string) => {
  queryParams.sortBy = val
  resetPagination()
  showSortDropdown.value = false
}

const clearCategoryFilter = () => {
  queryParams.category = undefined
  resetPagination()
}

const hasActiveFilters = computed(() => !!queryParams.category)

const formatCategory = (cat: MediaCategory) => {
  return cat
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
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
    <div class="bg-gray-50 min-h-screen pt-28 pb-12 px-6 md:px-18 font-poppins">
      <div class="max-w-7xl mx-auto">
        <!-- TITLE -->
        <div class="text-center mb-12">
          <h1 class="text-3xl md:text-4xl font-black text-gray-900 uppercase leading-tight">
            Melihat Jejak, <span class="text-primary-500">Menebar Kebaikan</span>
          </h1>
          <p class="text-gray-500 max-w-2xl mx-auto mt-4">
            Dokumentasi kegiatan sosial, penyaluran donasi, serta momen kebersamaan Yayasan Orang
            Tua Asuh bersama anak asuh dan masyarakat.
          </p>
        </div>

        <!-- Search + Sort + Filter -->
        <div class="flex justify-center mb-10">
          <div class="relative w-full max-w-xl" ref="searchContainerRef">
            <BasePublicSearch
              v-model="searchQuery"
              placeholder="Cari momen kebaikan..."
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
                <!-- Category Filter -->
                <div>
                  <label class="block text-xs font-bold text-gray-500 mb-2">Kategori</label>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      v-for="cat in Object.values(MediaCategory)"
                      :key="cat"
                      @click="
                        () => {
                          queryParams.category = queryParams.category === cat ? undefined : cat
                          resetPagination()
                        }
                      "
                      class="w-full text-center px-3 py-2 rounded-xl text-xs transition-colors border"
                      :class="
                        queryParams.category === cat
                          ? 'border-primary-500 bg-primary-50 text-primary-600 font-semibold'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      "
                    >
                      {{ formatCategory(cat) }}
                    </button>
                  </div>
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
        </div>

        <!-- Loading State -->
        <div v-if="isInitialLoading" class="flex flex-col items-center justify-center py-24">
          <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p class="text-gray-500 font-medium animate-pulse">Menyiapkan galeri momen...</p>
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
              'Terjadi kesalahan sistem saat mencoba mengambil daftar galeri.'
            }}
          </p>
          <BaseButton variant="outline" class="mt-6" @click="listQuery.refetch()">
            Coba Lagi
          </BaseButton>
        </div>

        <!-- Main Content -->
        <template v-else>
          <div
            v-if="galleries.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <GalleryCard v-for="gallery in galleries" :key="gallery.id" :gallery="gallery" />
          </div>

          <!-- Search Empty State -->
          <div v-else-if="searchQuery" class="py-24 text-center">
            <div
              class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"
            >
              <Search :size="32" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Galeri Tidak Ditemukan</h3>
            <p class="text-gray-500 max-w-sm mx-auto mb-8">
              Maaf, kami tidak dapat menemukan galeri dengan kata kunci "{{ searchQuery }}".
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
              <ImageIcon :size="32" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Belum Ada Galeri</h3>
            <p class="text-gray-500 max-w-sm mx-auto">
              Saat ini belum ada dokumentasi kegiatan yang dapat ditampilkan. Silakan kembali lagi
              nanti.
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
        </template>
      </div>
    </div>
  </PublicLayout>
</template>
