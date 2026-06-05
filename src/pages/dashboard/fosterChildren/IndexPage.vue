<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Plus, Trash2, Edit, Baby, GraduationCap, User } from 'lucide-vue-next'
import { useFosterChildrenFilters } from '@/composables/fosterChildren/useFosterChildrenFilters'
import { useFosterChildrenDelete } from '@/composables/fosterChildren/useFosterChildrenDelete'
import { useToast } from '@/composables/ui/useToast'
import { formatDate, formatStatus } from '@/utils/format'
import { extractError } from '@/utils/error'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { Category, Gender, type FosterChildren } from '@/types/fosterChildren'
import { getStatusColor } from '@/utils/statusColor'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

const { showToast } = useToast()

const {
  queryParams,
  limitOptions,
  searchQuery,
  pageOffset,
  fosterChildren,
  pagination,
  isLoading,
  hasActiveFilters,
  handleNextPage,
  handlePrevPage,
  clearFilters,
} = useFosterChildrenFilters(true)

const { deleteMutation } = useFosterChildrenDelete()

const isDeleteModalOpen = ref(false)
const selectedChild = ref<FosterChildren | null>(null)

const openDeleteModal = (child: FosterChildren) => {
  selectedChild.value = child
  isDeleteModalOpen.value = true
}

const handleConfirmDelete = async () => {
  if (!selectedChild.value) return

  deleteMutation.mutate(selectedChild.value.id, {
    onSuccess: () => {
      showToast('Data anak asuh berhasil dihapus', 'success')
      isDeleteModalOpen.value = false
      selectedChild.value = null
    },
    onError: (error) => {
      showToast(extractError(error) || 'Gagal menghapus data anak asuh', 'error')
    },
  })
}
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Anak Asuh</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <BaseButton
          variant="primary"
          :to="{ name: 'dashboard-foster-children-create' }"
          class="w-full sm:w-auto"
        >
          <Plus :size="20" class="mr-1" />
          Tambah Anak Asuh
        </BaseButton>

        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Cari nama anak..."
            class="w-full sm:w-64"
          />
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default="{ closeDropdown }">
              <div class="space-y-4 w-64">
                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Jenis Kelamin
                  </label>
                  <select
                    v-model="queryParams.gender"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Gender</option>
                    <option :value="Gender.male">Laki-laki</option>
                    <option :value="Gender.female">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Kategori
                  </label>
                  <select
                    v-model="queryParams.category"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Kategori</option>
                    <option :value="Category.yatim">Yatim</option>
                    <option :value="Category.piatu">Piatu</option>
                    <option :value="Category.yatimPiatu">Yatim Piatu</option>
                  </select>
                </div>

                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Status Kelulusan
                  </label>
                  <select
                    v-model="queryParams.isGraduated"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Semua Status</option>
                    <option :value="true">Sudah Lulus</option>
                    <option :value="false">Belum Lulus</option>
                  </select>
                </div>

                <div>
                  <label
                    class="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider"
                  >
                    Urutkan
                  </label>
                  <select
                    v-model="queryParams.sortBy"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-primary-500"
                  >
                    <option :value="undefined">Bawaan (Terbaru)</option>
                    <option value="created_at asc">Terlama Terdaftar</option>
                    <option value="name asc">Nama (A-Z)</option>
                    <option value="name desc">Nama (Z-A)</option>
                    <option value="birth_date asc">Umur Tertua</option>
                    <option value="birth_date desc">Umur Termuda</option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    RESET
                  </button>
                  <button
                    @click="closeDropdown"
                    class="flex-1 px-3 py-2 text-xs font-bold bg-primary-300 text-white rounded-lg hover:bg-primary-500 transition-colors shadow-sm"
                  >
                    APPLY
                  </button>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
      </div>

      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data anak asuh..."
        :is-empty="fosterChildren.length === 0"
        empty-message="Tidak ada data anak asuh"
        :has-prev="(queryParams.page ?? 1) > 1"
        :has-next="pagination ? (queryParams.page ?? 1) < pagination.totalPages : false"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
      >
        <template #empty-icon>
          <Baby :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Foto</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Nama Lengkap
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Gender</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Kategori
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Terdaftar
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(child, index) in fosterChildren"
            :key="child.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200 text-sm"
            >
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div
                class="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 shadow-sm"
              >
                <img
                  v-if="child.profilePicture"
                  :src="child.profilePicture"
                  class="w-full h-full object-cover"
                  :alt="child.name"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <User :size="20" />
                </div>
              </div>
            </td>
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white truncate max-w-xs">
              {{ child.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  child.gender === Gender.male
                    ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-900/30 dark:text-blue-400'
                    : 'bg-pink-50 border-pink-100 text-pink-700 dark:bg-pink-900/20 dark:border-pink-900/30 dark:text-pink-400',
                ]"
              >
                {{ child.gender === Gender.male ? 'Laki-laki' : 'Perempuan' }}
              </span>
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600 dark:text-gray-300"
            >
              {{ formatStatus(child.category) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(child.isGraduated ? 'completed' : 'active'),
                ]"
              >
                <GraduationCap v-if="child.isGraduated" :size="12" />
                {{ child.isGraduated ? 'Lulus' : 'Aktif' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatDate(child.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <BaseIconButton
                  :to="{ name: 'dashboard-foster-children-edit', params: { id: child.id } }"
                  title="Edit Anak Asuh"
                  variant="primary"
                >
                  <Edit :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  variant="danger"
                  title="Hapus Anak Asuh"
                  @click="openDeleteModal(child)"
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
      :title="`Hapus ${selectedChild?.name}?`"
      message="Apakah Anda yakin ingin menghapus data ini? Semua informasi terkait anak asuh ini akan dihapus permanen."
      danger-button-text="Hapus"
      secondary-button-text="Batal"
      :danger-button-loading="deleteMutation.isPending.value"
      @danger="handleConfirmDelete"
      @secondary="isDeleteModalOpen = false"
      @close="isDeleteModalOpen = false"
    />
  </DashboardLayout>
</template>
