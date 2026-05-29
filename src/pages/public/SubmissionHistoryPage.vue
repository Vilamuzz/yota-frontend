<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import { extractError } from '@/utils/error'
import type { ApiError } from '@/types/response'
import { useMyFosterChildrenCandidateList } from '@/composables/fosterChildrenCandidate/useMyFosterChildrenCandidateList'
import { useMyFosterChildrenCandidateCancel } from '@/composables/fosterChildrenCandidate/useMyFosterChildrenCandidateCancel'
import { useMyAmbulanceServiceCandidateList } from '@/composables/ambulanceService/useMyAmbulanceServiceList'
import { useMyAmbulanceServiceCandidateCancel } from '@/composables/ambulanceService/useMyAmbulanceServiceCancel'
import { useToast } from '@/composables/ui/useToast'
import PublicConfirmationModal from '@/components/molecules/PublicConfirmationModal.vue'
import { useCursorPagination } from '@/composables/ui/usePagination'
import {
  Loader2,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  FileText,
  AlertTriangle,
  Baby,
  Ambulance,
} from 'lucide-vue-next'
import { formatDate } from '@/utils/format'
import type { FosterChildrenCandidateQueryParams } from '@/types/fosterChildrenCandidate'
import type { AmbulanceServiceQueryParams } from '@/types/ambulanceService'

const router = useRouter()
const { showToast } = useToast()

// ─── Active Tab ───────────────────────────────────────────────
const activeTab = ref<'foster' | 'ambulance'>('foster')

const tabs = [
  { key: 'foster' as const, label: 'Calon Anak Asuh', icon: Baby },
  { key: 'ambulance' as const, label: 'Layanan Ambulans', icon: Ambulance },
]

// ─── Foster Children ──────────────────────────────────────────
const fosterSearchQuery = ref('')
const fosterQueryParams = reactive<FosterChildrenCandidateQueryParams>({
  limit: 10,
  search: undefined,
})

const {
  listQuery: fosterListQuery,
  fosterChildrenCandidate,
  pagination: fosterPagination,
  isLoading: isFosterLoading,
} = useMyFosterChildrenCandidateList(fosterQueryParams)

const {
  resetPagination: fosterResetPagination,
  handleNextPage: fosterNextPage,
  handlePrevPage: fosterPrevPage,
} = useCursorPagination(fosterQueryParams)

const { cancelMutation: fosterCancelMutation } = useMyFosterChildrenCandidateCancel()

let fosterSearchTimeout: ReturnType<typeof setTimeout>
watch(fosterSearchQuery, (val) => {
  clearTimeout(fosterSearchTimeout)
  fosterSearchTimeout = setTimeout(() => {
    fosterQueryParams.search = val || undefined
    fosterResetPagination()
  }, 400)
})

// ─── Ambulance ────────────────────────────────────────────────
const ambulanceSearchQuery = ref('')
const ambulanceQueryParams = reactive<AmbulanceServiceQueryParams>({
  limit: 10,
  search: undefined,
})

const {
  listQuery: ambulanceListQuery,
  ambulanceServices,
  pagination: ambulancePagination,
  isLoading: isAmbulanceLoading,
} = useMyAmbulanceServiceCandidateList(ambulanceQueryParams)

const {
  resetPagination: ambulanceResetPagination,
  handleNextPage: ambulanceNextPage,
  handlePrevPage: ambulancePrevPage,
} = useCursorPagination(ambulanceQueryParams)

const { cancelMutation: ambulanceCancelMutation } = useMyAmbulanceServiceCandidateCancel()

let ambulanceSearchTimeout: ReturnType<typeof setTimeout>
watch(ambulanceSearchQuery, (val) => {
  clearTimeout(ambulanceSearchTimeout)
  ambulanceSearchTimeout = setTimeout(() => {
    ambulanceQueryParams.search = val || undefined
    ambulanceResetPagination()
  }, 400)
})

// ─── Computed helpers ─────────────────────────────────────────
const isLoading = computed(() =>
  activeTab.value === 'foster' ? isFosterLoading.value : isAmbulanceLoading.value,
)

const isError = computed(() =>
  activeTab.value === 'foster' ? fosterListQuery.isError.value : ambulanceListQuery.isError.value,
)

const errorValue = computed(() =>
  activeTab.value === 'foster' ? fosterListQuery.error.value : ambulanceListQuery.error.value,
)

const searchQuery = computed({
  get: () => (activeTab.value === 'foster' ? fosterSearchQuery.value : ambulanceSearchQuery.value),
  set: (val) => {
    if (activeTab.value === 'foster') fosterSearchQuery.value = val
    else ambulanceSearchQuery.value = val
  },
})

// ─── Cancel modals ────────────────────────────────────────────
const showCancelModal = ref(false)
const itemToCancel = ref<{ id: string; name: string; type: 'foster' | 'ambulance' } | null>(null)

