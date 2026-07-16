<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import { useAuthStore } from '@/stores/auth'
import AuthRequiredModal from '@/components/organisms/AuthRequiredModal.vue'
import {
  Ambulance as AmbulanceIcon,
  Phone,
  User,
  Search,
  Loader2,
  ArrowUpRight,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next'
import { usePublicAmbulanceList } from '@/composables/ambulance/usePublicAmbulanceList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import {
  type AmbulanceQueryParams,
  AmbulanceStatus,
  formatAmbulanceStatus,
} from '@/types/ambulance'
import { formatPhoneWithDashes } from '@/utils/phone'

const searchQuery = ref('')
const selectedStatus = ref<AmbulanceStatus | undefined>(undefined)

const queryParams = reactive<AmbulanceQueryParams>({
  limit: 6,
  search: undefined,
  status: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const { ambulances, pagination, isLoading } = usePublicAmbulanceList(queryParams)
const { resetPagination, handleNextPage, handlePrevPage } = useCursorPagination(queryParams)

const onPrevPage = (pageInfo: any) => {
  handlePrevPage(pageInfo)
  window.scrollTo({ top: 0 })
}

const onNextPage = (pageInfo: any) => {
  handleNextPage(pageInfo)
  window.scrollTo({ top: 0 })
}
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(selectedStatus, (val) => {
  queryParams.status = val
  resetPagination()
})

const statusBadgeClass = (status: AmbulanceStatus) => {
  switch (status) {
    case AmbulanceStatus.Available:
      return 'bg-green-100 text-green-700 border border-green-200'
    case AmbulanceStatus.InUse:
      return 'bg-blue-100 text-blue-700 border border-blue-200'
    case AmbulanceStatus.Maintenance:
      return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-200'
  }
}

const statusDotClass = (status: AmbulanceStatus) => {
  switch (status) {
    case AmbulanceStatus.Available:
      return 'bg-green-500'
    case AmbulanceStatus.InUse:
      return 'bg-blue-500'
    case AmbulanceStatus.Maintenance:
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

const authStore = useAuthStore()
const router = useRouter()
const showAuthModal = ref(false)

const handleRequestClick = () => {
  if (!authStore.isAuthenticated) {
    showAuthModal.value = true
  } else {
    router.push({ name: 'ambulance-submission' })
  }
}
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-12 px-6 md:px-18 font-poppins">
      <div class="max-w-7xl mx-auto">
        <!-- TITLE -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-primary-500 mb-3 uppercase">Layanan Ambulans</h1>
          <p class="text-gray-500 max-w-2xl mx-auto">
            Kami menyediakan layanan ambulans yang siap bergerak kapan pun Anda membutuhkan. Hubungi
            kami segera untuk bantuan darurat medis.
          </p>
        </div>

        <!-- SEARCH + STATUS FILTER -->
        <div class="flex flex-col items-center gap-4 mb-10">
          <BasePublicSearch
            v-model="searchQuery"
            placeholder="Cari berdasarkan nomor plat atau sopir..."
            :show-sort="false"
            :show-filter="false"
          />
          <!-- Status Filter Pills -->
          <div class="flex flex-wrap justify-center gap-2">
            <button
              v-for="s in [
                { label: 'Semua', value: undefined },
                { label: 'Tersedia', value: AmbulanceStatus.Available },
                { label: 'Digunakan', value: AmbulanceStatus.InUse },
                { label: 'Pemeliharaan', value: AmbulanceStatus.Maintenance },
              ]"
              :key="s.label"
              @click="selectedStatus = s.value"
              class="px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap"
              :class="[
                selectedStatus === s.value
                  ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-200'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-600',
              ]"
            >
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-24">
          <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p class="text-gray-500 font-medium animate-pulse">Menyiapkan data ambulans...</p>
        </div>

        <!-- Main Content -->
        <template v-else>
          <!-- Ambulance Grid -->
          <div
            v-if="ambulances.length > 0"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <!-- Ambulance Card -->
            <RouterLink
              v-for="ambulance in ambulances"
              :key="ambulance.id"
              :to="{ name: 'ambulance-detail', params: { id: ambulance.id } }"
              class="bg-white rounded-2xl overflow-hidden border-none ring-1 ring-gray-100 shadow-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 group flex flex-col cursor-pointer"
            >
              <!-- Vehicle Image -->
              <div class="relative h-48 bg-gray-100 overflow-hidden shrink-0">
                <img
                  v-if="ambulance.image"
                  :src="ambulance.image"
                  :alt="`Ambulans ${ambulance.plateNumber}`"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div
                  v-else
                  class="w-full h-full flex flex-col items-center justify-center text-gray-300"
                >
                  <AmbulanceIcon :size="48" />
                  <p class="text-xs mt-2 text-gray-400">Foto tidak tersedia</p>
                </div>

                <!-- Status Badge -->
                <div class="absolute top-3 right-3">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="statusBadgeClass(ambulance.status)"
                  >
                    <span
                      class="w-1.5 h-1.5 rounded-full"
                      :class="statusDotClass(ambulance.status)"
                    ></span>
                    {{ formatAmbulanceStatus(ambulance.status) }}
                  </span>
                </div>

                <!-- Plate Overlay -->
                <div
                  class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3"
                >
                  <p class="text-white font-bold text-lg tracking-widest">
                    {{ ambulance.plateNumber }}
                  </p>
                </div>
              </div>

              <!-- Card Body -->
              <div class="p-5 flex flex-col flex-1 gap-3">
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <div class="p-1.5 bg-primary-50 rounded-lg text-primary-500">
                    <User :size="14" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 leading-none mb-0.5">Sopir</p>
                    <p class="font-medium text-gray-800">{{ ambulance.driver.username }}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <div class="p-1.5 bg-primary-50 rounded-lg text-primary-500">
                    <Phone :size="14" />
                  </div>
                  <div>
                    <p class="text-xs text-gray-400 leading-none mb-0.5">Kontak</p>
                    <p v-if="ambulance.driver.phone === `-`">-</p>
                    <a
                      v-else
                      :href="`https://wa.me/+62${ambulance.driver.phone}`"
                      target="_blank"
                      class="font-medium text-primary-600 hover:underline"
                    >
                      {{ formatPhoneWithDashes(ambulance.driver.phone) }}
                    </a>
                  </div>
                </div>

                <div class="mt-auto pt-3 border-t border-gray-100 flex gap-2">
                  <RouterLink
                    :to="{ name: 'ambulance-detail', params: { id: ambulance.id } }"
                    @click.stop
                    class="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 bg-gray-100 hover:bg-gray-200 text-gray-700"
                  >
                    <Eye :size="15" />
                    Lihat Detail
                  </RouterLink>
                  <a
                    :href="`https://wa.me/+62${ambulance.driver.phone}`"
                    target="_blank"
                    @click.stop
                    class="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                    :class="
                      ambulance.status === AmbulanceStatus.Available
                        ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-200/50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                    "
                  >
                    <Phone :size="15" />
                    {{
                      ambulance.status === AmbulanceStatus.Available ? 'Hubungi' : 'Tidak Tersedia'
                    }}
                  </a>
                </div>
              </div>
            </RouterLink>
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
              Maaf, kami tidak dapat menemukan ambulans dengan kata kunci "{{ searchQuery }}".
            </p>
          </div>

          <!-- General Empty State -->
          <div v-else class="py-24 text-center">
            <div
              class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"
            >
              <AmbulanceIcon :size="32" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Data Belum Tersedia</h3>
            <p class="text-gray-500 max-w-sm mx-auto">
              Saat ini belum ada data ambulans yang dapat ditampilkan. Silakan kembali lagi nanti.
            </p>
          </div>

          <!-- Pagination -->
          <div
            v-if="pagination?.nextCursor || pagination?.prevCursor"
            class="mt-16 flex items-center justify-center gap-4"
          >
            <button
              v-if="pagination?.prevCursor"
              class="w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-primary-500 hover:border-primary-500 transition-all duration-200"
              @click="onPrevPage(pagination)"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft :size="18" />
            </button>
            <button
              v-if="pagination?.nextCursor"
              class="w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-primary-500 hover:border-primary-500 transition-all duration-200"
              @click="onNextPage(pagination)"
              title="Halaman Selanjutnya"
            >
              <ChevronRight :size="18" />
            </button>
          </div>

          <!-- PERSUASIVE CTA CARD — Request Ambulance Service -->
          <div
            class="mt-20 bg-gray-900 rounded-[3rem] p-10 md:p-14 text-white flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group"
          >
            <div
              class="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(239,68,68,0.15),transparent)]"
            ></div>
            <AmbulanceIcon
              class="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 transform -rotate-12 group-hover:rotate-0 transition-transform duration-1000"
            />

            <div class="relative z-10 text-center md:text-left max-w-lg">
              <h2 class="text-3xl font-black mb-4 leading-tight">Butuh Ambulans Segera?</h2>
              <p class="text-gray-400 text-lg font-medium leading-relaxed">
                Ajukan permintaan layanan ambulans kami dan tim kami akan segera menghubungi Anda.
                Kami siap melayani 24 jam penuh untuk keadaan darurat medis Anda.
              </p>
            </div>

            <button
              @click="handleRequestClick"
              class="relative z-10 inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-black text-sm bg-primary-500 hover:bg-primary-600 text-white shadow-xl shadow-primary-500/30 transition-all duration-300 active:scale-95 group/btn cursor-pointer"
            >
              AJUKAN PERMINTAAN
              <ArrowUpRight
                :size="20"
                class="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"
              />
            </button>
          </div>
        </template>
      </div>
    </div>

    <!-- Auth Required Modal -->
    <AuthRequiredModal
      :show="showAuthModal"
      @close="showAuthModal = false"
      title="Login Diperlukan"
      message="Silakan masuk ke akun Anda terlebih dahulu untuk mengajukan permintaan layanan ambulans."
    />
  </PublicLayout>
</template>
