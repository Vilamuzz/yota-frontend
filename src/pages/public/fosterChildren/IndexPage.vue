<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseSearchChildren from '@/components/atoms/BaseSearchChildren.vue'
import ChildrenCard from '@/components/molecules/ChildrenCard.vue'
import { Category, Gender, type FosterChildren } from '@/types/fosterChildren'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')
const fosterChildren = ref<FosterChildren[]>([
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
    familyCard: '',
    sktm: '',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Tia Mutiara',
    slug: 'tia-mutiara',
    gender: Gender.female,
    category: Category.piatu,
    birthPlace: 'Garut',
    birthDate: '15-02-2015',
    address: 'Jl. Mawar No. 5 Garut',
    profilePicture: 'https://i.pravatar.cc/150?img=2',
    achievements: [
      {
        id: '1',
        title: 'Juara 3 Lomba Menulis Cerpen 2023',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        alt: 'Juara 3 Lomba Menulis Cerpen.pdf',
      }
    ],
    isGraduated: false,
    familyCard: '',
    sktm: '',
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    name: 'Ahmad Rizki',
    slug: 'ahmad-rizki',
    gender: Gender.male,
    category: Category.yatimPiatu,
    birthPlace: 'Tasikmalay',
    birthDate: '20-03-2013',
    address: 'Jl. Anggrek No. 9 Tasikmalaya',
    profilePicture: 'https://i.pravatar.cc/150?img=4',
    achievements: [
      {
        id: '1',
        title: 'Juara 1 Lomba Pidato 2023',
        url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        alt: 'Juara 1 Lomba Pidato.pdf',
      }
    ],
    isGraduated: false,
    familyCard: '',
    sktm: '',
    createdAt: '2024-01-03',
  },
])

const handleView = (child: FosterChildren) => {
  router.push({ name: 'foster-children-detail', params: { slug: child.slug } })
}
</script>

<template>
  <PublicLayout>
    <BaseSearchChildren v-model="searchQuery" />
    <div
      class="max-w-6xl mx-auto bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-6"
    >
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-6">
        <ChildrenCard
          v-for="child in fosterChildren"
          :key="child.id"
          :fosterChildren="child"
          @view="handleView"
        />
        <div
          v-if="fosterChildren.length === 0"
          class="col-span-full text-center py-16 text-gray-400"
        >
          Tidak ada anak asuh aktif saat ini.
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
