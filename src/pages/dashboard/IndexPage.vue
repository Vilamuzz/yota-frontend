<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import {
  BarChart3,
  Users,
  FileText,
  Star,
  Mail,
  CheckCircle,
  PartyPopper,
  Plus,
  Upload,
  UserPlus,
  FileBarChart,
} from 'lucide-vue-next'

const { user, fetchCurrentUser } = useCurrentUser()
const error = ref('')
const loading = ref(false)

// Fetch current user data
const getUserData = async () => {
  loading.value = true
  error.value = ''

  const result = await fetchCurrentUser()

  if (result.isError) {
    error.value = result.error?.message || 'Failed to fetch user data'
  }

  loading.value = false
}

// Fetch user data on component mount
onMounted(() => {
  getUserData()
})
</script>

<template>
  <DashboardLayout>
    <template #title>Dashboard</template>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <svg
        class="animate-spin h-12 w-12 text-indigo-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg"
    >
      <h2 class="text-lg font-semibold mb-2">Error loading user data</h2>
      <p>{{ error }}</p>
      <button
        @click="getUserData"
        class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-200"
      >
        Retry
      </button>
    </div>

    <!-- Success State -->
    <div v-else class="space-y-6">
      <!-- Welcome Card -->
      <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {{ user?.username }}! 👋
        </h2>
        <p class="text-gray-600">Here's what's happening with your account today.</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          class="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="text-green-600">
              <BarChart3 :size="32" :stroke-width="2" />
            </div>
            <div class="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
              +12.5%
            </div>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-1">2,345</h3>
          <p class="text-sm text-gray-600">Total Views</p>
        </div>

        <div
          class="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="text-blue-600">
              <Users :size="32" :stroke-width="2" />
            </div>
            <div class="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              +8.2%
            </div>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-1">1,234</h3>
          <p class="text-sm text-gray-600">Active Users</p>
        </div>

        <div
          class="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="text-purple-600">
              <FileText :size="32" :stroke-width="2" />
            </div>
            <div class="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
              +23.1%
            </div>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-1">45</h3>
          <p class="text-sm text-gray-600">New Posts</p>
        </div>

        <div
          class="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="text-yellow-600">
              <Star :size="32" :stroke-width="2" />
            </div>
            <div class="text-xs font-semibold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
              +5.7%
            </div>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-1">4.8</h3>
          <p class="text-sm text-gray-600">Avg Rating</p>
        </div>
      </div>

      <!-- Recent Activity & Quick Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Activity -->
        <div class="lg:col-span-2 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div class="space-y-4">
            <div
              class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div
                class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0"
              >
                <Mail :size="20" class="text-blue-600" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900">New message received</p>
                <p class="text-xs text-gray-600">You have 3 unread messages</p>
                <p class="text-xs text-gray-400 mt-1">2 hours ago</p>
              </div>
            </div>

            <div
              class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div
                class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0"
              >
                <CheckCircle :size="20" class="text-green-600" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900">Task completed</p>
                <p class="text-xs text-gray-600">Project milestone reached</p>
                <p class="text-xs text-gray-400 mt-1">5 hours ago</p>
              </div>
            </div>

            <div
              class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <div
                class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0"
              >
                <PartyPopper :size="20" class="text-purple-600" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-900">Account verified</p>
                <p class="text-xs text-gray-600">Your email has been confirmed</p>
                <p class="text-xs text-gray-400 mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div class="space-y-3">
            <button
              class="w-full px-4 py-3 bg-[#0E733B] text-white rounded-lg font-medium hover:bg-[#0B5C2F] transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Plus :size="18" />
              <span>Create New</span>
            </button>
            <button
              class="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Upload :size="18" />
              <span>Upload File</span>
            </button>
            <button
              class="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <UserPlus :size="18" />
              <span>Invite Team</span>
            </button>
            <button
              class="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <FileBarChart :size="18" />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
