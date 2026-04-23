<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ArrowLeft, Eye } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import router from '@/router'
import { ref, computed } from 'vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import type { Child } from '@/types/fosterChildren'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChildren } from '@fortawesome/free-solid-svg-icons'

const route = useRoute()
const childId = route.params.id as string

const children = ref<Child[]>([
  {
    id: '1',
    name: 'Faris Ahad',
    slug: 'faris-ahad',
    gender: 'Laki-laki',
    category: 'Yatim',
    birthplace: 'Bandung',
    birth_date: '10-05-2014',
    address: 'Jl. Melati No. 12 Bandung',
    image_url: 'https://i.pravatar.cc/150?img=1',
    achievements: ['Juara 1 Lomba Menggambar 2023', 'Juara 2 Lomba Cerdas Cermat 2024'],
    certificates: [
      {
        id: '1',
        title: 'Juara 1 Lomba Menggambar 2023',
        file_name: 'Juara 1 Lomba Menggambar.pdf',
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
      },
      {
        id: '2',
        title: 'Juara 2 Lomba Cerdas Cermat 2024',
        file_name: 'Juara 2 Lomba Cerdas Cermat.pdf',
        file_url: 'https://www.africau.edu/images/default/sample.pdf'
      }
    ],
    status: 'aktif',
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Tia Mutiara',
    slug: 'tia-mutiara',
    gender: 'Perempuan',
    category: 'Piatu',
    birthplace: 'Garut',
    birth_date: '15-02-2015',
    address: 'Jl. Mawar No. 5 Garut',
    image_url: 'https://i.pravatar.cc/150?img=2',
    achievements: ['Juara 3 Lomba Menulis Cerpen 2023'],
    certificates: [],
    status: 'lulus',
    created_at: '2024-01-02',
  },
  {
    id: '3',
    name: 'Ahmad Rizki',
    slug: 'ahmad-rizki',
    gender: 'Laki-laki',
    category: 'Yatim Piatu',
    birthplace: 'Tasikmalaya',
    birth_date: '20-03-2013',
    address: 'Jl. Anggrek No. 9 Tasikmalaya',
    image_url: 'https://i.pravatar.cc/150?img=4',
    achievements: ['Juara 1 Lomba Pidato 2023', 'Juara 2 Lomba Matematika 2024'],
    certificates: [],
    status: 'lulus',
    created_at: '2024-01-03',
  }
])

const child = computed(() => {
  return children.value.find(c => c.id === childId)
})

const previewCertificate = (url: string) => {
  window.open(url, '_blank')
}
const handleCancel = () => {
  router.push({ name: 'dashboard-foster-children' })
}

const handleEdit = (child: Child) => {
  router.push({
    name: 'dashboard-foster-children-edit',
    params: { id: child.id },
  })
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
            <FontAwesomeIcon :icon="faChildren" size="lg" class="text-primary-400"/>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Detail Anak Asuh</h2>
          </div>
        </div>
      </div>

      <div
        v-if="child"
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="p-6 space-y-5">
          <div class="flex gap-6 items-center ml-6">
            <img
              :src="child.image_url"
              :alt="child.name"
              class="w-20 h-20 object-cover rounded-full border-2 border-green-600">
            <h2 class="text-lg font-semibold text-gray-900">
              {{  child.name }}
            </h2>
          </div>

          <div class="flex-1 space-y-3 text-sm">
            <div class="grid grid-cols-[180px_auto] gap-y-3 gap-x-2 text-sm">
              <div class="text-gray-500">Nama Anak Asuh</div>
              <div>: {{  child.name }}</div>

              <div class="text-gray-500">Jenis Kelamin</div>
              <div>: {{  child.gender }}</div>

              <div class="text-gray-500">Tempat Lahir</div>
              <div>: {{  child.birthplace }}</div>

              <div class="text-gray-500">Tanggal Lahir</div>
              <div>: {{  child.birth_date }}</div>

              <div class="text-gray-500">Alamat</div>
              <div>: {{  child.address }}</div>

              <div class="text-gray-500">Prestasi</div>
              <div class="flex items-start gap-2">
                <span>: </span>
                <ol class="list-decimal list-outside pl-4 text-sm">
                  <li
                    v-for="(achievement, index) in child.achievements"
                    :key="index"
                  >
                    {{ achievement }}
                  </li>
                </ol>
              </div>

              <div class="text-gray-500">
                Piagam Penghargaan
              </div>
              <div class="flex items-start gap-2">
                <span>: </span>
                <div
                  v-if="child.certificates?.length"
                  class="space-y-2">
                  <div
                    v-for="(cert, index) in child.certificates"
                    :key="index"
                    class="flex items-center gap-3">
                    <iframe
                      :src="cert.file_url"
                      class="w-20 h-20 rounded border shrink-0">
                    </iframe>
                    <span class="text-sm">
                      {{ cert.file_name || 'Sertifikat' }}
                    </span>
                    <button
                      @click="previewCertificate(cert.file_url)"
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

            <div class="pt-4 flex items-center gap-40">
              <div class="text-gray-500">
                Status
              </div>
              <span
                :class="[
                  'px-2 py-1 text-xs rounded-full',
                  child.status === 'aktif'
                    ? 'bg-green-100 text-green-800'
                  : child.status === 'lulus'
                    ?'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
                ]">
                {{  child.status === 'aktif' ? 'Aktif' : 'Lulus' }}
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
