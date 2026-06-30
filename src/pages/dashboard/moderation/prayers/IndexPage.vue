<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { MessageCircleHeart, Trash2, CheckCircle, Eye, X } from 'lucide-vue-next'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { useAdminPrayerList } from '@/composables/prayer/useAdminPrayerList'
import { useAdminPrayerDelete } from '@/composables/prayer/useAdminPrayerDelete'
import { usePrayerAllow } from '@/composables/prayer/usePrayerAllow'
import type { Prayer } from '@/types/prayer'
import { formatDate } from '@/utils/format'
import { useToast } from '@/composables/ui/useToast'
import BaseIconButton from '@/components/atoms/BaseIconButton.vue'
import { useOffsetPagination } from '@/composables/ui/useOffsetPagination'

const { showToast } = useToast()

const queryParams = reactive({
  page: 1,
  limit: 10,
  sortBy: 'reportCount',
})
const limitOptions = [10, 25, 50]

const {
  prayers,
  pagination: prayerPagination,
  isLoading: prayersLoading,
} = useAdminPrayerList(queryParams)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } = useOffsetPagination(
  queryParams,
  prayerPagination,
)

watch(
  () => queryParams.limit,
  () => resetPagination(),
)

const { deleteMutation } = useAdminPrayerDelete()
const confirmDeleteShow = ref(false)
const confirmDeletePrayer = ref<Prayer | null>(null)

function openDeleteConfirm(prayer: Prayer) {
  confirmDeletePrayer.value = prayer
  confirmDeleteShow.value = true
}

async function handleConfirmDelete() {
  if (confirmDeletePrayer.value) {
    deleteMutation.mutate(confirmDeletePrayer.value.id, {
      onSuccess: () => {
        showToast('Doa berhasil dihapus', 'success')
        confirmDeleteShow.value = false
        confirmDeletePrayer.value = null
      },
      onError: () => {
        showToast('Gagal menghapus doa', 'error')
      },
    })
  }
}

const { allowMutation } = usePrayerAllow()

async function allowPrayer(prayer: Prayer) {
  if (allowMutation.isPending.value) return
  allowMutation.mutate(prayer.id, {
    onSuccess: () => {
      showToast('Doa berhasil diizinkan', 'success')
    },
    onError: () => {
      showToast('Gagal menandai doa aman', 'error')
    },
  })
}

const detailShow = ref(false)
const detailPrayer = ref<Prayer | null>(null)

function openDetailModal(prayer: Prayer) {
  detailPrayer.value = prayer
  detailShow.value = true
}

function truncate(text: string, max = 80) {
  return text.length > max ? text.slice(0, max) + '…' : text
}
</script>

<template>
  <DashboardLayout>
    <template #title>Moderasi Doa</template>

    <div class="space-y-6">
      <!-- Prayers table -->
      <div class="overflow-hidden">
        <BaseTable
          :loading="prayersLoading"
          loading-message="Memuat data doa..."
          :is-empty="!prayersLoading && prayers.length === 0"
          empty-message="Tidak ada doa yang ditemukan."
          :has-prev="(queryParams.page ?? 1) > 1"
          :has-next="
            prayerPagination ? (queryParams.page ?? 1) < prayerPagination.totalPages : false
          "
          v-model:limit="queryParams.limit"
          :limit-options="limitOptions"
          @prev="handlePrevPage"
          @next="handleNextPage"
        >
          <template #empty-icon>
            <MessageCircleHeart :size="56" class="mb-2 text-gray-300" />
          </template>

          <template #headers>
            <th class="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">No</th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Pengguna
            </th>
            <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              Isi Doa
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
              v-for="(prayer, index) in prayers"
              :key="prayer.id"
              class="transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <!-- No -->
              <td class="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                {{ pageOffset * queryParams.limit + index + 1 }}
              </td>

              <!-- Username -->
              <td class="px-4 py-3 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <div
                    class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                  >
                    {{ prayer.username.charAt(0).toUpperCase() }}
                  </div>
                  <span class="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {{ prayer.username }}
                  </span>
                </div>
              </td>

              <!-- Content -->
              <td class="max-w-xs px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {{ truncate(prayer.content, 40) }}
              </td>

              <!-- Amen count -->
              <td class="px-4 py-3 text-center">
                {{ prayer.reportCount }}
              </td>

              <!-- Date -->
              <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                {{ formatDate(prayer.createdAt) }}
              </td>

              <!-- Actions -->
              <td class="px-4 py-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <BaseIconButton
                    @click="openDetailModal(prayer)"
                    title="Lihat detail"
                    variant="info"
                  >
                    <Eye :size="16" />
                  </BaseIconButton>
                  <BaseIconButton
                    @click="allowPrayer(prayer)"
                    :disabled="allowMutation.isPending.value"
                    title="Tandai aman"
                    variant="success"
                  >
                    <CheckCircle :size="16" />
                  </BaseIconButton>
                  <BaseIconButton
                    @click="openDeleteConfirm(prayer)"
                    :disabled="deleteMutation.isPending.value"
                    title="Hapus doa"
                    variant="danger"
                  >
                    <Trash2 :size="16" />
                  </BaseIconButton>
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
    title="Hapus Doa?"
    :message="`Doa dari @${confirmDeletePrayer?.username} akan dihapus secara permanen.\nTindakan ini tidak dapat dibatalkan.`"
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
              class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/40"
            >
              <Eye :size="20" class="text-blue-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Detail Doa</h3>
            </div>
          </div>

          <div v-if="detailPrayer" class="space-y-4">
            <div>
              <label
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >Pengguna</label
              >
              <div class="mt-1 flex items-center gap-2">
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                >
                  {{ detailPrayer.username.charAt(0).toUpperCase() }}
                </div>
                <span class="text-base font-medium text-gray-900 dark:text-gray-100">{{
                  detailPrayer.username
                }}</span>
              </div>
            </div>

            <div>
              <label
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >Tanggal</label
              >
              <p class="mt-1 text-sm text-gray-800 dark:text-gray-200">
                {{ formatDate(detailPrayer.createdAt) }}
              </p>
            </div>

            <div class="flex gap-6">
              <div>
                <label
                  class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >Laporan</label
                >
                <p class="mt-1 text-sm font-bold text-amber-600">
                  {{ detailPrayer.reportCount }} Laporan
                </p>
              </div>
              <div>
                <label
                  class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >Dukungan</label
                >
                <p class="mt-1 text-sm font-bold text-pink-600">
                  {{ detailPrayer.amenCount }} Amin
                </p>
              </div>
            </div>

            <div
              class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <label
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >Isi Doa</label
              >
              <p
                class="mt-2 text-base italic text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
              >
                "{{ detailPrayer.content }}"
              </p>
            </div>

            <!-- Modal Actions -->
            <div
              class="mt-6 flex flex-wrap gap-3 border-t border-gray-100 dark:border-gray-700 pt-5"
            >
              <button
                @click="(openDeleteConfirm(detailPrayer), (detailShow = false))"
                :disabled="deleteMutation.isPending.value"
                class="flex items-center justify-center gap-2 flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                <Trash2 :size="16" /> Hapus
              </button>
              <button
                @click="(allowPrayer(detailPrayer), (detailShow = false))"
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
