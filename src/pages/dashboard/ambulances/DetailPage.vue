<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useAmbulanceDetail } from '@/composables/ambulance/useAmbulanceDetail'
import { useAmbulanceDelete } from '@/composables/ambulance/useAmbulanceDelete'
import { useToast } from '@/composables/ui/useToast'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { AmbulanceStatus } from '@/types/ambulance'
import {
  Ambulance as AmbulanceIcon,
  Loader2,
  ShieldCheck,
  Settings,
  Camera,
  History,
  Edit,
  Trash2,
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const { deleteMutation } = useAmbulanceDelete()

const ambulanceId = route.params.id as string
const { detailQuery } = useAmbulanceDetail(ambulanceId)

const isFetching = computed(() => detailQuery.isPending.value)
const isDeleting = computed(() => deleteMutation.isPending.value)
const ambulance = computed(() => detailQuery.data.value?.data)

const isDeleteModalOpen = ref(false)

const statuses = [
  { label: 'Tersedia', value: AmbulanceStatus.Available },
  { label: 'Sedang Digunakan', value: AmbulanceStatus.InUse },
  { label: 'Pemeliharaan', value: AmbulanceStatus.Maintenance },
]

function handleConfirmDelete() {
  deleteMutation.mutate(ambulanceId, {
    onSuccess: () => {
      showToast('Ambulans berhasil dihapus', 'success')
      isDeleteModalOpen.value = false
      router.push({ name: 'dashboard-ambulance' })
    },
    onError: () => {
      showToast('Gagal menghapus ambulans', 'error')
    },
  })
}
</script>

<template>
  <DashboardLayout>
    <template #title>Detail Ambulans</template>

    <div class="max-w-full mx-auto space-y-6">
      <!-- Back Button & Loader -->
      <div
        v-if="isFetching"
        class="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <Loader2 class="w-10 h-10 text-primary-500 animate-spin mb-4" />
        <p class="text-gray-500 dark:text-gray-400 font-medium tracking-wide">
          Memuat detail ambulans...
        </p>
      </div>

      <!-- Not Found State -->
      <div
        v-else-if="!ambulance"
        class="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm text-center px-6"
      >
        <div class="p-4 bg-red-50 dark:bg-red-950/20 rounded-full mb-4 text-red-500">
          <AmbulanceIcon :size="48" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">
          Ambulans Tidak Ditemukan
        </h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
          Data detail ambulans tidak tersedia atau telah dihapus.
        </p>
        <BaseButton variant="outline" :to="{ name: 'dashboard-ambulance' }">
          Kembali ke Daftar
        </BaseButton>
      </div>

      <!-- Details View (Based on EditPage layout) -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Vehicle Details -->
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-500">
                <AmbulanceIcon :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Informasi Kendaraan
              </h3>
            </div>

            <!-- Read-only Info Display Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Plate Number -->
              <div>
                <label
                  class="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5"
                >
                  Nomor Plat
                </label>
                <div
                  class="px-3.5 py-2.5 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white font-mono font-bold tracking-wider"
                >
                  {{ ambulance.plateNumber }}
                </div>
              </div>

              <!-- Driver details -->
              <div>
                <label
                  class="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5"
                >
                  Sopir
                </label>
                <div
                  class="px-3.5 py-2.5 bg-gray-50 dark:bg-[#121212] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                >
                  {{ ambulance.driver?.username || '—' }}
                </div>
              </div>
            </div>

            <!-- Verification Card -->
            <div
              class="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 flex items-start gap-3"
            >
              <ShieldCheck class="text-green-500 shrink-0 mt-0.5" :size="18" />
              <div>
                <p
                  class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1"
                >
                  Status Verifikasi
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Data nomor plat di atas telah dicocokkan dengan STNK kendaraan resmi untuk
                  pelacakan rute armada ambulans.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Image & Actions -->
        <div class="space-y-6">
          <!-- Ambulance Image -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Foto Ambulans
            </h3>

            <div class="flex justify-center">
              <div
                class="relative w-full aspect-video rounded-xl border-4 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900/50"
              >
                <img
                  v-if="ambulance.image"
                  :src="ambulance.image"
                  class="w-full h-full object-cover"
                  :alt="`Foto ${ambulance.plateNumber}`"
                />
                <div
                  v-else
                  class="h-full flex flex-col items-center justify-center p-4 text-center text-gray-300 dark:text-gray-700"
                >
                  <Camera class="mb-2" :size="32" />
                  <p class="text-[10px] font-semibold uppercase tracking-wider">
                    Foto Tidak Tersedia
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Status & Actions Card -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <div class="flex items-center gap-2 mb-2">
              <Settings class="text-gray-400" :size="16" />
              <h3 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Status Kendaraan
              </h3>
            </div>

            <!-- Disabled status list where only active one is styled as active -->
            <div class="grid grid-cols-1 gap-2">
              <div
                v-for="s in statuses"
                :key="s.value"
                class="flex items-center justify-between px-3.5 py-3 rounded-xl border text-xs font-semibold select-none"
                :class="[
                  ambulance.status === s.value
                    ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300'
                    : 'border-gray-100 dark:border-gray-750 text-gray-400 dark:text-gray-600 bg-gray-50/30 dark:bg-transparent',
                ]"
              >
                {{ s.label }}
                <div
                  v-if="ambulance.status === s.value"
                  class="w-2 h-2 rounded-full bg-primary-300 shadow-[0_0_8px_rgba(var(--color-primary-500),0.8)]"
                ></div>
              </div>
            </div>

            <!-- Management Buttons Section -->
            <div class="flex flex-col gap-3 pt-4 border-t border-gray-50 dark:border-gray-700">
              <!-- Edit Button -->
              <BaseButton
                :to="{ name: 'dashboard-ambulance-edit', params: { id: ambulance.id } }"
                variant="primary"
                class="w-full justify-center"
              >
                <Edit :size="15" class="mr-2" />
                Edit Data
              </BaseButton>

              <!-- Route to Index History Ambulance -->
              <BaseButton
                :to="{ name: 'dashboard-ambulance-histories-detail', params: { id: ambulance.id } }"
                variant="outline"
                class="w-full justify-center"
              >
                <History :size="15" class="mr-2" />
                Riwayat Layanan
              </BaseButton>

              <!-- Delete Button -->
              <BaseButton
                type="button"
                variant="danger"
                @click="isDeleteModalOpen = true"
                class="w-full justify-center"
              >
                <Trash2 :size="15" class="mr-2" />
                Hapus Ambulans
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal
      :show="isDeleteModalOpen"
      title="Hapus Ambulans"
      message="Apakah Anda yakin ingin menghapus data ambulans ini? Tindakan ini tidak dapat dibatalkan."
      variant="danger"
      :primary-button-loading="isDeleting"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />
  </DashboardLayout>
</template>
