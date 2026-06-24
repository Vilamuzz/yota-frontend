<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, X, Baby, CheckCircle2, Loader2, AlertCircle } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { FosterChildrenCandidateStatus } from '@/types/fosterChildrenCandidate'
import { useFosterChildrenCandidateDetail } from '@/composables/fosterChildrenCandidate/useFosterChildrenCandidateDetail'
import { useFosterChildrenCandidateUpdate } from '@/composables/fosterChildrenCandidate/useFosterChildrenCandidateUpdate'
import { useToast } from '@/composables/ui/useToast'
import { getStatusColor } from '@/utils/statusColor'
import { formatDate, formatStatus } from '@/utils/format'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import RejectConfirmationModal from '@/components/organisms/RejectConfirmationModal.vue'
import { ROLES } from '@/const/roles'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const fosterChildrenCandidateId = route.params.id as string
const { showToast } = useToast()

const { detailQuery } = useFosterChildrenCandidateDetail(fosterChildrenCandidateId)
const { acceptMutation, rejectMutation } = useFosterChildrenCandidateUpdate()

const fosterChildrenCandidate = computed(() => detailQuery.data.value?.data)
const isLoading = computed(() => detailQuery.isPending.value)

const showImagePreview = ref(false)
const previewImageUrl = ref<string | null>(null)

const previewImage = (url: string) => {
  previewImageUrl.value = url
  showImagePreview.value = true
}

const closeImagePreview = () => {
  showImagePreview.value = false
}

const previewFile = (url: string) => {
  if (!url) return
  window.open(url, '_blank')
}

const getShortFileName = (url: string, label: string) => {
  if (!url) return '-'
  const fileName = url.split('/').pop()
  return fileName || `${label}.pdf`
}

const handleCancel = () => {
  if (role.value === ROLES.CHAIRMAN) {
    router.push({
      name: 'chairman-foster-children-candidates',
    })
  } else {
    router.push({
      name: 'dashboard-foster-children-candidates',
    })
  }
}

const confirmVerify = ref(false)
const confirmReject = ref(false)

const authStore = useAuthStore()
const role = computed(() =>
  authStore.activeRole === ROLES.CHAIRMAN ? ROLES.CHAIRMAN : ROLES.SOCIAL_MANAGER,
)

const verifyConfig = computed(() => {
  if (role.value === ROLES.CHAIRMAN) {
    return {
      title: 'Setujui Pengajuan Anak Asuh',
      message: `Apakah Anda yakin ingin menyetujui pengajuan ini?\n\n Persetujuan ini akan menetapkan anak tersebut sebagai anak asuh resmi yayasan.`,
      buttonText: 'Setujui',
    }
  }

  return {
    title: 'Verifikasi Pengajuan Anak Asuh',
    message: `Apakah Anda yakin ingin memverifikasi pengajuan anak asuh ini?\n\n Pengajuan yang diverifikasi akan diteruskan ke Ketua Yayasan untuk proses persetujuan.`,
    buttonText: 'Verifikasi',
  }
})

const openVerifyModal = () => {
  confirmVerify.value = true
}

const isUpdating = computed(() => acceptMutation.isPending.value || rejectMutation.isPending.value)

const confirmVerifyAction = () => {
  acceptMutation.mutate(fosterChildrenCandidateId, {
    onSuccess: () => {
      showToast(
        role.value === ROLES.CHAIRMAN
          ? 'Pengajuan berhasil disetujui'
          : 'Pengajuan berhasil diverifikasi',
        'success',
      )
      confirmVerify.value = false
    },
    onError: () => {
      showToast('Gagal memproses pengajuan', 'error')
    },
  })
}

const openRejectModal = () => {
  confirmReject.value = true
}

const handleReject = (reason: string) => {
  rejectMutation.mutate(
    {
      id: fosterChildrenCandidateId,
      rejectionReason: reason,
    },
    {
      onSuccess: () => {
        showToast('Pengajuan berhasil ditolak', 'success')
        confirmReject.value = false
      },
      onError: () => {
        showToast('Gagal menolak pengajuan', 'error')
      },
    },
  )
}

