<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, SquarePen, Trash2, Plus, Baby } from 'lucide-vue-next'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import type { Child } from '@/types/fosterChildren'

const router = useRouter()

const searchQuery = ref('')
const selectedGender = ref('all')
const selectedCategory = ref('all')
const selectedStatus = ref('all')

const limit = ref(10)
const limitOptions = [10, 25, 50, 100]

const pageOffset = ref(0)

const children = ref<Child[]>([
  {
    id: '1',
    name: 'Faris Ahad',
    slug: 'faris-ahad',
    gender: 'Laki-laki',
    category: 'Yatim',
    birthplace: 'Bandung',
    birth_date: '2014-05-10',
    address: 'Jl. Melati No. 12 Bandung',
    image_url: 'https://i.pravatar.cc/150?img=1',
    achievements: ['Juara 1 Lomba Menggambar 2023', 'Juara 2 Lomba Cerdas Cermat 2024'],
    certificates: [],
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
    birth_date: '2015-02-15',
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
    birth_date: '2013-08-20',
    address: 'Jl. Anggrek No. 9 Tasikmalaya',
    image_url: 'https://i.pravatar.cc/150?img=4',
    achievements: ['Juara 1 Lomba Pidato 2023', 'Juara 2 Lomba Matematika 2024'],
    certificates: [],
    status: 'lulus',
    created_at: '2024-01-03',
  },
  {
    id: '4',
    name: 'Siti Nurhaliza',
    slug: 'siti-nurhaliza',
    gender: 'Perempuan',
    category: 'Yatim',
    birthplace: 'Bogor',
    birth_date: '2016-11-05',
    address: 'Jl. Kenanga No. 7 Bogor',
    image_url: 'https://i.pravatar.cc/150?img=3',
    achievements: ['Juara 2 Lomba Menyanyi 2023'],
    certificates: [],
    status: 'aktif',
    created_at: '2024-01-04',
  },
  {
    id: '5',
    name: 'Rizky Ramadhan',
    slug: 'rizky-ramadhan',
    gender: 'Laki-laki',
    category: 'Piatu',
    birthplace: 'Depok',
    birth_date: '2012-09-12',
    address: 'Jl. Melati No. 15 Depok',
    image_url: 'https://i.pravatar.cc/150?img=5',
    achievements: ['Juara 1 Lomba Sepak Bola 2023'],
    certificates: [],
    status: 'lulus',
    created_at: '2024-01-05',
  },
  {
    id: '6',
    name: 'Dewi Sartika',
    slug: 'dewi-sartika',
    gender: 'Perempuan',
    category: 'Yatim Piatu',
    birthplace: 'Sukabumi',
    birth_date: '2014-03-18',
    address: 'Jl. Anggrek No. 12 Sukabumi',
    image_url: 'https://i.pravatar.cc/150?img=6',
    achievements: ['Juara 3 Lomba Tari 2023'],
    certificates: [],
    status: 'aktif',
    created_at: '2024-01-06',
  },
  {
    id: '7',
    name: 'Budi Santoso',
    slug: 'budi-santoso',
    gender: 'Laki-laki',
    category: 'Yatim',
    birthplace: 'Cirebon',
    birth_date: '2013-06-22',
    address: 'Jl. Mawar No. 10 Cirebon',
    image_url: 'https://i.pravatar.cc/150?img=7',
    achievements: ['Juara 2 Lomba Lari 2023'],
    certificates: [],
    status: 'aktif',
    created_at: '2024-01-07',
  },
  {
    id: '8',
    name: 'Ani Wulandari',
    slug: 'ani-wulandari',
    gender: 'Perempuan',
    category: 'Piatu',
    birthplace: 'Purwakarta',
    birth_date: '2015-01-30',
    address: 'Jl. Dahlia No. 8 Purwakarta',
    image_url: 'https://i.pravatar.cc/150?img=8',
    achievements: ['Juara 1 Lomba Membaca Puisi 2024'],
    certificates: [],
    status: 'aktif',
    created_at: '2024-01-08',
  },
  {
    id: '9',
    name: 'Rina Kartika',
    slug: 'rina-kartika',
    gender: 'Perempuan',
    category: 'Yatim Piatu',
    birthplace: 'Majalengka',
    birth_date: '2012-12-05',
    address: 'Jl. Kenanga No. 6 Majalengka',
    image_url: 'https://i.pravatar.cc/150?img=9',
    achievements: ['Juara 2 Lomba Tari Tradisional 2023'],
    certificates: [],
    status: 'lulus',
    created_at: '2024-01-09',
  },
  {
    id: '10',
    name: 'Rian Saputra',
    slug: 'Rian-saputra',
    gender: 'Laki-laki',
    category: 'Yatim',
    birthplace: 'Subang',
    birth_date: '2013-04-17',
    address: 'Jl. Melati No. 20 Subang',
    image_url: 'https://i.pravatar.cc/150?img=10',
    achievements: ['Juara 3 Lomba Catur 2024'],
    certificates: [],
    status: 'aktif',
    created_at: '2024-01-10',
  },
  {
    id: '11',
    name: 'Putri Lestari',
    slug: 'putri-lestari',
    gender: 'Perempuan',
    category: 'Piatu',
    birthplace: 'Indramayu',
    birth_date: '2014-10-09',
    address: 'Jl. Anggrek No. 14 Indramayu',
    image_url: 'https://i.pravatar.cc/150?img=11',
    achievements: ['Juara 1 Lomba Menyanyi 2024'],
    certificates: [],
    status: 'aktif',
    created_at: '2024-01-11',
  }
])

