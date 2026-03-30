<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, SquarePen, Trash2, PersonStanding, Plus } from 'lucide-vue-next'
import { useChildList } from '@/composables/fosterchildren/useChildList'
import { useQueryClient } from '@tanstack/vue-query'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import type { Child, ChildParams } from '@/types/child'

const router = useRouter()

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedGender = ref('all')
const selectedCategory = ref('all')
const selectedStatus = ref('all')

const limit = ref(10)
const limitOptions = [10, 25, 50, 100]

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newValue) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newValue
  }, 500)
})

const currentNextCursor = ref<string | undefined>(undefined)
const currentPrevCursor = ref<string | undefined>(undefined)
const direction = ref<'next' | 'prev' | undefined>(undefined)
const pageOffset = ref(0)

const queryParams = computed<ChildParams>(() => {
  const params: ChildParams = { limit: limit.value }

    if (direction.value === 'next' && currentNextCursor.value) {
      params.next_cursor = currentNextCursor.value
    } else if (direction.value === 'prev' && currentPrevCursor.value) {
      params.prev_cursor = currentPrevCursor.value
    }

    if (debouncedSearchQuery.value) {
      params.search = debouncedSearchQuery.value
    }

    if (selectedStatus.value !== 'all') {
      params.status = selectedStatus.value
    }

    return params
})

const resetPagination = () => {
  currentNextCursor.value = undefined
  currentPrevCursor.value = undefined
  direction.value = undefined
  pageOffset.value = 0
}

watch([debouncedSearchQuery, selectedStatus, limit], () => {
  resetPagination()
})

const queryClient = useQueryClient()

const { childListQuery } = useChildList(queryParams)
const children = computed<Child[]>(() => (childListQuery.data.value?.data?.child as Child[]) ?? [])
const pagination = computed(() => childListQuery.data.value?.data?.pagination)

const handleNextPage = () => {
  if (pagination.value?.has_next && pagination.value.next_cursor) {
    currentNextCursor.value = pagination.value.next_cursor
    direction.value = 'next'
    pageOffset.value += 1
  }
}

const handlePrevPage = () => {
  if (pagination.value?.has_prev && pagination.value.prev_cursor) {
    currentPrevCursor.value = pagination.value.prev_cursor
    direction.value = 'prev'
    pageOffset.value -= 1
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'aktif':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-blue-100 text-blue-800'
  }
}

const confirmShow = ref(false)
const  confirmChild = ref<Child | null>(null)

const deleteChild = (child: Child) => {
  confirmChild.value = child
  confirmShow.value = true
}

const handleConfirmDelete = async () => {
  if (!confirmChild.value) return
  queryClient.invalidateQueries({ queryKey: ['child'] })
  confirmShow.value = false
  confirmChild.value = null
}

const clearFilters = () => {
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
  selectedGender.value = 'all'
  selectedCategory.value = 'all'
  selectedStatus.value = 'all'
}

const genders = ['all', 'laki-laki', 'perempuan']
const categories = ['all', 'yatim', 'piatu', 'yatim piatu']
const statuses = ['all', 'aktif', 'lulus']

const handleView = (child: Child) => {
  console.log('Lihat anak asuh:', child.id)
}
const handleCreate = () => {
  router.push({ name: 'dashboard-foster-children-create' })
}

const handleEdit = (child: Child) => {
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
                :has-active-filters="selectedGender !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all'"
              >
                <template #default="{ closeDropdown }">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Jenis Kelamin</label>
                      <select v-model="selectedGender"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option v-for="gender in genders" :key="gender" :value="gender">
                        {{  gender.charAt(0).toUpperCase() + gender.slice(1) }}
                      </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Kategori</label>
                      <select v-model="selectedCategory"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option v-for="category in categories" :key="category" :value="category">
                        {{  category.charAt(0).toUpperCase() + category.slice(1) }}
                      </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Status</label>
                      <select v-model="selectedStatus"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                      <option v-for="status in statuses" :key="status" :value="status">
                        {{  status.charAt(0).toUpperCase() + status.slice(1) }}
                      </option>
                      </select>
                    </div>

                    <div class="flex gap-2 pt-2">
                      <button
                        @click="clearFilters"
                        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150">
                        Clear
                      </button>
                      <button
                        @click="closeDropdown"
                        class="flex-1 px-3 py-2 text-sm bg-primary-300 text-white rounded-lg hover:bg-primary-400 transition-colors duration-150">
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
    :loading="childListQuery.isPending.value"
    loading-message="Memuat data anak asuh..."
    :is-empty="children.length === 0"
    empty-message="Tidak ada anak asuh yang ditemukan."
    :has-prev="pagination?.has_prev"
    :has-next="pagination?.has_next"
    v-model.limit="limit"
    :limit-options="limitOptions"
    @prev="handlePrevPage"
    @next="handleNextPage"
  >
    <template #empty-icon>
      <PersonStanding :size="96" class="text-gray-400" />
    </template>

    <template #headers>
      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nama Anak Asuh</th>
      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Jenis Kelamin</th>
      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tanggal Ditambahkan</th>
      <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
      <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Aksi</th>
    </template>

    <template #rows>
      <tr
        v-for="(child, index) in children"
        :key="child.id"
        class="bg-white hover:bg-gray-50 transition-colors duration-150">

        <td class="px-6 py-4 whitespace-nowrap font-medium">
          {{ pageOffset * limit + index + 1 }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap font-medium max-w-50 truncate">
          {{ child.name }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap font-medium">
          {{ child.gender }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap font-medium">
          {{ child.category.charAt(0).toUpperCase() + child.category.slice(1) }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap font-medium">
          {{ new Date(child.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) }}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-center">
          <span :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    getStatusColor(child.status),
                    ]">
            {{ child.status.charAt(0).toUpperCase() + child.status.slice(1) }}
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
