<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import NewsCard from '@/components/molecules/NewsCard.vue'
import { usePublishedNewsList } from '@/composables/news/useNewsList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { Newspaper, Search, Loader2, X } from 'lucide-vue-next'
import type { NewsQueryParams } from '@/types/news'

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const queryParams = reactive<NewsQueryParams>({
  limit: 9,
  search: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const { listQuery, news, pagination } = usePublishedNewsList(queryParams)
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
            Kabar Terbaru dari <span class="text-primary-500">Lapangan</span>
          </h1>
          <p class="text-gray-500 max-w-2xl mx-auto mt-4">
            Ikuti perkembangan terbaru, kisah inspiratif, dan laporan kegiatan kami dalam upaya
            menebar kebaikan bagi sesama.
          </p>
        </div>

        <!-- SEARCH + BUTTON -->
        <div class="flex justify-center mb-12">
          <BasePublicSearch
            v-model="searchQuery"
            placeholder="Cari berita atau cerita..."
            :show-sort="false"
            :show-filter="false"
          />
        </div>

        <!-- Loading State -->
        <div v-if="isInitialLoading" class="flex flex-col items-center justify-center py-24">
          <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p class="text-gray-500 font-medium animate-pulse">Menghimpun berita terbaru...</p>
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
          <h3 class="text-lg font-bold text-gray-900 mb-2">Gagal Memuat Berita</h3>
          <p class="text-gray-600 max-w-md mx-auto">
            {{
              listQuery.error.value?.message ||
              'Terjadi kesalahan sistem saat mencoba mengambil daftar berita.'
            }}
          </p>
          <BaseButton variant="outline" class="mt-6" @click="listQuery.refetch()">
            Coba Lagi
          </BaseButton>
        </div>

        <!-- Main Content -->
        <template v-else>
          <div v-if="news.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <NewsCard
              v-for="item in news"
              :key="item.id"
              :news="item"
              class="transform hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-xl rounded-2xl border-none ring-1 ring-gray-100 bg-white overflow-hidden"
            />
          </div>

          <!-- Search Empty State -->
          <div v-else-if="searchQuery" class="py-24 text-center">
            <div
              class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"
            >
              <Search :size="32" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Berita Tidak Ditemukan</h3>
            <p class="text-gray-500 max-w-sm mx-auto mb-8">
              Maaf, kami tidak dapat menemukan berita dengan kata kunci "{{ searchQuery }}".
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
              <Newspaper :size="32" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Belum Ada Berita</h3>
            <p class="text-gray-500 max-w-sm mx-auto">
              Saat ini belum ada berita atau cerita yang dapat ditampilkan. Silakan kembali lagi
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
