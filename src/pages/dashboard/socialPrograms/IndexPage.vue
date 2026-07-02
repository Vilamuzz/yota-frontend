<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  Eye,
  SquarePen,
  Trash2,
  Plus,
  Heart,
  Check,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-vue-next'
import { useSocialProgramStatus } from '@/composables/socialProgram/useSocialProgramStatus'
import RejectConfirmationModal from '@/components/organisms/RejectConfirmationModal.vue'
import { useToast } from '@/composables/ui/useToast'

import { useSocialProgramList } from '@/composables/socialProgram/useSocialProgramList'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import type { SocialProgram, SocialProgramQueryParams } from '@/types/socialProgram'
import {
  formatSocialProgramStatus,
  SocialProgramStatusEnum,
  socialProgramStatusOptions,
} from '@/types/socialProgram'
import { getStatusColor } from '@/utils/statusColor'
import { formatCurrency, formatDate } from '@/utils/format'
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/const/roles'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import { useOffsetPagination } from '@/composables/ui/useOffsetPagination'
import { useSocialProgramDelete } from '@/composables/socialProgram/useSocialProgramDelete'
import { extractError } from '@/utils/error'

const authStore = useAuthStore()
const { deleteMutation } = useSocialProgramDelete()

const isChairman = computed(() => authStore.activeRole === ROLES.CHAIRMAN)

