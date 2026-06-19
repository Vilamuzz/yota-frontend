<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Plus, Trash2, Edit, Image as ImageIcon, Play, Archive } from 'lucide-vue-next'
import { useGalleryAdminList } from '@/composables/gallery/useGalleryAdminList'
import { useGalleryUpdate } from '@/composables/gallery/useGalleryUpdate'
import { useOffsetPagination } from '@/composables/ui/useOffsetPagination'
import { useToast } from '@/composables/ui/useToast'
import { formatDate, formatStatus } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import { MediaCategory, MediaStatus } from '@/types/media'
import type { GalleryQueryParams, Gallery } from '@/types/gallery'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'

const { showToast } = useToast()
const { deleteMutation, publishMutation, archiveMutation } = useGalleryUpdate()

const queryParams = reactive<GalleryQueryParams>({
  limit: 10,
  page: 1,
  search: undefined,
  category: undefined,
  status: undefined,
  sortBy: undefined,
})

const limitOptions = [10, 25, 50, 100]
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const categories = Object.values(MediaCategory)
const statuses = Object.values(MediaStatus)

const { galleries, pagination, isLoading } = useGalleryAdminList(queryParams)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } = useOffsetPagination(
  queryParams,
  pagination,
)

const isDeleteModalOpen = ref(false)
const isPublishModalOpen = ref(false)
const isArchiveModalOpen = ref(false)
const selectedGallery = ref<Gallery | null>(null)

const hasActiveFilters = computed(
  () =>
    queryParams.category !== undefined ||
    queryParams.status !== undefined ||
    queryParams.sortBy !== undefined,
)

watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(
  () => [queryParams.category, queryParams.status, queryParams.sortBy, queryParams.limit],
  () => resetPagination(),
)

function openDeleteModal(gallery: Gallery) {
  selectedGallery.value = gallery
  isDeleteModalOpen.value = true
}

function handleConfirmDelete() {
  if (selectedGallery.value) {
    deleteMutation.mutate(selectedGallery.value.id, {
      onSuccess: () => {
        showToast('Galeri berhasil dihapus', 'success')
        isDeleteModalOpen.value = false
        selectedGallery.value = null
      },
      onError: () => {
        showToast('Gagal menghapus galeri', 'error')
      },
    })
  }
}

function openPublishModal(gallery: Gallery) {
  selectedGallery.value = gallery
  isPublishModalOpen.value = true
}

function handleConfirmPublish() {
  if (selectedGallery.value) {
    publishMutation.mutate(selectedGallery.value.id, {
      onSuccess: () => {
        showToast('Galeri berhasil diterbitkan', 'success')
        isPublishModalOpen.value = false
        selectedGallery.value = null
      },
      onError: () => {
        showToast('Gagal menerbitkan galeri', 'error')
      },
    })
  }
}

function openArchiveModal(gallery: Gallery) {
  selectedGallery.value = gallery
  isArchiveModalOpen.value = true
}

function handleConfirmArchive() {
  if (selectedGallery.value) {
    archiveMutation.mutate(selectedGallery.value.id, {
      onSuccess: () => {
        showToast('Galeri berhasil diarsipkan', 'success')
        isArchiveModalOpen.value = false
        selectedGallery.value = null
      },
      onError: () => {
        showToast('Gagal mengarsipkan galeri', 'error')
      },
    })
  }
}

