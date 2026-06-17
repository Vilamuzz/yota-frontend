<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Check, X as XIcon, ClipboardList, AlertCircle, Eye, Play } from 'lucide-vue-next'
import { useAmbulanceServiceList } from '@/composables/ambulanceService/useAmbulanceServiceList'
import { useAssignedAmbulanceServiceList } from '@/composables/ambulanceService/useAssignedAmbulanceServiceList'
import { useAssignedAmbulanceServiceUpdate } from '@/composables/ambulanceService/useAssignedAmbulanceServiceUpdate'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import {
  type AmbulanceServiceQueryParams,
  type AmbulanceService,
  AmbulanceServiceStatus,
} from '@/types/ambulanceService'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { useAmbulanceServiceUpdate } from '@/composables/ambulanceService/useAmbulanceServiceUpdate'
import { getStatusColor } from '@/utils/statusColor'
import { formatStatus, getCategoryLabel } from '@/utils/format'
import { ambulanceServiceCategoryOptions } from '@/types/ambulanceHistory'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import RejectConfirmationModal from '@/components/organisms/RejectConfirmationModal.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { useAmbulanceList } from '@/composables/ambulance/useAmbulanceList'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/const/roles'
import { useAmbulanceDetail } from '@/composables/ambulance/useAmbulanceDetail'

const { showToast } = useToast()
const authStore = useAuthStore()
const isDriver = computed(() => authStore.activeRole === ROLES.AMBULANCE_DRIVER)

const route = useRoute()
const ambulanceId = route.params.ambulanceId as string

const { detailQuery, isAmbulanceLoading } = useAmbulanceDetail(ambulanceId)
const ambulance = computed(() => detailQuery.data.value?.data)

