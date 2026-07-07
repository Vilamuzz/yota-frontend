<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { Eye, Baby } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { useAuthStore } from '@/stores/auth'
import { Category, Gender } from '@/types/fosterChildren'
import { ROLES } from '@/const/roles'
import { useFosterChildrenCandidateList } from '@/composables/fosterChildrenCandidate/useFosterChildrenCandidateList'
import { useOffsetPagination } from '@/composables/ui/useOffsetPagination'
import { getStatusColor } from '@/utils/statusColor'
import { formatDate, formatStatus } from '@/utils/format'
import {
  FosterChildrenCandidateStatus,
  type FosterChildrenCandidateAdminQueryParams,
} from '@/types/fosterChildrenCandidate'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

// Unified query parameters
const queryParams = reactive<FosterChildrenCandidateAdminQueryParams>({
  limit: 10,
  page: 1,
  search: undefined,
  gender: undefined,
  category: undefined,
  status: undefined,
  sortBy: undefined,
})

const searchInput = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const { candidates, pagination, isLoading } = useFosterChildrenCandidateList(queryParams)
const filteredCandidates = computed(() => {
  if (role.value === ROLES.CHAIRMAN) {
    return candidates.value.filter(
      (candidate) => candidate.status !== FosterChildrenCandidateStatus.PENDING,
    )
  }
  return candidates.value
})
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } = useOffsetPagination(
  queryParams,
  pagination,
)

watch(searchInput, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(
  () => [
    queryParams.gender,
    queryParams.category,
    queryParams.status,
    queryParams.sortBy,
    queryParams.limit,
  ],
  () => resetPagination(),
)

const genders = Object.values(Gender)
const categories = Object.values(Category)

const authStore = useAuthStore()
const role = computed(() => {
  if (authStore.activeRole === ROLES.CHAIRMAN) return ROLES.CHAIRMAN
  return ROLES.SOCIAL_MANAGER
})

const statusByRole = computed(() => {
  const common = [
    { label: 'Diterima Koordinator Sosial', value: FosterChildrenCandidateStatus.SOCIAL_MANAGER_ACCEPTED },
    { label: 'Diterima', value: FosterChildrenCandidateStatus.ACCEPTED },
    { label: 'Ditolak', value: FosterChildrenCandidateStatus.REJECTED },
  ]

  if (role.value === ROLES.SOCIAL_MANAGER) {
    return [{ label: 'Tertunda', value: FosterChildrenCandidateStatus.PENDING }, ...common]
  }

  return common
})

const hasActiveFilters = computed(
  () =>
    queryParams.gender !== undefined ||
    queryParams.category !== undefined ||
    queryParams.status !== undefined ||
    queryParams.sortBy !== undefined,
)
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Filters & Search -->
      <div class="flex flex-col md:flex-row gap-4 justify-end items-start md:items-center">
        <!-- Search and Filter Controls -->
        <div class="flex flex-row gap-3 w-full md:w-auto">
          <BaseSearch v-model="searchInput" placeholder="Cari nama anak..." class="flex-1 w-full" />

          <BaseFilter :has-active-filters="hasActiveFilters" class="w-auto shrink-0">
            <template #default>
              <div class="space-y-4 w-64">
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
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
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
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
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
                    >Status</label
                  >
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Status</option>
                    <option
                      v-for="status in statusByRole"
                      :key="status.value"
                      :value="status.value"
                    >
                      {{ status.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
                    >Urutkan</label
                  >
                  <select
                    v-model="queryParams.sortBy"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Default</option>
                    <option value="created_at desc">Terbaru</option>
                    <option value="created_at asc">Terlama</option>
                    <option value="name asc">Nama (A-Z)</option>
                    <option value="name desc">Nama (Z-A)</option>
                  </select>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data ajuan..."
        :is-empty="filteredCandidates.length === 0"
        empty-message="Tidak ada data ajuan"
        :has-prev="(queryParams.page ?? 1) > 1"
        :has-next="pagination ? (queryParams.page ?? 1) < pagination.totalPages : false"
        v-model:limit="queryParams.limit"
        :limit-options="[10, 25, 50]"
        @prev="handlePrevPage"
        @next="handleNextPage"
      >
        <template #empty-icon>
          <Baby :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Anak</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Gender</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Kategori
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pengaju</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(child, index) in filteredCandidates"
            :key="child.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ pageOffset * (queryParams.limit || 10) + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0"
                >
                  <img
                    v-if="child.profilePicture"
                    :src="child.profilePicture"
                    class="w-full h-full object-cover"
                    :alt="child.name"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <Baby :size="16" />
                  </div>
                </div>
                <div class="font-medium text-gray-900 dark:text-white text-sm">
                  {{ child.name }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  child.gender === Gender.male
                    ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-400'
                    : 'bg-pink-50 border-pink-100 text-pink-700 dark:bg-pink-900/20 dark:border-pink-900/30 dark:text-pink-400',
                ]"
              >
                {{ child.gender === Gender.male ? 'Laki-laki' : 'Perempuan' }}
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-300 capitalize"
            >
              {{ formatStatus(child.category) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              {{ child.submitterName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(child.status),
                ]"
              >
                {{ formatStatus(child.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(child.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <BaseIconButton
                :to="{
                  name: 'dashboard-foster-children-candidates-detail',
                  params: { id: child.id },
                }"
                title="Lihat detail"
                variant="info"
              >
                <Eye :size="18" />
              </BaseIconButton>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>
</template>
