<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Plus, Trash2, Edit, History, RotateCcw, SquarePen, Eye } from 'lucide-vue-next'
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
  type AmbulanceServiceCategory,
  ambulanceServiceCategoryOptions,
} from '@/types/ambulanceHistory'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import { getCategoryColor } from '@/utils/statusColor'
import { getCategoryLabel } from '@/utils/format'
import { formatPhoneWithDashes } from '@/utils/phone'
import { useRoute } from 'vue-router'
import { useAmbulanceDetail } from '@/composables/ambulance/useAmbulanceDetail'
import { useAdminAmbulanceHistoryList } from '@/composables/ambulanceHistory/useAdminAmbulanceHistoryList'
import { useAmbulanceHistorySummary } from '@/composables/ambulanceHistory/useAmbulanceHistorySummary'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/const/roles'
import { useDriverHistorySummary } from '@/composables/ambulanceHistory/useDriverHistorySummary'
import { useDriverAmbulanceHistoryList } from '@/composables/ambulanceHistory/useDriverAmbulanceHistoryList'
import { useAmbulanceList } from '@/composables/ambulance/useAmbulanceList'

const { showToast } = useToast()
const route = useRoute()
const ambulanceId = route.params.id as string

const authStore = useAuthStore()
const isDriver = computed(() => authStore.activeRole === ROLES.AMBULANCE_DRIVER)

// Fetch ambulance details (for admin/manager)
const { detailQuery, isAmbulanceLoading: isAdminAmbulanceLoading } = useAmbulanceDetail(ambulanceId)

// Fetch assigned ambulance (for driver)
const driverAmbulanceParams = ref({ limit: 1 })
const { ambulances: driverAmbulances, isLoading: isDriverAmbulanceLoading } = useAmbulanceList(
  driverAmbulanceParams,
  isDriver,
)

const ambulance = computed(() => {
  if (isDriver.value) {
    return driverAmbulances.value[0]
  }
  return detailQuery.data.value?.data
})

const isAmbulanceLoading = computed(() => {
  if (isDriver.value) {
    return isDriverAmbulanceLoading.value
  }
  return isAdminAmbulanceLoading.value
})

// Fetch summary metrics (for admin/manager)
const { summary: adminSummary, isLoading: isAdminSummaryLoading } = useAmbulanceHistorySummary(
  ambulanceId,
  computed(() => ({})),
  computed(() => !isDriver.value),
)

// Fetch summary metrics (for driver)
const { summaryQuery: driverSummaryQuery } = useDriverHistorySummary(undefined, isDriver)

const summary = computed(() => {
  if (isDriver.value) {
    return driverSummaryQuery.data.value?.data
  }
  return adminSummary.value
})

const isSummaryLoading = computed(() => {
  if (isDriver.value) {
    return driverSummaryQuery.isPending.value
  }
  return isAdminSummaryLoading.value
})

const getCategoryCount = (catValue: string) => {
  return summary.value?.categories?.find((c) => c.category === catValue)?.count || 0
}

