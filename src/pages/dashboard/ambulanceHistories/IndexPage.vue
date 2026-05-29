<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Plus, Trash2, Edit, History, RotateCcw, X as XIcon } from 'lucide-vue-next'
import { useAmbulanceHistoryList } from '@/composables/ambulanceHistory/useAmbulanceHistoryList'
import { useAmbulanceHistoryCreate } from '@/composables/ambulanceHistory/useAmbulanceHistoryCreate'
import { useAmbulanceHistoryUpdate } from '@/composables/ambulanceHistory/useAmbulanceHistoryUpdate'
import { useAmbulanceHistoryDelete } from '@/composables/ambulanceHistory/useAmbulanceHistoryDelete'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import {
  type AmbulanceHistoryQueryParams,
  type AmbulanceHistory,
  type CreateAmbulanceHistoryRequest,
  type UpdateAmbulanceHistoryRequest,
  type ServiceCategory,
  serviceCategoryOptions,
} from '@/types/ambulanceHistory'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import { getStatusColor } from '@/utils/statusColor'
import { formatStatus, getCategoryLabel } from '@/utils/format'
import { useRoute } from 'vue-router'
import { useAmbulanceDetail } from '@/composables/ambulance/useAmbulanceDetail'

const { showToast } = useToast()
const route = useRoute()
const ambulanceId = route.params.id as string

const { detailQuery, isAmbulanceLoading } = useAmbulanceDetail(ambulanceId)
const ambulance = computed(() => detailQuery.data.value?.data)

const queryParams = reactive<AmbulanceHistoryQueryParams>({
  limit: 10,
  ambulanceId: undefined,
  serviceCategory: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]

const { histories, pagination, isLoading } = useAmbulanceHistoryList(ambulanceId, queryParams)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)
const { createMutation } = useAmbulanceHistoryCreate()
const { updateMutation } = useAmbulanceHistoryUpdate()
const { deleteMutation } = useAmbulanceHistoryDelete()

const hasActiveFilters = computed(() => queryParams.serviceCategory !== undefined)

watch(
  () => [queryParams.serviceCategory, queryParams.limit],
  () => resetPagination(),
)

function clearFilters() {
  queryParams.serviceCategory = undefined
  resetPagination()
}

const isDeleteModalOpen = ref(false)
const selectedHistoryId = ref<string | null>(null)

function openDeleteModal(id: string) {
  selectedHistoryId.value = id
  isDeleteModalOpen.value = true
}

function handleConfirmDelete() {
  if (!selectedHistoryId.value) return
  deleteMutation.mutate(selectedHistoryId.value, {
    onSuccess: () => {
      showToast('Riwayat berhasil dihapus', 'success')
      isDeleteModalOpen.value = false
      selectedHistoryId.value = null
    },
    onError: () => {
      showToast('Gagal menghapus riwayat', 'error')
    },
  })
}

const isCreateModalOpen = ref(false)
const createForm = reactive<CreateAmbulanceHistoryRequest>({
  ambulanceId: '',
  driverId: '',
  serviceCategory: '' as ServiceCategory,
  note: '',
})

function openCreateModal() {
  createForm.ambulanceId = ambulance.value?.id || ''
  createForm.driverId = ambulance.value?.driver?.id || ''
  createForm.serviceCategory = '' as ServiceCategory
  createForm.note = ''
  isCreateModalOpen.value = true
}

function handleConfirmCreate() {
  createMutation.mutate(
    { ...createForm },
    {
      onSuccess: () => {
        showToast('Riwayat berhasil ditambahkan', 'success')
        isCreateModalOpen.value = false
      },
      onError: () => {
        showToast('Gagal menambahkan riwayat', 'error')
      },
    },
  )
}

const isEditModalOpen = ref(false)
const editingHistoryId = ref<string | null>(null)
const editForm = reactive<UpdateAmbulanceHistoryRequest>({
  serviceCategory: '' as ServiceCategory,
})

function openEditModal(history: AmbulanceHistory) {
  editingHistoryId.value = history.id
  editForm.serviceCategory = history.serviceCategory
  isEditModalOpen.value = true
}