const queryParams = reactive<SocialProgramQueryParams>({
  limit: 10,
  page: 1,
  search: undefined,
  status: undefined,
  sortBy: undefined,
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
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } = useOffsetPagination(
  queryParams,
  pagination,
)

watch(
  () => [queryParams.status, queryParams.sortBy, queryParams.limit],
  () => resetPagination(),
)

const hasActiveFilters = computed(
  () => queryParams.status !== undefined || queryParams.sortBy !== undefined,
)

// DELETE
const confirmShow = ref(false)
const confirmProgram = ref<SocialProgram | null>(null)

const deleteProgram = (program: SocialProgram) => {
  confirmProgram.value = program
  confirmShow.value = true
}

const handleConfirmDelete = async () => {
  if (!confirmProgram.value) return
  deleteMutation.mutate(confirmProgram.value.id, {
    onSuccess: () => {
      showToast('Data program berhasil dihapus', 'success')
      confirmShow.value = false
      confirmProgram.value = null
    },
    onError: (error) => {
      showToast(extractError(error) || 'Gagal menghapus data program', 'error')
    },
  })
}

const { showToast } = useToast()
const { approveMutation, rejectMutation, completeMutation } = useSocialProgramStatus()

// COMPLETE
const completeConfirmShow = ref(false)
const completeProgram = ref<SocialProgram | null>(null)

const handleComplete = (program: SocialProgram) => {
  completeProgram.value = program
  completeConfirmShow.value = true
}

const handleConfirmComplete = async () => {
  if (!completeProgram.value) return
  completeMutation.mutate(completeProgram.value.id, {
    onSuccess: () => {
      showToast('Program berhasil diselesaikan!', 'success')
      completeConfirmShow.value = false
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Gagal menyelesaikan program', 'error')
    },
  })
}

// APPROVE
const approveConfirmShow = ref(false)
const approveProgram = ref<SocialProgram | null>(null)

const handleApprove = (program: SocialProgram) => {
  approveProgram.value = program
  approveConfirmShow.value = true
}

const handleConfirmApprove = async () => {
  if (!approveProgram.value) return
  approveMutation.mutate(approveProgram.value.id, {
    onSuccess: () => {
      showToast('Program berhasil disetujui!', 'success')
      approveConfirmShow.value = false
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Gagal menyetujui program', 'error')
    },
  })
}

// REJECT
const rejectModalShow = ref(false)
const rejectProgram = ref<SocialProgram | null>(null)

const handleReject = (program: SocialProgram) => {
  rejectProgram.value = program
  rejectModalShow.value = true
}

const handleConfirmReject = async (reason: string) => {
  if (!rejectProgram.value) return
  rejectMutation.mutate(
    { id: rejectProgram.value.id, reason },
    {
      onSuccess: () => {
        showToast('Program berhasil ditolak', 'success')
        rejectModalShow.value = false
      },
      onError: (err) => {
        showToast(err.response?.data?.message || 'Gagal menolak program', 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Data Program Berkelanjutan</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <!-- Header Section -->
      <div
        class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
        :class="{ 'justify-end': isChairman }"
      >
        <div class="flex flex-row gap-3 w-full md:w-auto">
          <BaseSearch v-model="searchQuery" placeholder="Cari Program..." class="flex-1 w-full" />
          <BaseFilter :has-active-filters="hasActiveFilters" class="w-auto shrink-0">
            <template #default>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800"
                  >
                    <option :value="undefined">Semua</option>
                    <option
                      v-for="status in socialProgramStatusOptions"
                      :key="status.value"
                      :value="status.value"
                    >
                      {{ status.label }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Urutkan</label>
                  <select
                    v-model="queryParams.sortBy"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  >
                    <option :value="undefined">Bawaan (Terbaru)</option>
                    <option value="created_at desc">Terbaru</option>
                    <option value="created_at asc">Terlama</option>
                    <option value="title asc">Nama (A-Z)</option>
                    <option value="title desc">Nama (Z-A)</option>
                    <option value="total_subscribers desc">Pelanggan Terbanyak</option>
                    <option value="total_subscribers asc">Pelanggan Paling Sedikit</option>
                    <option value="minimum_amount asc">Donasi Terendah</option>
                    <option value="minimum_amount desc">Donasi Tertinggi</option>
                    <option value="billing_day asc">Hari Tagihan Terawal</option>
                  </select>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
        <BaseButton
          v-if="!isChairman"
          variant="primary"
          class="w-full sm:w-auto justify-center"
          :to="{ name: 'dashboard-social-programs-create' }"
        >
          <Plus :size="20" class="mr-1" />
          Tambah Program
        </BaseButton>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data program..."
        :is-empty="socialPrograms.length === 0"
        empty-message="Tidak ada data program"
        :has-prev="(queryParams.page ?? 1) > 1"
        :has-next="pagination ? (queryParams.page ?? 1) < pagination.totalPages : false"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
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
                {{ formatSocialProgramStatus(program.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatDate(program.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-start gap-2">
                <BaseIconButton
                  :to="{
                    name: 'dashboard-social-programs-detail',
                    params: { id: program.id },
                  }"
                  title="Lihat detail"
                  variant="info"
                >
                  <Eye :size="18" />
                </BaseIconButton>

                <template v-if="isChairman">
                  <template v-if="program.status === SocialProgramStatusEnum.PENDING">
                    <BaseIconButton
                      @click="handleApprove(program)"
                      title="Setujui program"
                      variant="success"
                    >
                      <Check :size="18" />
                    </BaseIconButton>
                    <BaseIconButton
                      @click="handleReject(program)"
                      title="Tolak program"
                      variant="danger"
                    >
                      <X :size="18" />
                    </BaseIconButton>
                  </template>
                </template>

                <template v-else>
                  <BaseIconButton
                    v-if="
                      program.status !== SocialProgramStatusEnum.COMPLETED &&
                      program.status !== SocialProgramStatusEnum.REJECTED
                    "
                    :to="{
                      name: 'dashboard-social-programs-edit',
                      params: { id: program.id },
                    }"
                    title="Edit program"
                    variant="primary"
                  >
                    <SquarePen :size="18" />
                  </BaseIconButton>

                  <BaseIconButton
                    v-if="program.status === SocialProgramStatusEnum.ACTIVE"
                    @click="handleComplete(program)"
                    title="Selesaikan program"
                    variant="success"
                  >
                    <CheckCircle :size="18" />
                  </BaseIconButton>

                  <BaseIconButton
                    v-if="program.status === SocialProgramStatusEnum.PENDING"
                    @click="deleteProgram(program)"
                    title="Hapus program"
                    variant="danger"
                  >
                    <Trash2 :size="18" />
                  </BaseIconButton>
                </template>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>

  <!-- APPROVE CONFIRMATION MODAL -->
  <ConfirmationModal
    :show="approveConfirmShow"
    :title="`Setujui ${approveProgram?.title}?`"
    message="Program ini akan disetujui dan status akan berubah menjadi Aktif/Berjalan."
    primary-button-text="Setujui"
    secondary-button-text="Batal"
    :icon="Check"
    :primary-button-loading="approveMutation.isPending.value"
    @primary="handleConfirmApprove"
    @secondary="approveConfirmShow = false"
    @close="approveConfirmShow = false"
  />

  <!-- REJECT MODAL -->
  <RejectConfirmationModal
    :show="rejectModalShow"
    :title="`Tolak ${rejectProgram?.title}?`"
    message="Berikan alasan penolakan untuk program ini."
    primary-button-text="Tolak"
    secondary-button-text="Batal"
    :icon="AlertCircle"
    :primary-button-loading="rejectMutation.isPending.value"
    @primary="handleConfirmReject"
    @secondary="rejectModalShow = false"
    @close="rejectModalShow = false"
  />

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

  <!-- COMPLETE CONFIRMATION MODAL -->
  <ConfirmationModal
    :show="completeConfirmShow"
    :title="`Selesaikan ${completeProgram?.title}?`"
    message="Program ini akan ditandai sebagai Selesai. Tindakan ini tidak dapat dibatalkan."
    primary-button-text="Selesaikan"
    secondary-button-text="Batal"
    :icon="CheckCircle"
    :primary-button-loading="completeMutation.isPending.value"
    @primary="handleConfirmComplete"
    @secondary="completeConfirmShow = false"
    @close="completeConfirmShow = false"
  />
</template>
