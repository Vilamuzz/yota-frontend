<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ArrowLeft, Eye, Baby } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import router from '@/router'
import { ref, computed } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { Category, Gender, type FosterChildren } from '@/types/fosterChildren'

const route = useRoute()
const childId = route.params.id as string

const children = ref<FosterChildren[]>([
  {
    id: '1',
    name: 'Faris Ahad',
    gender: Gender.male,
    category: Category.yatim,
    birthPlace: 'Bandung',
    birthDate: '10-05-2014',
    address: 'Jl. Melati No. 12 Bandung',
    schoolName: 'SDN 1 Bandung',
    educationLevel: 1,
    profilePicture: 'https://i.pravatar.cc/150?img=1',
    achievements: [
      {
        id: '1',
        title: 'Juara 1 Lomba Menggambar 2023',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        alt: 'Juara 1 Lomba Menggambar.pdf',
      },
      {
        id: '2',
        title: 'Juara 2 Lomba Cerdas Cermat 2024',
        url: 'https://www.africau.edu/images/default/sample.pdf',
        alt: 'Juara 2 Lomba Cerdas Cermat.pdf',
      },
    ],
    isGraduated: false,
    familyCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Tia Mutiara',
    gender: Gender.female,
    category: Category.piatu,
    birthPlace: 'Garut',
    birthDate: '15-02-2015',
    address: 'Jl. Mawar No. 5 Garut',
    schoolName: 'SDN 2 Garut',
    educationLevel: 1,
    profilePicture: 'https://i.pravatar.cc/150?img=2',
    achievements: [
      {
        id: '3',
        title: 'Juara 3 Lomba Menulis Cerpen 2023',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        alt: 'Juara 3 Lomba Menulis Cerpen.pdf',
      }
    ],
    isGraduated: false,
    familyCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Ahmad Rizki',
    gender: Gender.male,
    category: Category.yatimPiatu,
    birthPlace: 'Tasikmalaya',
    birthDate: '20-03-2013',
    address: 'Jl. Anggrek No. 9 Tasikmalaya',
    schoolName: 'SMPN 1 Tasikmalaya',
    educationLevel: 2,
    profilePicture: 'https://i.pravatar.cc/150?img=4',
    achievements: [
      {
        id: '4',
        title: 'Juara 1 Lomba Pidato 2023',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        alt: 'Juara 1 Lomba Pidato.pdf',
      },
      {
        id: '5',
        title: 'Juara 2 Lomba Matematika 2024',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        alt: 'Juara 2 Lomba Matematika.pdf',
      }
    ],
    isGraduated: true,
    familyCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    createdAt: '2024-01-03',
  },
])

const child = computed(() => {
  return children.value.find((c) => c.id === childId)
})

const previewFile = (file: File | string) => {
  if (!file) return

  if (typeof file === 'string') {

    window.open(file, '_blank')
  } else {
    const url = URL.createObjectURL(file)
    window.open(url, '_blank')
  }
}

const getShortFileName = (fileUrl: string, defaultName: string) => {
  if (!fileUrl) return defaultName

  try {
    const parts = fileUrl.split('/')
    return parts[parts.length - 1]
  } catch {
    return defaultName
  }
}

const handleCancel = () => {
  router.push({ name: 'dashboard-foster-children' })
}

