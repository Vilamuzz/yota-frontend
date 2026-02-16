<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import {
  Home,
  Newspaper,
  BarChart3,
  Settings,
  ChevronDown,
  User,
  Users,
  LogOut,
} from 'lucide-vue-next'

const { user, logout } = useAuth()
const router = useRouter()
const route = useRoute()

const showUserMenu = ref(false)

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard', name: 'dashboard' },
  { icon: Users, label: 'Users', path: '/dashboard/users', name: 'users' },
  { icon: Newspaper, label: 'News', path: '/dashboard/news', name: 'news' },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics', name: 'analytics' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings', name: 'settings' },
]

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const navigateTo = (path: string) => {
  router.push(path)
  showUserMenu.value = false
}

const isActive = (name: string) => {
  return route.name === name || route.path.startsWith(`/dashboard/${name}`)
}

// Get user initials for avatar
const getUserInitials = () => {
  if (!user.value?.username) return 'U'
  const names = user.value.username.split(' ')
  if (names.length >= 2) {
    return (names[0][0] + names[1][0]).toUpperCase()
  }
  return user.value.username.substring(0, 2).toUpperCase()
}

// Get user role (default to 'User' if not available)
const getUserRole = () => {
  return user.value?.role || 'User'
}
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <!-- Sidebar -->
    <aside class="bg-[#062E18] text-white transition-all duration-300 flex flex-col w-64">
      <!-- Logo Section -->
      <div class="p-4 flex items-center justify-between border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="text-2xl font-bold">YOTA</div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4 space-y-2">
        <button
          v-for="item in menuItems"
          :key="item.path"
          @click="navigateTo(item.path)"
          :class="[
            'w-full flex items-center gap-3 px-4 py-2 rounded-sm transition-all duration-200',
            isActive(item.name)
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white',
          ]"
        >
          <component :is="item.icon" :size="20" :stroke-width="2" />
          <span class="font-medium">{{ item.label }}</span>
        </button>
      </nav>

      <!-- Toggle Sidebar Button -->
      <div class="p-4 border-t border-white/10">
        <button
          @click="handleLogout"
          class="w-full flex text-white/70 items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut :size="20" />
          <span class="font-medium">Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Navigation Bar -->
      <header class="bg-white z-10">
        <div class="flex items-center justify-end px-6 py-4">
          <!-- User Profile Section -->
          <div class="relative">
            <button
              @click="toggleUserMenu"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <!-- Profile Picture -->
              <div
                class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md"
              >
                {{ getUserInitials() }}
              </div>

              <!-- User Info -->
              <div class="text-left hidden md:block">
                <div class="text-sm font-semibold text-gray-800">
                  {{ user?.username || 'User' }}
                </div>
                <div class="text-xs text-gray-500">{{ getUserRole() }}</div>
              </div>

              <!-- Dropdown Arrow -->
              <ChevronDown
                :size="16"
                class="text-gray-500 transition-transform duration-200"
                :class="{ 'rotate-180': showUserMenu }"
              />
            </button>

            <!-- Dropdown Menu -->
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="showUserMenu"
                class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
              >
                <!-- User Info in Dropdown -->
                <div class="px-4 py-3 border-b border-gray-200">
                  <div class="text-sm font-semibold text-gray-800">
                    {{ user?.username || 'User' }}
                  </div>
                  <div class="text-xs text-gray-500">{{ user?.email }}</div>
                </div>

                <!-- Menu Items -->
                <button
                  @click="navigateTo('/dashboard/profile')"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
                >
                  <User :size="16" />
                  <span>My Profile</span>
                </button>

                <button
                  @click="navigateTo('/dashboard/settings')"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
                >
                  <Settings :size="16" />
                  <span>Settings</span>
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto bg-white">
        <div class="p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>

  <!-- Click outside to close user menu -->
  <div v-if="showUserMenu" @click="showUserMenu = false" class="fixed inset-0 z-40"></div>
</template>
