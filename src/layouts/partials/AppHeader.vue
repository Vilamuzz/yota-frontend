<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'
import { ChevronDown, User, Settings } from 'lucide-vue-next'

const { user } = useCurrentUser()
const route = useRoute()

const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const getUserInitials = () => {
  if (!user.value?.username) return 'U'
  const names = user.value.username.split(' ')
  if (names.length >= 2) {
    return ((names[0]?.[0] ?? '') + (names[1]?.[0] ?? '')).toUpperCase()
  }
  return user.value.username.substring(0, 2).toUpperCase()
}

const getUserRole = () => {
  return user.value?.role || 'User'
}
</script>

<template>
  <header class="bg-white z-10 font-sf-pro">
    <div class="flex items-center justify-between px-6 py-4">
      <div class="flex items-center gap-3">
        <h1 class="text-2xl font-bold">{{ route.meta.title }}</h1>
      </div>

      <!-- User Profile Section -->
      <div class="relative">
        <button
          @click="toggleUserMenu"
          class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          <!-- Avatar -->
          <div
            class="w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center text-white font-semibold text-sm shadow-md"
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
            <router-link
              to="/dashboard/profile"
              @click="showUserMenu = false"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
            >
              <User :size="16" />
              <span>My Profile</span>
            </router-link>

            <router-link
              to="/dashboard/settings"
              @click="showUserMenu = false"
              class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors duration-150"
            >
              <Settings :size="16" />
              <span>Settings</span>
            </router-link>
          </div>
        </transition>
      </div>
    </div>
  </header>

  <!-- Click outside to close user menu -->
  <div v-if="showUserMenu" @click="showUserMenu = false" class="fixed inset-0 z-40"></div>
</template>