const isCancelLoading = computed(() =>
  itemToCancel.value?.type === 'foster'
    ? fosterCancelMutation.isPending.value
    : ambulanceCancelMutation.isPending.value,
)

const openCancelModal = (id: string, name: string, type: 'foster' | 'ambulance') => {
  itemToCancel.value = { id, name, type }
  showCancelModal.value = true
}

const confirmCancel = () => {
  if (!itemToCancel.value) return
  const { id, type } = itemToCancel.value

  const onSuccess = () => {
    showToast('Pengajuan berhasil dibatalkan.', 'success')
    showCancelModal.value = false
    itemToCancel.value = null
  }
  const onError = (err: ApiError) => {
    showToast(extractError(err, 'Gagal membatalkan pengajuan.'), 'error')
    showCancelModal.value = false
    itemToCancel.value = null
  }

  if (type === 'foster') {
    fosterCancelMutation.mutate(id, { onSuccess, onError })
  } else {
    ambulanceCancelMutation.mutate(id, { onSuccess, onError })
  }
}

// ─── Status config ────────────────────────────────────────────
const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'accepted':
    case 'approved':
      return {
        icon: CheckCircle2,
        class: 'bg-green-50 text-green-700 border-green-200',
        label: 'Diterima',
      }
    case 'rejected':
      return {
        icon: XCircle,
        class: 'bg-red-50 text-red-700 border-red-200',
        label: 'Ditolak',
      }
    case 'cancelled':
      return {
        icon: XCircle,
        class: 'bg-gray-50 text-gray-700 border-gray-200',
        label: 'Dibatalkan',
      }
    case 'pending':
    default:
      return {
        icon: Clock,
        class: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        label: 'Menunggu',
      }
  }
}
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-16 font-poppins">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <!-- Page Header -->
        <div class="mb-10 text-center md:text-left">
          <h1 class="text-4xl font-black text-gray-900 uppercase tracking-tight">
            Riwayat Pengajuan
          </h1>
          <p class="text-gray-500 mt-1 text-lg">
            Pantau status semua pengajuan layanan Anda di sini.
          </p>
        </div>

        <!-- Category Tabs (InvoicePage style) -->
        <div class="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="activeTab = tab.key"
            class="flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-black transition-all duration-500 border-2"
            :class="
              activeTab === tab.key
                ? 'bg-primary-400 border-primary-400 text-white shadow-xl shadow-primary-400/20 translate-y-1'
                : 'bg-white border-gray-100 text-gray-500 hover:border-primary-200 hover:text-primary-400'
            "
          >
            <component :is="tab.icon" :size="20" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Sub-bar: search + count (InvoicePage toolbar style) -->
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"
            >
              <component :is="tabs.find((t) => t.key === activeTab)!.icon" :size="20" />
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Jenis Pengajuan
              </p>
              <h3 class="text-sm font-black text-gray-900">
                {{ tabs.find((t) => t.key === activeTab)!.label }}
              </h3>
            </div>
          </div>

          <div class="w-full md:w-72">
            <BasePublicSearch
              v-model="searchQuery"
              :placeholder="
                activeTab === 'foster' ? 'Cari nama calon...' : 'Cari nama pemohon...'
              "
            />
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-24">
          <Loader2 class="w-12 h-12 text-primary-400 animate-spin mb-4" />
          <p class="text-gray-500 font-medium animate-pulse">Memuat riwayat pengajuan...</p>
        </div>

        <!-- Error -->
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
              errorValue
                ? extractError(
                    errorValue as unknown as ApiError,
                    'Terjadi kesalahan saat mengambil riwayat. Silakan coba lagi.',
                  )
                : 'Terjadi kesalahan saat mengambil riwayat. Silakan coba lagi.'
            }}
          </p>
        </div>

        <!-- ─── FOSTER CHILDREN SECTION ──────────────────────────── -->
        <template v-else-if="activeTab === 'foster'">
          <div v-if="fosterChildrenCandidate.length > 0" class="grid grid-cols-1 gap-6">
            <div
              v-for="candidate in fosterChildrenCandidate"
              :key="candidate.id"
              class="group bg-white rounded-4xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8"
            >
              <!-- Status left stripe -->
              <div
                class="absolute top-0 left-0 w-2 h-full transition-all duration-500"
                :class="
                  candidate.status === 'accepted' || candidate.status === 'approved'
                    ? 'bg-green-500'
                    : candidate.status === 'rejected'
                      ? 'bg-red-500'
                      : candidate.status === 'cancelled'
                        ? 'bg-gray-400'
                        : 'bg-primary-400'
                "
              ></div>

              <div class="flex items-start gap-6 relative z-10">
                <img
                  :src="candidate.profilePicture"
                  :alt="candidate.name"
                  class="w-16 h-16 rounded-2xl object-cover bg-gray-100 shrink-0 border border-gray-100 group-hover:rotate-3 transition-transform duration-500"
                />
                <div class="space-y-1.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      {{ candidate.id.slice(0, 8) }}...
                    </span>
                    <div class="h-1 w-1 rounded-full bg-gray-200"></div>
                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {{ formatDate(candidate.createdAt) }}
                    </span>
                  </div>
                  <h3
                    class="text-xl font-black text-gray-900 leading-tight group-hover:text-primary-400 transition-colors duration-300"
                  >
                    {{ candidate.name }}
                  </h3>
                  <div class="flex flex-wrap items-center gap-4 pt-1">
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
                      :class="getStatusConfig(candidate.status).class"
                    >
                      <component :is="getStatusConfig(candidate.status).icon" :size="12" />
                      {{ getStatusConfig(candidate.status).label }}
                    </span>
                    <div class="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <FileText :size="14" />
                      <span class="capitalize">{{ candidate.category }}</span>
                    </div>
                  </div>
                  <div
                    v-if="
                      candidate.status.toLowerCase() === 'rejected' && candidate.rejectionReason
                    "
                    class="mt-3 p-3 bg-red-50/70 rounded-xl border border-red-100"
                  >
                    <p class="text-xs text-red-800">
                      <span class="font-bold">Alasan Penolakan:</span>
                      {{ candidate.rejectionReason }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Action -->
              <div
                class="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-6 md:pt-0 relative z-10 shrink-0"
              >
                <button
                  v-if="candidate.status.toLowerCase() === 'pending'"
                  @click="openCancelModal(candidate.id, candidate.name, 'foster')"
                  :disabled="fosterCancelMutation.isPending.value"
                  class="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Batalkan Pengajuan"
                >
                  <X :size="22" />
                </button>
                <div
                  v-else-if="
                    candidate.status === 'accepted' || candidate.status === 'approved'
                  "
                  class="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shadow-sm"
                >
                  <CheckCircle2 :size="24" />
                </div>
                <div
                  v-else
                  class="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center shadow-sm"
                >
                  <XCircle :size="24" />
                </div>
              </div>
            </div>
          </div>

          <!-- Foster empty: search -->
          <div v-else-if="fosterSearchQuery" class="py-24 text-center">
            <div
              class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300 animate-pulse"
            >
              <Search :size="40" />
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-3">Hasil Tidak Ditemukan</h3>
            <p class="text-gray-500 max-w-sm mx-auto text-base leading-relaxed">
              Tidak ada pengajuan yang cocok dengan
              <span class="font-bold text-gray-900">"{{ fosterSearchQuery }}"</span>.
            </p>
          </div>

          <!-- Foster empty: no data -->
          <div
            v-else
            class="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-24 text-center"
          >
            <div
              class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300 animate-pulse"
            >
              <Baby :size="48" />
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-3">Belum Ada Pengajuan</h3>
            <p class="text-gray-500 max-w-sm mx-auto text-base leading-relaxed">
              Anda belum pernah mengajukan calon anak asuh. Ajukan sekarang untuk membantu mereka.
            </p>
            <BaseButton
              variant="primary"
              class="mt-8"
              @click="router.push({ name: 'foster-children-candidate-submission' })"
            >
              Ajukan Calon Anak Asuh
            </BaseButton>
          </div>

          <!-- Foster pagination -->
          <div
            v-if="fosterPagination?.nextCursor || fosterPagination?.prevCursor"
            class="mt-10 flex items-center justify-center gap-4"
          >
            <BaseButton
              variant="outline"
              :disabled="!fosterPagination?.prevCursor"
              @click="fosterPrevPage(fosterPagination)"
            >
              Sebelumnya
            </BaseButton>
            <BaseButton
              variant="outline"
              :disabled="!fosterPagination?.nextCursor"
              @click="fosterNextPage(fosterPagination)"
            >
              Berikutnya
            </BaseButton>
          </div>
        </template>

        <!-- ─── AMBULANCE SECTION ──────────────────────────────────── -->
        <template v-else>
          <div v-if="ambulanceServices.length > 0" class="grid grid-cols-1 gap-6">
            <div
              v-for="service in ambulanceServices"
              :key="service.id"
              class="group bg-white rounded-4xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8"
            >
              <!-- Status left stripe -->
              <div
                class="absolute top-0 left-0 w-2 h-full transition-all duration-500"
                :class="
                  service.status === 'approved'
                    ? 'bg-green-500'
                    : service.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-primary-400'
                "
              ></div>

              <div class="flex items-start gap-6 relative z-10">
                <div
                  class="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:rotate-6"
                  :class="
                    service.status === 'approved'
                      ? 'bg-green-50 text-green-600'
                      : service.status === 'rejected'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-primary-50 text-primary-400'
                  "
                >
                  <Ambulance :size="32" />
                </div>
                <div class="space-y-1.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                      {{ service.id.slice(0, 8) }}...
                    </span>
                    <div class="h-1 w-1 rounded-full bg-gray-200"></div>
                    <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      {{ formatDate(service.requestDate) }}
                    </span>
                  </div>
                  <h3
                    class="text-xl font-black text-gray-900 leading-tight group-hover:text-primary-400 transition-colors duration-300"
                  >
                    {{ service.applicantName }}
                  </h3>
                  <div class="flex flex-wrap items-center gap-4 pt-1">
                    <span
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
                      :class="getStatusConfig(service.status).class"
                    >
                      <component :is="getStatusConfig(service.status).icon" :size="12" />
                      {{ getStatusConfig(service.status).label }}
                    </span>
                    <div class="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <Clock :size="14" />
                      Diajukan: {{ formatDate(service.createdAt) }}
                    </div>
                  </div>
                  <div
                    v-if="service.status === 'rejected' && service.rejectionReason"
                    class="mt-3 p-3 bg-red-50/70 rounded-xl border border-red-100"
                  >
                    <p class="text-xs text-red-800">
                      <span class="font-bold">Alasan Penolakan:</span>
                      {{ service.rejectionReason }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Action -->
              <div
                class="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-6 md:pt-0 relative z-10 shrink-0"
              >
                <button
                  v-if="service.status === 'pending'"
                  @click="openCancelModal(service.id, service.applicantName, 'ambulance')"
                  :disabled="ambulanceCancelMutation.isPending.value"
                  class="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all duration-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title="Batalkan Permintaan"
                >
                  <X :size="22" />
                </button>
                <div
                  v-else-if="service.status === 'approved'"
                  class="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shadow-sm"
                >
                  <CheckCircle2 :size="24" />
                </div>
                <div
                  v-else
                  class="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center shadow-sm"
                >
                  <XCircle :size="24" />
                </div>
              </div>
            </div>
          </div>

          <!-- Ambulance empty: search -->
          <div v-else-if="ambulanceSearchQuery" class="py-24 text-center">
            <div
              class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300 animate-pulse"
            >
              <Search :size="40" />
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-3">Hasil Tidak Ditemukan</h3>
            <p class="text-gray-500 max-w-sm mx-auto text-base leading-relaxed">
              Tidak ada permintaan yang cocok dengan
              <span class="font-bold text-gray-900">"{{ ambulanceSearchQuery }}"</span>.
            </p>
          </div>

          <!-- Ambulance empty: no data -->
          <div
            v-else
            class="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-24 text-center"
          >
            <div
              class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300 animate-pulse"
            >
              <Ambulance :size="48" />
            </div>
            <h3 class="text-2xl font-black text-gray-900 mb-3">Belum Ada Permintaan</h3>
            <p class="text-gray-500 max-w-sm mx-auto text-base leading-relaxed">
              Anda belum pernah mengajukan permintaan layanan ambulans.
            </p>
            <BaseButton
              variant="primary"
              class="mt-8"
              @click="router.push({ name: 'ambulance-service-submission' })"
            >
              Ajukan Permintaan Ambulans
            </BaseButton>
          </div>

          <!-- Ambulance pagination -->
          <div
            v-if="ambulancePagination?.nextCursor || ambulancePagination?.prevCursor"
            class="mt-10 flex items-center justify-center gap-4"
          >
            <BaseButton
              variant="outline"
              :disabled="!ambulancePagination?.prevCursor"
              @click="ambulancePrevPage(ambulancePagination)"
            >
              Sebelumnya
            </BaseButton>
            <BaseButton
              variant="outline"
              :disabled="!ambulancePagination?.nextCursor"
              @click="ambulanceNextPage(ambulancePagination)"
            >
              Berikutnya
            </BaseButton>
          </div>
        </template>
      </div>
    </div>

    <!-- Cancel Confirmation Modal -->
    <PublicConfirmationModal
      :show="showCancelModal"
      :title="
        itemToCancel?.type === 'foster' ? 'Batalkan Pengajuan Anak Asuh' : 'Batalkan Permintaan Ambulans'
      "
      :message="`Apakah Anda yakin ingin membatalkan ${itemToCancel?.type === 'foster' ? 'pengajuan' : 'permintaan'} untuk ${itemToCancel?.name}? Tindakan ini tidak dapat dibatalkan.`"
      :icon="AlertTriangle"
      secondary-button-text="Tutup"
      danger-button-text="Ya, Batalkan"
      :danger-button-loading="isCancelLoading"
      @secondary="showCancelModal = false"
      @danger="confirmCancel"
      @close="showCancelModal = false"
    />
  </PublicLayout>
</template>
