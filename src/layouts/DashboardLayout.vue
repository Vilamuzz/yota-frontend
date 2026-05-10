<script setup lang="ts">
import { computed, ref } from 'vue'
import { Motion } from 'motion-v'
import { useRoute, useRouter } from 'vue-router'
import { useCurrentUser } from '@/composables/account/useCurrentUser'
import { ChevronDown, User, ChevronRight, Check, Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '@/composables/ui/useTheme'
import { useRoleSwitch } from '@/composables/auth/useRoleSwitch'
import { useAuthStore } from '@/stores/auth'
import DashboardSidebar from '@/components/ui/DashboardSidebar.vue'
import type { Role } from '@/types/auth'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'

const { isDark, toggleTheme } = useTheme()
const authStore = useAuthStore()
const { showToast } = useToast()
const { user } = useCurrentUser()
const { switchRole, isLoading: isSwitchingRole } = useRoleSwitch()
const route = useRoute()
const router = useRouter()

const breadcrumbs = computed(() => {
  const crumbs = [{ label: 'Dashboard', path: '/dashboard' }]

  if (route.name === 'dashboard') {
    return crumbs
  }

  // Check if route has an activeMenu indicating a parent hierarchy
  if (route.meta.activeMenu) {
    try {
      const parentRoute = router.resolve({ name: route.meta.activeMenu as string })
      if (parentRoute) {
        crumbs.push({
          label: (parentRoute.meta.title as string) || 'Menu',
          path: parentRoute.path,
        })
      }
    } catch {
      // Ignore if activeMenu is not a valid route name
    }
  }

  // Current page
  crumbs.push({
    label: (route.meta.title as string) || 'Current Page',
    path: route.path,
  })

  return crumbs
})

const showUserMenu = ref(false)

const userInitials = computed(() => {
  if (!user.value?.username) return 'U'
  const names = user.value.username.split(' ')
  if (names.length >= 2) {
    return ((names[0]?.[0] ?? '') + (names[1]?.[0] ?? '')).toUpperCase()
  }
  return user.value.username.substring(0, 2).toUpperCase()
})

const userRole = computed(() => authStore.activeRole || 'User')

const handleRoleSwitch = (role: Role) => {
  switchRole(role, {
    onSuccess: () => {
      showToast('Role switched successfully!', 'success')
    },
    onError: (err) => {
      showToast(extractError(err, 'Gagal mengubah role. Silakan coba lagi.'), 'error')
    },
    onSettled: () => {
      showUserMenu.value = false
    },
  })
}
</script>

<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
    <DashboardSidebar />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header
        class="bg-white dark:bg-gray-800 z-10 font-sf-pro border-b border-gray-200 dark:border-gray-700"
      >
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex flex-col gap-1.5">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              {{ route.meta.title }}
            </h1>

            <!-- Breadcrumbs -->
            <nav class="flex items-center text-sm font-medium text-gray-500">
              <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
                <RouterLink
                  v-if="index < breadcrumbs.length - 1"
                  :to="crumb.path"
                  class="hover:text-primary-600 transition-colors duration-200"
                >
                  {{ crumb.label }}
                </RouterLink>
                <span v-else class="text-gray-900 dark:text-gray-200">{{ crumb.label }}</span>

                <ChevronRight
                  v-if="index < breadcrumbs.length - 1"
                  class="w-4 h-4 mx-1.5 text-gray-400"
                />
              </template>
            </nav>
          </div>

          <!-- Actions & User Profile Section -->
          <div class="relative flex items-center gap-4">
            <!-- Theme Toggle -->
            <button
              @click="toggleTheme"
              class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle dark mode"
            >
              <Sun v-if="isDark" :size="20" />
              <Moon v-else :size="20" />
            </button>

            <!-- Click outside to close user menu -->
            <div v-if="showUserMenu" @click="showUserMenu = false" class="fixed inset-0 z-40"></div>

            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <!-- Avatar -->
              <div
                v-if="user?.profilePicture"
                class="w-10 h-10 rounded-full overflow-hidden bg-primary-300 flex items-center justify-center"
              >
                <img :src="user.profilePicture" alt="Avatar" class="w-full h-full object-cover" />
              </div>
              <div
                v-else
                class="w-10 h-10 rounded-full bg-primary-300 flex items-center justify-center text-white font-semibold text-sm shadow-md"
              >
                {{ userInitials }}
              </div>

              <!-- User Info -->
              <div class="text-left hidden md:block">
                <div class="text-sm font-semibold text-gray-800 dark:text-white">
                  {{ user?.username || 'User' }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ userRole }}</div>
              </div>

              <!-- Dropdown Arrow -->
              <ChevronDown
                :size="16"
                class="text-gray-500 transition-transform duration-200"
                :class="{ 'rotate-180': showUserMenu }"
              />
            </button>

            <!-- Dropdown Menu -->
            <Motion
              v-if="showUserMenu"
              :initial="{ opacity: 0, y: -10, scale: 0.95 }"
              :animate="{ opacity: 1, y: 0, scale: 1 }"
              :exit="{ opacity: 0, y: -10, scale: 0.95 }"
              :transition="{ duration: 0.2 }"
              class="absolute right-0 top-15 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 text-gray-800 dark:text-gray-200"
            >
              <div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div class="text-sm font-semibold text-gray-800 dark:text-white">
                  {{ user?.username || 'User' }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ user?.email }}</div>
              </div>

              <!-- Role Switcher -->
              <div
                v-if="authStore.roles.length > 1"
                class="py-2 border-b border-gray-200 dark:border-gray-700"
              >
                <div
                  class="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Switch Role
                </div>
                <button
                  v-for="role in authStore.roles"
                  :key="role"
                  @click="handleRoleSwitch(role)"
                  :disabled="isSwitchingRole || authStore.activeRole === role"
                  class="w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors duration-150"
                  :class="[
                    authStore.activeRole === role
                      ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50',
                    isSwitchingRole ? 'opacity-50 cursor-not-allowed' : '',
                  ]"
                >
                  <span>{{ role }}</span>
                  <Check v-if="authStore.activeRole === role" :size="16" class="text-primary-600" />
                </button>
              </div>

              <!-- Menu Items -->
              <RouterLink
                to="/dashboard/profile"
                @click="showUserMenu = false"
                class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 flex items-center gap-2 transition-colors duration-150"
              >
                <User :size="16" />
                <span>My Profile</span>
              </RouterLink>
            </Motion>
          </div>
        </div>
      </header>

      <main
        class="flex-1 overflow-y-auto bg-transparent dark:bg-[#121212] font-sf-pro text-gray-900 dark:text-white"
      >
        <div class="p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