const handleEdit = () => {
  if (child.value) {
    router.push({
      name: 'dashboard-foster-children-edit',
      params: { id: child.value.id },
    })
  }
}

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
      <div class="flex items-center gap-4">
        <button
          @click="handleCancel"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-500 hover:text-gray-700"
          title="Kembali ke anak asuh"
        >
          <ArrowLeft :size="20" />
        </button>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 rounded-lg">
            <Baby :size="24" class="text-primary-400" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Detail Anak Asuh</h2>
          </div>
        </div>
      </div>

      <div
        v-if="child"
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div class="p-6 space-y-5">
          <div class="flex gap-6 items-center ml-6">
            <img
              :src="child.profilePicture"
              :alt="child.name"
              class="w-20 h-20 object-cover rounded-full border-2 border-green-600"
            />
            <h2 class="text-lg font-semibold text-gray-900">
              {{ child.name }}
            </h2>
          </div>

          <div class="flex-1 space-y-3 text-sm">
            <div class="grid grid-cols-[180px_auto] gap-y-3 gap-x-2 text-sm">
              <div class="text-gray-500">Nama Anak Asuh</div>
              <div>: {{ child.name }}</div>

              <div class="text-gray-500">Jenis Kelamin</div>
              <div>: {{ child.gender }}</div>

              <div class="text-gray-500">Tempat Lahir</div>
              <div>: {{ child.birthPlace }}</div>

              <div class="text-gray-500">Tanggal Lahir</div>
              <div>: {{ child.birthDate }}</div>

              <div class="text-gray-500">Nama Sekolah / Univ</div>
              <div>: {{ child.schoolName || '-' }}</div>

              <div class="text-gray-500">Tingkat Pendidikan</div>
              <div>: {{ getEducationLevelLabel(child.educationLevel) }}</div>

              <div class="text-gray-500">Alamat</div>
              <div>: {{ child.address }}</div>

              <div class="text-gray-500">Kartu Keluarga</div>
                <div class="flex items-start gap-2">
                  <span>: </span>
                  <div v-if="child.familyCard" class="space-y-2">
                    <div class="flex items-center gap-3">
                      <span class="text-sm">{{
                        getShortFileName(child.familyCard, 'Kartu_Keluarga')
                      }}</span>
                      <button
                        @click="previewFile(child.familyCard)"
                        class="ml-3 text-gray-500 hover:text-gray-700 flex items-center"
                        title="Lihat Kartu Keluarga"
                      >
                        <Eye :size="18" />
                      </button>
                    </div>
                  </div>
                  <div v-else class="flex items-center text-sm">Tidak ada kartu keluarga</div>
                </div>

                <div class="text-gray-500">SKTM</div>
                <div class="flex items-start gap-2">
                  <span>: </span>
                  <div v-if="child.sktm" class="space-y-2">
                    <div class="flex items-center gap-3">
                      <span class="text-sm">{{ getShortFileName(child.sktm, 'SKTM') }}</span>
                      <button
                        @click="previewFile(child.sktm)"
                        class="ml-3 text-gray-500 hover:text-gray-700 flex items-center"
                        title="Lihat SKTM"
                      >
                        <Eye :size="18" />
                      </button>
                    </div>
                  </div>
                </div>

              <div class="text-gray-500">Prestasi</div>
              <div class="flex items-start gap-2">
                <span>: </span>
                <ol class="list-decimal list-outside pl-4 text-sm">
                  <li v-for="(achievement, index) in child.achievements" :key="index">
                    {{ achievement.title }}
                  </li>
                </ol>
              </div>

              <div class="text-gray-500">Piagam Penghargaan</div>
              <div class="flex items-start gap-2">
                <span>: </span>
                <div v-if="child.achievements?.length" class="space-y-2">
                  <div
                    v-for="cert in child.achievements"
                    :key="cert.id"
                    class="flex items-center gap-3"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-sm">
                        {{ cert.title }}
                    </span>
                    </div>
                    <button
                      @click="previewFile(cert.url)"
                      class="ml-3 text-gray-500 hover:text-gray-700 flex items-center"
                      title="Lihat Sertifikat"
                    >
                      <Eye :size="18" />
                    </button>
                  </div>
                </div>
                <div v-else class="flex items-center text-sm">Tidak ada sertifikat</div>
              </div>
            </div>

            <div class="pt-2 flex items-center gap-40">
              <div class="text-gray-500">Status</div>
              <span
                :class="[
                  'px-2 py-1 text-xs rounded-full',
                  child.isGraduated === false
                    ? 'bg-green-100 text-green-800'
                    : child.isGraduated === true
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800',
                ]"
              >
                {{ child.isGraduated === false ? 'Aktif' : 'Lulus' }}
              </span>
            </div>
          </div>
        </div>

        <div class="px-6 pb-4 flex justify-end gap-3">
          <BaseButton type="button" variant="primary" @click="handleEdit" :disabled="!child">
            Edit Anak Asuh
          </BaseButton>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
