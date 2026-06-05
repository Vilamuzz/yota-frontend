<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, Baby, GraduationCap } from 'lucide-vue-next'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import { Category, Gender, type FosterChildrenQueryParams } from '@/types/fosterChildren'
import { useFosterChildrenList } from '@/composables/fosterChildren/useFosterChildrenList'
import { useOffsetPagination } from '@/composables/ui/useOffsetPagination'
import { formatDate, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'

const queryParams = reactive<FosterChildrenQueryParams>({
  limit: 10,
  page: 1,
  search: undefined,
  gender: undefined,
  category: undefined,
  isGraduated: undefined,
  sortBy: undefined,
})

const searchInput = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const { fosterChildren, pagination, isLoading } = useFosterChildrenList(queryParams, true)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } = useOffsetPagination(
  queryParams,
  pagination,
)

watch(searchInput, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 500)
})

watch(
  () => [
    queryParams.gender,
    queryParams.category,
    queryParams.isGraduated,
    queryParams.sortBy,
    queryParams.limit,
  ],
  () => resetPagination(),
)

const limitOptions = [10, 25, 50, 100]

const clearFilters = () => {
  searchInput.value = ''
  queryParams.search = undefined
  queryParams.gender = undefined
  queryParams.category = undefined
  queryParams.isGraduated = undefined
  queryParams.sortBy = undefined
  resetPagination()
}

const hasActiveFilters = computed(() => {
  return (
    queryParams.gender !== undefined ||
    queryParams.category !== undefined ||
    queryParams.isGraduated !== undefined ||
    queryParams.sortBy !== undefined
  )
})
</script>

<template>
  <DashboardLayout>
    <div class="space-y-6">
      <!-- Filters & Search -->
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-end">
        <BaseSearch
          v-model="searchInput"
          placeholder="Cari anak asuh..."
          class="w-full sm:max-w-xs"
        />

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default="{ closeDropdown }">
              <div class="space-y-4 w-64">
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Jenis Kelamin
                  </label>
                  <select
                    v-model="queryParams.gender"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Gender</option>
                    <option :value="Gender.male">Laki-laki</option>
                    <option :value="Gender.female">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Kategori
                  </label>
                  <select
                    v-model="queryParams.category"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Kategori</option>
                    <option :value="Category.yatim">Yatim</option>
                    <option :value="Category.piatu">Piatu</option>
                    <option :value="Category.yatimPiatu">Yatim Piatu</option>
                  </select>
                </div>

                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Status Kelulusan
                  </label>
                  <select
                    v-model="queryParams.isGraduated"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Status</option>
                    <option :value="true">Sudah Lulus</option>
                    <option :value="false">Belum Lulus</option>
                  </select>
                </div>

                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Urutkan
                  </label>
                  <select
                    v-model="queryParams.sortBy"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Bawaan (Terbaru)</option>
                    <option value="created_at asc">Terlama Terdaftar</option>
                    <option value="name asc">Nama (A-Z)</option>
                    <option value="name desc">Nama (Z-A)</option>
                    <option value="birth_date asc">Umur Tertua</option>
                    <option value="birth_date desc">Umur Termuda</option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    RESET
                  </button>
                  <button
                    @click="closeDropdown"
                    class="flex-1 px-3 py-2 text-xs font-bold bg-primary-300 text-white rounded-lg hover:bg-primary-500 transition-colors shadow-sm"
                  >
                    APPLY
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
        :has-prev="(queryParams.page ?? 1) > 1"
        :has-next="pagination ? (queryParams.page ?? 1) < pagination.totalPages : false"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
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
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Tanggal Masuk
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(child, index) in fosterChildren"
            :key="child.id"
            class="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ pageOffset * (queryParams.limit ?? 10) + index + 1 }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white max-w-xs truncate"
            >
              {{ child.name }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 capitalize"
            >
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
              class="px-6 py-4 whitespace-nowrap text-left text-sm text-gray-600 dark:text-gray-300"
            >
              {{ formatStatus(child.category) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatDate(child.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(child.isGraduated ? 'completed' : 'active'),
                ]"
              >
                <GraduationCap v-if="child.isGraduated" :size="12" />
                {{ child.isGraduated ? 'Lulus' : 'Aktif' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  :to="{
                    name: 'dashboard-foster-children-transaction-detail',
                    params: { id: child.id },
                  }"
                  title="Lihat Riwayat Donasi"
                  variant="info"
                >
                  <Eye :size="18" />
                </BaseIconButton>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>
</template>
