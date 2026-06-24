<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { SquarePen, Trash2, HandHeart, Plus, Archive, Play, Eye } from 'lucide-vue-next'
import { useDonationProgramFilters } from '@/composables/donationProgram/useDonationProgramFilters'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { useDonationProgramUpdate } from '@/composables/donationProgram/useDonationProgramUpdate'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'
import {
  type DonationProgram,
  DonationProgramStatusEnum,
  donationProgramCategoryOptions,
  donationProgramStatusOptions,
  formatDonationProgramCategory,
} from '@/types/donationProgram'
import { formatCurrency, formatDate, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

const {
  queryParams,
  limitOptions,
  searchQuery,
  pageOffset,
  donationPrograms,
  pagination,
  isLoading,
  hasActiveFilters,
  handleNextPage,
  handlePrevPage,
} = useDonationProgramFilters()

const { deleteMutation, activeMutation, archiveMutation } = useDonationProgramUpdate()
const { showToast } = useToast()

const confirmShow = ref(false)
const confirmDonationProgram = ref<DonationProgram | null>(null)

const archiveConfirmShow = ref(false)
const archiveDonationProgram = ref<DonationProgram | null>(null)

const activeConfirmShow = ref(false)
const activeDonationProgram = ref<DonationProgram | null>(null)

function deleteDonationProgram(donationProgram: DonationProgram) {
  confirmDonationProgram.value = donationProgram
  confirmShow.value = true
}

function handleConfirmDelete() {
  if (!confirmDonationProgram.value) return

  deleteMutation.mutate(confirmDonationProgram.value.id, {
    onSuccess: () => {
      showToast('Program donasi berhasil dihapus!', 'success')
      confirmShow.value = false
      confirmDonationProgram.value = null
    },
    onError: (err) => {
      showToast(extractError(err, 'Gagal menghapus program donasi.'), 'error')
    },
  })
}

function handleActive(donationProgram: DonationProgram) {
  activeDonationProgram.value = donationProgram
  activeConfirmShow.value = true
}

function handleConfirmActive() {
  if (!activeDonationProgram.value) return

  activeMutation.mutate(activeDonationProgram.value.id, {
    onSuccess: () => {
      showToast('Program donasi berhasil diaktifkan!', 'success')
      activeConfirmShow.value = false
      activeDonationProgram.value = null
    },
    onError: (err) => {
      showToast(extractError(err, 'Gagal mengaktifkan program donasi.'), 'error')
    },
  })
}

function handleArchive(donationProgram: DonationProgram) {
  archiveDonationProgram.value = donationProgram
  archiveConfirmShow.value = true
}

function handleConfirmArchive() {
  if (!archiveDonationProgram.value) return

  archiveMutation.mutate(archiveDonationProgram.value.id, {
    onSuccess: () => {
      showToast('Program donasi berhasil diarsipkan!', 'success')
      archiveConfirmShow.value = false
      archiveDonationProgram.value = null
    },
    onError: (err) => {
      showToast(extractError(err, 'Gagal mengarsipkan program donasi.'), 'error')
    },
  })
}
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Donasi</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div class="flex flex-row gap-3 w-full md:w-auto">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Cari program donasi..."
            class="flex-1 w-full"
          />
          <BaseFilter :has-active-filters="hasActiveFilters" class="w-auto shrink-0">
            <template #default>
              <div class="space-y-4 w-64">
                <!-- Category filter -->
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
                  >
                    Kategori
                  </label>
                  <select
                    v-model="queryParams.category"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Kategori</option>
                    <option
                      v-for="category in donationProgramCategoryOptions"
                      :key="category.value"
                      :value="category.value"
                    >
                      {{ category.label }}
                    </option>
                  </select>
                </div>

                <!-- Status filter -->
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
                  >
                    Status
                  </label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Status</option>
                    <option
                      v-for="status in donationProgramStatusOptions"
                      :key="status.value"
                      :value="status.value"
                    >
                      {{ status.label }}
                    </option>
                  </select>
                </div>

                <!-- Sort filter -->
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 tracking-wider"
                  >
                    Urutkan
                  </label>
                  <select
                    v-model="queryParams.sortBy"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Bawaan (Terbaru)</option>
                    <option value="created_at asc">Terlama</option>
                    <option value="title asc">Judul (A-Z)</option>
                    <option value="title desc">Judul (Z-A)</option>
                    <option value="fund_target desc">Target Dana Tertinggi</option>
                    <option value="fund_target asc">Target Dana Terendah</option>
                    <option value="start_date desc">Tanggal Mulai (Terbaru)</option>
                    <option value="start_date asc">Tanggal Mulai (Terlama)</option>
                    <option value="end_date asc">Tanggal Selesai (Terdekat)</option>
                    <option value="end_date desc">Tanggal Selesai (Terlama)</option>
                  </select>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
        <BaseButton
          variant="primary"
          :to="{ name: 'dashboard-donation-programs-create' }"
          class="w-full md:w-auto justify-center"
        >
          <Plus :size="20" class="mr-1" />
          Buat Program Donasi
        </BaseButton>
      </div>

      <!-- Donations Table -->
      <BaseTable
        :loading="isLoading"
        loading-message="Loading donations..."
        :is-empty="donationPrograms.length === 0 && !isLoading"
        empty-message="No donations available"
        :has-prev="(queryParams.page ?? 1) > 1"
        :has-next="pagination ? (queryParams.page ?? 1) < pagination.totalPages : false"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
      >
        <template #empty-icon>
          <HandHeart :size="96" class="mx-auto mb-2" />
        </template>

        <template #headers>
          <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
          <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Program Donasi
          </th>
          <th class="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Target</th>
          <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Timeline</th>
          <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
        </template>

        <template #rows>
          <tr
            v-for="(donation, index) in donationPrograms"
            :key="donation.id"
            class="hover:bg-gray-50 transition-colors duration-150 dark:hover:bg-gray-700"
          >
            <td class="px-4 py-4 whitespace-nowrap font-medium text-gray-500 dark:text-gray-200">
              {{ pageOffset * (queryParams.limit || 10) + index + 1 }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap max-w-64">
              <div class="flex flex-col">
                <span
                  class="font-semibold text-gray-900 dark:text-white truncate"
                  :title="donation.title"
                >
                  {{ donation.title }}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {{ formatDonationProgramCategory(donation.category) }}
                </span>
              </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap font-medium text-right dark:text-gray-200">
              {{ formatCurrency(donation.fundTarget) }}
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(donation.status),
                ]"
              >
                {{ formatStatus(donation.status) }}
              </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="flex flex-col text-xs space-y-1">
                <div class="flex items-center gap-1 text-gray-700 dark:text-gray-200">
                  <span class="font-medium">Berakhir:</span>
                  <span>{{ formatDate(donation.endDate) }}</span>
                </div>
                <div class="flex items-center gap-1 text-gray-400 dark:text-gray-500">
                  <span>Dibuat:</span>
                  <span>{{ formatDate(donation.createdAt) }}</span>
                </div>
              </div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="flex items-center justify-left gap-2">
                <BaseIconButton
                  v-if="donation.status === DonationProgramStatusEnum.DRAFT"
                  @click="handleActive(donation)"
                  title="Aktifkan program donasi"
                  variant="success"
                  :disabled="activeMutation.isPending.value"
                >
                  <Play :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  v-if="donation.status === DonationProgramStatusEnum.ACTIVE"
                  @click="handleArchive(donation)"
                  title="Arsipkan program donasi"
                  variant="warning"
                  :disabled="archiveMutation.isPending.value"
                >
                  <Archive :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  v-if="
                    donation.status === DonationProgramStatusEnum.COMPLETED ||
                    donation.status === DonationProgramStatusEnum.EXPIRED ||
                    donation.status === DonationProgramStatusEnum.ARCHIVED ||
                    donation.status === DonationProgramStatusEnum.ACTIVE
                  "
                  :to="{
                    name: 'dashboard-donation-programs-detail',
                    params: { id: donation.id },
                  }"
                  title="Lihat detail program donasi"
                  variant="info"
                >
                  <Eye :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  v-if="
                    donation.status !== DonationProgramStatusEnum.COMPLETED &&
                    donation.status !== DonationProgramStatusEnum.EXPIRED &&
                    donation.status !== DonationProgramStatusEnum.ARCHIVED
                  "
                  :to="{
                    name: 'dashboard-donation-programs-edit',
                    params: { id: donation.id },
                  }"
                  title="Edit program donasi"
                >
                  <SquarePen :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  v-if="donation.status === DonationProgramStatusEnum.DRAFT"
                  @click="deleteDonationProgram(donation)"
                  title="Hapus program donasi"
                  variant="danger"
                >
                  <Trash2 :size="18" />
                </BaseIconButton>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>

  <!-- Delete Confirmation Modal -->
  <ConfirmationModal
    :show="confirmShow"
    :title="`Hapus ${confirmDonationProgram?.title}?`"
    :message="`Program donasi ini akan dihapus permanen. Aksi ini tidak dapat dibatalkan.`"
    danger-button-text="Hapus"
    secondary-button-text="Batal"
    :danger-button-loading="deleteMutation.isPending.value"
    @danger="handleConfirmDelete"
    @secondary="confirmShow = false"
    @close="confirmShow = false"
  />

  <!-- Archive Confirmation Modal -->
  <ConfirmationModal
    :show="archiveConfirmShow"
    :title="`Arsipkan ${archiveDonationProgram?.title}?`"
    :message="`Program donasi ini akan diarsipkan dan tidak akan lagi terlihat oleh publik. Anda masih dapat mengaksesnya dari admin dashboard.`"
    primary-button-text="Arsipkan"
    secondary-button-text="Batal"
    :primary-button-loading="archiveMutation.isPending.value"
    @primary="handleConfirmArchive"
    @secondary="archiveConfirmShow = false"
    @close="archiveConfirmShow = false"
  />

  <!-- Active Confirmation Modal -->
  <ConfirmationModal
    :show="activeConfirmShow"
    :title="`Aktifkan ${activeDonationProgram?.title}?`"
    :message="`Program donasi ini akan diaktifkan dan akan terlihat oleh publik. Pastikan semua detail dan gambar sampul sudah benar.`"
    primary-button-text="Aktifkan"
    secondary-button-text="Batal"
    :primary-button-loading="activeMutation.isPending.value"
    @primary="handleConfirmActive"
    @secondary="activeConfirmShow = false"
    @close="activeConfirmShow = false"
  />
</template>
