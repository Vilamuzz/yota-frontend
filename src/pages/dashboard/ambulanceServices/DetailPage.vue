<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  Check,
  X as XIcon,
  AlertCircle,
  Loader2,
  Ambulance,
  User,
  CalendarDays,
  MapPin,
  Phone,
  FileText,
  Clock,
  ShieldCheck,
  UserCircle,
  Play,
} from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { useAmbulanceServiceDetail } from '@/composables/ambulanceService/useAmbulanceServiceDetail'
import { useAssignedAmbulanceServiceDetail } from '@/composables/ambulanceService/useAssignedAmbulanceServiceDetail'
import { useAmbulanceServiceUpdate } from '@/composables/ambulanceService/useAmbulanceServiceUpdate'
import { useAssignedAmbulanceServiceUpdate } from '@/composables/ambulanceService/useAssignedAmbulanceServiceUpdate'
import { useToast } from '@/composables/ui/useToast'
import { getStatusColor } from '@/utils/statusColor'
import { formatDate, formatStatus, getCategoryLabel } from '@/utils/format'
import { AmbulanceServiceCategory, ambulanceServiceCategoryOptions } from '@/types/ambulanceHistory'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import RejectConfirmationModal from '@/components/organisms/RejectConfirmationModal.vue'
import BaseModal from '@/components/organisms/BaseModal.vue'
import FilePreviewModal from '@/components/molecules/FilePreviewModal.vue'
import { useAmbulanceList } from '@/composables/ambulance/useAmbulanceList'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/const/roles'
import { AmbulanceServiceStatus } from '@/types/ambulanceService'

const route = useRoute()
const id = (route.params.serviceId || route.params.id) as string
const ambulanceId = (route.params.ambulanceId || '') as string
const { showToast } = useToast()
const authStore = useAuthStore()
const isDriver = computed(() => authStore.activeRole === ROLES.AMBULANCE_DRIVER)

const managerDetail = useAmbulanceServiceDetail(
  id,
  computed(() => !isDriver.value),
)
const driverDetail = useAssignedAmbulanceServiceDetail(
  id,
  computed(() => isDriver.value),
)

const ambulanceService = computed(() =>
  isDriver.value ? driverDetail.ambulanceService.value : managerDetail.ambulanceService.value,
)
const isLoading = computed(() =>
  isDriver.value ? driverDetail.isLoading.value : managerDetail.isLoading.value,
)
const { acceptMutation, rejectMutation } = useAmbulanceServiceUpdate()
const { startMutation, completeMutation, cancelMutation } = useAssignedAmbulanceServiceUpdate()
const { ambulances, isLoading: isLoadingAmbulances } = useAmbulanceList(
  { limit: 100 },
  computed(() => !isDriver.value),
)

const isUpdating = computed(
  () =>
    acceptMutation.isPending.value ||
    rejectMutation.isPending.value ||
    startMutation.isPending.value ||
    completeMutation.isPending.value ||
    cancelMutation.isPending.value,
)

const confirmAccept = ref(false)
const confirmReject = ref(false)
const selectedAmbulanceId = ref('')

// ACCEPT
const openAcceptModal = () => {
  selectedAmbulanceId.value = ''
  confirmAccept.value = true
}

const handleConfirmAccept = () => {
  if (!selectedAmbulanceId.value) return
  acceptMutation.mutate(
    { id, payload: { ambulanceId: selectedAmbulanceId.value } },
    {
      onSuccess: () => {
        showToast('Permintaan berhasil disetujui', 'success')
        confirmAccept.value = false
      },
      onError: () => {
        showToast('Gagal menyetujui permintaan', 'error')
      },
    },
  )
}

// REJECT
const handleConfirmReject = (reason: string) => {
  rejectMutation.mutate(
    { id, payload: { rejectionReason: reason } },
    {
      onSuccess: () => {
        showToast('Permintaan berhasil ditolak', 'success')
        confirmReject.value = false
      },
      onError: () => {
        showToast('Gagal menolak permintaan', 'error')
      },
    },
  )
}

// START & COMPLETE & CANCEL (DRIVER)
const confirmStart = ref(false)
const confirmComplete = ref(false)
const confirmCancel = ref(false)
const cancelReason = ref('')
const showKtpModal = ref(false)