const verifyRejectConfig = computed(() => {
  if (role.value === ROLES.CHAIRMAN) {
    return {
      title: 'Tolak Pengajuan Anak Asuh',
      message: `Silakan masukkan alasan penolakan pengajuan anak asuh ini.\n\n Keputusan ini akan dicatat sebagai keputusan akhir yayasan.`,
    }
  }

  return {
    title: 'Tolak Pengajuan Anak Asuh',
    message: `Silakan lengkapi alasan penolakan sebelum melanjutkan.`,
  }
})
const getEducationLevelLabel = (level?: number) => {
  if (level !== undefined && level >= 1 && level <= 12) {
    return `Kelas ${level}`
  }
  return '-'
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
        <p class="text-gray-500 font-medium animate-pulse">Memuat detail ajuan...</p>
      </div>

      <!-- Error / Not Found State -->
      <div
        v-else-if="!fosterChildrenCandidate"
        class="flex flex-col items-center justify-center py-32 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center px-6"
      >
        <div class="p-4 bg-red-50 dark:bg-red-900/20 rounded-full mb-4 text-red-500">
          <AlertCircle :size="48" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Data Tidak Ditemukan</h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8">
          Maaf, kami tidak dapat menemukan detail pengajuan yang Anda cari. Data mungkin telah
          dihapus atau link tidak valid.
        </p>
        <BaseButton variant="outline" @click="handleCancel"> Kembali ke Daftar </BaseButton>
      </div>

      <div
        v-else
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <!-- Identitas Anak Asuh Section -->
          <div class="p-8 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700">
            <h3
              class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
            >
              <Baby :size="20" class="text-green-500" />
              Identitas Anak Asuh
            </h3>
            <div class="space-y-4">
              <div class="grid grid-cols-3 gap-4">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Nama Lengkap</span
                >
                <span class="col-span-2 text-sm text-gray-900 dark:text-gray-200">{{
                  fosterChildrenCandidate.name
                }}</span>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Jenis Kelamin</span
                >
                <span class="col-span-2 text-sm text-gray-900 dark:text-gray-200 capitalize">{{
                  fosterChildrenCandidate.gender
                }}</span>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">TTL</span>
                <span class="col-span-2 text-sm text-gray-900 dark:text-gray-200"
                  >{{ fosterChildrenCandidate.birthPlace }},
                  {{ formatDate(fosterChildrenCandidate.birthDate) }}</span
                >
              </div>
              <div class="grid grid-cols-3 gap-4">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</span>
                <span class="col-span-2 text-sm text-gray-900 dark:text-gray-200 capitalize">{{
                  fosterChildrenCandidate.category
                }}</span>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Sekolah</span>
                <span class="col-span-2 text-sm text-gray-900 dark:text-gray-200">{{
                  fosterChildrenCandidate.schoolName || '-'
                }}</span>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400"
                  >Tingkat Pendidikan</span
                >
                <span class="col-span-2 text-sm text-gray-900 dark:text-gray-200 capitalize">{{
                  getEducationLevelLabel(fosterChildrenCandidate.educationLevel)
                }}</span>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Alamat</span>
                <span class="col-span-2 text-sm text-gray-900 dark:text-gray-200">{{
                  fosterChildrenCandidate.address
                }}</span>
              </div>

              <!-- Documents -->
              <div class="pt-6 border-t border-gray-100 dark:border-gray-700">
                <h4
                  class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4"
                >
                  Dokumen Pendukung
                </h4>
                <div class="space-y-3">
                  <!-- Profile Picture -->
                  <div
                    class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-600"
                      >
                        <img
                          v-if="fosterChildrenCandidate.profilePicture"
                          :src="fosterChildrenCandidate.profilePicture"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                        >Foto Profil</span
                      >
                    </div>
                    <button
                      @click="previewImage(fosterChildrenCandidate.profilePicture)"
                      class="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      <Eye :size="18" />
                    </button>
                  </div>

                  <!-- Family Card -->
                  <div
                    class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-500">
                        <Eye :size="20" />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Kartu Keluarga
                        </p>
                        <p class="text-xs text-gray-400">
                          {{ getShortFileName(fosterChildrenCandidate.familyCard, 'KK') }}
                        </p>
                      </div>
                    </div>
                    <button
                      @click="previewFile(fosterChildrenCandidate.familyCard)"
                      class="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      :disabled="!fosterChildrenCandidate.familyCard"
                    >
                      <Eye :size="18" />
                    </button>
                  </div>

                  <!-- SKTM -->
                  <div
                    class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
                  >
                    <div class="flex items-center gap-3">
                      <div class="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-orange-500">
                        <Eye :size="20" />
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">SKTM</p>
                        <p class="text-xs text-gray-400">
                          {{ getShortFileName(fosterChildrenCandidate.sktm, 'SKTM') }}
                        </p>
                      </div>
                    </div>
                    <button
                      @click="previewFile(fosterChildrenCandidate.sktm)"
                      class="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      :disabled="!fosterChildrenCandidate.sktm"
                    >
                      <Eye :size="18" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Informasi Pengajuan Section -->
          <div class="p-8 space-y-8 bg-gray-50/50 dark:bg-gray-800/30">
            <div>
              <h3
                class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
              >
                <CheckCircle2 :size="20" class="text-green-500" />
                Informasi Pengajuan
              </h3>
              <div class="space-y-4">
                <div class="grid grid-cols-3 gap-4">
                  <span class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Nama Pengaju</span
                  >
                  <span class="col-span-2 text-sm text-gray-900 dark:text-gray-200">{{
                    fosterChildrenCandidate.submitterName
                  }}</span>
                </div>
                <div class="grid grid-cols-3 gap-4">
                  <span class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Nomor Telepon</span
                  >
                  <span class="col-span-2 text-sm text-gray-900 dark:text-gray-200">{{
                    fosterChildrenCandidate.submitterPhone
                  }}</span>
                </div>
                <div class="grid grid-cols-3 gap-4">
                  <span class="text-sm font-medium text-gray-500 dark:text-gray-400"
                    >Alamat Pengaju</span
                  >
                  <span class="col-span-2 text-sm text-gray-900 dark:text-gray-200">{{
                    fosterChildrenCandidate.submitterAddress
                  }}</span>
                </div>
                <div class="grid grid-cols-3 gap-4 items-center">
                  <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                  <div class="col-span-2">
                    <span
                      :class="[
                        'px-3 py-1 text-xs font-bold rounded-full tracking-wider border',
                        getStatusColor(fosterChildrenCandidate.status),
                      ]"
                    >
                      {{ formatStatus(fosterChildrenCandidate.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="
                fosterChildrenCandidate.status === FosterChildrenCandidateStatus.REJECTED &&
                fosterChildrenCandidate.rejectionReason
              "
              class="mt-4 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl"
            >
              <h4
                class="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2"
              >
                Alasan Penolakan
              </h4>
              <p class="text-sm text-red-700 dark:text-red-300">
                {{ fosterChildrenCandidate.rejectionReason }}
              </p>
            </div>

            <!-- Piagam / Prestasi -->
            <div v-if="fosterChildrenCandidate.achievements?.length">
              <h4
                class="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4"
              >
                Piagam / Prestasi
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(cert, index) in fosterChildrenCandidate.achievements"
                  :key="index"
                  class="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <span class="text-sm text-gray-700 dark:text-gray-300 truncate pr-4">{{
                    cert.title
                  }}</span>
                  <button
                    @click="previewFile(cert.url)"
                    class="text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    <Eye :size="18" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div
          v-if="
            fosterChildrenCandidate.status === FosterChildrenCandidateStatus.PENDING ||
            (fosterChildrenCandidate.status ===
              FosterChildrenCandidateStatus.SOCIAL_MANAGER_ACCEPTED &&
              role === ROLES.CHAIRMAN)
          "
          class="px-8 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
        >
          <p class="text-xs text-gray-500 dark:text-gray-400 italic">
            Dikirim pada {{ formatDate(fosterChildrenCandidate.createdAt) }}
          </p>
          <div class="flex items-center gap-3">
            <BaseButton
              variant="danger"
              size="md"
              class="px-8"
              @click="openRejectModal"
              :disabled="isUpdating"
            >
              Tolak
            </BaseButton>
            <BaseButton
              variant="primary"
              size="md"
              class="px-8"
              @click="openVerifyModal"
              :disabled="isUpdating"
            >
              {{ verifyConfig.buttonText }}
            </BaseButton>
          </div>
        </div>
        <div
          v-else
          class="px-8 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700"
        >
          <p class="text-xs text-gray-500 dark:text-gray-400 italic">
            Dikirim pada {{ formatDate(fosterChildrenCandidate.createdAt) }}
          </p>
        </div>
      </div>
    </div>
  </DashboardLayout>

  <!-- Image Preview Modal -->
  <div
    v-if="showImagePreview"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    @click.self="closeImagePreview"
  >
    <div
      class="relative max-w-4xl w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform scale-100"
    >
      <div class="absolute top-4 right-4 z-10">
        <button
          @click="closeImagePreview"
          class="p-2 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X :size="24" />
        </button>
      </div>
      <img
        v-if="previewImageUrl"
        :src="previewImageUrl"
        class="w-full h-auto max-h-[85vh] object-contain"
      />
    </div>
  </div>

  <!-- Confirmations -->
  <ConfirmationModal
    :show="confirmVerify"
    :title="verifyConfig.title"
    :message="verifyConfig.message"
    :primary-button-text="verifyConfig.buttonText"
    secondary-button-text="Batal"
    @primary="confirmVerifyAction"
    @secondary="confirmVerify = false"
    @close="confirmVerify = false"
  />

  <RejectConfirmationModal
    :show="confirmReject"
    :title="verifyRejectConfig.title"
    :message="verifyRejectConfig.message"
    primary-button-text="Tolak"
    secondary-button-text="Batal"
    @primary="handleReject"
    @secondary="confirmReject = false"
    @close="confirmReject = false"
  />
</template>
