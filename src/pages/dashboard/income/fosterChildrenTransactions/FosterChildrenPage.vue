<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, Baby } from 'lucide-vue-next'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { Category, Gender, type FosterChildren } from '@/types/fosterChildren'

const queryParams = reactive({
  search: '',
  gender: 'all',
  category: 'all',
  status: 'all',
  limit: 10,
  page: 1,
})

const searchInput = ref('')
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchInput, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val
    queryParams.page = 1
  }, 500)
})

const limitOptions = [10, 25, 50, 100]
const genders = ['laki-laki', 'perempuan']
const categories = ['yatim', 'piatu', 'yatim piatu']
const statuses = ['aktif', 'lulus']

const clearFilters = () => {
  searchInput.value = ''
  queryParams.search = ''
  queryParams.gender = 'all'
  queryParams.category = 'all'
  queryParams.status = 'all'
  queryParams.page = 1
}

const hasActiveFilters = computed(() => {
  return (
    queryParams.gender !== 'all' || queryParams.category !== 'all' || queryParams.status !== 'all'
  )
})

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
    achievements: [],
    isGraduated: false,
    familyCard: '',
    sktm: '',
    createdAt: '2024-01-01',
  },
])

const filteredChildren = computed(() => {
  return fosterChildren.value.filter((child) => {
    const matchSearch = child.name.toLowerCase().includes(queryParams.search.toLowerCase())
    const matchGender =
      queryParams.gender === 'all' || child.gender.toLowerCase() === queryParams.gender
    const matchCategory =
      queryParams.category === 'all' || child.category.toLowerCase() === queryParams.category

    const childStatus = child.isGraduated ? 'lulus' : 'aktif'
    const matchStatus = queryParams.status === 'all' || childStatus === queryParams.status

    return matchSearch && matchGender && matchCategory && matchStatus
  })
})

const pageOffset = computed(() => queryParams.page - 1)

const paginatedChildren = computed(() => {
  const start = pageOffset.value * queryParams.limit
  const end = start + queryParams.limit
  return filteredChildren.value.slice(start, end)
})

watch([() => queryParams.limit], () => {
  queryParams.page = 1
})

const handleNextPage = () => {
  if (queryParams.page * queryParams.limit < filteredChildren.value.length) {
    queryParams.page++
  }
}

const handlePrevPage = () => {
  if (queryParams.page > 1) {
    queryParams.page--
  }
}

const getStatusColor = (status: boolean) => {
  if (status) {
    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
  }
  return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Donatur Anak Asuh</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <CirclePoundSterling :size="24" class="text-primary-400 dark:text-primary-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Anak Asuh</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Pilih anak asuh untuk melihat riwayat donasinya.
            </p>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <BaseSearch
          v-model="searchInput"
          placeholder="Cari anak asuh..."
          class="w-full sm:max-w-xs"
        />

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2"
                    >Jenis Kelamin</label
                  >
                  <select
                    v-model="queryParams.gender"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option :value="undefined">Semua</option>
                    <option v-for="gender in genders" :key="gender" :value="gender">
                      {{ gender.charAt(0).toUpperCase() + gender.slice(1) }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2"
                    >Kategori</label
                  >
                  <select
                    v-model="queryParams.category"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option :value="undefined">Semua</option>
                    <option v-for="category in categories" :key="category" :value="category">
                      {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                  <select
                    v-model="queryParams.isGraduated"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option :value="undefined">Semua</option>
                    <option
                      v-for="status in statuses"
                      :key="String(status.value)"
                      :value="status.value"
                    >
                      {{ status.label }}
                    </option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
      </div>

      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data anak asuh..."
        :is-empty="fosterChildren.length === 0"
        empty-message="Tidak ada data anak asuh"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <Baby :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Jenis Kelamin
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

          <template #rows>
            <tr
              v-for="(child, index) in paginatedChildren"
              :key="child.id"
              class="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ pageOffset * queryParams.limit + index + 1 }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white max-w-xs truncate"
              >
                {{ child.name }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 capitalize"
              >
                {{ child.gender }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 capitalize"
              >
                {{ child.category }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                {{ formatDate(child.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300',
                    getStatusColor(child.isGraduated),
                  ]"
                >
                  {{ child.isGraduated ? 'Lulus' : 'Aktif' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center gap-2">
                  <RouterLink
                    :to="{
                      name: 'dashboard-foster-children-transaction-detail',
                      params: { id: child.id },
                    }"
                    class="p-2 inline-flex items-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                    title="Lihat Riwayat Donasi"
                  >
                    <Eye :size="18" />
                  </RouterLink>
                </div>
              </td>
            </tr>
          </template>
        </BaseTable>
      </div>
    </div>
  </DashboardLayout>
</template>
