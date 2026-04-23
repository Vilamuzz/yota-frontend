<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import type { Child } from '@/types/fosterChildren'
import ChildProfile from '@/components/molecules/ChildProfile.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import router from '@/router'
import { ref, computed } from 'vue'

const route = useRoute()
const childSlug = route.params.slug as string

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
    status: 'nonaktif',
    created_at: '2024-01-03',
  }
])

const child = computed(() => {
  return children.value.find((c) => c.slug === childSlug)
})

const handleBack = () => {
  router.push({ name: 'foster-children' })
}

const handleDonasi = () => {
  router.push({ name: 'donation', params: { slug: childSlug } })
}

</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <div class="sticky top-0 z-40 bg-white px-6 py-4 flex items-center gap-4 font-[Poppins]">
      <!-- Back Button -->
      <button
        class="flex items-center justify-center shrink-0 text-gray-700 hover:text-gray-900 transition"
        @click="handleBack"
      >
        <ArrowLeft :size="28" />
      </button>

      <!-- Title -->
      <h1 class="text-lg md:text-xl font-bold text-color-primary-500)] line-clamp-1">
        {{ child?.name }}
      </h1>
    </div>

    <div class="bg-white rounded-xl border-gray-100 shadow-sm overflow-hidden mx-auto mt-5 w-[90%]">
      <div class="p-6 space-y-5">
        <ChildProfile
          v-if="child"
          :child="child"
        />
        <div class="grid grid-cols-[180px_auto] gap-y-3 gap-x-2 text-sm">
          <div class="text-gray-500">Nama Anak Asuh</div>
          <div>: {{  child?.name }}</div>

          <div class="text-gray-500">Jenis Kelamin</div>
          <div>: {{  child?.gender }}</div>

          <div class="text-gray-500">Tempat Lahir</div>
          <div>: {{  child?.birthplace }}</div>

          <div class="text-gray-500">Tanggal Lahir</div>
          <div>: {{  child?.birth_date }}</div>

          <div class="text-gray-500">Alamat</div>
          <div>: {{  child?.address }}</div>
        </div>
        <div class="flex flex-col gap-3 mt-5">
          <div v-if="child?.certificates?.length"
               class="flex flex-wrap gap-4 mt-6">
            <div v-for="cert in child.certificates"
                :key="cert.id"
                class="w-65 rounded-xl border bg-white shadow-sm overflow-hidden">
              <iframe
                :src="cert.file_url"
                class="w-full h-50">
              </iframe>
            </div>
          </div>
          <p v-else class="text-gray-500 text-sm mt-6">Belum ada sertifikat yang diunggah.</p>
        </div>
        <div class="px-6 pb-4 flex justify-end gap-3">
          <BaseButton variants="primary" @click="handleDonasi" class="rounded-xl" sizes="lg">
            Donasi
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>
