<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, SquarePen, Trash2, PersonStanding, Plus } from 'lucide-vue-next'
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
    age: 10,
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
    age: 9,
    birthplace: 'Garut',
    birth_date: '2015-02-15',
    address: 'Jl. Mawar No. 5 Garut',
    image_url: 'https://i.pravatar.cc/150?img=2',
    achievements: ['Juara 3 Lomba Menulis Cerpen 2023'],
    certificates: [],
    status: 'aktif',
    created_at: '2024-01-02',
  },
  {
    id: '3',
    name: 'Ahmad Rizki',
    slug: 'ahmad-rizki',
    gender: 'Laki-laki',
    category: 'Yatim Piatu',
    age: 11,
    birthplace: 'Tasikmalaya',
    birth_date: '2013-08-20',
    address: 'Jl. Anggrek No. 9 Tasikmalaya',
    image_url: 'https://i.pravatar.cc/150?img=3',
    achievements: ['Juara 1 Lomba Pidato 2023', 'Juara 2 Lomba Matematika 2024'],
    certificates: [],
    status: 'lulus',
    created_at: '2024-01-03',
  }
])

const pagination = ref({
  has_prev: false,
  has_next: false
})

const handleNextPage = () => {}
const handlePrevPage = () => {}

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
      :is-empty="children.length === 0"
      empty-message="Tidak ada anak asuh yang ditemukan."
      :has-prev="pagination?.has_prev"
      :has-next="pagination?.has_next"
      v-model.limit="limit"
      :limit-options="limitOptions"
      @prev="handlePrevPage"
      @next="handleNextPage"
    >
      <template #empty-icon>
        <PersonStanding :size="96" class="text-gray-400" />
      </template>

      <template #headers>
        <th class="px-6 py-2 text-center text-xs font-medium uppercase tracking-wider">No</th>
        <th class="px-6 py-2 text-center text-xs font-medium uppercase tracking-wider">
          Nama Anak Asuh
        </th>
        <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
          Jenis Kelamin
        </th>
        <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Kategori</th>
        <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
          Tanggal Ditambahkan
        </th>
        <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
        <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
      </template>

      <template #rows>
        <tr
          v-for="(child, index) in children"
          :key="child.id"
          class="bg-white hover:bg-gray-50 transition-colors duration-150"
        >
          <td class="px-6 py-4 whitespace-nowrap font-medium">
            {{ pageOffset * limit + index + 1 }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-medium max-w-50 truncate">
            {{ child.name }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-medium">
            {{ child.gender }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-medium">
            {{ child.category.charAt(0).toUpperCase() + child.category.slice(1) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-medium">
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
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
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
