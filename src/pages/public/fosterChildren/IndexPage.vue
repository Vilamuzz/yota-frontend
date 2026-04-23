<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseSearchChildren from '@/components/atoms/BaseSearchChildren.vue'
import ChildrenCard from '@/components/molecules/ChildrenCard.vue'
import type { Child } from '@/types/fosterChildren'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
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


const handleView = (child: Child) => {
  router.push({ name: 'foster-children-detail', params: { slug: child.slug } })
}
</script>

<template>
  <PublicLayout>

    <BaseSearchChildren v-model="searchQuery" />
    <div class="max-w-6xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6">
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
        <ChildrenCard
          v-for="child in children"
          :key="child.id"
          :children="child"
          @view="handleView"
        />
        <div
          v-if="children.length === 0"
          class="col-span-full text-center py-16 text-gray-400"
        >
          Tidak ada anak asuh aktif saat ini.
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
