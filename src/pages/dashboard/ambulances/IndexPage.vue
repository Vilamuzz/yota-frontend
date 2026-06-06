<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Plus, Trash2, Edit, Ambulance as AmbulanceIcon } from 'lucide-vue-next'
import { useAmbulanceList } from '@/composables/ambulance/useAmbulanceList'
import { useAmbulanceDelete } from '@/composables/ambulance/useAmbulanceDelete'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import { getStatusColor } from '@/utils/statusColor'
import { type AmbulanceQueryParams, AmbulanceStatus } from '@/types/ambulance'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

const { showToast } = useToast()
const { deleteMutation } = useAmbulanceDelete()

const queryParams = reactive<AmbulanceQueryParams>({
  limit: 10,
  search: undefined,
  status: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const statuses = [
  { label: 'Tersedia', value: AmbulanceStatus.Available },
  { label: 'Sedang Digunakan', value: AmbulanceStatus.InUse },
  { label: 'Pemeliharaan', value: AmbulanceStatus.Maintenance },
]

const { ambulances, pagination, isLoading } = useAmbulanceList(queryParams)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

const isDeleteModalOpen = ref(false)
const selectedAmbulanceId = ref<string | null>(null)

const hasActiveFilters = computed(() => queryParams.status !== undefined)

watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(
  () => [queryParams.status, queryParams.limit],
  () => resetPagination(),
)

function clearFilters() {
  searchQuery.value = ''
  queryParams.status = undefined
  resetPagination()
}

function openDeleteModal(id: string) {
  selectedAmbulanceId.value = id
  isDeleteModalOpen.value = true
}

function handleConfirmDelete() {
  if (selectedAmbulanceId.value) {
    deleteMutation.mutate(selectedAmbulanceId.value, {
      onSuccess: () => {
        showToast('Ambulans berhasil dihapus', 'success')
        isDeleteModalOpen.value = false
        selectedAmbulanceId.value = null
      },
      onError: () => {
        showToast('Gagal menghapus ambulans', 'error')
      },
    })
  }
}

function getStatusLabel(status: string) {
  return statuses.find((s) => s.value === status)?.label || status
}
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Ambulans</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <BaseButton
          variant="primary"
          :to="{ name: 'dashboard-ambulance-create' }"
          class="w-full sm:w-auto"
        >
          <Plus :size="20" class="mr-1" />
          Tambah Ambulans
        </BaseButton>
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Cari plat nomor atau model..."
            class="w-full sm:w-64"
          />
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default="{ closeDropdown }">
              <div class="space-y-4 w-64">
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Status
                  </label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Status</option>
                    <option v-for="status in statuses" :key="status.value" :value="status.value">
                      {{ status.label }}
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

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data ambulans..."
        :is-empty="ambulances.length === 0"
        empty-message="Tidak ada data ambulans"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <AmbulanceIcon :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Plat Nomor
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Sopir</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Telepon</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(ambulance, index) in ambulances"
            :key="ambulance.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200 text-sm"
            >
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">
              {{ ambulance.plateNumber }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ ambulance.driver.username }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ ambulance.driver.phone }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(ambulance.status),
                ]"
              >
                {{ getStatusLabel(ambulance.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  :to="{ name: 'dashboard-ambulance-edit', params: { id: ambulance.id } }"
                  variant="primary"
                  title="Edit Ambulans"
                >
                  <Edit :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  title="Hapus Ambulans"
                  variant="danger"
                  @click="openDeleteModal(ambulance.id)"
                >
                  <Trash2 :size="18" />
                </BaseIconButton>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="isDeleteModalOpen"
      title="Hapus Ambulans"
      message="Apakah Anda yakin ingin menghapus data ambulans ini? Tindakan ini tidak dapat dibatalkan."
      variant="danger"
      :primary-button-loading="deleteMutation.isPending.value"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />
  </DashboardLayout>
</template>
