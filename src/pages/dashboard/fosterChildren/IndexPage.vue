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
import { useFosterChildrenList } from '@/composables/fosterChildren/useFosterChildrenList'
import { Category, Gender, type FosterChildren, type FosterChildrenParams } from '@/types/fosterChildren'

const router = useRouter()

const children = ref<FosterChildren[]>([
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
        id: '3',
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
    birthPlace: 'Tasikmalaya',
    birthDate: '20-03-2013',
    address: 'Jl. Anggrek No. 9 Tasikmalaya',
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
    familyCard: '',
    sktm: '',
    createdAt: '2024-01-03',
  },
])

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedGender = ref('all')
const selectedCategory = ref('all')
const selectedStatus = ref('all')

const limit = ref(10)
const limitOptions = [10, 25, 50, 100]

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newVal
  }, 500)
})

// Cursor pagination state
const currentNextCursor = ref<string | undefined>(undefined)
const currentPrevCursor = ref<string | undefined>(undefined)
const direction = ref<'next' | 'prev' | undefined>(undefined)
const pageOffset = ref(0)

const queryParams = computed<FosterChildrenParams>(() => {
  const params: FosterChildrenParams = { limit: limit.value }

  if (direction.value === 'next' && currentNextCursor.value) {
    params.nextCursor = currentNextCursor.value
  } else if (direction.value === 'prev' && currentPrevCursor.value) {
    params.prevCursor = currentPrevCursor.value
  }

  if (debouncedSearchQuery.value) {
    params.search = debouncedSearchQuery.value
  }

  if (selectedGender.value !== 'all') {
    params.gender = selectedGender.value as Gender
  }

  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value as Category
  }

  if (selectedStatus.value !== 'all') {
    params.isGraduated = selectedStatus.value === 'lulus'
  }

  return params
})

const resetPagination = () => {
  currentNextCursor.value = undefined
  currentPrevCursor.value = undefined
  direction.value = undefined
  pageOffset.value = 0
}

watch([debouncedSearchQuery, selectedGender, selectedCategory, selectedStatus, limit], () => {
  resetPagination()
})

// Fetch foster children via composable
const { fosterChildrenListQuery, fosterChildren, pagination } = useFosterChildrenList(queryParams)

const displayChildren = computed(() => {
  // kalau API kosong → pakai dummy
  return fosterChildren.value.length
    ? fosterChildren.value
    : children.value
})

const handleNextPage = () => {
  if (pagination.value?.nextCursor) {
    currentNextCursor.value = pagination.value.nextCursor
    direction.value = 'next'
    pageOffset.value += 1
  }
}

const handlePrevPage = () => {
  if (pagination.value?.prevCursor) {
    currentPrevCursor.value = pagination.value.prevCursor
    direction.value = 'prev'
    pageOffset.value -= 1
  }
}

const getStatusColor = (isGraduated: boolean) => {
  return isGraduated ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-green-100 text-green-800 border-green-200'
}

const confirmShow = ref(false)
const confirmChild = ref<FosterChildren | null>(null)
const deleteChild = (child: FosterChildren) => {
  confirmChild.value = child
  confirmShow.value = true
}

const handleConfirmDelete = async () => {
  if (!confirmChild.value) return
  // TODO: Implement delete mutation
  confirmShow.value = false
  confirmChild.value = null
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedGender.value = 'all'
  selectedCategory.value = 'all'
  selectedStatus.value = 'all'
}

const genders = ['all', Gender.male, Gender.female]
const categories = ['all', Category.yatim, Category.piatu, Category.yatimPiatu]
const statuses = ['all', 'aktif', 'lulus']

const handleView = (child: FosterChildren) => {
  router.push({ name: 'dashboard-foster-children-detail', params: { id: child.id } })
}
const handleCreate = () => {
  router.push({ name: 'dashboard-foster-children-create' })
}

const handleEdit = (child: FosterChildren) => {
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
      :loading="fosterChildrenListQuery.isPending.value && displayChildren.length === 0"
      loading-message="Memuat data anak asuh..."
      :is-empty="displayChildren.length === 0"
      empty-message="Tidak ada anak asuh yang ditemukan."
      :has-prev="!!pagination?.prevCursor"
      :has-next="!!pagination?.nextCursor"
      v-model:limit="limit"
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
          v-for="(child, index) in displayChildren"
          :key="child.id"
          class="bg-white hover:bg-gray-50 transition-colors duration-150"
        >
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ pageOffset * limit + index + 1 }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins max-w-50 truncate">
            {{ child.name }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins capitalize">
            {{ child.gender }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{ child.category.charAt(0).toUpperCase() + child.category.slice(1) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap font-poppins">
            {{
              new Date(child.createdAt).toLocaleDateString('id-ID', {
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
                getStatusColor(child.isGraduated),
              ]"
            >
              {{ child.isGraduated ? 'Lulus' : 'Aktif' }}
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