const handleConfirmStart = () => {
  startMutation.mutate(id, {
    onSuccess: () => {
      showToast('Layanan ambulans berhasil dimulai', 'success')
      confirmStart.value = false
    },
    onError: () => {
      showToast('Gagal memulai layanan ambulans', 'error')
    },
  })
}

const handleConfirmComplete = () => {
  completeMutation.mutate(id, {
    onSuccess: () => {
      showToast('Layanan ambulans berhasil diselesaikan', 'success')
      confirmComplete.value = false
    },
    onError: () => {
      showToast('Gagal menyelesaikan layanan ambulans', 'error')
    },
  })
}

const handleConfirmCancel = () => {
  if (!cancelReason.value.trim()) return
  cancelMutation.mutate(
    { id, cancelationReason: cancelReason.value },
    {
      onSuccess: () => {
        showToast('Layanan ambulans berhasil dibatalkan', 'success')
        confirmCancel.value = false
        cancelReason.value = ''
      },
      onError: () => {
        showToast('Gagal membatalkan layanan ambulans', 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <div class="max-w-full mx-auto space-y-6">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p class="text-gray-500 font-medium animate-pulse">Memuat detail permintaan ambulans...</p>
      </div>

      <!-- Not Found State -->
      <div
        v-else-if="!ambulanceService"
        class="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center px-6"
      >
        <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4 text-red-500">
          <AlertCircle :size="48" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Data Tidak Ditemukan</h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
          Maaf, kami tidak dapat menemukan detail permintaan yang Anda cari. Data mungkin telah
          dihapus atau link tidak valid.
        </p>
        <BaseButton
          variant="outline"
          :to="
            ambulanceId
              ? { name: 'dashboard-ambulance-assigned-service', params: { ambulanceId } }
              : { name: 'dashboard-ambulance-services' }
          "
          >Kembali ke Daftar</BaseButton
        >
      </div>

      <!-- Content -->
      <div
        v-else
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <!-- Page Header -->
        <div
          class="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <div class="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-500">
              <Ambulance :size="22" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900 dark:text-white">
                Detail Permintaan Layanan Ambulans
              </h2>
            </div>
          </div>
          <span
            :class="[
              'px-3 py-1 text-xs font-bold rounded-full tracking-wider border',
              getStatusColor(ambulanceService.status),
            ]"
          >
            {{ formatStatus(ambulanceService.status) }}
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2">
          <!-- Left: Submitter & Patient Information -->
          <div class="p-8 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700">
            <!-- Submitter Information -->
            <h3
              class="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
            >
              <User :size="18" class="text-blue-500" />
              Informasi Pengaju
            </h3>
            <div class="space-y-5 mb-8">
              <!-- Submitter Name -->
              <div class="flex gap-3">
                <div class="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500">
                  <User :size="16" />
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                    Nama Pengaju
                  </p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ ambulanceService.submitterName }}
                  </p>
                </div>
              </div>

              <!-- Phone -->
              <div class="flex gap-3">
                <div class="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500">
                  <Phone :size="16" />
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                    Nomor Telepon
                  </p>
                  <p class="text-sm text-gray-900 dark:text-gray-200">
                    {{ ambulanceService.submitterPhone }}
                  </p>
                </div>
              </div>

              <!-- ID Card -->
              <div class="flex gap-3">
                <div class="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500">
                  <FileText :size="16" />
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                    KTP Pengaju
                  </p>
                  <button
                    v-if="ambulanceService.submitterIdCard"
                    @click="showKtpModal = true"
                    class="text-sm text-blue-500 hover:underline cursor-pointer"
                  >
                    Lihat KTP
                  </button>
                  <p v-else class="text-sm text-gray-900 dark:text-gray-200">-</p>
                </div>
              </div>
            </div>

            <!-- Patient Information -->
            <h3
              class="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
            >
              <UserCircle :size="18" class="text-blue-500" />
              {{
                ambulanceService.serviceCategory === AmbulanceServiceCategory.MORTUARY_SERVICE
                  ? 'Informasi Almarhum'
                  : 'Informasi Pasien'
              }}
            </h3>
            <div class="space-y-5 mb-8">
              <!-- Patient Name & Age -->
              <div class="flex gap-3">
                <div class="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500">
                  <User :size="16" />
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                    {{
                      ambulanceService.serviceCategory === AmbulanceServiceCategory.MORTUARY_SERVICE
                        ? 'Nama & Usia Almarhum'
                        : 'Nama & Usia Pasien'
                    }}
                  </p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">
                    {{ ambulanceService.patientName }}
                    <span v-if="ambulanceService.patientAge"
                      >({{ ambulanceService.patientAge }} tahun)</span
                    >
                  </p>
                </div>
              </div>

              <!-- Address -->
              <div class="flex gap-3">
                <div class="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500">
                  <MapPin :size="16" />
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                    {{
                      ambulanceService.serviceCategory === AmbulanceServiceCategory.MORTUARY_SERVICE
                        ? 'Alamat Almarhum'
                        : 'Alamat Pasien'
                    }}
                  </p>
                  <p class="text-sm text-gray-900 dark:text-gray-200">
                    {{ ambulanceService.patientAddress || '-' }}
                  </p>
                </div>
              </div>

              <!-- Disease -->
              <div class="flex gap-3">
                <div class="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500">
                  <AlertCircle :size="16" />
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                    Penyakit / Kondisi
                  </p>
                  <p class="text-sm text-gray-900 dark:text-gray-200">
                    {{ ambulanceService.disease || '-' }}
                  </p>
                </div>
              </div>

              <!-- Patient Conditions -->
              <div class="flex gap-3">
                <div class="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500">
                  <ShieldCheck :size="16" />
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                    Kondisi Tambahan
                  </p>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span
                      v-if="ambulanceService.isInfectious"
                      class="px-2 py-0.5 text-xs font-medium bg-red-50 text-red-600 rounded border border-red-200"
                    >
                      Penyakit Menular
                    </span>
                    <span
                      v-if="ambulanceService.isAbleToSit"
                      class="px-2 py-0.5 text-xs font-medium bg-green-50 text-green-600 rounded border border-green-200"
                    >
                      Bisa Duduk
                    </span>
                    <span
                      v-if="!ambulanceService.isInfectious && !ambulanceService.isAbleToSit"
                      class="text-sm text-gray-500"
                      >-</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Timestamps -->
            <div class="space-y-5 pt-6 border-t border-gray-100 dark:border-gray-700">
              <!-- Submission Date -->
              <div class="flex gap-3">
                <div class="mt-0.5 shrink-0 text-gray-400 dark:text-gray-500">
                  <Clock :size="16" />
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
                    Dibuat Pada
                  </p>
                  <p class="text-sm text-gray-900 dark:text-gray-200">
                    {{ formatDate(ambulanceService.createdAt) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Request Details -->
          <div class="p-8 space-y-6 bg-gray-50/50 dark:bg-gray-800/30">
            <div>
              <h3
                class="text-base font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
              >
                <FileText :size="18" class="text-blue-500" />
                Detail Penjemputan
              </h3>

              <!-- Category -->
              <div class="space-y-2 mb-6">
                <p
                  class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Kategori Layanan
                </p>
                <div class="flex">
                  <span
                    class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                  >
                    {{
                      getCategoryLabel(
                        ambulanceService.serviceCategory,
                        ambulanceServiceCategoryOptions,
                      )
                    }}
                  </span>
                </div>
              </div>

              <!-- Date and Time -->
              <div class="space-y-2 mb-6 grid grid-cols-2 gap-4">
                <div>
                  <p
                    class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Tanggal Penjemputan
                  </p>
                  <div
                    class="mt-1 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
                  >
                    <CalendarDays :size="16" class="text-gray-400" />
                    {{ formatDate(ambulanceService.pickupDate) }}
                  </div>
                </div>
                <div>
                  <p
                    class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Waktu Penjemputan
                  </p>
                  <div
                    class="mt-1 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200"
                  >
                    <Clock :size="16" class="text-gray-400" />
                    {{ ambulanceService.pickupTime }}
                  </div>
                </div>
              </div>

              <!-- Destination -->
              <div class="space-y-2 mb-6">
                <p
                  class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Tujuan
                </p>
                <div
                  class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
                >
                  {{ ambulanceService.destination || '-' }}
                </div>
              </div>

              <!-- Note -->
              <div v-if="ambulanceService.note" class="space-y-2 mb-6">
                <p
                  class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Catatan Tambahan
                </p>
                <div
                  class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
                >
                  {{ ambulanceService.note }}
                </div>
              </div>

              <!-- Assigned Ambulance -->
              <div
                v-if="ambulanceService.assignedAmbulance || ambulanceService.ambulanceId"
                class="space-y-2 mb-6"
              >
                <p
                  class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Ambulans yang Ditugaskan
                </p>

                <!-- Rich card when full object is available -->
                <div
                  v-if="ambulanceService.assignedAmbulance"
                  class="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl overflow-hidden"
                >
                  <!-- Header row -->
                  <div class="flex items-center gap-3 px-4 py-3 bg-blue-100/60 dark:bg-blue-900/20">
                    <Ambulance :size="18" class="text-blue-600 dark:text-blue-400 shrink-0" />
                    <span class="text-sm font-bold text-blue-700 dark:text-blue-300 tracking-wide">
                      {{ ambulanceService.assignedAmbulance.plateNumber }}
                    </span>
                    <span
                      class="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                      :class="
                        ambulanceService.assignedAmbulance.status === 'in use'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          : ambulanceService.assignedAmbulance.status === 'maintenance'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                      "
                    >
                      <ShieldCheck :size="10" />
                      {{ ambulanceService.assignedAmbulance.status }}
                    </span>
                  </div>
                  <!-- Driver details -->
                  <div class="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="flex items-center gap-2">
                      <UserCircle :size="15" class="text-blue-400 shrink-0" />
                      <div>
                        <p
                          class="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Pengemudi
                        </p>
                        <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {{ ambulanceService.assignedAmbulance.driver.username }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <Phone :size="15" class="text-blue-400 shrink-0" />
                      <div>
                        <p
                          class="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                        >
                          Telepon Pengemudi
                        </p>
                        <p class="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {{ ambulanceService.assignedAmbulance.driver.phone }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Fallback: only ambulanceId available -->
                <div
                  v-else
                  class="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg"
                >
                  <Ambulance :size="18" class="text-blue-500 shrink-0" />
                  <span class="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    {{ ambulanceService.ambulanceId }}
                  </span>
                </div>
              </div>

              <!-- Rejection Reason -->
              <div
                v-if="ambulanceService.status === 'rejected' && ambulanceService.rejectionReason"
                class="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl"
              >
                <h4
                  class="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2"
                >
                  Alasan Penolakan
                </h4>
                <p class="text-sm text-red-700 dark:text-red-300">
                  {{ ambulanceService.rejectionReason }}
                </p>
              </div>

              <!-- Cancelation Reason -->
              <div
                v-if="ambulanceService.status === 'cancelled' && ambulanceService.cancelationReason"
                class="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl animate-none transition-none"
              >
                <h4
                  class="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2"
                >
                  Alasan Pembatalan
                </h4>
                <p class="text-sm text-red-700 dark:text-red-300">
                  {{ ambulanceService.cancelationReason }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Footer for Driver -->
        <div
          v-if="
            isDriver &&
            (ambulanceService.status === AmbulanceServiceStatus.ACCEPTED ||
              ambulanceService.status === AmbulanceServiceStatus.IN_SERVICE)
          "
          class="px-8 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end"
        >
          <div class="flex items-center gap-3">
            <BaseButton
              variant="danger"
              size="md"
              class="px-8"
              @click="confirmCancel = true"
              :disabled="isUpdating"
            >
              Batalkan Layanan
            </BaseButton>
            <BaseButton
              v-if="ambulanceService.status === AmbulanceServiceStatus.ACCEPTED"
              variant="primary"
              size="md"
              class="px-8"
              @click="confirmStart = true"
              :disabled="isUpdating"
            >
              Mulai Layanan
            </BaseButton>
            <BaseButton
              v-if="ambulanceService.status === AmbulanceServiceStatus.IN_SERVICE"
              variant="primary"
              size="md"
              class="px-8"
              @click="confirmComplete = true"
              :disabled="isUpdating"
            >
              Selesaikan Layanan
            </BaseButton>
          </div>
        </div>

        <!-- Action Footer (only for pending and manager) -->
        <div
          v-else-if="!isDriver && ambulanceService.status === 'pending'"
          class="px-8 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end"
        >
          <div class="flex items-center gap-3">
            <BaseButton
              variant="danger"
              size="md"
              class="px-8"
              @click="confirmReject = true"
              :disabled="isUpdating"
            >
              <XIcon :size="16" class="mr-1.5" />
              Tolak
            </BaseButton>
            <BaseButton
              variant="primary"
              size="md"
              class="px-8"
              @click="openAcceptModal"
              :disabled="isUpdating"
            >
              <Check :size="16" class="mr-1.5" />
              Setujui
            </BaseButton>
          </div>
        </div>

        <!-- Non-pending footer -->
        <div
          v-else
          class="px-8 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
        ></div>
      </div>
    </div>

    <!-- Accept Confirmation Modal -->
    <ConfirmationModal
      :show="confirmAccept"
      title="Setujui Permintaan Ambulans?"
      message="Pilih ambulans yang akan ditugaskan untuk melayani permintaan ini:"
      primary-button-text="Setujui"
      secondary-button-text="Batal"
      :icon="Check"
      :primary-button-loading="acceptMutation.isPending.value"
      @primary="handleConfirmAccept"
      @secondary="confirmAccept = false"
      @close="confirmAccept = false"
    >
      <div class="mt-4 text-left">
        <label
          for="ambulance-select"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Pilih Ambulans
        </label>
        <select
          id="ambulance-select"
          v-model="selectedAmbulanceId"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
          :disabled="isLoadingAmbulances"
        >
          <option value="" disabled>-- Pilih Ambulans --</option>
          <option v-for="ambulance in ambulances" :key="ambulance.id" :value="ambulance.id">
            {{ ambulance.plateNumber }} - {{ ambulance.driver.username }}
          </option>
        </select>
        <p v-if="isLoadingAmbulances" class="text-xs text-gray-500 mt-1">
          Memuat daftar ambulans...
        </p>
      </div>
    </ConfirmationModal>

    <!-- Reject Confirmation Modal -->
    <RejectConfirmationModal
      :show="confirmReject"
      :title="`Tolak permintaan ${ambulanceService?.submitterName || ''}?`"
      message="Berikan alasan penolakan untuk permintaan ambulans ini."
      primary-button-text="Tolak"
      secondary-button-text="Batal"
      :icon="AlertCircle"
      :primary-button-loading="rejectMutation.isPending.value"
      @primary="handleConfirmReject"
      @secondary="confirmReject = false"
      @close="confirmReject = false"
    />

    <!-- Start Service Confirmation Modal -->
    <ConfirmationModal
      :show="confirmStart"
      title="Mulai Layanan Ambulans?"
      message="Apakah Anda yakin ingin memulai layanan ambulans ini sekarang?"
      primary-button-text="Mulai"
      secondary-button-text="Batal"
      :icon="Play"
      :primary-button-loading="startMutation.isPending.value"
      @primary="handleConfirmStart"
      @secondary="confirmStart = false"
      @close="confirmStart = false"
    />

    <!-- Complete Service Confirmation Modal -->
    <ConfirmationModal
      :show="confirmComplete"
      title="Selesaikan Layanan Ambulans?"
      message="Apakah Anda yakin ingin menyelesaikan layanan ambulans ini? Langkah ini akan merekam riwayat perjalanan."
      primary-button-text="Selesai"
      secondary-button-text="Batal"
      :icon="Check"
      :primary-button-loading="completeMutation.isPending.value"
      @primary="handleConfirmComplete"
      @secondary="confirmComplete = false"
      @close="confirmComplete = false"
    />

    <!-- Cancel Service Confirmation Modal -->
    <BaseModal
      :show="confirmCancel"
      title="Batalkan Layanan Ambulans"
      @close="confirmCancel = false"
    >
      <div class="space-y-4 py-2 text-left">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Apakah Anda yakin ingin membatalkan layanan ambulans ini? Status akan berubah menjadi
          <span class="font-semibold text-red-600 dark:text-red-400">"Dibatalkan"</span>.
        </p>
        <div class="text-left">
          <label
            for="detail-cancel-reason-textarea"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Alasan Pembatalan
          </label>
          <textarea
            id="detail-cancel-reason-textarea"
            v-model="cancelReason"
            rows="3"
            placeholder="Masukkan alasan pembatalan (wajib)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm resize-none animate-none transition-none"
            required
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <BaseButton variant="outline" @click="confirmCancel = false">Batal</BaseButton>
          <BaseButton
            variant="danger"
            @click="handleConfirmCancel"
            :disabled="cancelMutation.isPending.value || !cancelReason.trim()"
          >
            Batalkan
          </BaseButton>
        </div>
      </template>
    </BaseModal>

    <!-- KTP Preview Modal -->
    <FilePreviewModal
      :show="showKtpModal"
      :fileUrl="ambulanceService?.submitterIdCard || null"
      @close="showKtpModal = false"
    />
  </DashboardLayout>
</template>
