<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ArrowLeft, Eye, X } from 'lucide-vue-next'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChildren } from '@fortawesome/free-solid-svg-icons'
import router from '@/router'
import { ref, computed } from 'vue'
import type { Submission } from '@/types/submissionChildren'
import { useRoute } from 'vue-router'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import RejectConfirmationModal from '@/components/molecules/RejectConfirmationModal.vue'

const route = useRoute()
const childId = route.params.id as string

const child = computed(() => {
  return children.value.find((c) => c.id === childId)
})

const children = ref<Submission[]>([
  {
    id: '1',
    applicant_name: 'Choi Youngjae',
    number_phone: '081234567890',
    ktp_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    child_name: 'Faris Ahad',
    gender: 'Laki-laki',
    category: 'Yatim',
    birthplace: 'Bandung',
    birthdate: '2014-05-10',
    address: 'Jl. Melati No. 12 Bandung',
    image_url: 'https://i.pravatar.cc/150?img=1',
    familyCard_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    certificates: [],
    status: 'Diajukan',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    applicant_name: 'Jung Woojin',
    number_phone: '081234567891',
    ktp_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    child_name: 'Tia Mutiara',
    gender: 'Perempuan',
    category: 'Piatu',
    birthplace: 'Garut',
    birthdate: '2015-02-15',
    address: 'Jl. Mawar No. 5 Garut',
    image_url: 'https://i.pravatar.cc/150?img=2',
    familyCard_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    certificates: [],
    status: 'Menunggu Verifikasi',
    created_at: '2024-01-02',
  },
  {
    id: '3',
    applicant_name: 'Jang Juwang',
    number_phone: '081234567892',
    ktp_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    child_name: 'Ahmad Rizki',
    gender: 'Laki-laki',
    category: 'Yatim Piatu',
    birthplace: 'Tasikmalaya',
    birthdate: '2013-08-20',
    address: 'Jl. Anggrek No. 9 Tasikmalaya',
    image_url: 'https://i.pravatar.cc/150?img=4',
    familyCard_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    certificates: [],
    status: 'Disetujui',
    created_at: '2024-01-03',
  },
  {
    id: '4',
    applicant_name: 'Park Sungho',
    number_phone: '081234567893',
    ktp_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    child_name: 'Laila Salsabila',
    gender: 'Perempuan',
    category: 'Yatim',
    birthplace: 'Cimahi',
    birthdate: '2016-11-30',
    address: 'Jl. Dahlia No. 3 Cimahi',
    image_url: 'https://i.pravatar.cc/150?img=5',
    familyCard_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    certificates: [],
    status: 'Ditolak',
    created_at: '2024-01-04',
  }
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
  window.open(url, '_blank')
}

const getShortFileName = (url: string, label: string) => {
  if (!url) return '-'
  const fileName = url.split('/').pop()
  return fileName || `${label}.pdf`
}

const handleCancel = () => {
  if (role.value === 'chairman') {
    router.push({
      name: 'chairman-foster-children-submissions'
    })
  } else {
    router.push({
      name: 'dashboard-foster-children-submissions'
    })
  }

}

const confirmVerify = ref(false)
const confirmReject = ref(false)

const role = ref('social_manager')
if (window.location.pathname.includes('chairman')) {
  role.value = 'chairman'
} else {
  role.value = 'social_manager'
}


const verifyConfig = computed(() => {
  if (role.value === 'chairman') {
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
  if (role.value === 'chairman') {
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
  if (role.value === 'chairman') {
    console.log('Pengajuan ditolak oleh Ketua')
  } else {
    console.log('Pengajuan ditolak oleh Social Manager')
  }
  confirmReject.value = false
}
const verifyRejectConfig = computed(() => {
  if (role.value === 'chairman') {
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
      <div class="flex items-center gap-4">
        <button
          @click="handleCancel"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-500 hover:text-gray-700"
          title="Kembali ke ajuan anak asuh"
        >
          <ArrowLeft :size="20" />
        </button>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 rounded-lg">
            <FontAwesomeIcon :icon="faChildren" size="lg" class="text-primary-400"/>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Detail Ajuan Anak Asuh</h2>
          </div>
        </div>
      </div>

      <div
        v-if="child"
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="grid grid-cols-1 md:grid-cols-2 items-start">
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden m-4">
            <div class="p-6 space-y-5">
              <h2 class="text-lg font-semibold text-gray-900">Identitas Anak Asuh</h2>
              <div class="grid grid-cols-[180px_auto] gap-y-3 gap-x-2 text-sm">
                <div class="text-gray-500">Nama Anak Asuh</div>
                <div>: {{  child.child_name }}</div>

                <div class="text-gray-500">Jenis Kelamin</div>
                <div>: {{  child.gender }}</div>

                <div class="text-gray-500">Tempat Lahir</div>
                <div>: {{ child.birthplace }}</div>

                <div class="text-gray-500">Tanggal Lahir</div>
                <div>: {{ child.birthdate }}</div>

                <div class="text-gray-500">Alamat</div>
                <div>: {{ child.address }}</div>

                <div class="text-gray-500">Kategori</div>
                <div>: {{ child.category }}</div>

                <div class="text-gray-500">Foto Anak</div>
                <div class="flex items-center gap-2">
                  <span>: </span>
                  <div
                    v-if="child.image_url"
                    class="flex items-center gap-3">
                    <img
                      :src="child.image_url"
                      :alt="child.child_name"
                      class="w-10 h-10 rounded border shrink-0">
                      <button
                        @click="previewImage(child.image_url)"
                        class="ml-3 text-gray-500 hover:text-gray-700 flex items-center"
                        title="Lihat Foto">
                        <Eye :size="18" />
                      </button>
                  </div>
                  <div
                    v-if="showImagePreview"
                    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                    >
                    <div class="relative bg-white rounded-lg p-4 max-w-lg w-full">
                      <button
                        @click="closeImagePreview"
                        class="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                      >
                        <X :size="20" />
                      </button>

                      <img
                        v-if="previewImageUrl"
                        :src="previewImageUrl"
                        class="w-full max-h-[70vh] object-contain rounded"
                      />
                    </div>
                  </div>
                </div>

                <div class="text-gray-500">Kartu Keluarga</div>
                <div class="flex items-start gap-2">
                  <span>: </span>
                  <div
                    v-if="child.familyCard_url"
                    class="space-y-2">
                    <div class="flex items-center gap-3">
                      <span class="text-sm">{{ getShortFileName(child.familyCard_url, 'Kartu_Keluarga') }}</span>
                      <button
                        @click="previewFile(child.familyCard_url)"
                        class="ml-3 text-gray-500 hover:text-gray-700 flex items-center"
                        title="Lihat Kartu Keluarga">
                        <Eye :size="18" />
                      </button>
                    </div>
                  </div>
                  <div v-else class="flex items-center text-sm">
                    Tidak ada kartu keluarga
                  </div>
                </div>

                <div class="text-gray-500">SKTM</div>
                <div class="flex items-start gap-2">
                  <span>: </span>
                  <div
                    v-if="child.sktm_url"
                    class="space-y-2">
                    <div class ="flex items-center gap-3">
                      <span class="text-sm">{{ getShortFileName(child.sktm_url, 'SKTM') }}</span>
                      <button
                        @click="previewFile(child.sktm_url)"
                        class="ml-3 text-gray-500 hover:text-gray-700 flex items-center"
                        title="Lihat SKTM">
                        <Eye :size="18" />
                      </button>
                    </div>
                  </div>
                </div>

                <div class="text-gray-500">Piagam Penghargaan</div>
                <div class="flex items-start gap-2">
                  <span>: </span>
                  <div
                    v-if="child.certificates?.length"
                    class="space-y-2">
                    <div
                      v-for="(cert, index) in child.certificates"
                      :key="index"
                      class="flex items-center gap-3">
                      <span class="text-sm">
                        {{ cert.file_name || 'Sertifikat' }}
                      </span>
                      <button
                        @click="previewFile(cert.file_url)"
                        class="ml-3 text-gray-500 hover:text-gray-700 flex items-center"
                        title="Lihat Sertifikat">
                      <Eye :size="18" />
                      </button>
                    </div>
                  </div>
                  <div v-else class="flex items-center text-sm">
                    Tidak ada sertifikat
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden m-4">
            <div class="p-6 space-y-5">
              <h2 class="text-lg font-semibold text-gray-900">Informasi Pengajuan</h2>
              <div class="grid grid-cols-[180px_auto] gap-y-3 gap-x-2 text-sm">
                <div class="text-gray-500">Nama Pengaju</div>
                <div>: {{ child.applicant_name }}</div>

                <div class="text-gray-500">Nomor Telepon</div>
                <div>: {{ child.number_phone }}</div>

                <div class="text-gray-500">KTP Pengaju</div>
                <div class="flex items-start gap-2">
                  <span>: </span>
                  <div
                    v-if="child.ktp_url"
                    class="space-y-2">
                    <div class="flex items-center gap-3">
                      <span class="text-sm">{{ getShortFileName(child.ktp_url, 'KTP') }}</span>
                      <button
                        @click="previewFile(child.ktp_url)"
                        class="ml-3 text-gray-500 hover:text-gray-700 flex items-center"
                        title="Lihat KTP">
                        <Eye :size="18" />
                      </button>
                    </div>
                  </div>
                  <div v-else class="flex items-center text-sm">
                    Tidak ada KTP pengaju
                  </div>
                </div>

                <div class="text-gray-500">Status Pengajuan</div>
                <span :class="[
                  'inline-block w-fit ml-2 px-3 py-1 text-xs rounded-full',
                  child.status === 'Diajukan'
                    ? 'bg-yellow-100 text-yellow-800'
                  : child.status === 'Menunggu Verifikasi'
                    ? 'bg-purple-100 text-purple-800'
                  : child.status === 'Disetujui'
                    ? 'bg-green-100 text-green-800'
                  : child.status === 'Ditolak'
                    ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
                ]">
                  {{  child.status }}
                </span>
                </div>
            </div>
          </div>
        </div>

        <div class="px-6 pb-4 flex justify-end gap-3">
        <BaseButton type="button" variant="danger" @click="openRejectModal">
          Tolak
        </BaseButton>

        <BaseButton type="button" variant="primary" @click="openVerifyModal">
           {{ verifyConfig.buttonText }}
        </BaseButton>
      </div>
      </div>
    </div>
  </DashboardLayout>

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
