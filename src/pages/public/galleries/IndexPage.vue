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
    <div class="bg-gray-50 min-h-screen pt-28 pb-12 px-18 font-poppins">
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

        <!-- SEARCH + BUTTON -->
        <div class="flex justify-center mb-12">
          <BasePublicSearch v-model="searchQuery" placeholder="Cari momen kebaikan..." />
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
    </div>
  </PublicLayout>
</template>
