<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import { extractError } from '@/utils/error'
import type { ApiError } from '@/types/response'
import { useMyFosterChildrenCandidateList } from '@/composables/fosterChildrenCandidate/useMyFosterChildrenCandidateList'
import { useMyFosterChildrenCandidateCancel } from '@/composables/fosterChildrenCandidate/useMyFosterChildrenCandidateCancel'
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
} from 'lucide-vue-next'
import { formatDate } from '@/utils/format'
import type { FosterChildrenCandidateQueryParams } from '@/types/fosterChildrenCandidate'

const router = useRouter()
const searchQuery = ref('')

const queryParams = reactive<FosterChildrenCandidateQueryParams>({
  limit: 10,
  search: undefined,
})

const { listQuery, fosterChildrenCandidate, pagination, isLoading } =
  useMyFosterChildrenCandidateList(queryParams)
const { resetPagination, handleNextPage, handlePrevPage } = useCursorPagination(queryParams)
const { cancelMutation } = useMyFosterChildrenCandidateCancel()
const { showToast } = useToast()

const showCancelModal = ref(false)
const candidateToCancel = ref<{ id: string; name: string } | null>(null)

const handleCancel = (id: string, name: string) => {
  candidateToCancel.value = { id, name }
  showCancelModal.value = true
}

const confirmCancel = () => {
  if (!candidateToCancel.value) return

  cancelMutation.mutate(candidateToCancel.value.id, {
    onSuccess: () => {
      showToast('Pengajuan berhasil dibatalkan.', 'success')
      showCancelModal.value = false
      candidateToCancel.value = null
    },
    onError: (err) => {
      const errorMsg = extractError(err, 'Gagal membatalkan pengajuan.')
      showToast(errorMsg, 'error')
      showCancelModal.value = false
      candidateToCancel.value = null
    },
  })
}

const isError = listQuery.isError

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'accepted':
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
    <div class="bg-gray-50 min-h-screen pt-28 pb-12 px-18 font-poppins">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <div class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div class="text-center md:text-left">
            <h1 class="text-4xl font-black text-gray-900 uppercase tracking-tight">
              Riwayat Pengajuan
            </h1>
            <p class="text-gray-500 mt-1 text-lg">
              Pantau status pengajuan calon anak asuh Anda di sini.
            </p>
          </div>

          <div class="w-full md:w-72">
            <BasePublicSearch v-model="searchQuery" placeholder="Cari nama calon..." />
          </div>
        </div>

        <div v-if="isLoading" class="flex flex-col items-center justify-center py-24">
          <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
          <p class="text-gray-500 font-medium animate-pulse">Memuat riwayat pengajuan...</p>
        </div>

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
              listQuery.error.value
                ? extractError(
                    listQuery.error.value as unknown as ApiError,
                    'Terjadi kesalahan saat mengambil riwayat. Silakan coba lagi.',
                  )
                : 'Terjadi kesalahan saat mengambil riwayat. Silakan coba lagi.'
            }}
          </p>
        </div>

        <template v-else>
          <div v-if="fosterChildrenCandidate.length > 0" class="space-y-4">
            <div
              v-for="candidate in fosterChildrenCandidate"
              :key="candidate.id"
              class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center transition-all hover:shadow-md"
            >
              <img
                :src="candidate.profilePicture"
                :alt="candidate.name"
                class="w-20 h-20 rounded-xl object-cover bg-gray-100 shrink-0 border border-gray-100"
              />

              <div class="flex-1 min-w-0">
                <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <h3 class="text-lg font-bold text-gray-900 truncate">{{ candidate.name }}</h3>

                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border w-fit"
                    :class="getStatusConfig(candidate.status).class"
                  >
                    <component :is="getStatusConfig(candidate.status).icon" :size="14" />
                    {{ getStatusConfig(candidate.status).label }}
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-gray-600">
                  <div class="flex items-center gap-2">
                    <FileText :size="16" class="text-gray-400" />
                    <span
                      >Kategori:
                      <span class="font-medium text-gray-900 capitalize">{{
                        candidate.category
                      }}</span></span
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    <Clock :size="16" class="text-gray-400" />
                    <span
                      >Diajukan:
                      <span class="font-medium text-gray-900">{{
                        formatDate(candidate.createdAt)
                      }}</span></span
                    >
                  </div>
                </div>

                <div
                  v-if="candidate.status.toLowerCase() === 'rejected' && candidate.rejectionReason"
                  class="mt-4 p-3 bg-red-50/50 rounded-xl border border-red-100"
                >
                  <p class="text-xs text-red-800">
                    <span class="font-bold">Alasan Penolakan:</span> {{ candidate.rejectionReason }}
                  </p>
                </div>
              </div>

              <!-- Cancel Button for Pending Status -->
              <div
                v-if="candidate.status.toLowerCase() === 'pending'"
                class="w-full md:w-auto shrink-0 mt-4 md:mt-0"
              >
                <BaseButton
                  variant="danger"
                  class="w-full md:w-auto text-sm py-2"
                  @click="handleCancel(candidate.id, candidate.name)"
                  :disabled="cancelMutation.isPending.value"
                >
                  Batalkan Pengajuan
                </BaseButton>
              </div>
            </div>
          </div>

          <div v-else-if="searchQuery" class="py-24 text-center">
            <div
              class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"
            >
              <Search :size="32" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Hasil Tidak Ditemukan</h3>
            <p class="text-gray-500 max-w-sm mx-auto mb-8">
              Tidak ada pengajuan yang cocok dengan "{{ searchQuery }}".
            </p>
            <BaseButton variant="outline" @click="searchQuery = ''">Bersihkan Pencarian</BaseButton>
          </div>

          <div v-else class="py-24 text-center">
            <div
              class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"
            >
              <FileText :size="32" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">Belum Ada Pengajuan</h3>
            <p class="text-gray-500 max-w-sm mx-auto mb-8">
              Anda belum pernah mengajukan calon anak asuh. Ajukan sekarang untuk membantu mereka.
            </p>
            <BaseButton
              variant="primary"
              @click="router.push({ name: 'foster-children-candidate-submission' })"
            >
              Ajukan Calon Anak Asuh
            </BaseButton>
          </div>

          <div
            v-if="pagination?.nextCursor || pagination?.prevCursor"
            class="mt-10 flex items-center justify-center gap-4"
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

    <!-- Cancel Confirmation Modal -->
    <PublicConfirmationModal
      :show="showCancelModal"
      title="Batalkan Pengajuan"
      :message="`Apakah Anda yakin ingin membatalkan pengajuan untuk ${candidateToCancel?.name}? Tindakan ini tidak dapat dibatalkan.`"
      :icon="AlertTriangle"
      secondary-button-text="Tutup"
      danger-button-text="Ya, Batalkan"
      :danger-button-loading="cancelMutation.isPending.value"
      @secondary="showCancelModal = false"
      @danger="confirmCancel"
      @close="showCancelModal = false"
    />
  </PublicLayout>
</template>
