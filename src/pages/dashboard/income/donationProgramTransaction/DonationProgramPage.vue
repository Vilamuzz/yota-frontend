<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { Eye, HandHeart } from 'lucide-vue-next'

import { useDonationProgramList } from '@/composables/donationProgram/useDonationProgramList'
import { useQueryClient } from '@tanstack/vue-query'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import type { Donation, DonationParams } from '@/types/donationProgram'

const router = useRouter()

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedCategory = ref('all')
const selectedStatus = ref('all')
const limit = ref(10)
const limitOptions = [10, 25, 50, 100]

let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newVal
  }, 500)
})

// Cursor pagination state
const currentNextCursor = ref<string | undefined>(undefined)
const currentPrevCursor = ref<string | undefined>(undefined)
const direction = ref<'next' | 'prev' | undefined>(undefined)
const pageOffset = ref(0)

const queryParams = computed<DonationParams>(() => {
  const params: DonationParams = { limit: limit.value }

  if (direction.value === 'next' && currentNextCursor.value) {
    params.next_cursor = currentNextCursor.value
  } else if (direction.value === 'prev' && currentPrevCursor.value) {
    params.prev_cursor = currentPrevCursor.value
  }

  if (debouncedSearchQuery.value) {
    params.search = debouncedSearchQuery.value
  }

  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }

  if (selectedStatus.value !== 'all') {
    params.status = selectedStatus.value
  }

  return params
})

const resetPagination = () => {
  currentNextCursor.value = undefined
  currentPrevCursor.value = undefined
  direction.value = undefined
  pageOffset.value = 0
}

watch([debouncedSearchQuery, selectedCategory, selectedStatus, limit], () => {
  resetPagination()
})

const queryClient = useQueryClient()

// Fetch donations via composable
const { donationListQuery } = useDonationProgramList(queryParams)
const donations = computed<Donation[]>(() => donationListQuery.data.value?.data?.donations || [])
const pagination = computed(() => donationListQuery.data.value?.data?.pagination)

const handleNextPage = () => {
  if (pagination.value?.has_next && pagination.value.next_cursor) {
    currentNextCursor.value = pagination.value.next_cursor
    direction.value = 'next'
    pageOffset.value += 1
  }
}

const handlePrevPage = () => {
  if (pagination.value?.has_prev && pagination.value.prev_cursor) {
    currentPrevCursor.value = pagination.value.prev_cursor
    direction.value = 'prev'
    pageOffset.value -= 1
  }
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'completed':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'closed':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Delete confirmation modal
const confirmShow = ref(false)
const confirmDonation = ref<Donation | null>(null)

const handleConfirmDelete = async () => {
  if (!confirmDonation.value) return
  // TODO: implement delete mutation
  queryClient.invalidateQueries({ queryKey: ['donations'] })
  confirmShow.value = false
  confirmDonation.value = null
}

const clearFilters = () => {
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
  selectedCategory.value = 'all'
  selectedStatus.value = 'all'
}

const categories = ['all', 'education', 'health', 'environment', 'social', 'disaster']
const statuses = ['all', 'active', 'pending', 'completed', 'closed']

const handleDonationTransaction = (id: string) => {
  router.push({ name: 'dashboard-donation-transaction', params: { id } })
}
</script>

<template>
  <DashboardLayout>
    <template #title>Donation Management</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="">
        <div class="flex flex-col md:flex-col gap-4">
          <!-- Search and Filter Controls -->
          <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
            <BaseSearch v-model="searchQuery" placeholder="Search donations..." />
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <BaseFilter
                :has-active-filters="selectedCategory !== 'all' || selectedStatus !== 'all'"
              >
                <template #default="{ closeDropdown }">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Category</label>
                      <select
                        v-model="selectedCategory"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option v-for="category in categories" :key="category" :value="category">
                          {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Status</label>
                      <select
                        v-model="selectedStatus"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option v-for="status in statuses" :key="status" :value="status">
                          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div class="flex gap-2 pt-2">
                      <button
                        @click="clearFilters"
                        class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                      >
                        Clear
                      </button>
                      <button
                        @click="closeDropdown"
                        class="flex-1 px-3 py-2 text-sm bg-primary-300 text-white rounded-lg hover:bg-primary-400 transition-colors duration-150"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                </template>
              </BaseFilter>
            </div>
          </div>
        </div>
      </div>

      <!-- Donations Table -->
      <BaseTable
        :loading="donationListQuery.isPending.value"
        loading-message="Loading donations..."
        :is-empty="donations.length === 0"
        empty-message="No donations available"
        :has-prev="pagination?.has_prev"
        :has-next="pagination?.has_next"
        v-model:limit="limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
      >
        <template #empty-icon>
          <HandHeart :size="96" class="mx-auto mb-2" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Judul</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Target Dana
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Dana Terkumpul
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Tanggal Berakhir
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Aksi</th>
        </template>

        <template #rows>
          <tr
            v-for="(donation, index) in donations"
            :key="donation.id"
            class="hover:bg-gray-50 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium">
              {{ pageOffset * limit + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium max-w-50 truncate">
              {{ donation.title }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium">
              {{ donation.category.charAt(0).toUpperCase() + donation.category.slice(1) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-right">
              {{ formatCurrency(donation.fund_target) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-right">
              {{ formatCurrency(donation.collected_fund) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(donation.status),
                ]"
              >
                {{ donation.status.charAt(0).toUpperCase() + donation.status.slice(1) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium">
              {{ formatDate(donation.date_end) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center relative">
              <button
                @click="handleDonationTransaction(donation.id)"
                class="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                title="View details"
              >
                <Eye :size="18" />
              </button>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>

  <!-- Delete Confirmation Modal -->
  <ConfirmationModal
    :show="confirmShow"
    :title="`Delete ${confirmDonation?.title}?`"
    :message="`This donation will be permanently deleted. This action cannot be undone.`"
    primary-button-text="Delete"
    secondary-button-text="Cancel"
    @primary="handleConfirmDelete"
    @secondary="confirmShow = false"
    @close="confirmShow = false"
  />
</template>
