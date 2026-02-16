<script setup lang="ts">
import { ref, computed } from 'vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  Search,
  Filter,
  UserCheck,
  MoreVertical,
  Eye,
  Edit,
  Ban,
  ChevronLeft,
  ChevronRight,
  UserRound,
} from 'lucide-vue-next'

interface User {
  id: number
  username: string
  email: string
  role: string
  status: 'active' | 'banned' | 'pending'
  createdAt: string
}

// Sample data
const users = ref<User[]>([])

const searchQuery = ref('')
const selectedRole = ref('all')
const selectedStatus = ref('all')
const showFilterDropdown = ref(false)
const activeDropdown = ref<number | null>(null)
const currentPage = ref(1)
const itemsPerPage = 10

// Filtered users
const filteredUsers = computed(() => {
  let result = users.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query),
    )
  }

  // Role filter
  if (selectedRole.value !== 'all') {
    result = result.filter((user) => user.role === selectedRole.value)
  }

  // Status filter
  if (selectedStatus.value !== 'all') {
    result = result.filter((user) => user.status === selectedStatus.value)
  }

  return result
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage))

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredUsers.value.slice(start, end)
})

const toggleDropdown = (userId: number) => {
  activeDropdown.value = activeDropdown.value === userId ? null : userId
}

const closeDropdown = () => {
  activeDropdown.value = null
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'banned':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const banUser = (user: User) => {
  if (confirm(`Are you sure you want to ban ${user.username}?`)) {
    user.status = 'banned'
    closeDropdown()
    // Here you would typically call an API
    console.log('Banned user:', user.id)
  }
}

const unbanUser = (user: User) => {
  if (confirm(`Are you sure you want to unban ${user.username}?`)) {
    user.status = 'active'
    closeDropdown()
    // Here you would typically call an API
    console.log('Unbanned user:', user.id)
  }
}

const viewUser = (user: User) => {
  closeDropdown()
  console.log('View user:', user.id)
  // Navigate to user detail page
}

const editUser = (user: User) => {
  closeDropdown()
  console.log('Edit user:', user.id)
  // Navigate to user edit page
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedRole.value = 'all'
  selectedStatus.value = 'all'
  currentPage.value = 1
}

const goToPage = (page: number) => {
  currentPage.value = page
}

const roles = ['all', 'Admin', 'Moderator', 'User']
const statuses = ['all', 'active', 'banned', 'pending']
</script>

<template>
  <DashboardLayout>
    <template #title>User Management</template>

    <div class="space-y-6">
      <!-- Header Section -->
      <div class="">
        <div class="flex flex-col md:flex-col gap-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-1">Users</h2>
            <p class="text-sm text-gray-600">
              Manage and monitor user accounts ({{ filteredUsers.length }} users)
            </p>
          </div>

          <!-- Search and Filter Controls -->
          <div class="flex flex-col sm:flex-row gap-3 justify-end">
            <!-- Search Field -->
            <div class="relative">
              <Search
                :size="18"
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search users..."
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm w-full sm:w-64"
              />
            </div>

            <!-- Filter Dropdown -->
            <div class="relative">
              <button
                @click="showFilterDropdown = !showFilterDropdown"
                class="flex items-center gap-2 p-2 border border-gray-300 rounded-sm bg-[#0E733B] hover:bg-[#0B5C2F] transition-colors duration-150 text-sm font-medium text-white"
              >
                <Filter :size="18" />

                <span
                  v-if="selectedRole !== 'all' || selectedStatus !== 'all'"
                  class="w-2 h-2 bg-indigo-600 rounded-full"
                ></span>
              </button>

              <!-- Filter Dropdown Menu -->
              <div
                v-if="showFilterDropdown"
                class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
              >
                <div class="space-y-4">
                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      v-model="selectedRole"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option v-for="role in roles" :key="role" :value="role.toLowerCase()">
                        {{ role.charAt(0).toUpperCase() + role.slice(1) }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      v-model="selectedStatus"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                      @click="showFilterDropdown = false"
                      class="flex-1 px-3 py-2 text-sm bg-[#0E733B] text-white rounded-lg hover:bg-[#0B5C2F] transition-colors duration-150"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="bg-white overflow-hidden">
        <div
          v-if="paginatedUsers.length === 0"
          class="p-6 text-center text-gray-500 min-h-[50vh] flex flex-col items-center justify-center"
        >
          <UserRound :size="96" class="mx-auto mb-2" />
          <p class="text-lg font-bold text-gray-700">No users available</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-100 border-b border-gray-200">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  No
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Username
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  class="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Created At
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr
                v-for="(user, index) in paginatedUsers"
                :key="user.id"
                class="hover:bg-gray-50 transition-colors duration-150"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ user.username }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {{ user.role }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span
                    :class="[
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
                      getStatusColor(user.status),
                    ]"
                  >
                    {{ user.status.charAt(0).toUpperCase() + user.status.slice(1) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ new Date(user.createdAt).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 relative">
                  <button
                    @click="toggleDropdown(user.id)"
                    class="p-1 hover:bg-gray-100 rounded transition-colors duration-150"
                  >
                    <MoreVertical :size="18" />
                  </button>

                  <!-- Action Dropdown -->
                  <div
                    v-if="activeDropdown === user.id"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <button
                      @click="viewUser(user)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Eye :size="16" />
                      <span>View Details</span>
                    </button>
                    <button
                      @click="editUser(user)"
                      class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit :size="16" />
                      <span>Edit User</span>
                    </button>
                    <div class="border-t border-gray-200 my-1"></div>
                    <button
                      v-if="user.status !== 'banned'"
                      @click="banUser(user)"
                      class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Ban :size="16" />
                      <span>Ban User</span>
                    </button>
                    <button
                      v-else
                      @click="unbanUser(user)"
                      class="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center gap-2"
                    >
                      <UserCheck :size="16" />
                      <span>Unban User</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          v-if="totalPages > 1"
          class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between"
        >
          <div class="text-sm text-gray-600">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
            {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} of
            {{ filteredUsers.length }} results
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <ChevronLeft :size="18" />
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-150',
                currentPage === page
                  ? 'bg-[#0E733B] text-white'
                  : 'border border-gray-300 hover:bg-white',
              ]"
            >
              {{ page }}
            </button>

            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              <ChevronRight :size="18" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