const pagination = ref({
  has_prev: false,
  has_next: false
})

const filteredChildren = computed(() => {
  return children.value.filter(child => {
    const matchSearch =
      child.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchGender =
      selectedGender.value === 'all' ||
      child.gender.toLowerCase() === selectedGender.value
    const matchCategory =
      selectedCategory.value === 'all' ||
      child.category.toLowerCase() === selectedCategory.value

    const matchStatus =
      selectedStatus.value === 'all' ||
      child.status.toLowerCase() === selectedStatus.value

    return (
      matchSearch &&
      matchGender &&
      matchCategory &&
      matchStatus
    )
  })
})

const paginatedChildren = computed(() => {
  const start = pageOffset.value * limit.value
  const end = start + limit.value
  return filteredChildren.value.slice(start, end)
})

watch([pageOffset, limit, filteredChildren], () => {
  pagination.value.has_prev = pageOffset.value > 0
  pagination.value.has_next =
    (pageOffset.value + 1) * limit.value < filteredChildren.value.length
}, { immediate: true })

watch(limit, () => {
  pageOffset.value = 0

  pagination.value.has_prev = false
  pagination.value.has_next =
    limit.value < filteredChildren.value.length
})

watch(
  [searchQuery, selectedGender, selectedCategory, selectedStatus],
  () => {
    pageOffset.value = 0
  }
)

const handleNextPage = () => {
  if (pagination.value.has_next) {
    pageOffset.value++
  }
}

