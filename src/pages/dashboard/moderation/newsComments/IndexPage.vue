<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  MessageCircleMore,
  Trash2,
  Flag,
  Newspaper,
  MessageSquare,
  ChevronRight,
  ShieldAlert,
  X,
} from 'lucide-vue-next'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { usePublishedNewsList } from '@/composables/news/useNewsList'
import { useNewsCommentList } from '@/composables/newsComment/useNewsCommentList'
import { useNewsCommentDelete } from '@/composables/newsComment/useNewsCommentDelete'
import { useNewsCommentReport } from '@/composables/newsComment/useNewsCommentReport'
import type { News, NewsComment } from '@/types/news'
import { formatDate } from '@/utils/format'

// ── News article selector panel ───────────────────────────────────────────
const newsQueryParams = reactive({
  limit: 10,
  search: undefined as string | undefined,
})

const newsSearchQuery = ref('')
let newsSearchTimeout: ReturnType<typeof setTimeout>

watch(newsSearchQuery, (val) => {
  clearTimeout(newsSearchTimeout)
  newsSearchTimeout = setTimeout(() => {
    newsQueryParams.search = val || undefined
  }, 400)
})

const {
  news,
  pagination: newsPagination,
  isLoading: newsLoading,
} = usePublishedNewsList(newsQueryParams)

const selectedNews = ref<News | null>(null)

function selectNews(article: News) {
  selectedNews.value = article
  commentSearch.value = ''
  commentPageOffset.value = 0
}

// ── Comment list panel ────────────────────────────────────────────────────
const commentSearch = ref('')
const commentPageOffset = ref(0)
const commentLimit = ref(10)
const commentLimitOptions = [10, 25, 50]

const selectedNewsSlug = computed(() => selectedNews.value?.slug ?? '')

const {
  newsComments,
  pagination: commentPagination,
  isLoading: commentsLoading,
} = useNewsCommentList(selectedNewsSlug as unknown as string)

function handleCommentNext() {
  if (commentPagination.value?.nextCursor) commentPageOffset.value += 1
}
function handleCommentPrev() {
  if (commentPagination.value?.prevCursor) commentPageOffset.value -= 1
}

// Local filter by search
const filteredComments = computed(() => {
  if (!commentSearch.value.trim()) return newsComments.value
  const q = commentSearch.value.toLowerCase()
  return newsComments.value.filter(
    (c) => c.username.toLowerCase().includes(q) || c.content.toLowerCase().includes(q),
  )
})

// ── Delete ────────────────────────────────────────────────────────────────
const { deleteMutation } = useNewsCommentDelete()
const confirmDeleteShow = ref(false)
const confirmDeleteComment = ref<NewsComment | null>(null)

function openDeleteConfirm(comment: NewsComment) {
  confirmDeleteComment.value = comment
  confirmDeleteShow.value = true
}

async function handleConfirmDelete() {
  if (!confirmDeleteComment.value) return
  await deleteMutation.mutateAsync(confirmDeleteComment.value.id)
  confirmDeleteShow.value = false
  confirmDeleteComment.value = null
}

// ── Report ────────────────────────────────────────────────────────────────
const { createMutation: reportMutation } = useNewsCommentReport()
const reportShow = ref(false)
const reportComment = ref<NewsComment | null>(null)
const reportReason = ref('')

function openReportModal(comment: NewsComment) {
  reportComment.value = comment
  reportReason.value = ''
  reportShow.value = true
}

async function handleConfirmReport() {
  if (!reportComment.value || !reportReason.value.trim()) return
  await reportMutation.mutateAsync({
    newsCommentID: reportComment.value.id,
    reason: reportReason.value.trim(),
  })
  reportShow.value = false
  reportComment.value = null
  reportReason.value = ''
}

// ── Utilities ─────────────────────────────────────────────────────────────
function truncate(text: string, max = 80) {
  return text.length > max ? text.slice(0, max) + '…' : text
}
</script>

