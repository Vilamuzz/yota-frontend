<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
import BaseSearchChildren from '@/components/atoms/BaseSearchChildren.vue'
import ChildrenCard from '@/components/molecules/ChildrenCard.vue'
import ChildModal from '@/components/molecules/ChildModal.vue'
import type { Child } from '@/types/fosterChildren'
import { ref } from 'vue'

const searchQuery = ref('')
const children = ref<Child[]>([
  {
    id: '1',
    slug: 'faris-ahad',
    name: 'Faris Ahad',
    age: 11,
    birthplace: 'Sragen',
    birth_date: '2013-01-01',
    address: 'Sragen',
    gender: 'Laki-laki',
    category: 'Yatim',
    achievements: ['Juara 1 Lomba Menggambar 2023', 'Juara 2 Lomba Cerdas Cermat 2024'],
    status: 'aktif',
    image_url: 'https://i.pravatar.cc/150?img=1',
    certificates: [],
    created_at: '2024-01-01',
  },
  {
    id: '2',
    slug: 'tia-mutiara',
    name: 'Tia Mutiara',
    age: 9,
    birthplace: 'Solo',
    birth_date: '2015-01-01',
    address: 'Solo',
    gender: 'Perempuan',
    category: 'Piatu',
    achievements: ['Juara 3 Lomba Menulis Cerpen 2023'],
    status: 'aktif',
    image_url: 'https://i.pravatar.cc/150?img=5',
    certificates: [],
    created_at: '2024-01-01',
  }
])

const detailChild = ref(false)
const selectedChild = ref<Child | null>(null)

const handleView = (child: Child) => {
  selectedChild.value = child
  detailChild.value = true
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
    <ChildModal
      :show="detailChild"
      :child="selectedChild"
      @close="detailChild = false"
    />
  </PublicLayout>
</template>
