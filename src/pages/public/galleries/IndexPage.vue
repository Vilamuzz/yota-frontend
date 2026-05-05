<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import GalleryCard from '@/components/molecules/GalleryCard.vue'
import { usePublishedGalleryList } from '@/composables/gallery/useGalleryList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { Image as ImageIcon, Search, Loader2, X } from 'lucide-vue-next'
import type { GalleryQueryParams } from '@/types/gallery'

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const queryParams = reactive<GalleryQueryParams>({
  limit: 12,
  search: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const { listQuery, galleries, pagination } = usePublishedGalleryList(queryParams)
const { resetPagination, handleNextPage, handlePrevPage } = useCursorPagination(queryParams)

watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

const isInitialLoading = computed(() => listQuery.isPending.value)
const isError = computed(() => listQuery.isError.value)
</script>

<template>
  <PublicLayout>
    <!-- Hero/Search Section -->
    <div class="relative">
      <BasePublicSearch v-model="searchQuery" placeholder="Cari momen kebaikan..." />
    </div>

    <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
      <!-- Title & Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div class="flex items-center gap-2 text-primary-500 mb-2">
            <ImageIcon :size="20" class="fill-current" />
            <span class="text-sm font-bold uppercase tracking-wider">Galeri Foto</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-black text-gray-900">
            Melihat Jejak, <span class="text-primary-500">Menebar Kebaikan</span>
          </h1>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isInitialLoading" class="flex flex-col items-center justify-center py-24">
        <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p class="text-gray-500 font-medium animate-pulse">Menyiapkan galeri momen...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
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

        <!-- Empty State -->
        <div v-else class="py-24 text-center">
          <div
            class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"
          >
            <Search :size="32" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Galeri Tidak Ditemukan</h3>
          <p class="text-gray-500 max-w-sm mx-auto">
            Maaf, kami tidak dapat menemukan galeri dengan kata kunci "{{ searchQuery }}".
          </p>
          <BaseButton variant="outline" class="mt-8" @click="searchQuery = ''">
            Lihat Semua Galeri
          </BaseButton>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination?.nextCursor || pagination?.prevCursor"
          class="mt-16 flex items-center justify-center gap-4"
        >
          <BaseButton
            variant="outline"
            :disabled="!pagination?.prevCursor"
            @click="handlePrevPage(pagination)"
          >
            Sebelumnya
          </BaseButton>
          <BaseButton
            variant="outline"
            :disabled="!pagination?.nextCursor"
            @click="handleNextPage(pagination)"
          >
            Berikutnya
          </BaseButton>
        </div>
      </template>
    </div>
  </PublicLayout>
</template>

