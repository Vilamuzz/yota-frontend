<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { Eye, Baby, RotateCcw } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Category, Gender } from '@/types/fosterChildren'
import { ROLES } from '@/const/roles'
import { useFosterChildrenCandidateList } from '@/composables/fosterChildrenCandidate/useFosterChildrenCandidateList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { getStatusColor } from '@/utils/statusColor'
import { formatDate } from '@/utils/format'
import type {
  FosterChildrenCandidate,
  FosterChildrenCandidateQueryParams,
} from '@/types/fosterChildrenCandidate'

const router = useRouter()

// Unified query parameters
const queryParams = reactive<FosterChildrenCandidateQueryParams>({
  limit: 10,
  search: undefined,
  gender: undefined,
  category: undefined,
  status: 'all',
  nextCursor: undefined,
  prevCursor: undefined,
})

const searchInput = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const { candidates, pagination, isLoading } = useFosterChildrenCandidateList(queryParams)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

watch(searchInput, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(
  () => [queryParams.gender, queryParams.category, queryParams.status, queryParams.limit],
  () => resetPagination(),
)

const clearFilters = () => {
  searchInput.value = ''
  queryParams.search = undefined
  queryParams.gender = undefined
  queryParams.category = undefined
  queryParams.status = 'all'
  resetPagination()
}

const genders = Object.values(Gender)
const categories = Object.values(Category)

const authStore = useAuthStore()
const role = computed(() => {
  if (authStore.activeRole === ROLES.CHAIRMAN) return ROLES.CHAIRMAN
  return ROLES.SOCIAL_MANAGER
})

const statusByRole: Record<string, string[]> = {
  [ROLES.CHAIRMAN]: ['Menunggu Verifikasi', 'Disetujui', 'Ditolak'],
  [ROLES.SOCIAL_MANAGER]: ['Diajukan', 'Menunggu Verifikasi', 'Disetujui', 'Ditolak'],
}

const statuses = computed(() => {
  return ['all', ...(statusByRole[role.value] ?? [])]
})

const hasActiveFilters = computed(
  () =>
    queryParams.gender !== undefined ||
    queryParams.category !== undefined ||
    queryParams.status !== 'all',
)

const handleView = (child: FosterChildrenCandidate) => {
  const routeName =
    role.value === ROLES.CHAIRMAN
      ? 'chairman-foster-children-candidates-detail'
      : 'dashboard-foster-children-candidates-detail'

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
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch
            v-model="searchInput"
            placeholder="Cari nama anak..."
            class="w-full sm:max-w-xs"
          />

          <BaseFilter :has-active-filters="hasActiveFilters">
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
                      {{ status === 'all' ? 'Semua Status' : status }}
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

          <BaseButton
            v-if="hasActiveFilters"
            variant="outline"
            size="md"
            @click="clearFilters"
            class="hidden sm:flex"
          >
            <RotateCcw :size="16" class="mr-2" />
            Reset
          </BaseButton>
        </div>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data ajuan..."
        :is-empty="candidates.length === 0"
        empty-message="Tidak ada data ajuan"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="[10, 25, 50]"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
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
            v-for="(child, index) in candidates"
            :key="child.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ pageOffset * (queryParams.limit || 10) + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0"
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
                  'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border',
                  child.gender === Gender.male
                    ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-400'
                    : 'bg-pink-50 border-pink-100 text-pink-700 dark:bg-pink-900/20 dark:border-pink-900/30 dark:text-pink-400',
                ]"
              >
                {{ child.gender }}
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-300 capitalize"
            >
              {{ child.category }}
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
                {{ child.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              {{ formatDate(child.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <button
                @click="handleView(child)"
                class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 dark:hover:bg-gray-700 dark:text-gray-200"
                title="Lihat detail"
              >
                <Eye :size="18" />
              </button>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>
</template>
