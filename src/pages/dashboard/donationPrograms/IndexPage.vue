<script setup lang="ts">
import { ref } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { SquarePen, Trash2, HandHeart, Plus } from 'lucide-vue-next'
import { useDonationProgramFilters } from '@/composables/donationProgram/useDonationProgramFilters'
import { useQueryClient } from '@tanstack/vue-query'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseTable from '@/components/organisms/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import {
  type DonationProgram,
  DonationProgramCategoryEnum,
  DonationProgramStatusEnum,
} from '@/types/donationProgram'
import { formatCurrency, formatDate } from '@/utils/format'
import { getStatusColor } from '@/utils/status'

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
  clearFilters,
} = useDonationProgramFilters()

const queryClient = useQueryClient()

// Delete confirmation modal
const confirmShow = ref(false)
const confirmDonation = ref<DonationProgram | null>(null)

function deleteDonation(donation: DonationProgram) {
  confirmDonation.value = donation
  confirmShow.value = true
}

async function handleConfirmDelete() {
  if (!confirmDonation.value) return
  // TODO: implement delete mutation
  queryClient.invalidateQueries({ queryKey: ['donationPrograms'] })
  confirmShow.value = false
  confirmDonation.value = null
}

const categories = Object.values(DonationProgramCategoryEnum)
const statuses = Object.values(DonationProgramStatusEnum)
</script>

<template>
  <DashboardLayout>
    <template #title>Manajemen Donasi</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
        <BaseSearch v-model="searchQuery" placeholder="Search donations..." />

        <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default>
              <div class="space-y-4">
                <!-- Category filter -->
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2"
                    >Category</label
                  >
                  <select
                    v-model="queryParams.category"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option :value="undefined">All</option>
                    <option v-for="category in categories" :key="category" :value="category">
                      {{ category.charAt(0).toUpperCase() + category.slice(1) }}
                    </option>
                  </select>
                </div>

                <!-- Status filter -->
                <div>
                  <label class="block text-xs text-gray-700 dark:text-gray-200 mb-2">Status</label>
                  <select
                    v-model="queryParams.status"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option :value="undefined">All</option>
                    <option v-for="status in statuses" :key="status" :value="status">
                      {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                    </option>
                  </select>
                </div>

                <div class="flex gap-2 pt-2">
                  <button
                    @click="clearFilters"
                    class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </template>
          </BaseFilter>

          <BaseButton variant="primary" :to="{ name: 'dashboard-donation-programs-create' }">
            <Plus :size="20" class="mr-1" />
            Create Donation
          </BaseButton>
        </div>
      </div>

      <!-- Donations Table -->
      <BaseTable
        :loading="isLoading"
        loading-message="Loading donations..."
        :is-empty="donationPrograms.length === 0 && !isLoading"
        empty-message="No donations available"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage(pagination)"
        @next="handleNextPage(pagination)"
      >
        <template #empty-icon>
          <HandHeart :size="96" class="mx-auto mb-2" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Judul</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Kategori</th>
          <th class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
            Target Donasi
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Tanggal Berakhir
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Tanggal Dibuat
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Actions
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(donation, index) in donationPrograms"
            :key="donation.id"
            class="hover:bg-gray-50 transition-colors duration-150 dark:hover:bg-gray-700"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-500 dark:text-gray-200">
              {{ pageOffset * (queryParams.limit || 10) + index + 1 }}
            </td>
            <td
              class="px-6 py-4 whitespace-nowrap font-medium max-w-50 truncate dark:text-gray-200"
            >
              {{ donation.title }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium capitalize dark:text-gray-200">
              {{ donation.category }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-right dark:text-gray-200">
              {{ formatCurrency(donation.fundTarget) }}
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
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ formatDate(donation.endDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-200">
              {{ formatDate(donation.createdAt) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center justify-center gap-2">
                <router-link
                  :to="{ name: 'dashboard-donation-programs-edit', params: { id: donation.id } }"
                  class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 inline-block dark:hover:bg-gray-700 dark:text-gray-200"
                  title="Edit donation"
                >
                  <SquarePen :size="18" />
                </router-link>
                <button
                  @click="deleteDonation(donation)"
                  class="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-150 dark:hover:bg-gray-700"
                  title="Delete donation"
                >
                  <Trash2 :size="18" />
                </button>
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
    :title="`Delete ${confirmDonation?.title}?`"
    :message="`This donation will be permanently deleted. This action cannot be undone.`"
    primary-button-text="Delete"
    secondary-button-text="Cancel"
    @primary="handleConfirmDelete"
    @secondary="confirmShow = false"
    @close="confirmShow = false"
  />
</template>
