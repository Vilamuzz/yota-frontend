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
  type FosterChildrenParams,
} from '@/types/fosterChildren'

const router = useRouter()

const queryParams = reactive<FosterChildrenParams>({
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
const { fosterChildrenListQuery, fosterChildren, pagination } = useFosterChildrenList(queryParams)

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
    ? 'bg-blue-100 text-blue-800 border-blue-200'
    : 'bg-green-100 text-green-800 border-green-200'
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

const genders = [Gender.male, Gender.female]
const categories = [Category.yatim, Category.piatu, Category.yatimPiatu]

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
                <template #default>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Jenis Kelamin</label>
                      <select
                        v-model="queryParams.gender"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option :value="undefined">All</option>
                        <option v-for="gender in genders" :key="gender" :value="gender">
                          {{ gender.charAt(0).toUpperCase() + gender.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Kategori</label>
                      <select
                        v-model="queryParams.category"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option :value="undefined">All</option>
                        <option v-for="category in categories" :key="category" :value="category">
                          {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Status</label>
                      <select
                        v-model="queryParams.isGraduated"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option :value="undefined">All</option>
                        <option :value="false">Aktif</option>
                        <option :value="true">Lulus</option>
                      </select>
                    </div>

                    <div class="flex gap-2 pt-2">
                      <button
                        @click="clearFilters"
                        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      >
                        Clear
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
      :loading="fosterChildrenListQuery.isPending.value"
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
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">
          Kategori
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">
          Tanggal Ditambahkan
        </th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">Status</th>
        <th class="px-6 py-3 text-center text-xs font-poppins uppercase tracking-wider">Aksi</th>
      </template>

      <template #rows>
        <tr
          v-for="(child, index) in fosterChildren"
          :key="child.id"
          class="hover:bg-gray-50 transition-colors duration-150 dark:hover:bg-gray-700"
        >
          <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-500 dark:text-gray-200">
            {{ pageOffset * (queryParams.limit || 10) + index + 1 }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-200 max-w-50 truncate">
            {{ child.name }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-200 capitalize">
            {{ child.gender }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-200">
            {{ child.category.charAt(0).toUpperCase() + child.category.slice(1) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-200">
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
              class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 dark:hover:bg-gray-700 dark:text-gray-200"
              title="Lihat Detail"
            >
              <Eye :size="18" />
            </button>
            <button
              @click="handleEdit(child)"
              class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 dark:hover:bg-gray-700 dark:text-gray-200"
              title="Edit Anak Asuh"
            >
              <SquarePen :size="18" />
            </button>
            <button
              @click="deleteChild(child)"
              class="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-150 dark:hover:bg-gray-700"
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
