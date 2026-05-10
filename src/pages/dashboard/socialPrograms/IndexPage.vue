<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, SquarePen, Trash2, Plus, Heart } from 'lucide-vue-next'

import { useSocialProgramList } from '@/composables/socialProgram/useSocialProgramList'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useQueryClient } from '@tanstack/vue-query'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import type { SocialProgram, SocialProgramQueryParams } from '@/types/socialprogramt'
import { getStatusColor } from '@/utils/statusColor'
import { formatCurrency, formatDate } from '@/utils/format'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/const/roles'

const router = useRouter()
const authStore = useAuthStore()

const isChairman = computed(() => authStore.activeRole === ROLES.CHAIRMAN)

const queryParams = reactive<SocialProgramQueryParams>({
  limit: 10,
  search: undefined,
  status: undefined,
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

const { socialPrograms, pagination, isLoading } = useSocialProgramList(queryParams)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

watch(
  () => [queryParams.status, queryParams.limit],
  () => resetPagination(),
)

const hasActiveFilters = computed(() => queryParams.status !== undefined)

const clearFilters = () => {
  searchQuery.value = ''
  queryParams.search = undefined
  queryParams.status = undefined
  resetPagination()
}

const queryClient = useQueryClient()

// DELETE
const confirmShow = ref(false)
const confirmProgram = ref<SocialProgram | null>(null)

const deleteProgram = (program: SocialProgram) => {
  confirmProgram.value = program
  confirmShow.value = true
}

const handleConfirmDelete = async () => {
  if (!confirmProgram.value) return
  // TODO: delete API
  queryClient.invalidateQueries({ queryKey: ['socialprograms'] })
  confirmShow.value = false
  confirmProgram.value = null
}

const statuses = [
  { value: 'active', label: 'Berjalan' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Selesai' },
]

const handleCreate = () => {
  router.push({ name: 'dashboard-social-program-create' })
}

const handleView = (program: SocialProgram) => {
  router.push({
    name: 'dashboard-social-program-detail',
    params: { id: program.id.toString() },
    query: { program: JSON.stringify(program) },
  })
}

const handleEdit = (program: SocialProgram) => {
  router.push({
    name: 'dashboard-social-program-edit',
    params: { id: program.id.toString() },
    query: { program: JSON.stringify(program) },
  })
}
</script>

<template>
  <DashboardLayout>
    <template #title>Data Program Sosial</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch v-model="searchQuery" placeholder="Cari Program..." class="w-full sm:w-64" />
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default="{ closeDropdown }">
              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800"
                  >
                    <option :value="undefined">Semua Status</option>
                    <option v-for="status in statuses" :key="status.value" :value="status.value">
                      {{ status.label }}
                    </option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    Hapus
                  </button>
                  <button
                    @click="closeDropdown"
                    class="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-150"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>

        <BaseButton variant="primary" class="flex items-center gap-2" @click="handleCreate">
          <Plus :size="16" />
          Tambah Program
        </BaseButton>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data program..."
        :is-empty="socialPrograms.length === 0"
        empty-message="Tidak ada data program"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <Heart :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Nama Program
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            {{ isChairman ? 'Nominal Minimal' : 'Total Subscriber' }}
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Tanggal Ditambahkan
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(program, index) in socialPrograms"
            :key="program.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
              {{ program.title }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-right text-gray-600 dark:text-gray-200"
            >
              <span v-if="isChairman">
                {{ formatCurrency(program.minimumAmount) }}
              </span>
              <span v-else>
                {{ program.totalSubscribers }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(program.status),
                ]"
              >
                {{
                  program.status === 'active'
                    ? 'Berjalan'
                    : program.status === 'pending'
                      ? 'Pending'
                      : program.status === 'completed'
                        ? 'Selesai'
                        : program.status
                }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatDate(program.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="handleView(program)"
                  class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 inline-block dark:hover:bg-gray-700 dark:text-gray-200"
                  title="Lihat detail"
                >
                  <Eye :size="18" />
                </button>
                <template v-if="!isChairman">
                  <button
                    @click="handleEdit(program)"
                    class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 inline-block dark:hover:bg-gray-700 dark:text-gray-200"
                    title="Edit program"
                  >
                    <SquarePen :size="18" />
                  </button>
                  <button
                    @click="deleteProgram(program)"
                    class="p-1 hover:bg-red-50 text-red-500 rounded transition-colors duration-150 inline-block dark:hover:bg-red-900/20"
                    title="Hapus program"
                  >
                    <Trash2 :size="18" />
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>

  <!-- MODAL -->
  <ConfirmationModal
    :show="confirmShow"
    :title="`Hapus ${confirmProgram?.title}?`"
    message="Program ini akan dihapus secara permanen."
    primary-button-text="Hapus"
    secondary-button-text="Batal"
    @primary="handleConfirmDelete"
    @secondary="confirmShow = false"
    @close="confirmShow = false"
  />
</template>
