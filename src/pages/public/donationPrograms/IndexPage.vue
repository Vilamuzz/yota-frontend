<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import DonationCard from '@/components/molecules/DonationCard.vue'
import { useDonationProgramList } from '@/composables/donationProgram/useDonationProgramList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { Heart, Search, Loader2 } from 'lucide-vue-next'
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
    <!-- Hero/Search Section -->
    <div class="relative">
      <BasePublicSearch
        v-model="searchQuery"
        placeholder="Bantu siapa hari ini? Cari program donasi..."
      />
    </div>

    <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
      <!-- Title & Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div class="flex items-center gap-2 text-primary-500 mb-2">
            <Heart :size="20" class="fill-current" />
            <span class="text-sm font-bold uppercase tracking-wider">Program Kebaikan</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-black text-gray-900">
            Ulurkan Tangan, <span class="text-primary-500">Berbagi Kebahagiaan</span>
          </h1>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isInitialLoading" class="flex flex-col items-center justify-center py-24">
        <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p class="text-gray-500 font-medium animate-pulse">Menyiapkan program donasi...</p>
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
            'Terjadi kesalahan sistem saat mencoba mengambil daftar program donasi.'
          }}
        </p>
        <BaseButton variant="outline" class="mt-6" @click="listQuery.refetch()">
          Coba Lagi
        </BaseButton>
      </div>

      <!-- Main Content -->
      <template v-else>
        <div
          v-if="donationPrograms.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10"
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
          <BaseButton variant="outline" class="mt-8" @click="searchQuery = ''">
            Lihat Semua Program
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
