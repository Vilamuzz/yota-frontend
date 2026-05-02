<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { Eye, Baby, FilterX } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import type { FosterChildrenCandidate } from '@/types/fosterChildrenCandidate'
import { useRouter } from 'vue-router'
import { Category, Gender } from '@/types/fosterChildren'
import { ROLES } from '@/const/roles'

const router = useRouter()

// Unified query parameters
const queryParams = reactive({
  search: '',
  gender: undefined as Gender | undefined,
  category: undefined as Category | undefined,
  status: 'all',
  limit: 10,
  page: 1,
})

// Search debounce logic
const searchInput = ref('')
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchInput, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val
    queryParams.page = 1
  }, 500)
})

const clearFilters = () => {
  searchInput.value = ''
  queryParams.search = ''
  queryParams.gender = undefined
  queryParams.category = undefined
  queryParams.status = 'all'
  queryParams.page = 1
}

const genders = Object.values(Gender)
const categories = Object.values(Category)

const rawRole = localStorage.getItem('role')
const role = ref(rawRole ? rawRole.toLowerCase() : 'social_manager')
if (window.location.pathname.toLowerCase().includes('chairman')) {
  role.value = 'chairman'
}

const statusByRole: Record<string, string[]> = {
  [ROLES.CHAIRMAN]: ['Menunggu Verifikasi', 'Disetujui', 'Ditolak'],
  [ROLES.SOCIAL_MANAGER]: ['Diajukan', 'Menunggu Verifikasi', 'Disetujui', 'Ditolak'],
}

const statuses = computed(() => {
  return ['all', ...(statusByRole[role.value] ?? [])]
})

const pageOffset = computed(() => queryParams.page - 1)

const handleNextPage = () => {
  queryParams.page++
}
const handlePrevPage = () => {
  if (queryParams.page > 1) queryParams.page--
}

// Mock data (replace with API call when ready)
const children = ref<FosterChildrenCandidate[]>([
  {
    id: '1',
    name: 'Faris Ahad',
    slug: 'faris-ahad',
    gender: Gender.male,
    category: Category.yatim,
    birthPlace: 'Bandung',
    birthDate: '2014-05-10',
    address: 'Jl. Melati No. 12 Bandung',
    profilePicture: 'https://i.pravatar.cc/150?img=1',
    isGraduated: false,
    familyCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    sktm: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    submitterName: 'Choi Youngjae',
    submitterPhone: '081234567890',
    submitterAddress: 'Jl. Melati No.2 Bandung',
    submitterIdCard: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    submittedBy: '',
    status: 'Diajukan',
    rejectionReason: '',
    createdAt: '2024-01-01',
    achievements: [],
  },
  {
    id: '2',
    name: 'Sarah Amira',
    slug: 'sarah-amira',
    gender: Gender.female,
    category: Category.piatu,
    birthPlace: 'Jakarta',
    birthDate: '2015-08-15',
    address: 'Jl. Mawar No. 4 Jakarta',
    profilePicture: 'https://i.pravatar.cc/150?img=5',
    isGraduated: false,
    familyCard: '',
    sktm: '',
    achievements: [],
    submittedBy: '',
    submitterName: 'Jung Woojin',
    submitterIdCard: '',
    submitterAddress: '',
    submitterPhone: '',
    status: 'Menunggu Verifikasi',
    rejectionReason: '',
    createdAt: '2024-01-15',
  },
])

const filteredChildren = computed(() => {
  let data = [...children.value]
  if (role.value === ROLES.CHAIRMAN) {
    data = data.filter((child) => child.status !== 'Diajukan')
  }
  if (queryParams.status !== 'all') {
    data = data.filter((child) => child.status === queryParams.status)
  }
  if (queryParams.gender) {
    data = data.filter((child) => child.gender === queryParams.gender)
  }
  if (queryParams.category) {
    data = data.filter((child) => child.category === queryParams.category)
  }
  if (queryParams.search) {
    data = data.filter((child) =>
      child.name.toLowerCase().includes(queryParams.search.toLowerCase()),
    )
  }

  return data
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Disetujui':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    case 'Menunggu Verifikasi':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
    case 'Diajukan':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
    default:
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
  }
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const handleView = (child: FosterChildrenCandidate) => {
  const routeName =
    role.value === 'chairman'
      ? 'chairman-foster-children-submissions-detail'
      : 'dashboard-foster-children-submissions-detail'

  router.push({
    name: routeName,
    params: { id: child.id },
  })
}
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Baby :size="24" class="text-primary-400 dark:text-primary-500" />
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">Ajuan Anak Asuh</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Review dan verifikasi pengajuan anak asuh baru.
            </p>
          </div>
        </div>
      </div>

      <!-- Filters & Search -->
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <BaseSearch
          v-model="searchInput"
          placeholder="Cari nama anak..."
          class="w-full sm:max-w-xs"
        />

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <BaseFilter
            :has-active-filters="
              queryParams.gender !== undefined ||
              queryParams.category !== undefined ||
              queryParams.status !== 'all'
            "
          >
            <template #default="{ closeDropdown }">
              <div class="space-y-4 w-64">
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                    >Jenis Kelamin</label
                  >
                  <select
                    v-model="queryParams.gender"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Gender</option>
                    <option v-for="gender in genders" :key="gender" :value="gender">
                      {{ gender.charAt(0).toUpperCase() + gender.slice(1) }}
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                    >Kategori</label
                  >
                  <select
                    v-model="queryParams.category"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Kategori</option>
                    <option v-for="category in categories" :key="category" :value="category">
                      {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                    >Status</label
                  >
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ status }}
                    </option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    RESET
                  </button>
                  <button
                    @click="closeDropdown"
                    class="flex-1 px-3 py-2 text-xs font-bold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    APPLY
                  </button>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
      </div>

      <!-- Table Content -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300"
      >
        <BaseTable
          :loading="false"
          :is-empty="filteredChildren.length === 0"
          :has-prev="queryParams.page > 1"
          :has-next="filteredChildren.length > queryParams.page * queryParams.limit"
          v-model:limit="queryParams.limit"
          @prev="handlePrevPage"
          @next="handleNextPage"
        >
          <template #empty-icon>
            <FilterX :size="48" class="text-gray-300 dark:text-gray-600" />
          </template>
          <template #empty-message>
            Tidak ada data pengajuan yang ditemukan dengan filter tersebut.
          </template>

          <template #headers>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              No
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Nama Anak
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Jenis Kelamin
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Kategori
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Tgl Pengajuan
            </th>
            <th
              class="px-6 py-4 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Status
            </th>
            <th
              class="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
            >
              Aksi
            </th>
          </template>

          <template #rows>
            <tr
              v-for="(child, index) in filteredChildren.slice((queryParams.page - 1) * queryParams.limit, queryParams.page * queryParams.limit)"
              :key="child.id"
              class="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ pageOffset * queryParams.limit + index + 1 }}
              </td>
              <td
                class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white"
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
                    getStatusColor(child.status),
                  ]"
                >
                  {{ child.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <button
                  @click="handleView(child)"
                  class="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                  title="Lihat Detail"
                >
                  <Eye :size="18" />
                </button>
              </td>
            </tr>
          </template>
        </BaseTable>
      </div>
    </div>
  </DashboardLayout>
</template>
