<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Newspaper, Plus, SquarePen, Trash2, Eye } from 'lucide-vue-next'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { useNewsAdminList } from '@/composables/news/useNewsAdminList'
import { useNewsUpdate } from '@/composables/news/useNewsUpdate'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'
import { formatDate } from '@/utils/format'
import { MediaCategory, MediaStatus } from '@/types/media'
import type { News, NewsQueryParams } from '@/types/news'

const router = useRouter()
const { showToast } = useToast()

// ── Query params ──────────────────────────────────────────────────────────
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
const pageOffset = ref(0)

let searchTimeout: ReturnType<typeof setTimeout>
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

function resetPagination() {
  queryParams.nextCursor = undefined
  queryParams.prevCursor = undefined
  pageOffset.value = 0
}

// ── Data ──────────────────────────────────────────────────────────────────
const { news, pagination, isLoading } = useNewsAdminList(queryParams)

function handleNextPage() {
  if (pagination.value?.nextCursor) {
    queryParams.nextCursor = pagination.value.nextCursor
    queryParams.prevCursor = undefined
    pageOffset.value += 1
  }
}
function handlePrevPage() {
  if (pagination.value?.prevCursor) {
    queryParams.prevCursor = pagination.value.prevCursor
    queryParams.nextCursor = undefined
    pageOffset.value -= 1
  }
}

// ── Delete ────────────────────────────────────────────────────────────────
const { deleteMutation } = useNewsUpdate()
const confirmShow = ref(false)
const confirmNews = ref<News | null>(null)

function openDeleteConfirm(item: News) {
  confirmNews.value = item
  confirmShow.value = true
}

async function handleConfirmDelete() {
  if (!confirmNews.value) return
  try {
    await deleteMutation.mutateAsync(confirmNews.value.id)
    showToast('Berita berhasil dihapus.', 'success')
  } catch (err: any) {
    showToast(extractError(err, 'Gagal menghapus berita.'), 'error')
  } finally {
    confirmShow.value = false
    confirmNews.value = null
  }
}

// ── Filters ───────────────────────────────────────────────────────────────
const hasActiveFilters = computed(
  () => queryParams.category !== undefined || queryParams.status !== undefined,
)
function clearFilters() {
  searchQuery.value = ''
  queryParams.category = undefined
  queryParams.status = undefined
  resetPagination()
}

const categories = Object.values(MediaCategory)
const statuses = Object.values(MediaStatus)

// ── Status badge ──────────────────────────────────────────────────────────
function getStatusColor(status: string) {
  switch (status) {
    case MediaStatus.Published:
      return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
    case MediaStatus.Draft:
      return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
    case MediaStatus.Archived:
      return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function categoryLabel(cat: string) {
  return cat
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Berita</template>

    <div class="space-y-6">
      <!-- Header toolbar -->
      <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
        <BaseSearch v-model="searchQuery" placeholder="Cari judul berita..." />

        <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default>
              <div class="space-y-4">
                <!-- Category -->
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Kategori</label>
                  <select
                    v-model="queryParams.category"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option :value="undefined">Semua</option>
                    <option v-for="cat in categories" :key="cat" :value="cat">
                      {{ categoryLabel(cat) }}
                    </option>
                  </select>
                </div>

                <!-- Status -->
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
                  >
                    <option :value="undefined">Semua</option>
                    <option v-for="s in statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </template>
          </BaseFilter>

          <BaseButton variant="primary" @click="router.push({ name: 'dashboard-news-create' })">
            <Plus :size="18" class="mr-1" />
            Tambah Berita
          </BaseButton>
        </div>
      </div>

      <!-- Table -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data berita..."
        :is-empty="!isLoading && news.length === 0"
        empty-message="Tidak ada berita yang ditemukan."
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
      >
        <template #empty-icon>
          <Newspaper :size="64" class="text-gray-300 mb-2" />
        </template>

        <template #headers>
          <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">No</th>
          <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Judul</th>
          <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
          <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
            <Eye :size="13" class="inline mr-1" />Dilihat
          </th>
          <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Dipublikasi
          </th>
          <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Dibuat</th>
          <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
        </template>

        <template #rows>
          <tr
            v-for="(item, index) in news"
            :key="item.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <!-- No -->
            <td class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {{ pageOffset * (queryParams.limit ?? 10) + index + 1 }}
            </td>

            <!-- Title + Cover thumbnail -->
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div
                  class="h-10 w-14 flex-shrink-0 rounded overflow-hidden bg-gray-100 dark:bg-gray-700"
                >
                  <img
                    v-if="item.coverImage"
                    :src="item.coverImage"
                    :alt="item.title"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="h-full w-full flex items-center justify-center"
                  >
                    <Newspaper :size="16" class="text-gray-400" />
                  </div>
                </div>
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">
                  {{ item.title }}
                </span>
              </div>
            </td>

            <!-- Category -->
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 capitalize">
              {{ categoryLabel(item.category) }}
            </td>

            <!-- Status -->
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(item.status),
                ]"
              >
                {{ statusLabel(item.status) }}
              </span>
            </td>

            <!-- Views -->
            <td class="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {{ item.views.toLocaleString('id-ID') }}
            </td>

            <!-- Published At -->
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {{ item.publishedAt ? formatDate(item.publishedAt) : '—' }}
            </td>

            <!-- Created At -->
            <td class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {{ formatDate(item.createdAt) }}
            </td>

            <!-- Actions -->
            <td class="px-4 py-3 text-center whitespace-nowrap">
              <div class="flex items-center justify-center gap-1">
                <router-link
                  :to="{ name: 'dashboard-news-edit', params: { id: item.id } }"
                  class="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                  title="Edit berita"
                >
                  <SquarePen :size="16" />
                </router-link>
                <button
                  @click="openDeleteConfirm(item)"
                  class="p-1.5 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Hapus berita"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>

  <ConfirmationModal
    :show="confirmShow"
    title="Hapus Berita?"
    :message="`Berita &quot;${confirmNews?.title}&quot; akan dihapus secara permanen.\nTindakan ini tidak dapat dibatalkan.`"
    primary-button-text="Hapus"
    secondary-button-text="Batal"
    :primary-button-loading="deleteMutation.isPending.value"
    @primary="handleConfirmDelete"
    @secondary="confirmShow = false"
    @close="confirmShow = false"
  />
</template>
