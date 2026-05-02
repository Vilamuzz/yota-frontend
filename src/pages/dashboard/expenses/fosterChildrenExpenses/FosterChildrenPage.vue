<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, Baby, CirclePoundSterling } from 'lucide-vue-next'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { Category, Gender } from '@/types/fosterChildren'
import { formatDate } from '@/utils/format'
import { useFosterChildrenList } from '@/composables/fosterChildren/useFosterChildrenList'
import type { FosterChildrenQueryParams, FosterChildren } from '@/types/fosterChildren'

const router = useRouter()

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
watch(searchInput, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

const limitOptions = [10, 25, 50, 100]
const genders = Object.values(Gender)
const categories = Object.values(Category)

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

const pageOffset = ref(0)

function resetPagination() {
  queryParams.nextCursor = undefined
  queryParams.prevCursor = undefined
  pageOffset.value = 0
}

watch(
  () => [queryParams.gender, queryParams.category, queryParams.isGraduated, queryParams.limit],
  () => resetPagination(),
)

// Fetch foster children via composable
const { fosterChildren, pagination, isLoading } = useFosterChildrenList(queryParams)

const handleNextPage = () => {
  if (pagination.value?.nextCursor) {
    queryParams.nextCursor = pagination.value.nextCursor
    queryParams.prevCursor = undefined
    pageOffset.value += 1
  }
}

const handlePrevPage = () => {
  if (pagination.value?.prevCursor) {
    queryParams.prevCursor = pagination.value.prevCursor
    queryParams.nextCursor = undefined
    pageOffset.value -= 1
  }
}

const handleView = (child: FosterChildren) => {
  router.push({
    name: 'dashboard-foster-children-expense-transaction',
    params: { id: child.id },
  })
}

const getStatusColor = (isGraduated: boolean) => {
  if (isGraduated) {
    return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
  }
  return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
}
</script>

<template>
  <DashboardLayout>
    <template #title>Pengeluaran Anak Asuh</template>

    <div class="space-y-6">
      <div class="">
        <div class="flex flex-col md:flex-col gap-4">
          <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
            <BaseSearch v-model="searchInput" placeholder="Cari anak asuh..." />
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
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
        </div>
      </div>
    </div>

    <BaseTable
      class="mt-6"
      :loading="isLoading"
      loading-message="Memuat data anak asuh..."
      :is-empty="fosterChildren.length === 0"
      empty-message="Tidak ada anak asuh yang ditemukan."
      :has-prev="!!pagination?.prevCursor"
      :has-next="!!pagination?.nextCursor"
      v-model:limit="queryParams.limit"
      :limit-options="limitOptions"
      @prev="handlePrevPage"
      @next="handleNextPage"
    >
      <template #empty-icon>
        <Baby :size="64" class="text-gray-400 dark:text-gray-600" />
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
          Nama Anak Asuh
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
          Status
        </th>
        <th
          class="px-6 py-4 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest"
        >
          Aksi
        </th>
      </template>

      <template #rows>
        <tr
          v-for="(child, index) in fosterChildren"
          :key="child.id"
          class="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-0"
        >
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
            {{ pageOffset * queryParams.limit! + index + 1 }}
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
          <td class="px-6 py-4 whitespace-nowrap">
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
            <button
              @click="handleView(child)"
              class="p-2 inline-flex items-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
              title="Lihat Pengeluaran"
            >
              <Eye :size="18" />
            </button>
          </td>
        </tr>
      </template>
    </BaseTable>
  </DashboardLayout>
</template>