function handleConfirmEdit() {
  if (!editingHistoryId.value) return
  updateMutation.mutate(
    { id: editingHistoryId.value, data: { ...editForm } },
    {
      onSuccess: () => {
        showToast('Riwayat berhasil diperbarui', 'success')
        isEditModalOpen.value = false
        editingHistoryId.value = null
      },
      onError: () => {
        showToast('Gagal memperbarui riwayat', 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Riwayat Ambulans</template>

    <div class="space-y-6">
      <!-- Stats Grid -->
      <div v-if="!isAmbulanceLoading && ambulance" class="grid grid-cols-1 md:grid-cols-12 gap-5">
        <div
          class="md:col-span-6 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ ambulance.plateNumber }}
          </h1>
          <p class="text-sm text-gray-400 mt-1">Ambulans</p>
        </div>

        <div
          class="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h3 class="text-3xl font-bold text-green-700 dark:text-green-500">
            {{ ambulance.driver.username }}
          </h3>
          <p class="text-sm text-gray-400 mt-1">Driver</p>
        </div>

        <div
          class="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm"
        >
          <h3 class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ formatStatus(ambulance.status) }}
          </h3>
          <p class="text-sm text-gray-400 mt-1">Status</p>
        </div>
      </div>
      <div v-else-if="isAmbulanceLoading" class="animate-pulse flex gap-5">
        <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <BaseButton variant="primary" @click="openCreateModal" class="w-full sm:w-auto">
          <Plus :size="20" class="mr-1" />
          Tambah Riwayat
        </BaseButton>
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default="{ closeDropdown }">
              <div class="space-y-4 w-64">
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Kategori Layanan
                  </label>
                  <select
                    v-model="queryParams.serviceCategory"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Kategori</option>
                    <option
                      v-for="item in serviceCategoryOptions"
                      :key="item.value"
                      :value="item.value"
                    >
                      {{ item.label }}
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
        loading-message="Memuat data riwayat ambulans..."
        :is-empty="histories.length === 0"
        empty-message="Tidak ada data riwayat ambulans"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <History :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Sopir</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Telepon</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Kategori Layanan
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Catatan</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Tgl Dibuat
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(history, index) in histories"
            :key="history.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200 text-sm"
            >
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">
              {{ history.driver.username }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ history.driver.phone }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(history.serviceCategory),
                ]"
              >
                {{ getCategoryLabel(history.serviceCategory, serviceCategoryOptions) }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
              {{ history.note || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ history.createdAt }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  variant="primary"
                  title="Edit Riwayat"
                  @click="openEditModal(history)"
                >
                  <Edit :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  title="Hapus Riwayat"
                  variant="danger"
                  @click="openDeleteModal(history.id)"
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
      title="Hapus Riwayat"
      message="Apakah Anda yakin ingin menghapus data riwayat ini? Tindakan ini tidak dapat dibatalkan."
      variant="danger"
      :primary-button-loading="deleteMutation.isPending.value"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />

    <!-- Create Modal -->
    <ConfirmationModal
      :show="isCreateModalOpen"
      title="Tambah Riwayat Ambulans"
      message="Isi data riwayat ambulans baru:"
      primary-button-text="Simpan"
      secondary-button-text="Batal"
      :icon="Plus"
      :primary-button-loading="createMutation.isPending.value"
      @primary="handleConfirmCreate"
      @secondary="isCreateModalOpen = false"
      @close="isCreateModalOpen = false"
    >
      <div class="mt-4 text-left space-y-3">
        <div>
          <label
            for="create-service-category"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Kategori Layanan
          </label>
          <select
            id="create-service-category"
            v-model="createForm.serviceCategory"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
          >
            <option value="" disabled>-- Pilih Kategori --</option>
            <option v-for="cat in serviceCategoryOptions" :key="cat.value" :value="cat.value">
              {{ cat.label }}
            </option>
          </select>
        </div>
        <div>
          <label
            for="create-note"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Catatan
          </label>
          <textarea
            id="create-note"
            v-model="createForm.note"
            rows="3"
            placeholder="Catatan tambahan (opsional)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm resize-none"
          />
        </div>
      </div>
    </ConfirmationModal>

    <!-- Edit Modal -->
    <ConfirmationModal
      :show="isEditModalOpen"
      title="Edit Riwayat Ambulans"
      message="Perbarui data riwayat ambulans:"
      primary-button-text="Simpan Perubahan"
      secondary-button-text="Batal"
      :icon="XIcon"
      :primary-button-loading="updateMutation.isPending.value"
      @primary="handleConfirmEdit"
      @secondary="isEditModalOpen = false"
      @close="isEditModalOpen = false"
    >
      <div class="mt-4 text-left">
        <label
          for="edit-service-category"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Kategori Layanan
        </label>
        <select
          id="edit-service-category"
          v-model="editForm.serviceCategory"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
        >
          <option value="" disabled>-- Pilih Kategori --</option>
          <option v-for="cat in serviceCategoryOptions" :key="cat.value" :value="cat.value">
            {{ cat.label }}
          </option>
        </select>
      </div>
    </ConfirmationModal>
  </DashboardLayout>
</template>