function formatCategory(category: string) {
  return category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Galeri</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <BaseButton
          variant="primary"
          :to="{ name: 'dashboard-galleries-create' }"
          class="w-full sm:w-auto justify-center"
        >
          <Plus :size="20" class="mr-1" />
          Tambah Galeri
        </BaseButton>
        <div class="flex flex-row gap-3 w-full md:w-auto">
          <BaseSearch v-model="searchQuery" placeholder="Cari galeri..." class="flex-1 w-full" />
          <BaseFilter :has-active-filters="hasActiveFilters" class="w-auto shrink-0">
            <template #default>
              <div class="space-y-4 w-64">
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
                    <option v-for="cat in categories" :key="cat" :value="cat">
                      {{ formatCategory(cat) }}
                    </option>
                  </select>
                </div>

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
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ formatStatus(status) }}
                    </option>
                  </select>
                </div>

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
                    <option value="created_at desc">Terbaru</option>
                    <option value="created_at asc">Terlama</option>
                    <option value="views desc">Viewer Terbanyak</option>
                    <option value="views asc">Viewer Terendah</option>
                    <option value="title asc">Judul (A-Z)</option>
                    <option value="title desc">Judul (Z-A)</option>
                  </select>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data galeri..."
        :is-empty="galleries.length === 0"
        empty-message="Tidak ada data galeri"
        :has-prev="(queryParams.page ?? 1) > 1"
        :has-next="pagination ? (queryParams.page ?? 1) < pagination.totalPages : false"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
      >
        <template #empty-icon>
          <ImageIcon :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Thumbnail
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Judul</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Dibuat</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(gallery, index) in galleries"
            :key="gallery.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td
              class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200 text-sm"
            >
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="w-16 h-10 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                <img
                  v-if="gallery.coverImage"
                  :src="gallery.coverImage"
                  class="w-full h-full object-cover"
                  :alt="gallery.title"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <ImageIcon :size="16" class="text-gray-400" />
                </div>
              </div>
            </td>
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
              {{ gallery.title }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatCategory(gallery.category) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(gallery.status),
                ]"
              >
                {{ formatStatus(gallery.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatDate(gallery.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <div class="flex items-center justify-end gap-2">
                <BaseIconButton
                  v-if="
                    gallery.status === MediaStatus.DRAFT || gallery.status === MediaStatus.ARCHIVED
                  "
                  title="Terbitkan galeri"
                  @click="openPublishModal(gallery)"
                  variant="success"
                >
                  <Play :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  v-if="gallery.status === MediaStatus.PUBLISHED"
                  title="Arsipkan galeri"
                  @click="openArchiveModal(gallery)"
                  variant="warning"
                >
                  <Archive :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  :to="{ name: 'dashboard-galleries-edit', params: { id: gallery.id } }"
                  title="Edit galeri"
                  variant="info"
                >
                  <Edit :size="18" />
                </BaseIconButton>
                <BaseIconButton
                  v-if="gallery.status === MediaStatus.DRAFT"
                  title="Hapus galeri"
                  @click="openDeleteModal(gallery)"
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

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="isDeleteModalOpen"
      :title="`Hapus ${selectedGallery?.title}?`"
      message="Apakah Anda yakin ingin menghapus galeri ini? Semua media di dalamnya juga akan terhapus secara permanen."
      danger-button-text="Hapus"
      secondary-button-text="Batal"
      :danger-button-loading="deleteMutation.isPending.value"
      @danger="handleConfirmDelete"
      @secondary="isDeleteModalOpen = false"
      @close="isDeleteModalOpen = false"
    />

    <!-- Publish Confirmation Modal -->
    <ConfirmationModal
      :show="isPublishModalOpen"
      :title="`Terbitkan ${selectedGallery?.title}?`"
      message="Galeri ini akan dipublikasikan dan dapat dilihat oleh publik. Pastikan semua konten sudah benar."
      primary-button-text="Terbitkan"
      secondary-button-text="Batal"
      :primary-button-loading="publishMutation.isPending.value"
      @primary="handleConfirmPublish"
      @secondary="isPublishModalOpen = false"
      @close="isPublishModalOpen = false"
    />

    <!-- Archive Confirmation Modal -->
    <ConfirmationModal
      :show="isArchiveModalOpen"
      :title="`Arsipkan ${selectedGallery?.title}?`"
      message="Galeri ini akan diarsipkan dan tidak lagi terlihat oleh publik. Anda masih dapat mengaksesnya dari dashboard admin."
      primary-button-text="Arsipkan"
      secondary-button-text="Batal"
      :primary-button-loading="archiveMutation.isPending.value"
      @primary="handleConfirmArchive"
      @secondary="isArchiveModalOpen = false"
      @close="isArchiveModalOpen = false"
    />
  </DashboardLayout>
</template>