const queryParams = reactive<AmbulanceHistoryQueryParams>({
  limit: 10,
  ambulanceId: undefined,
  serviceCategory: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]

// Fetch history list (for admin/manager)
const {
  histories: adminHistories,
  pagination: adminPagination,
  isLoading: isAdminHistoriesLoading,
} = useAdminAmbulanceHistoryList(
  ambulanceId,
  queryParams,
  computed(() => !isDriver.value),
)

// Fetch history list (for driver)
const {
  histories: driverHistories,
  pagination: driverPagination,
  isLoading: isDriverHistoriesLoading,
} = useDriverAmbulanceHistoryList(queryParams, isDriver)

const histories = computed(() => {
  if (isDriver.value) {
    return driverHistories.value
  }
  return adminHistories.value
})

const pagination = computed(() => {
  if (isDriver.value) {
    return driverPagination.value
  }
  return adminPagination.value
})

const isLoading = computed(() => {
  if (isDriver.value) {
    return isDriverHistoriesLoading.value
  }
  return isAdminHistoriesLoading.value
})

const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

const { createMutation, createDriverMutation } = useAmbulanceHistoryCreate()
const { updateMutation, updateDriverMutation } = useAmbulanceHistoryUpdate()
const { deleteMutation, deleteDriverMutation } = useAmbulanceHistoryDelete()

const activeDeleteMutation = computed(() =>
  isDriver.value ? deleteDriverMutation : deleteMutation,
)
const activeCreateMutation = computed(() =>
  isDriver.value ? createDriverMutation : createMutation,
)
const activeUpdateMutation = computed(() =>
  isDriver.value ? updateDriverMutation : updateMutation,
)

const isDeletePending = computed(() => activeDeleteMutation.value.isPending.value)
const isCreatePending = computed(() => activeCreateMutation.value.isPending.value)
const isUpdatePending = computed(() => activeUpdateMutation.value.isPending.value)

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
  activeDeleteMutation.value.mutate(selectedHistoryId.value, {
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
  serviceCategory: '' as AmbulanceServiceCategory,
  note: '',
})

function openCreateModal() {
  createForm.ambulanceId = ambulance.value?.id || ''
  createForm.driverId = ambulance.value?.driver?.id || ''
  createForm.serviceCategory = '' as AmbulanceServiceCategory
  createForm.note = ''
  isCreateModalOpen.value = true
}

function handleConfirmCreate() {
  activeCreateMutation.value.mutate(
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

const isDetailModalOpen = ref(false)
const selectedHistory = ref<AmbulanceHistory | null>(null)

function openDetailModal(history: AmbulanceHistory) {
  selectedHistory.value = history
  isDetailModalOpen.value = true
}

const isEditModalOpen = ref(false)
const editingHistoryId = ref<string | null>(null)
const editForm = reactive<UpdateAmbulanceHistoryRequest>({
  serviceCategory: '' as AmbulanceServiceCategory,
  note: '',
})

function openEditModal(history: AmbulanceHistory) {
  editingHistoryId.value = history.id ?? null
  editForm.serviceCategory = history.serviceCategory
  editForm.note = history.note ?? ''
  isEditModalOpen.value = true
}

function handleConfirmEdit() {
  if (!editingHistoryId.value) return
  activeUpdateMutation.value.mutate(
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
      <div
        v-if="!isAmbulanceLoading && ambulance"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        <!-- Plate Number -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between"
        >
          <h1 class="text-xl font-bold text-gray-900 dark:text-white truncate font-mono">
            {{ ambulance.plateNumber }}
          </h1>
          <p class="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Ambulans</p>
        </div>

        <!-- Layanan Darurat -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-red-100/50 dark:border-red-950/20 bg-gradient-to-br from-white to-red-50/10 dark:from-gray-800 dark:to-red-950/10 shadow-sm flex flex-col justify-between"
        >
          <h3 class="text-xl font-bold text-red-600 dark:text-red-400">
            {{ getCategoryCount('emergency_service') }}
          </h3>
          <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold truncate">
            Layanan Darurat
          </p>
        </div>

        <!-- Layanan Pasien -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-blue-100/50 dark:border-blue-950/20 bg-gradient-to-br from-white to-blue-50/10 dark:from-gray-800 dark:to-blue-950/10 shadow-sm flex flex-col justify-between"
        >
          <h3 class="text-xl font-bold text-blue-600 dark:text-blue-400">
            {{ getCategoryCount('patient_service') }}
          </h3>
          <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold truncate">
            Layanan Pasien
          </p>
        </div>

        <!-- Layanan Jenazah -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-purple-100/50 dark:border-purple-950/20 bg-gradient-to-br from-white to-purple-50/10 dark:from-gray-800 dark:to-purple-950/10 shadow-sm flex flex-col justify-between"
        >
          <h3 class="text-xl font-bold text-purple-600 dark:text-purple-400">
            {{ getCategoryCount('mortuary_service') }}
          </h3>
          <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold truncate">
            Layanan Jenazah
          </p>
        </div>

        <!-- Layanan Sosial -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-green-100/50 dark:border-green-950/20 bg-gradient-to-br from-white to-green-50/10 dark:from-gray-800 dark:to-green-950/10 shadow-sm flex flex-col justify-between"
        >
          <h3 class="text-xl font-bold text-green-600 dark:text-green-400">
            {{ getCategoryCount('social_service') }}
          </h3>
          <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold truncate">
            Layanan Sosial
          </p>
        </div>

        <!-- Layanan Lainnya -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between"
        >
          <h3 class="text-xl font-bold text-gray-650 dark:text-gray-450">
            {{ getCategoryCount('other_service') }}
          </h3>
          <p class="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-semibold truncate">
            Layanan Lainnya
          </p>
        </div>
      </div>
      <div
        v-else-if="isAmbulanceLoading || isSummaryLoading"
        class="animate-pulse grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4"
      >
        <div
          v-for="i in 7"
          :key="i"
          class="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"
        ></div>
      </div>

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <BaseButton variant="primary" @click="openCreateModal" class="w-full sm:w-auto">
          <Plus :size="20" class="mr-1" />
          Tambah Riwayat
        </BaseButton>
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default>
              <div class="space-y-4 w-64">
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
                  >
                    Kategori Layanan
                  </label>
                  <select
                    v-model="queryParams.serviceCategory"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Kategori</option>
                    <option
                      v-for="item in ambulanceServiceCategoryOptions"
                      :key="item.value"
                      :value="item.value"
                    >
                      {{ item.label }}
                    </option>
                  </select>
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
              <a
                :href="`https://wa.me/62${history.driver.phone.replace(/^(\+62|62|0)/, '')}`"
                target="_blank"
                class="text-sm font-semibold text-primary-200 hover:underline inline-flex items-center"
              >
                {{ formatPhoneWithDashes(history.driver.phone) }}
              </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getCategoryColor(history.serviceCategory),
                ]"
              >
                {{ getCategoryLabel(history.serviceCategory, ambulanceServiceCategoryOptions) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ history.createdAt }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  variant="info"
                  title="Lihat Detail"
                  @click="openDetailModal(history)"
                >
                  <Eye :size="18" />
                </BaseIconButton>
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
                  @click="openDeleteModal(history.id!)"
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
      :primary-button-loading="isDeletePending"
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
      :primary-button-loading="isCreatePending"
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
            <option
              v-for="cat in ambulanceServiceCategoryOptions"
              :key="cat.value"
              :value="cat.value"
            >
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
      :icon="SquarePen"
      :primary-button-loading="isUpdatePending"
      @primary="handleConfirmEdit"
      @secondary="isEditModalOpen = false"
      @close="isEditModalOpen = false"
    >
      <div class="mt-4 text-left space-y-3">
        <div>
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
            <option
              v-for="cat in ambulanceServiceCategoryOptions"
              :key="cat.value"
              :value="cat.value"
            >
              {{ cat.label }}
            </option>
          </select>
        </div>
        <div>
          <label
            for="edit-note"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Catatan
          </label>
          <textarea
            id="edit-note"
            v-model="editForm.note"
            rows="3"
            placeholder="Catatan tambahan (opsional)"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm resize-none"
          />
        </div>
      </div>
    </ConfirmationModal>

    <!-- Detail Modal -->
    <ConfirmationModal
      :show="isDetailModalOpen"
      title="Detail Riwayat Ambulans"
      message=""
      secondary-button-text="Tutup"
      :icon="History"
      @secondary="isDetailModalOpen = false"
      @close="isDetailModalOpen = false"
    >
      <div class="mt-4 text-left space-y-4">
        <div>
          <p
            class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
          >
            Kategori Layanan
          </p>
          <span
            :class="[
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
              getCategoryColor(selectedHistory?.serviceCategory || ''),
            ]"
          >
            {{
              getCategoryLabel(
                selectedHistory?.serviceCategory || '',
                ambulanceServiceCategoryOptions,
              )
            }}
          </span>
        </div>
        <div>
          <p
            class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5"
          >
            Catatan
          </p>
          <div
            class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-gray-200 border border-gray-150 dark:border-gray-700 whitespace-pre-wrap min-h-[5rem]"
          >
            {{ selectedHistory?.note || '-' }}
          </div>
        </div>
      </div>
    </ConfirmationModal>
  </DashboardLayout>
</template>
