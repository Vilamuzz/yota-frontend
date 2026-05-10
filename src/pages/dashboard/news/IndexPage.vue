<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  Plus,
  Trash2,
  Edit,
  Newspaper,
  RotateCcw,
  Image as ImageIcon,
  Play,
  Archive,
} from 'lucide-vue-next'
import { useNewsAdminList } from '@/composables/news/useNewsAdminList'
import { useNewsUpdate } from '@/composables/news/useNewsUpdate'
import { useCursorPagination } from '@/composables/ui/usePagination'
import { useToast } from '@/composables/ui/useToast'
import { formatDate } from '@/utils/format'
import { getStatusColor } from '@/utils/statusColor'
import { MediaCategory, MediaStatus } from '@/types/media'
import type { NewsQueryParams } from '@/types/news'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'

const { showToast } = useToast()
const { deleteMutation, publishMutation, archiveMutation } = useNewsUpdate()

const queryParams = reactive<NewsQueryParams>({
  limit: 10,
  search: undefined,
  category: undefined,
  status: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})

const limitOptions = [10, 25, 50, 100]
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const categories = Object.values(MediaCategory)
const statuses = Object.values(MediaStatus)

const { news, pagination, isLoading } = useNewsAdminList(queryParams)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

const isDeleteModalOpen = ref(false)
const isPublishModalOpen = ref(false)
const isArchiveModalOpen = ref(false)
const selectedNews = ref<any>(null)

const hasActiveFilters = computed(
  () => queryParams.category !== undefined || queryParams.status !== undefined,
)

watch(searchQuery, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    queryParams.search = val || undefined
    resetPagination()
  }, 400)
})

watch(
  () => [queryParams.category, queryParams.status, queryParams.limit],
  () => resetPagination(),
)

function clearFilters() {
  searchQuery.value = ''
  queryParams.category = undefined
  queryParams.status = undefined
  resetPagination()
}

function openDeleteModal(news: any) {
  selectedNews.value = news
  isDeleteModalOpen.value = true
}

function handleConfirmDelete() {
  if (selectedNews.value) {
    deleteMutation.mutate(selectedNews.value.id, {
      onSuccess: () => {
        showToast('Berita berhasil dihapus', 'success')
        isDeleteModalOpen.value = false
        selectedNews.value = null
      },
      onError: () => {
        showToast('Gagal menghapus berita', 'error')
      },
    })
  }
}

function openPublishModal(news: any) {
  selectedNews.value = news
  isPublishModalOpen.value = true
}

function handleConfirmPublish() {
  if (selectedNews.value) {
    publishMutation.mutate(selectedNews.value.id, {
      onSuccess: () => {
        showToast('Berita berhasil diterbitkan', 'success')
        isPublishModalOpen.value = false
        selectedNews.value = null
      },
      onError: () => {
        showToast('Gagal menerbitkan berita', 'error')
      },
    })
  }
}

function openArchiveModal(news: any) {
  selectedNews.value = news
  isArchiveModalOpen.value = true
}

function handleConfirmArchive() {
  if (selectedNews.value) {
    archiveMutation.mutate(selectedNews.value.id, {
      onSuccess: () => {
        showToast('Berita berhasil diarsipkan', 'success')
        isArchiveModalOpen.value = false
        selectedNews.value = null
      },
      onError: () => {
        showToast('Gagal mengarsipkan berita', 'error')
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
    <template #title>Manajemen Berita</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <BaseButton
          variant="primary"
          :to="{ name: 'dashboard-news-create' }"
          class="w-full sm:w-auto"
        >
          <Plus :size="20" class="mr-1" />
          Tambah Berita
        </BaseButton>
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Cari judul berita..."
            class="w-full sm:w-64"
          />
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default="{ closeDropdown }">
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
                      {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                    </option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    @click="closeDropdown"
                    class="flex-1 px-3 py-2 text-xs font-bold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
                  >
                    Apply
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
        loading-message="Memuat data berita..."
        :is-empty="news.length === 0"
        empty-message="Tidak ada data berita"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <Newspaper :size="96" class="mx-auto mb-2 text-gray-300" />
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
            v-for="(item, index) in news"
            :key="item.id"
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
                  v-if="item.coverImage"
                  :src="item.coverImage"
                  class="w-full h-full object-cover"
                  :alt="item.title"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <ImageIcon :size="16" class="text-gray-400" />
                </div>
              </div>
            </td>
            <td class="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
              {{ item.title }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatCategory(item.category) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(item.status),
                ]"
              >
                {{ item.status.charAt(0).toUpperCase() + item.status.slice(1) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatDate(item.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <button
                  v-if="item.status === MediaStatus.DRAFT || item.status === MediaStatus.ARCHIVED"
                  class="p-1 hover:bg-green-50 text-green-600 rounded transition-colors duration-150 dark:hover:bg-green-900/20"
                  title="Terbitkan berita"
                  @click="openPublishModal(item)"
                >
                  <Play :size="18" />
                </button>
                <button
                  v-if="item.status === MediaStatus.PUBLISHED"
                  class="p-1 hover:bg-orange-50 text-orange-600 rounded transition-colors duration-150 dark:hover:bg-orange-900/20"
                  title="Arsipkan berita"
                  @click="openArchiveModal(item)"
                >
                  <Archive :size="18" />
                </button>
                <RouterLink
                  :to="{ name: 'dashboard-news-edit', params: { id: item.id } }"
                  class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 dark:hover:bg-gray-700 dark:text-gray-200"
                  title="Edit berita"
                >
                  <Edit :size="18" />
                </RouterLink>
                <button
                  v-if="item.status === MediaStatus.DRAFT"
                  class="p-1 hover:bg-red-50 text-red-500 rounded transition-colors duration-150 dark:hover:bg-red-900/20"
                  title="Hapus berita"
                  @click="openDeleteModal(item)"
                >
                  <Trash2 :size="18" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmationModal
      :show="isDeleteModalOpen"
      :title="`Hapus ${selectedNews?.title}?`"
      message="Apakah Anda yakin ingin menghapus berita ini? Tindakan ini tidak dapat dibatalkan."
      variant="danger"
      :primary-button-loading="deleteMutation.isPending.value"
      @close="isDeleteModalOpen = false"
      @confirm="handleConfirmDelete"
    />

    <!-- Publish Confirmation Modal -->
    <ConfirmationModal
      :show="isPublishModalOpen"
      :title="`Terbitkan ${selectedNews?.title}?`"
      message="Berita ini akan dipublikasikan dan dapat dilihat oleh publik. Pastikan semua konten sudah benar."
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
      :title="`Arsipkan ${selectedNews?.title}?`"
      message="Berita ini akan diarsipkan dan tidak lagi terlihat oleh publik. Anda masih dapat mengaksesnya dari dashboard admin."
      primary-button-text="Arsipkan"
      secondary-button-text="Batal"
      :primary-button-loading="archiveMutation.isPending.value"
      @primary="handleConfirmArchive"
      @secondary="isArchiveModalOpen = false"
      @close="isArchiveModalOpen = false"
    />
  </DashboardLayout>
</template>
