<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { UserCheck, SquarePen, Ban, UserRound, Eye } from 'lucide-vue-next'

import { useUserList } from '@/composables/user/useUserList'
import { useUserUpdate } from '@/composables/user/useUserUpdate'
import { useRoleList } from '@/composables/role/useRoleList'
import { useQueryClient } from '@tanstack/vue-query'
import UserModal from '@/components/molecules/UserModal.vue'
import BaseTable from '@/components/molecules/BaseTable.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import BaseSearch from '@/components/atoms/BaseSearch.vue'
import BaseFilter from '@/components/atoms/BaseFilter.vue'
import type { User, UsersParams } from '@/types/users'

const searchQuery = ref('')
const debouncedSearchQuery = ref('')
const selectedRole = ref<number | 'all'>('all')
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

const queryParams = computed<UsersParams>(() => {
  const params: UsersParams = { limit: limit.value }

  if (direction.value === 'next' && currentNextCursor.value) {
    params.next_cursor = currentNextCursor.value
  } else if (direction.value === 'prev' && currentPrevCursor.value) {
    params.prev_cursor = currentPrevCursor.value
  }

  if (debouncedSearchQuery.value) {
    params.search = debouncedSearchQuery.value
  }

  if (selectedRole.value !== 'all') {
    params.role = selectedRole.value
  }

  if (selectedStatus.value !== 'all') {
    params.status = selectedStatus.value === 'active'
  }

  return params
})

const resetPagination = () => {
  currentNextCursor.value = undefined
  currentPrevCursor.value = undefined
  direction.value = undefined
  pageOffset.value = 0
}

watch([debouncedSearchQuery, selectedRole, selectedStatus, limit], () => {
  resetPagination()
})

const { roleListQuery } = useRoleList()
const roles = computed(() => roleListQuery.data.value?.data || [])

const queryClient = useQueryClient()
const { updateUserMutation } = useUserUpdate()

// Fetch users via composable
const { userListQuery } = useUserList(queryParams)
const users = computed<User[]>(() => userListQuery.data.value?.data?.users || [])
const pagination = computed(() => userListQuery.data.value?.data?.pagination)

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
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'banned':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// Modal state
const modalShow = ref(false)
const modalUser = ref<User | null>(null)
const modalMode = ref<'view' | 'edit'>('view')

const openViewModal = (user: User) => {
  modalUser.value = user
  modalMode.value = 'view'
  modalShow.value = true
}

const openEditModal = (user: User) => {
  modalUser.value = user
  modalMode.value = 'edit'
  modalShow.value = true
}

const closeModal = () => {
  modalShow.value = false
}

// Ban / Unban confirmation modal
const confirmShow = ref(false)
const confirmUser = ref<User | null>(null)
const confirmAction = ref<'ban' | 'unban'>('ban')

const confirmTitle = computed(() =>
  confirmAction.value === 'ban'
    ? `Ban ${confirmUser.value?.username}?`
    : `Unban ${confirmUser.value?.username}?`,
)

const confirmMessage = computed(() =>
  confirmAction.value === 'ban'
    ? `${confirmUser.value?.username} will lose access to the platform immediately.`
    : `${confirmUser.value?.username} will regain access to the platform.`,
)

const banUser = (user: User) => {
  confirmUser.value = user
  confirmAction.value = 'ban'
  confirmShow.value = true
}

const unbanUser = (user: User) => {
  confirmUser.value = user
  confirmAction.value = 'unban'
  confirmShow.value = true
}

const handleConfirmAction = async () => {
  if (!confirmUser.value) return
  await updateUserMutation.mutateAsync({
    userId: confirmUser.value.id,
    data: { status: confirmAction.value === 'unban' },
  })
  queryClient.invalidateQueries({ queryKey: ['users'] })
  confirmShow.value = false
  confirmUser.value = null
}

const clearFilters = () => {
  searchQuery.value = ''
  debouncedSearchQuery.value = ''
  selectedRole.value = 'all'
  selectedStatus.value = 'all'
}

const statuses = ['all', 'active', 'banned']
</script>

<template>
  <DashboardLayout>
    <template #title>User Management</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="">
        <div class="flex flex-col md:flex-col gap-4">
          <!-- Search and Filter Controls -->
          <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
            <BaseSearch v-model="searchQuery" placeholder="Search users..." />
            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <BaseFilter :has-active-filters="selectedRole !== 'all' || selectedStatus !== 'all'">
                <template #default="{ closeDropdown }">
                  <div class="space-y-4">
                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Role</label>
                      <select
                        v-model="selectedRole"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option :value="'all'">All</option>
                        <option v-for="role in roles" :key="role.id" :value="role.id">
                          {{ role.role.charAt(0).toUpperCase() + role.role.slice(1) }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-xs text-gray-700 mb-2">Status</label>
                      <select
                        v-model="selectedStatus"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option
                          v-for="status in statuses"
                          :key="status"
                          :value="status.toLowerCase()"
                        >
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

      <!-- Users Table -->
      <BaseTable
        :loading="userListQuery.isPending.value"
        loading-message="Loading users..."
        :is-empty="users.length === 0"
        empty-message="No users available"
        :has-prev="pagination?.has_prev"
        :has-next="pagination?.has_next"
        v-model:limit="limit"
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
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Role</th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Status</th>
          <th class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
            Created At
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
            Actions
          </th>
        </template>

        <template #rows>
          <tr
            v-for="(user, index) in users"
            :key="user.id"
            class="hover:bg-gray-50 transition-colors duration-150"
          >
            <td class="px-6 py-4 whitespace-nowrap font-medium">
              {{ pageOffset * limit + index + 1 }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium">{{ user.username }}</td>
            <td class="px-6 py-4 whitespace-nowrap font-medium">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap font-medium">{{ user.role.role }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                  getStatusColor(user.status ? 'active' : 'banned'),
                ]"
              >
                {{ user.status ? 'Active' : 'Banned' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap font-medium">
              {{ new Date(user.created_at).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center relative">
              <button
                @click="openViewModal(user)"
                class="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                title="View details"
              >
                <Eye :size="18" />
              </button>
              <button
                @click="openEditModal(user)"
                class="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                title="Edit user"
              >
                <SquarePen :size="18" />
              </button>
              <button
                v-if="user.status !== false"
                @click="banUser(user)"
                class="p-1 text-red-600 hover:bg-gray-100 rounded transition-colors duration-150"
                title="Ban user"
              >
                <Ban :size="18" />
              </button>
              <button
                v-if="user.status === false"
                @click="unbanUser(user)"
                class="p-1 text-green-600 hover:bg-gray-100 rounded transition-colors duration-150"
                title="Unban user"
              >
                <UserCheck :size="18" />
              </button>
            </td>
          </tr>
        </template>
      </BaseTable>
    </div>
  </DashboardLayout>

  <!-- User Detail / Edit Modal -->
  <UserModal
    :show="modalShow"
    :user="modalUser"
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
    :primary-button-loading="updateUserMutation.isPending.value"
    secondary-button-text="Cancel"
    @primary="handleConfirmAction"
    @secondary="confirmShow = false"
    @close="confirmShow = false"
  />
</template>
