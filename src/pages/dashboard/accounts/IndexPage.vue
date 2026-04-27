<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { UserCheck, SquarePen, Ban, UserRound, Eye } from 'lucide-vue-next'
import { useAccountList, useAccountUpdate, useRoles } from '@/composables/account'
import { useQueryClient } from '@tanstack/vue-query'
import type { Account, AccountQueryParam } from '@/types/account'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import AccountModal from '@/components/molecules/AccountModal.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'

const queryParams = reactive<AccountQueryParam>({
  limit: 10,
  search: undefined,
  roleId: undefined,
  isBanned: undefined,
  nextCursor: undefined,
  prevCursor: undefined,
})
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

watch(
  () => [queryParams.roleId, queryParams.isBanned, queryParams.limit],
  () => resetPagination(),
)

const pageOffset = ref(0)

function resetPagination() {
  queryParams.nextCursor = undefined
  queryParams.prevCursor = undefined
  pageOffset.value = 0
}

const { accounts, pagination, isLoading } = useAccountList(queryParams)
const { roles } = useRoles()
const queryClient = useQueryClient()
const { updateBanStatusMutation } = useAccountUpdate()

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

const hasActiveFilters = computed(
  () => queryParams.roleId !== undefined || queryParams.isBanned !== undefined,
)

function clearFilters() {
  searchQuery.value = ''
  queryParams.roleId = undefined
  queryParams.isBanned = undefined
  resetPagination()
}

function getStatusColor(isBanned: boolean) {
  return isBanned
    ? 'bg-red-100 text-red-700 border-red-200'
    : 'bg-green-100 text-green-700 border-green-200'
}

const modalShow = ref(false)
const modalAccount = ref<Account | null>(null)
const modalMode = ref<'view' | 'edit'>('view')

function openViewModal(account: Account) {
  modalAccount.value = account
  modalMode.value = 'view'
  modalShow.value = true
}

function openEditModal(account: Account) {
  modalAccount.value = account
  modalMode.value = 'edit'
  modalShow.value = true
}

function closeModal() {
  modalShow.value = false
}

const confirmShow = ref(false)
const confirmAccount = ref<Account | null>(null)
const confirmAction = ref<'ban' | 'unban'>('ban')

const confirmTitle = computed(() =>
  confirmAction.value === 'ban'
    ? `Ban ${confirmAccount.value?.username}?`
    : `Unban ${confirmAccount.value?.username}?`,
)

const confirmMessage = computed(() =>
  confirmAction.value === 'ban'
    ? `${confirmAccount.value?.username} will lose access to the platform immediately.`
    : `${confirmAccount.value?.username} will regain access to the platform.`,
)

function openBanConfirm(account: Account) {
  confirmAccount.value = account
  confirmAction.value = 'ban'
  confirmShow.value = true
}

function openUnbanConfirm(account: Account) {
  confirmAccount.value = account
  confirmAction.value = 'unban'
  confirmShow.value = true
}

function handleConfirmAction() {
  if (!confirmAccount.value) return
  updateBanStatusMutation.mutate(
    {
      accountId: confirmAccount.value.id,
      data: { banStatus: confirmAction.value === 'ban' },
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        confirmShow.value = false
        confirmAccount.value = null
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Account Management</template>

    <div class="space-y-6">
      <!-- Search and Filter Controls -->
      <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
        <BaseSearch v-model="searchQuery" placeholder="Search accounts..." />

        <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
          <BaseFilter :has-active-filters="hasActiveFilters">
            <template #default="{ closeDropdown }">
              <div class="space-y-4">
                <!-- Role filter -->
                <div>
                  <label class="block text-xs text-gray-700 mb-2">Role</label>
                  <select
                    v-model="queryParams.roleId"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option :value="undefined">All</option>
                    <option v-for="role in roles" :key="role.id" :value="role.id">
                      {{ role.name.charAt(0).toUpperCase() + role.name.slice(1) }}
                    </option>
                  </select>
                </div>

                <!-- Status filter -->
                <div>
                  <label class="block text-xs text-gray-700 mb-2">Status</label>
                  <select
                    v-model="queryParams.isBanned"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option :value="undefined">All</option>
                    <option :value="false">Active</option>
                    <option :value="true">Banned</option>
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

      <!-- Accounts Table -->
      <BaseTable
        :loading="isLoading"
        loading-message="Loading accounts..."
        :is-empty="accounts.length === 0 && !isLoading"
        empty-message="No accounts found"
        :has-prev="!!pagination?.prevCursor"
        :has-next="!!pagination?.nextCursor"
        v-model:limit="queryParams.limit"
        :limit-options="limitOptions"
        @prev="handlePrevPage"
        @next="handleNextPage"
      >
        <template #empty-icon>
          <UserRound :size="96" class="mx-auto mb-2" />
        </template>

        <template #headers>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Username</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Email</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Default Role
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Joined At
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Actions
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(account, index) in accounts"
            :key="account.id"
            class="hover:bg-gray-50 transition-colors duration-150 dark:hover:bg-gray-700"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-500 dark:text-gray-200">
              {{ pageOffset * (queryParams.limit || 10) + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium">{{ account.username }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-200">
              {{ account.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium capitalize">
              {{ account.roles.find((r) => r.isDefault)?.roleName ?? '—' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(account.isBanned),
                ]"
              >
                {{ account.isBanned ? 'Banned' : 'Active' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-200">
              {{ new Date(account.createdAt).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <button
                @click="openViewModal(account)"
                class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 dark:hover:bg-gray-700 dark:text-gray-200"
                title="View details"
              >
                <Eye :size="18" />
              </button>
              <button
                @click="openEditModal(account)"
                class="p-1 hover:bg-gray-100 rounded transition-colors duration-150 dark:hover:bg-gray-700 dark:text-gray-200"
                title="Edit account"
              >
                <SquarePen :size="18" />
              </button>
              <button
                v-if="!account.isBanned"
                @click="openBanConfirm(account)"
                class="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-150 dark:hover:bg-gray-700"
                title="Ban account"
              >
                <Ban :size="18" />
              </button>
              <button
                v-else
                @click="openUnbanConfirm(account)"
                class="p-1 text-green-600 hover:bg-green-50 rounded transition-colors duration-150 dark:hover:bg-gray-700"
                title="Unban account"
              >
                <UserCheck :size="18" />
              </button>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>

  <!-- View / Edit Modal -->
  <AccountModal
    :show="modalShow"
    :user="modalAccount"
    :roles="roles"
    :mode="modalMode"
    @close="closeModal"
    @saved="closeModal"
  />

  <!-- Ban / Unban Confirmation Modal -->
  <ConfirmationModal
    :show="confirmShow"
    :title="confirmTitle"
    :message="confirmMessage"
    :primary-button-text="confirmAction === 'ban' ? 'Ban' : 'Unban'"
    :primary-button-loading="updateBanStatusMutation.isPending.value"
    secondary-button-text="Cancel"
    @primary="handleConfirmAction"
    @secondary="confirmShow = false"
    @close="confirmShow = false"
  />
</template>