const queryParams = reactive<AmbulanceServiceQueryParams>({
  limit: 10,
  search: undefined,
  status: undefined,
  serviceCategory: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]
const statuses = [
  { label: 'Tertunda', value: 'pending' },
  { label: 'Disetujui', value: 'approved' },
  { label: 'Dalam Layanan', value: 'in_service' },
  { label: 'Selesai', value: 'done' },
  { label: 'Ditolak', value: 'rejected' },
  { label: 'Dibatalkan', value: 'cancelled' },
]
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const managerList = useAmbulanceServiceList(
  queryParams,
  computed(() => !isDriver.value),
)
const driverList = useAssignedAmbulanceServiceList(
  ambulanceId,
  queryParams,
  computed(() => isDriver.value && !!ambulanceId),
)

const ambulanceServices = computed(() =>
  isDriver.value ? driverList.ambulanceServices.value : managerList.ambulanceServices.value,
)
const pagination = computed(() =>
  isDriver.value ? driverList.pagination.value : managerList.pagination.value,
)
const isLoading = computed(() =>
  isDriver.value ? driverList.isLoading.value : managerList.isLoading.value,
)

const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

const hasActiveFilters = computed(
  () =>
    queryParams.status !== undefined ||
    queryParams.serviceCategory !== undefined ||
    !!searchQuery.value,
)

watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(
  () => [queryParams.status, queryParams.serviceCategory, queryParams.limit],
  () => resetPagination(),
)

function clearFilters() {
  searchQuery.value = ''
  queryParams.status = undefined
  queryParams.serviceCategory = undefined
  resetPagination()
}

const { acceptMutation, rejectMutation } = useAmbulanceServiceUpdate()

const acceptModalShow = ref(false)
const acceptServiceId = ref<string | null>(null)
const selectedAmbulanceId = ref('')

const { ambulances, isLoading: isLoadingAmbulances } = useAmbulanceList(
  { limit: 100 },
  computed(() => true),
)

function handleAccept(id: string) {
  acceptServiceId.value = id
  selectedAmbulanceId.value = ''
  acceptModalShow.value = true
}

function handleConfirmAccept() {
  if (!acceptServiceId.value || !selectedAmbulanceId.value) return
  acceptMutation.mutate(
    { id: acceptServiceId.value, payload: { ambulanceId: selectedAmbulanceId.value } },
    {
      onSuccess: () => {
        showToast('Permintaan berhasil disetujui', 'success')
        acceptModalShow.value = false
        acceptServiceId.value = null
      },
      onError: () => {
        showToast('Gagal menyetujui permintaan', 'error')
      },
    },
  )
}

const rejectModalShow = ref(false)
const rejectService = ref<AmbulanceService | null>(null)

function handleReject(service: AmbulanceService) {
  rejectService.value = service
  rejectModalShow.value = true
}

function handleConfirmReject(rejectReason: string) {
  if (!rejectService.value) return
  rejectMutation.mutate(
    { id: rejectService.value.id, payload: { rejectionReason: rejectReason } },
    {
      onSuccess: () => {
        showToast('Permintaan berhasil ditolak', 'success')
        rejectModalShow.value = false
        rejectService.value = null
      },
      onError: () => {
        showToast('Gagal menolak permintaan', 'error')
      },
    },
  )
}

// START & COMPLETE (DRIVER)
const { startMutation, completeMutation } = useAssignedAmbulanceServiceUpdate()

const startModalShow = ref(false)
const completeModalShow = ref(false)
const actionServiceId = ref<string | null>(null)

function handleStart(id: string) {
  actionServiceId.value = id
  startModalShow.value = true
}

function handleConfirmStart() {
  if (!actionServiceId.value) return
  startMutation.mutate(
    { ambulanceId, id: actionServiceId.value },
    {
      onSuccess: () => {
        showToast('Layanan ambulans berhasil dimulai', 'success')
        startModalShow.value = false
        actionServiceId.value = null
      },
      onError: () => {
        showToast('Gagal memulai layanan ambulans', 'error')
      },
    },
  )
}

function handleComplete(id: string) {
  actionServiceId.value = id
  completeModalShow.value = true
}

function handleConfirmComplete() {
  if (!actionServiceId.value) return
  completeMutation.mutate(
    { ambulanceId, id: actionServiceId.value },
    {
      onSuccess: () => {
        showToast('Layanan ambulans berhasil diselesaikan', 'success')
        completeModalShow.value = false
        actionServiceId.value = null
      },
      onError: () => {
        showToast('Gagal menyelesaikan layanan ambulans', 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Permintaan Layanan Ambulans</template>

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
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-end">
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch v-model="searchQuery" placeholder="Cari pemohon..." class="w-full sm:w-64" />
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
                      v-for="option in ambulanceServiceCategoryOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
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
        loading-message="Memuat data permintaan ambulans..."
        :is-empty="ambulanceServices.length === 0"
        empty-message="Tidak ada data permintaan"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <ClipboardList :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Pemohon</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Telepon</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Tgl Permintaan
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-32">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(service, index) in ambulanceServices"
            :key="service.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200 text-sm"
            >
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">
              {{ service.submitterName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ service.submitterPhone }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30"
              >
                {{ getCategoryLabel(service.serviceCategory, ambulanceServiceCategoryOptions) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ new Date(service.pickupDate).toLocaleDateString('id-ID') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(service.status),
                ]"
              >
                {{ formatStatus(service.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  v-if="isDriver && service.status === AmbulanceServiceStatus.ACCEPTED"
                  @click="handleStart(service.id)"
                  title="Mulai"
                  variant="primary"
                  :disabled="startMutation.isPending.value || completeMutation.isPending.value"
                >
                  <Play :size="18" class="fill-current" />
                </BaseIconButton>
                <BaseIconButton
                  v-if="isDriver && service.status === AmbulanceServiceStatus.IN_SERVICE"
                  @click="handleComplete(service.id)"
                  title="Selesaikan"
                  variant="success"
                  :disabled="startMutation.isPending.value || completeMutation.isPending.value"
                >
                  <Check :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  v-if="!isDriver && service.status === AmbulanceServiceStatus.PENDING"
                  @click="handleAccept(service.id)"
                  title="Setujui"
                  variant="primary"
                  :disabled="acceptMutation.isPending.value || rejectMutation.isPending.value"
                >
                  <Check :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  :to="
                    isDriver
                      ? {
                          name: 'dashboard-ambulance-assigned-service-detail',
                          params: { ambulanceId: ambulanceId, serviceId: service.id },
                        }
                      : {
                          name: 'dashboard-ambulance-services-detail',
                          params: { id: service.id },
                        }
                  "
                  title="Lihat Detail"
                  variant="info"
                >
                  <Eye :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  v-if="!isDriver && service.status === 'pending'"
                  @click="handleReject(service)"
                  title="Tolak"
                  variant="danger"
                  :disabled="acceptMutation.isPending.value || rejectMutation.isPending.value"
                >
                  <XIcon :size="18" />
                </BaseIconButton>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>

    <!-- REJECT MODAL -->
    <RejectConfirmationModal
      :show="rejectModalShow"
      :title="`Tolak permintaan ${rejectService?.submitterName || ''}?`"
      message="Berikan alasan penolakan untuk permintaan ambulans ini."
      primary-button-text="Tolak"
      secondary-button-text="Batal"
      :icon="AlertCircle"
      :primary-button-loading="rejectMutation.isPending.value"
      @primary="handleConfirmReject"
      @secondary="rejectModalShow = false"
      @close="rejectModalShow = false"
    />

    <!-- Accept Confirmation Modal -->
    <ConfirmationModal
      :show="acceptModalShow"
      title="Tugaskan Ambulans"
      message="Pilih ambulans yang akan ditugaskan untuk melayani permintaan ini:"
      primary-button-text="Setujui & Tugaskan"
      secondary-button-text="Batal"
      :icon="Check"
      :primary-button-loading="acceptMutation.isPending.value"
      @primary="handleConfirmAccept"
      @secondary="acceptModalShow = false"
      @close="acceptModalShow = false"
    >
      <div class="mt-4 text-left">
        <label
          for="ambulance-select"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Pilih Ambulans
        </label>
        <select
          id="ambulance-select"
          v-model="selectedAmbulanceId"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white sm:text-sm"
          :disabled="isLoadingAmbulances"
        >
          <option value="" disabled>-- Pilih Ambulans --</option>
          <option v-for="ambulance in ambulances" :key="ambulance.id" :value="ambulance.id">
            {{ ambulance.plateNumber }} - {{ ambulance.driver.username }}
          </option>
        </select>
        <p v-if="isLoadingAmbulances" class="text-xs text-gray-500 mt-1">
          Memuat daftar ambulans...
        </p>
      </div>
    </ConfirmationModal>

    <!-- Start Service Confirmation Modal -->
    <ConfirmationModal
      :show="startModalShow"
      title="Mulai Layanan Ambulans?"
      message="Apakah Anda yakin ingin memulai layanan ambulans ini sekarang?"
      primary-button-text="Mulai"
      secondary-button-text="Batal"
      :icon="Play"
      :primary-button-loading="startMutation.isPending.value"
      @primary="handleConfirmStart"
      @secondary="startModalShow = false"
      @close="startModalShow = false"
    />

    <!-- Complete Service Confirmation Modal -->
    <ConfirmationModal
      :show="completeModalShow"
      title="Selesaikan Layanan Ambulans?"
      message="Apakah Anda yakin ingin menyelesaikan layanan ambulans ini? Langkah ini akan merekam riwayat perjalanan."
      primary-button-text="Selesai"
      secondary-button-text="Batal"
      :icon="Check"
      :primary-button-loading="completeMutation.isPending.value"
      @primary="handleConfirmComplete"
      @secondary="completeModalShow = false"
      @close="completeModalShow = false"
    />
  </DashboardLayout>
</template>
