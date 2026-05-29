<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ChildrenCard from '@/components/molecules/ChildrenCard.vue'
import { useFosterChildrenList } from '@/composables/fosterChildren/useFosterChildrenList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { Users, Search, Loader2, X, ArrowUpRight } from 'lucide-vue-next'
import type { FosterChildrenQueryParams } from '@/types/fosterChildren'

const router = useRouter()
const searchQuery = ref('')

const queryParams = reactive<FosterChildrenQueryParams>({
  limit: 12,
  search: undefined,
})

const {
  listQuery,
  fosterChildren,
  pagination,
  isLoading: isInitialLoading,
} = useFosterChildrenList(queryParams)

const { resetPagination, handleNextPage, handlePrevPage } = useCursorPagination(queryParams)

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

        <!-- SEARCH + BUTTON -->
        <div class="flex justify-center mb-10">
          <BasePublicSearch v-model="searchQuery" placeholder="Cari nama anak asuh..." />
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
              :to="{ name: 'foster-children-detail', params: { id: child.id } }"
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