const handlePrevPage = () => {
  if (pagination.value.has_prev) {
    pageOffset.value--
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aktif':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

const confirmShow = ref(false)
const confirmChild = ref<Child | null>(null)

const deleteChild = (child: Child) => {
  confirmChild.value = child
  confirmShow.value = true
}

const handleConfirmDelete = async () => {
  if (!confirmChild.value) return

  const childId = confirmChild.value.id

  const index = children.value.findIndex(
    c => c.id === childId
  )
  if (index !== -1 && children.value[index]) {
  children.value[index].status = 'nonaktif'
}

  confirmShow.value = false
  confirmChild.value = null
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedGender.value = 'all'
  selectedCategory.value = 'all'
  selectedStatus.value = 'all'
}

const genders = ['all', 'laki-laki', 'perempuan']
const categories = ['all', 'yatim', 'piatu', 'yatim piatu']
const statuses = ['all', 'aktif', 'lulus']

const handleView = (child: Child) => {
  router.push({ name: 'dashboard-foster-children-detail', params: { id: child.id } })
}
const handleCreate = () => {
  router.push({ name: 'dashboard-foster-children-create' })
}

const handleEdit = (child: Child) => {
  router.push({ name: 'dashboard-foster-children-edit', params: { id: child.id } })
}
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Anak Asuh </template>

    <div class="space-y-6">
      <div class="">
        <div class="flex flex-col md:flex-col gap-4">
          <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
            <BaseSearch v-model="searchQuery" placeholder="Cari anak asuh..." />
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <BaseFilter
                :has-active-filters="
                  selectedGender !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all'
                "
              >
                <template #default="{ closeDropdown }">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Jenis Kelamin</label>
                      <select
                        v-model="selectedGender"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option v-for="gender in genders" :key="gender" :value="gender">
                          {{ gender.charAt(0).toUpperCase() + gender.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Kategori</label>
                      <select
                        v-model="selectedCategory"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option v-for="category in categories" :key="category" :value="category">
                          {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Status</label>
                      <select
                        v-model="selectedStatus"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option v-for="status in statuses" :key="status" :value="status">
                          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div class="flex gap-2 pt-2">
                      <button
                        @click="clearFilters"
                        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      >
                        Clear
                      </button>
                      <button
                        @click="closeDropdown"
                        class="flex-1 px-3 py-2 text-sm bg-primary-300 text-white rounded-lg hover:bg-primary-400 transition-colors duration-150"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </template>
              </BaseFilter>

              <BaseButton variant="primary" @click="handleCreate">
                <Plus :size="20" class="mr-1" />
                Tambah Anak Asuh
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseTable
      class="mt-6"
      :loading="false"
      loading-message="Memuat data anak asuh..."
      :is-empty="filteredChildren.length === 0"
      empty-message="Tidak ada anak asuh yang ditemukan."
      :has-prev="pagination?.has_prev"
      :has-next="pagination?.has_next"
      v-model.limit="limit"
      :limit-options="limitOptions"
      @prev="handlePrevPage"
      @next="handleNextPage"
    >
      <template #empty-icon>
        <Baby :size="64" class="text-gray-400" />
      </template>

      <template #headers>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">No</th>
        <th class="px-6 py-2 text-center text-xs font-poppins uppercase tracking-wider">
          Nama Anak Asuh
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">
          Jenis Kelamin
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">Kategori</th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">
          Tanggal Ditambahkan
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">Status</th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">Aksi</th>
      </template>

      <template #rows>
        <tr
          v-for="(child, index) in paginatedChildren"
          :key="child.id"
          class="bg-white hover:bg-gray-50 transition-colors duration-150"
        >
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ pageOffset * limit + index + 1 }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins max-w-50 truncate">
            {{ child.name }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ child.gender }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ child.category.charAt(0).toUpperCase() + child.category.slice(1) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{
              new Date(child.created_at).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <span
              :class="[
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-poppins border',
                getStatusColor(child.status),
              ]"
            >
              {{ child.status.charAt(0).toUpperCase() + child.status.slice(1) }}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center relative">
            <button
              @click="handleView(child)"
              class="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
              title="Lihat Detail"
            >
              <Eye :size="18" />
            </button>
            <button
              @click="handleEdit(child)"
              class="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
              title="Edit Anak Asuh"
            >
              <SquarePen :size="18" />
            </button>
            <button
              @click="deleteChild(child)"
              class="p-1 text-red-600 hover:bg-gray-100 rounded transition-colors duration-150"
              title="Delete Anak Asuh"
            >
              <Trash2 :size="18" />
            </button>
          </td>
        </tr>
      </template>
    </BaseTable>
  </DashboardLayout>

  <ConfirmationModal
    :show="confirmShow"
    :title="`Delete ${confirmChild?.name}?`"
    :message="`Anak asuh akan dihapus secara permanen dan tidak dapat dipulihkan.`"
    primary-button-text="Delete"
    secondary-button-text="Cancel"
    @primary="handleConfirmDelete"
    @secondary="confirmShow = false"
    @close="confirmShow = false"
  />
</template>