<template>
  <DashboardLayout>
    <template #title>Moderasi Komentar</template>

    <div class="flex flex-col gap-6">
      <!-- Page description banner -->
      <div
        class="flex items-start gap-4 rounded-xl border border-sky-200 bg-linear-to-r from-sky-50 to-blue-50 p-4 dark:border-sky-800 dark:from-sky-950/40 dark:to-blue-950/40"
      >
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-white shadow"
        >
          <ShieldAlert :size="20" />
        </div>
        <div>
          <p class="text-sm font-semibold text-sky-900 dark:text-sky-200">
            Moderasi Komentar Berita
          </p>
          <p class="mt-0.5 text-xs text-sky-700 dark:text-sky-400">
            Pilih artikel berita di panel kiri untuk melihat dan mengelola komentar yang dikirimkan
            pengguna. Anda dapat menghapus atau melaporkan komentar yang tidak sesuai.
          </p>
        </div>
      </div>

      <!-- Two-panel layout -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <!-- LEFT: News article selector -->
        <div
          class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-[#1a1a1a]"
        >
          <div class="flex items-center gap-2">
            <Newspaper :size="18" class="text-sky-600" />
            <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">Artikel Berita</h2>
          </div>

          <!-- Search news -->
          <BaseSearch v-model="newsSearchQuery" placeholder="Cari berita..." />

          <!-- Loading skeleton -->
          <div v-if="newsLoading" class="space-y-2">
            <div
              v-for="i in 5"
              :key="i"
              class="h-16 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800"
            />
          </div>

          <!-- Empty state -->
          <div
            v-else-if="news.length === 0"
            class="flex flex-col items-center justify-center py-10 text-center text-gray-400"
          >
            <Newspaper :size="40" class="mb-2 opacity-40" />
            <p class="text-sm">Tidak ada berita ditemukan.</p>
          </div>

          <!-- Articles list -->
          <ul v-else class="flex flex-col gap-1.5 overflow-y-auto" style="max-height: 480px">
            <li v-for="article in news" :key="article.id">
              <button
                @click="selectNews(article)"
                :class="[
                  'group flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition-all duration-150',
                  selectedNews?.id === article.id
                    ? 'bg-sky-600 text-white shadow'
                    : 'hover:bg-gray-50 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
                ]"
              >
                <div class="min-w-0 flex-1">
                  <p
                    class="truncate text-sm font-medium"
                    :class="
                      selectedNews?.id === article.id
                        ? 'text-white'
                        : 'text-gray-800 dark:text-gray-100'
                    "
                  >
                    {{ article.title }}
                  </p>
                  <p
                    class="mt-0.5 truncate text-xs capitalize"
                    :class="
                      selectedNews?.id === article.id
                        ? 'text-sky-200'
                        : 'text-gray-500 dark:text-gray-400'
                    "
                  >
                    {{ article.category }} · {{ formatDate(article.publishedAt) }}
                  </p>
                </div>
                <ChevronRight
                  :size="16"
                  :class="
                    selectedNews?.id === article.id
                      ? 'text-sky-200'
                      : 'text-gray-400 group-hover:text-gray-600'
                  "
                />
              </button>
            </li>
          </ul>

          <!-- Pagination controls -->
          <div
            v-if="newsPagination?.prevCursor || newsPagination?.nextCursor"
            class="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700"
          >
            <button
              :disabled="!newsPagination?.prevCursor"
              class="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Sebelumnya
            </button>
            <button
              :disabled="!newsPagination?.nextCursor"
              class="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-600 dark:hover:bg-gray-800"
            >
              Berikutnya
            </button>
          </div>
        </div>

        <!-- RIGHT: Comments panel -->
        <div
          class="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#1a1a1a]"
        >
          <!-- Header -->
          <div
            class="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-center gap-2">
              <MessageCircleMore :size="18" class="text-sky-600" />
              <div>
                <h2 class="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {{ selectedNews ? selectedNews.title : 'Komentar' }}
                </h2>
                <p v-if="selectedNews" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ filteredComments.length }} komentar ditemukan
                </p>
              </div>
            </div>

            <!-- Comment search -->
            <div v-if="selectedNews" class="w-full sm:w-64">
              <BaseSearch v-model="commentSearch" placeholder="Cari komentar atau pengguna..." />
            </div>
          </div>

          <!-- No article selected -->
          <div
            v-if="!selectedNews"
            class="flex flex-col items-center justify-center py-20 text-center text-gray-400"
          >
            <MessageCircleMore :size="56" class="mb-3 opacity-30" />
            <p class="text-base font-medium text-gray-500 dark:text-gray-400">
              Pilih artikel berita
            </p>
            <p class="mt-1 text-sm text-gray-400 dark:text-gray-500">
              Pilih artikel dari panel kiri untuk menampilkan komentar.
            </p>
          </div>

          <!-- Comments table -->
          <div v-else class="overflow-hidden">
            <BaseTable
              :loading="commentsLoading"
              loading-message="Memuat komentar..."
              :is-empty="!commentsLoading && filteredComments.length === 0"
              empty-message="Tidak ada komentar yang ditemukan."
              :has-prev="!!commentPagination?.prevCursor"
              :has-next="!!commentPagination?.nextCursor"
              v-model:limit="commentLimit"
              :limit-options="commentLimitOptions"
              @prev="handleCommentPrev"
              @next="handleCommentNext"
            >
              <template #empty-icon>
                <MessageSquare :size="56" class="mb-2 text-gray-300" />
              </template>

              <template #headers>
                <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  No
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Pengguna
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Komentar
                </th>
                <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Tanggal
                </th>
                <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
                  Aksi
                </th>
              </template>

              <template #rows>
                <tr
                  v-for="(comment, index) in filteredComments"
                  :key="comment.id"
                  class="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <!-- No -->
                  <td class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                    {{ commentPageOffset * commentLimit + index + 1 }}
                  </td>

                  <!-- Username -->
                  <td class="px-4 py-3 whitespace-nowrap">
                    <div class="flex items-center gap-2">
                      <div
                        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300"
                      >
                        {{ comment.username.charAt(0).toUpperCase() }}
                      </div>
                      <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {{ comment.username }}
                      </span>
                    </div>
                  </td>

                  <!-- Content -->
                  <td class="max-w-xs px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {{ truncate(comment.content) }}
                  </td>

                  <!-- Date -->
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {{ formatDate(comment.createdAt) }}
                  </td>

                  <!-- Actions -->
                  <td class="px-4 py-3 text-center">
                    <div class="flex items-center justify-center gap-1">
                      <button
                        @click="openReportModal(comment)"
                        class="rounded p-1.5 text-amber-500 transition-colors duration-150 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        title="Laporkan komentar"
                      >
                        <Flag :size="16" />
                      </button>
                      <button
                        @click="openDeleteConfirm(comment)"
                        class="rounded p-1.5 text-red-500 transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Hapus komentar"
                      >
                        <Trash2 :size="16" />
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </BaseTable>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>

  <!-- Delete Confirmation Modal -->
  <ConfirmationModal
    :show="confirmDeleteShow"
    title="Hapus Komentar?"
    :message="`Komentar dari @${confirmDeleteComment?.username} akan dihapus secara permanen.\nTindakan ini tidak dapat dibatalkan.`"
    primary-button-text="Hapus"
    secondary-button-text="Batal"
    :primary-button-loading="deleteMutation.isPending.value"
    @primary="handleConfirmDelete"
    @secondary="confirmDeleteShow = false"
    @close="confirmDeleteShow = false"
  />

  <!-- Report Modal -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="reportShow"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="reportShow = false"
    >
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="reportShow"
          class="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl max-w-md w-full p-6 relative"
        >
          <button
            @click="reportShow = false"
            class="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X :size="18" />
          </button>

          <div class="flex items-center gap-3 mb-4">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40"
            >
              <Flag :size="20" class="text-amber-600" />
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">
                Laporkan Komentar
              </h3>
              <p v-if="reportComment" class="text-xs text-gray-500 dark:text-gray-400">
                dari @{{ reportComment.username }}
              </p>
            </div>
          </div>

          <!-- Comment preview -->
          <div
            v-if="reportComment"
            class="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
          >
            <p class="text-sm italic text-gray-600 dark:text-gray-300">
              "{{ truncate(reportComment.content, 120) }}"
            </p>
          </div>

          <div class="mb-5">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Alasan Laporan <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="reportReason"
              rows="3"
              placeholder="Jelaskan mengapa komentar ini perlu dilaporkan..."
              class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none transition-shadow focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-sky-400"
            />
          </div>

          <div class="flex gap-3">
            <button
              @click="reportShow = false"
              class="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Batal
            </button>
            <button
              @click="handleConfirmReport"
              :disabled="!reportReason.trim() || reportMutation.isPending.value"
              class="flex-1 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            >
              {{ reportMutation.isPending.value ? 'Melaporkan...' : 'Kirim Laporan' }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
