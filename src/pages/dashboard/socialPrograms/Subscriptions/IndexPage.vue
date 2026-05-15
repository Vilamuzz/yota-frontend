<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Users, Eye, Plus } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import { useSocialProgramSubscriptionList } from '@/composables/socialProgramSubscription/useSocialProgramSubscriptionList'
import { useSocialProgramDetail } from '@/composables/socialProgram/useSocialProgramDetail'
import { useCursorPagination } from '@/composables/ui/usePagination'
import type { SocialProgramSubscriptionQueryParams } from '@/types/socialProgramSubscription'
import { SocialProgramSubscriptionStatus } from '@/types/socialProgramSubscription'
import { getStatusColor } from '@/utils/statusColor'
import BaseButton from '@/components/atoms/BaseButton.vue'
import AddOfflineSubscriptionModal from '@/components/molecules/AddOfflineSubscriptionModal.vue'
import { useSocialProgramSubscriptionCreate } from '@/composables/socialProgramSubscription/useSocialProgramSubscriptionCreate'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'
import type { CreateOfflineSocialProgramSubscriptionRequest } from '@/types/socialProgramSubscription'

const route = useRoute()
const programId = route.params.id as string

// Program Detail
const { detailQuery: programDetailQuery } = useSocialProgramDetail(programId)
const program = computed(() => programDetailQuery.data.value?.data)

// Subscriptions List
const queryParams = reactive<SocialProgramSubscriptionQueryParams>({
  limit: 10,
  search: undefined,
  status: undefined,
})

const { subscriptions, pagination, isLoading } = useSocialProgramSubscriptionList(
  programId,
  queryParams,
)
const { pageOffset, resetPagination, handleNextPage, handlePrevPage } =
  useCursorPagination(queryParams)

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

// Add Subscription Modal
const { showToast } = useToast()
const isAddModalOpen = ref(false)
const { createMutation, validationErrors, reset } = useSocialProgramSubscriptionCreate()

watch(isAddModalOpen, (val) => {
  if (val) reset()
})

const handleAddSubscription = (payload: CreateOfflineSocialProgramSubscriptionRequest) => {
  createMutation.mutate(
    {
      programId,
      payload,
    },
    {
      onSuccess: () => {
        showToast('Pelanggan berhasil ditambahkan', 'success')
        isAddModalOpen.value = false
      },
      onError: (error) => {
        showToast(extractError(error) || 'Gagal menambahkan pelanggan', 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Daftar Subscriber Program</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <BaseButton
          variant="primary"
          class="flex items-center gap-2"
          @click="isAddModalOpen = true"
        >
          <Plus :size="16" />
          Tambah Pelanggan
        </BaseButton>

        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BaseSearch
            v-model="searchQuery"
            placeholder="Cari Subscriber..."
            class="w-full sm:w-64"
          />
          <BaseFilter>
            <template #default>
              <div class="space-y-4">
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800"
                  >
                    <option :value="undefined">Semua</option>
                    <option :value="SocialProgramSubscriptionStatus.ACTIVE">Aktif</option>
                    <option :value="SocialProgramSubscriptionStatus.PAUSED">
                      Diterima (Paused)
                    </option>
                    <option :value="SocialProgramSubscriptionStatus.INACTIVE">Berhenti</option>
                  </select>
                </div>
              </div>
            </template>
          </BaseFilter>
        </div>
      </div>

      <!-- Program Info Card -->
      <div
        v-if="program"
        class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
      >
        <div class="flex items-center gap-4">
          <div
            class="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shrink-0"
          >
            <img
              v-if="program.coverImage"
              :src="program.coverImage"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
              <Users :size="24" />
            </div>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ program.title }}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
              <Users :size="14" />
              {{ program.totalSubscribers }} Subscriber Aktif
            </p>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <BaseTable
        :loading="isLoading"
        loading-message="Memuat data subscriber..."
        :is-empty="subscriptions.length === 0"
        empty-message="Tidak ada subscriber ditemukan"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <Users :size="96" class="mx-auto mb-2 text-gray-300" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-16">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Subscriber
          </th>

          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Lama Berlangganan
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider w-24">
            Aksi
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(sub, index) in subscriptions"
            :key="sub.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ pageOffset * queryParams.limit! + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ sub.username }}
                  </span>
                </div>
              </div>
            </td>

            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider',
                  getStatusColor(sub.status),
                ]"
              >
                {{
                  sub.status === SocialProgramSubscriptionStatus.ACTIVE
                    ? 'Aktif'
                    : sub.status === SocialProgramSubscriptionStatus.PAUSED
                      ? 'Diterima'
                      : 'Berhenti'
                }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ sub.period }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <button
                class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-300"
                title="Lihat detail tagihan"
              >
                <Eye :size="18" />
              </button>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>

    <!-- Add Offline Subscription Modal -->
    <AddOfflineSubscriptionModal
      :show="isAddModalOpen"
      :program-id="programId"
      :loading="createMutation.isPending.value"
      :errors="validationErrors"
      @close="isAddModalOpen = false"
      @submit="handleAddSubscription"
    />
  </DashboardLayout>
</template>
