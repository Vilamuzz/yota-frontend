<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, Baby } from 'lucide-vue-next'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { Category, Gender, type FosterChildrenQueryParams } from '@/types/fosterChildren'
import { useFosterChildrenList } from '@/composables/fosterChildren/useFosterChildrenList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { formatDate } from '@/utils/format'

const queryParams = reactive<FosterChildrenQueryParams>({
  limit: 10,
  search: undefined,
  gender: undefined,
  category: undefined,
  isGraduated: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const searchInput = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const { fosterChildren, pagination, isLoading } = useFosterChildrenList(queryParams)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

watch(searchInput, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 500)
})

const limitOptions = [10, 25, 50, 100]
const genders = Object.values(Gender)
const categories = Object.values(Category)
const statuses = [
  { label: 'Aktif', value: false },
  { label: 'Lulus', value: true },
]

const clearFilters = () => {
  searchInput.value = ''
  queryParams.search = undefined
  queryParams.gender = undefined
  queryParams.category = undefined
  queryParams.isGraduated = undefined
  resetPagination()
}

const hasActiveFilters = computed(() => {
  return (
    queryParams.gender !== undefined ||
    queryParams.category !== undefined ||
    queryParams.isGraduated !== undefined
  )
})

const getStatusColor = (isGraduated: boolean) => {
  if (isGraduated) {
    return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
  }
  return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
}
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
            <template #default>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2"
                    >Jenis Kelamin</label
                  >
                  <select
                    v-model="queryParams.gender"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800"
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
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800"
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
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800"
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

                <div class="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 text-gray-600 dark:text-gray-300"
                  >
                    Reset
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
  </DashboardLayout>
</template>
