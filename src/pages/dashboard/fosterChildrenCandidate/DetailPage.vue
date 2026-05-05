<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ArrowLeft, Eye, X, Baby, CheckCircle2 } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { Category, Gender } from '@/types/fosterChildren'
import type { FosterChildrenCandidate } from '@/types/fosterChildrenCandidate'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import RejectConfirmationModal from '@/components/molecules/RejectConfirmationModal.vue'
import { ROLES } from '@/const/roles'

const route = useRoute()
const router = useRouter()
const fosterChildrenCandidateId = route.params.id as string

const fosterChildrenCandidate = computed(() => {
  return fosterChildrenCandidates.value.find((c) => c.id === fosterChildrenCandidateId)
})

const fosterChildrenCandidates = ref<FosterChildrenCandidate[]>([
  {
    id: '1',
    name: 'Faris Ahad',
    slug: 'faris-ahad',
    gender: Gender.male,
    category: Category.yatim,
    birthPlace: 'Bandung',
    birthDate: '10-05-2014',
    address: 'Jl. Melati No. 12 Bandung',
    profilePicture: 'https://i.pravatar.cc/150?img=1',
    isGraduated: false,
    familyCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    submitterName: 'Choi Youngjae',
    submitterPhone: '081234567890',
    submitterAddress: 'Jl. Melati No.2 Bandung',
    submitterIdCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    submittedBy: '',
    status: 'Diajukan',
    rejectionReason: '',
    createdAt: '2024-01-01',
    achievements: [],
  },
  {
    id: '2',
    name: 'Tia Mutiara',
    slug: 'tia-mutiara',
    gender: Gender.female,
    category: Category.piatu,
    birthPlace: 'Garut',
    birthDate: '2015-02-15',
    address: 'Jl. Mawar No. 5 Garut',
    profilePicture: 'https://i.pravatar.cc/150?img=2',
    isGraduated: false,
    familyCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    submitterName: 'Jung Woojin',
    submitterPhone: '081234567891',
    submitterAddress: 'Jl Mawar No. 7 Garut',
    submitterIdCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    status: 'Menunggu Verifikasi',
    rejectionReason: '',
    submittedBy: '',
    createdAt: '2024-01-02',
    achievements: [],
  },
])

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
const confirmVerifyAction = () => {
  if (role.value === ROLES.CHAIRMAN) {
    console.log('Pengajuan disetujui oleh Ketua Yayasan')
  } else {
    console.log('Pengajuan diverifikasi oleh Koodinator Sosial')
  }
  confirmVerify.value = false
}

const openRejectModal = () => {
  confirmReject.value = true
}
const handleReject = (reason: string) => {
  console.log('Alasan reject:', reason)
  if (role.value === ROLES.CHAIRMAN) {
    console.log('Pengajuan ditolak oleh Ketua')
  } else {
    console.log('Pengajuan ditolak oleh Social Manager')
  }
  confirmReject.value = false
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
</script>

<template>
  <DashboardLayout>
    <div class="max-w-full mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center gap-4">
        <button
          @click="handleCancel"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          title="Kembali ke ajuan anak asuh"
        >
          <ArrowLeft :size="20" />
        </button>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Baby :size="24" class="text-primary-400 dark:text-primary-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Detail Ajuan Anak Asuh</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Review dan kelola detail pengajuan anak asuh.
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="fosterChildrenCandidate"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <!-- Identitas Anak Asuh Section -->
          <div class="p-8 border-b lg:border-b-0 lg:border-r border-gray-100 dark:border-gray-700">
            <h3
              class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
            >
              <Baby :size="20" class="text-primary-400" />
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
                  {{ fosterChildrenCandidate.birthDate }}</span
                >
              </div>
              <div class="grid grid-cols-3 gap-4">
                <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</span>
                <span class="col-span-2 text-sm text-gray-900 dark:text-gray-200 capitalize">{{
                  fosterChildrenCandidate.category
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
                        'px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider border',
                        fosterChildrenCandidate.status === 'Diajukan'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                          : fosterChildrenCandidate.status === 'Menunggu Verifikasi'
                            ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
                            : fosterChildrenCandidate.status === 'Disetujui'
                              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                              : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
                      ]"
                    >
                      {{ fosterChildrenCandidate.status }}
                    </span>
                  </div>
                </div>
              </div>
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
          class="px-8 py-5 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between"
        >
          <p class="text-xs text-gray-500 dark:text-gray-400 italic">
            Dikirim pada {{ fosterChildrenCandidate.createdAt }}
          </p>
          <div class="flex items-center gap-3">
            <BaseButton variant="danger" size="md" class="px-8" @click="openRejectModal">
              Tolak
            </BaseButton>
            <BaseButton variant="primary" size="md" class="px-8" @click="openVerifyModal">
              {{ verifyConfig.buttonText }}
            </BaseButton>
          </div>
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
