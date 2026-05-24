<script setup lang="ts">
import { ref, reactive } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Trash2, CheckCircle, Eye, MessageSquare, X } from 'lucide-vue-next'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { useAdminNewsCommentList } from '@/composables/newsComment/useAdminNewsCommentList'
import { useNewsCommentDelete } from '@/composables/newsComment/useNewsCommentDelete'
import { useNewsCommentAllow } from '@/composables/newsComment/useNewsCommentAllow'
import type { NewsComment } from '@/types/news'
import { formatDate } from '@/utils/format'
import { useToast } from '@/composables/ui/useToast'

const { showToast } = useToast()

const commentCursors = reactive({
  nextCursor: undefined as string | undefined,
  prevCursor: undefined as string | undefined,
})
const commentPageOffset = ref(0)
const commentLimit = ref(10)
const commentLimitOptions = [10, 25, 50]

const {
  newsComments,
  pagination: commentPagination,
  isLoading: commentsLoading,
} = useAdminNewsCommentList()

function handleCommentNext() {
  if (commentPagination.value?.nextCursor) {
    commentCursors.nextCursor = commentPagination.value.nextCursor
    commentCursors.prevCursor = undefined
    commentPageOffset.value += 1
  }
}
function handleCommentPrev() {
  if (commentPagination.value?.prevCursor) {
    commentCursors.prevCursor = commentPagination.value.prevCursor
    commentCursors.nextCursor = undefined
    commentPageOffset.value -= 1
  }
}

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

const { allowMutation } = useNewsCommentAllow()

async function allowComment(comment: NewsComment) {
  if (allowMutation.isPending.value) return
  allowMutation.mutate(comment.id, {
    onSuccess: () => {
      showToast('Komentar berhasil diizinkan', 'success')
    },
    onError: () => {
      showToast('Gagal menandai komentar aman', 'error')
    },
  })
}

const detailShow = ref(false)
const detailComment = ref<NewsComment | null>(null)

function openDetailModal(comment: NewsComment) {
  detailComment.value = comment
  detailShow.value = true
}

function truncate(text: string, max = 80) {
  return text.length > max ? text.slice(0, max) + '…' : text
}
</script>

<template>
  <DashboardLayout>
    <template #title>Moderasi Komentar</template>

    <div class="space-y-6">
      <!-- Comments table -->
      <div class="overflow-hidden">
        <BaseTable
          :loading="commentsLoading"
          loading-message="Memuat komentar..."
          :is-empty="!commentsLoading && newsComments.length === 0"
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
            <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">No</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Pengguna
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Komentar
            </th>
            <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">
              Laporan
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Tanggal
            </th>
            <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
          </template>

          <template #rows>
            <tr
              v-for="(comment, index) in newsComments"
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

              <!-- Report count -->
              <td class="px-4 py-3 text-center">
                {{ comment.reportCount ?? 0 }}
              </td>

              <!-- Date -->
              <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {{ formatDate(comment.createdAt) }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <button
                    @click="openDetailModal(comment)"
                    class="rounded p-1.5 text-blue-500 transition-colors duration-150 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    title="Lihat detail"
                  >
                    <Eye :size="16" />
                  </button>
                  <button
                    @click="allowComment(comment)"
                    :disabled="allowMutation.isPending.value"
                    class="rounded p-1.5 text-emerald-500 transition-colors duration-150 hover:bg-emerald-50 disabled:opacity-50 dark:hover:bg-emerald-950/40"
                    title="Tandai aman"
                  >
                    <CheckCircle :size="16" />
                  </button>
                  <button
                    @click="openDeleteConfirm(comment)"
                    :disabled="deleteMutation.isPending.value"
                    class="rounded p-1.5 text-red-500 transition-colors duration-150 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
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
  <!-- Detail Modal -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="detailShow"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="detailShow = false"
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
          v-if="detailShow"
          class="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl max-w-lg w-full p-6 relative"
        >
          <button
            @click="detailShow = false"
            class="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X :size="18" />
          </button>

          <div
            class="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950/40"
            >
              <Eye :size="20" class="text-sky-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Detail Komentar
              </h3>
            </div>
          </div>

          <div v-if="detailComment" class="space-y-4">
            <div>
              <label
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >Pengguna</label
              >
              <div class="mt-1 flex items-center gap-2">
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700 dark:bg-sky-900 dark:text-sky-300"
                >
                  {{ detailComment.username.charAt(0).toUpperCase() }}
                </div>
                <span class="text-base font-medium text-gray-900 dark:text-gray-100">{{
                  detailComment.username
                }}</span>
              </div>
            </div>

            <div>
              <label
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >Tanggal</label
              >
              <p class="mt-1 text-sm text-gray-800 dark:text-gray-200">
                {{ formatDate(detailComment.createdAt) }}
              </p>
            </div>

            <div>
              <label
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >Laporan</label
              >
              <p class="mt-1 text-sm font-bold text-amber-600">
                {{ detailComment.reportCount ?? 0 }} Laporan
              </p>
            </div>

            <div
              class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <label
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >Isi Komentar</label
              >
              <p
                class="mt-2 text-base italic text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
              >
                "{{ detailComment.content }}"
              </p>
            </div>

            <!-- Modal Actions -->
            <div
              class="mt-6 flex flex-wrap gap-3 border-t border-gray-100 dark:border-gray-700 pt-5"
            >
              <button
                @click="detailShow = false"
                class="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                Tutup
              </button>
              <button
                @click="(openDeleteConfirm(detailComment), (detailShow = false))"
                :disabled="deleteMutation.isPending.value"
                class="flex items-center justify-center gap-2 flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                <Trash2 :size="16" /> Hapus
              </button>
              <button
                @click="(allowComment(detailComment), (detailShow = false))"
                :disabled="allowMutation.isPending.value"
                class="flex items-center justify-center gap-2 flex-[1.5] rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors"
              >
                <CheckCircle :size="16" /> Tandai Aman
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
