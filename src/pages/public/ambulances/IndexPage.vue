<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { Ambulance as AmbulanceIcon, Phone, User, Search } from 'lucide-vue-next'
import { usePublicAmbulanceList } from '@/composables/ambulance/usePublicAmbulanceList'
import { AmbulanceStatus } from '@/types/ambulance'

const searchQuery = ref('')
const selectedStatus = ref<AmbulanceStatus | undefined>(undefined)

const queryParams = reactive({
  limit: 12,
  search: undefined as string | undefined,
  status: undefined as AmbulanceStatus | undefined,
})

const { ambulances, isLoading } = usePublicAmbulanceList(queryParams)

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
  }, 400)
})

watch(selectedStatus, (val) => {
  queryParams.status = val
})

const statusLabel = (status: AmbulanceStatus) => {
  switch (status) {
    case AmbulanceStatus.Available:
      return 'Tersedia'
    case AmbulanceStatus.InUse:
      return 'Sedang Digunakan'
    case AmbulanceStatus.Maintenance:
      return 'Pemeliharaan'
    default:
      return status
  }
}

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

const availableCount = computed(
  () => ambulances.value.filter((a) => a.status === AmbulanceStatus.Available).length,
)
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen font-poppins">
      <!-- Hero Banner -->
      <div
        class="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 pt-32 pb-20 px-4 overflow-hidden"
      >
        <div
          class="absolute inset-0 opacity-10"
          style="
            background-image: url('https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=1920&fit=crop');
            background-size: cover;
            background-position: center;
          "
        ></div>
        <div class="relative max-w-4xl mx-auto text-center text-white">
          <div
            class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-6"
          >
            <AmbulanceIcon :size="16" />
            Layanan Ambulans 24 Jam
          </div>
          <h1 class="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Armada Ambulans Siap Melayani
          </h1>
          <p class="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Kami menyediakan layanan ambulans yang siap bergerak kapan pun Anda membutuhkan.
            Hubungi kami segera untuk bantuan darurat medis.
          </p>

          <!-- Quick Stats -->
          <div class="flex justify-center gap-8 text-center">
            <div>
              <p class="text-3xl font-bold">{{ ambulances.length }}</p>
              <p class="text-white/70 text-sm">Total Armada</p>
            </div>
            <div class="w-px bg-white/30"></div>
            <div>
              <p class="text-3xl font-bold">{{ availableCount }}</p>
              <p class="text-white/70 text-sm">Siap Beroperasi</p>
            </div>
            <div class="w-px bg-white/30"></div>
            <div>
              <p class="text-3xl font-bold">24/7</p>
              <p class="text-white/70 text-sm">Siaga Penuh</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="max-w-7xl mx-auto px-4 py-12">
        <!-- Search & Filter -->
        <div class="flex flex-col sm:flex-row gap-3 mb-10">
          <div class="relative flex-1 max-w-lg">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari berdasarkan nomor plat atau sopir..."
              class="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent shadow-sm"
            />
          </div>
          <div class="flex gap-2">
            <button
              v-for="s in [
                { label: 'Semua', value: undefined },
                { label: 'Tersedia', value: AmbulanceStatus.Available },
                { label: 'Digunakan', value: AmbulanceStatus.InUse },
                { label: 'Pemeliharaan', value: AmbulanceStatus.Maintenance },
              ]"
              :key="s.label"
              @click="selectedStatus = s.value"
              class="px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 whitespace-nowrap"
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

        <!-- Loading Skeleton -->
        <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="i in 6"
            :key="i"
            class="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm animate-pulse"
          >
            <div class="h-48 bg-gray-200"></div>
            <div class="p-5 space-y-3">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              <div class="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>

        <!-- Ambulance Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Ambulance Card -->
          <div
            v-for="ambulance in ambulances"
            :key="ambulance.id"
            class="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col"
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
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(ambulance.status)"></span>
                  {{ statusLabel(ambulance.status) }}
                </span>
              </div>

              <!-- Plate Overlay -->
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                <p class="text-white font-bold text-lg tracking-widest">{{ ambulance.plateNumber }}</p>
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
                  <p class="font-medium text-gray-800">{{ ambulance.driverName }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2 text-sm text-gray-600">
                <div class="p-1.5 bg-primary-50 rounded-lg text-primary-500">
                  <Phone :size="14" />
                </div>
                <div>
                  <p class="text-xs text-gray-400 leading-none mb-0.5">Kontak</p>
                  <a
                    :href="`tel:${ambulance.driverPhone}`"
                    class="font-medium text-primary-600 hover:underline"
                  >
                    {{ ambulance.driverPhone }}
                  </a>
                </div>
              </div>

              <div class="mt-auto pt-3 border-t border-gray-100">
                <a
                  :href="`tel:${ambulance.driverPhone}`"
                  class="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200"
                  :class="
                    ambulance.status === AmbulanceStatus.Available
                      ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-200/50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                  "
                >
                  <Phone :size="15" />
                  {{ ambulance.status === AmbulanceStatus.Available ? 'Hubungi Sopir' : 'Tidak Tersedia' }}
                </a>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="ambulances.length === 0"
            class="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-20"
          >
            <div class="bg-white rounded-2xl p-12 border border-dashed border-gray-300 inline-block">
              <AmbulanceIcon class="mx-auto text-gray-300 mb-4" :size="56" />
              <p class="text-gray-500 font-medium">Tidak ada ambulans ditemukan.</p>
              <p class="text-gray-400 text-sm mt-1">Coba ubah filter atau kata kunci pencarian.</p>
            </div>
          </div>
        </div>

        <!-- Emergency Info Banner -->
        <div class="mt-12 bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
          <div class="p-4 bg-red-100 rounded-xl text-red-500 shrink-0">
            <AmbulanceIcon :size="32" />
          </div>
          <div class="text-center sm:text-left flex-1">
            <h3 class="text-lg font-bold text-red-700">Darurat Medis?</h3>
            <p class="text-red-600/80 text-sm mt-1">
              Hubungi langsung nomor telepon sopir ambulans yang tersedia, atau segera hubungi
              layanan gawat darurat nasional.
            </p>
          </div>
          <a
            href="tel:119"
            class="shrink-0 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors duration-200 text-sm shadow-lg shadow-red-200"
          >
            Hubungi 119
          </a>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
