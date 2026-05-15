<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import DonationCard from '@/components/molecules/DonationCard.vue'
import { useDonationProgramList } from '@/composables/donationProgram/useDonationProgramList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { Search, Loader2 } from 'lucide-vue-next'
import type { DonationProgramQueryParams } from '@/types/donationProgram'

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const queryParams = reactive<DonationProgramQueryParams>({
  limit: 12,
  search: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const { listQuery, donationPrograms, pagination } = useDonationProgramList(queryParams)

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
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-primary-500 mb-3 uppercase">Program Donasi</h1>

          <p class="text-gray-500 max-w-2xl mx-auto">
            Ulurkan tangan, berbagi kebahagiaan. Setiap donasi Anda membawa harapan bagi mereka yang
            membutuhkan.
          </p>
        </div>

        <!-- SEARCH + BUTTON -->
        <div class="flex justify-center mb-10">
          <BasePublicSearch
            v-model="searchQuery"
            placeholder="Bantu siapa hari ini? Cari program donasi..."
          />
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
          <div
            v-if="pagination?.nextCursor || pagination?.prevCursor"
            class="mt-16 flex items-center justify-center gap-4"
          >
            <button
              class="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!pagination?.prevCursor"
              @click="handlePrevPage(pagination)"
            >
              Sebelumnya
            </button>
            <button
              class="px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!pagination?.nextCursor"
              @click="handleNextPage(pagination)"
            >
              Berikutnya
            </button>
          </div>
        </template>
      </div>
    </div>
  </PublicLayout>
</template>
