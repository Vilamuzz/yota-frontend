<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicSearch from '@/components/atoms/BasePublicSearch.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ChildrenCard from '@/components/molecules/ChildrenCard.vue'
import { useFosterChildrenList } from '@/composables/fosterChildren/useFosterChildrenList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { Users, Search, Loader2, X } from 'lucide-vue-next'
import type { FosterChildrenQueryParams, FosterChildren } from '@/types/fosterChildren'

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
    <!-- Hero/Search Section -->
    <div class="relative">
      <BasePublicSearch v-model="searchQuery" placeholder="Cari anak asuh..." />
    </div>

    <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-12">
      <!-- Title & Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div class="flex items-center gap-2 text-primary-500 mb-2">
            <Users :size="20" class="fill-current" />
            <span class="text-sm font-bold uppercase tracking-wider">Generasi Penerus</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-black text-gray-900">
            Masa Depan Mereka, <span class="text-primary-500">Kepedulian Kita</span>
          </h1>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isInitialLoading" class="flex flex-col items-center justify-center py-24">
        <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p class="text-gray-500 font-medium animate-pulse">Menyiapkan data anak asuh...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="isError" class="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
        <div
          class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"
        >
          <X :size="32" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">Gagal Memuat Data</h3>
        <p class="text-gray-600 max-w-md mx-auto">
          {{
            listQuery.error.value?.message ||
            'Terjadi kesalahan sistem saat mencoba mengambil daftar anak asuh.'
          }}
        </p>
        <BaseButton variant="outline" class="mt-6" @click="listQuery.refetch()">
          Coba Lagi
        </BaseButton>
      </div>

      <!-- Main Content -->
      <template v-else>
        <div
          v-if="fosterChildren.length > 0"
          class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
        >
          <ChildrenCard
            v-for="child in fosterChildren"
            :key="child.id"
            :fosterChildren="child"
            @view="handleView"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="py-24 text-center">
          <div
            class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400"
          >
            <Search :size="32" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Anak Asuh Tidak Ditemukan</h3>
          <p class="text-gray-500 max-w-sm mx-auto">
            Maaf, kami tidak dapat menemukan anak asuh dengan kata kunci "{{ searchQuery }}".
          </p>
          <BaseButton variant="outline" class="mt-8" @click="searchQuery = ''">
            Lihat Semua Anak Asuh
          </BaseButton>
        </div>

        <!-- Pagination -->
        <div
          v-if="pagination?.nextCursor || pagination?.prevCursor"
          class="mt-16 flex items-center justify-center gap-4"
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
  </PublicLayout>
</template>

