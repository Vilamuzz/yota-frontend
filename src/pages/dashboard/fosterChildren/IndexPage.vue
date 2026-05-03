<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, SquarePen, Trash2, Plus, Baby } from 'lucide-vue-next'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { useFosterChildrenList } from '@/composables/fosterChildren/useFosterChildrenList'
import {
  Category,
  Gender,
  type FosterChildren,
  type FosterChildrenQueryParams,
} from '@/types/fosterChildren'

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

const limitOptions = [10, 25, 50, 100]

const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(
  () => [queryParams.gender, queryParams.category, queryParams.isGraduated, queryParams.limit],
  () => resetPagination(),
)

const pageOffset = ref(0)

function resetPagination() {
  queryParams.nextCursor = undefined
  queryParams.prevCursor = undefined
  pageOffset.value = 0
}

// Fetch foster children via composable
const { listQuery, fosterChildren, pagination } = useFosterChildrenList(queryParams)

const displayChildren = computed(() => fosterChildren.value)

function handleNextPage() {
  if (pagination.value?.nextCursor) {
    queryParams.nextCursor = pagination.value.nextCursor
    queryParams.prevCursor = undefined
    pageOffset.value += 1
  }
}

function handlePrevPage() {
  if (pagination.value?.prevCursor) {
    queryParams.prevCursor = pagination.value.prevCursor
    queryParams.nextCursor = undefined
    pageOffset.value -= 1
  }
}

const getStatusColor = (isGraduated: boolean) => {
  return isGraduated
    ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
    : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
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

const hasActiveFilters = computed(
  () =>
    queryParams.gender !== undefined ||
    queryParams.category !== undefined ||
    queryParams.isGraduated !== undefined,
)

function clearFilters() {
  searchQuery.value = ''
  queryParams.gender = undefined
  queryParams.category = undefined
  queryParams.isGraduated = undefined
  resetPagination()
}

const genders = Object.values(Gender)
const categories = Object.values(Category)

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
              <BaseFilter :has-active-filters="hasActiveFilters">
                <template #default="{ closeDropdown }">
                  <div class="space-y-4 w-64">
                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Jenis Kelamin</label>
                      <select
                        v-model="queryParams.gender"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                      >
                        <option :value="undefined">Semua Gender</option>
                        <option v-for="gender in genders" :key="gender" :value="gender">
                          {{ gender.charAt(0).toUpperCase() + gender.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Kategori</label>
                      <select
                        v-model="queryParams.category"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                      >
                        <option :value="undefined">Semua Kategori</option>
                        <option v-for="category in categories" :key="category" :value="category">
                          {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Status</label>
                      <select
                        v-model="queryParams.isGraduated"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                      >
                        <option :value="undefined">Semua Status</option>
                        <option :value="false">Aktif</option>
                        <option :value="true">Lulus</option>
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

              <BaseButton variant="primary" @click="handleCreate">
                <Plus :size="20" class="mr-1" />
                Tambah Anak Asuh
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-300">
      <BaseTable
        :loading="listQuery.isPending.value"
        loading-message="Memuat data anak asuh..."
        :is-empty="displayChildren.length === 0"
        empty-message="Tidak ada anak asuh yang ditemukan."
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
      >
        <template #empty-icon>
          <Baby :size="64" class="text-gray-300 dark:text-gray-600 mb-2" />
        </template>

        <template #headers>
          <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">No</th>
          <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Nama Anak Asuh
          </th>
          <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Jenis Kelamin
          </th>
          <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Kategori
          </th>
          <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Tanggal Ditambahkan
          </th>
          <th class="px-6 py-4 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Status</th>
          <th class="px-6 py-4 text-center text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Aksi</th>
        </template>

        <template #rows>
          <tr
            v-for="(child, index) in displayChildren"
            :key="child.id"
            class="group hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-all duration-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ pageOffset * (queryParams.limit || 10) + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white max-w-xs truncate">
              {{ child.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 capitalize">
              {{ child.gender }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 capitalize">
              {{ child.category }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
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
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all duration-300',
                  getStatusColor(child.isGraduated),
                ]"
              >
                {{ child.isGraduated ? 'Lulus' : 'Aktif' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="handleView(child)"
                  class="p-2 inline-flex items-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                  title="Lihat Detail"
                >
                  <Eye :size="18" />
                </button>
                <button
                  @click="handleEdit(child)"
                  class="p-2 inline-flex items-center text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                  title="Edit Anak Asuh"
                >
                  <SquarePen :size="18" />
                </button>
                <button
                  @click="deleteChild(child)"
                  class="p-2 inline-flex items-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  title="Hapus Anak Asuh"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>

  <ConfirmationModal
    :show="confirmShow"
    :title="`Hapus ${confirmChild?.name}?`"
    :message="`Anak asuh akan dihapus secara permanen dan tidak dapat dipulihkan.`"
    primary-button-text="Hapus"
    secondary-button-text="Batal"
    variant="danger"
    @primary="handleConfirmDelete"
    @secondary="confirmShow = false"
    @close="confirmShow = false"
  />
</template>
