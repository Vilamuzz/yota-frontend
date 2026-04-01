<script setup lang="ts">
import { computed, ref } from 'vue'
import { Motion } from 'motion-v'
import { useRoute, useRouter } from 'vue-router'
import { useCurrentUser } from '@/composables/auth/useCurrentUser'
import { ChevronDown, User, Settings, LogOut, ChevronRight, Check } from 'lucide-vue-next'
import { useLogout } from '@/composables/auth/useLogout'
import { useMenuItems } from '@/composables/navigation/useMenuItems'
import { useRoleSwitch } from '@/composables/auth/useRoleSwitch'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
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
  return authStore.activeRole || 'User'
}

const { logout } = useLogout()
const { menuItems, expandedMenus, toggleSubMenu, isActive, isSubMenuActive } = useMenuItems()

const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <div class="flex h-screen bg-gray-100 overflow-hidden">
    <aside
      class="bg-primary-500 text-white transition-all duration-300 flex flex-col w-64 font-poppins"
    >
      <!-- Logo Section -->
      <div class="p-4 flex items-center justify-between border-b border-white/10">
        <div class="flex items-center gap-3">
          <div class="text-2xl font-bold">YOTA</div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <div v-for="item in menuItems" :key="item.name">
          <!-- Item with Dropdown -->
          <div v-if="item.children">
            <button
              @click="toggleSubMenu(item.name)"
              :aria-expanded="expandedMenus[item.name] || isSubMenuActive(item.children)"
              :class="[
                'w-full flex items-center justify-between px-4 py-2 rounded-sm transition-all duration-200',
                isSubMenuActive(item.children)
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              ]"
            >
              <div class="flex items-center gap-3">
                <component :is="item.icon" :size="20" :stroke-width="2" />
                <span class="font-medium">{{ item.label }}</span>
              </div>
              <ChevronDown
                :size="16"
                class="transition-transform duration-200"
                :class="{ 'rotate-180': expandedMenus[item.name] }"
              />
            </button>
            <div
              v-show="expandedMenus[item.name] || isSubMenuActive(item.children)"
              class="mt-1 flex flex-col space-y-1"
            >
              <router-link
                v-for="child in item.children"
                :key="child.name"
                :to="child.path || ''"
                :aria-current="isActive(child.name) ? 'page' : undefined"
                :class="[
                  'w-full flex items-center px-4 py-2 text-sm rounded-sm transition-all duration-200 text-left',
                  isActive(child.name)
                    ? 'bg-white/20 text-white font-medium shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5',
                ]"
              >
                {{ child.label }}
              </router-link>
            </div>
          </div>

          <!-- Direct Link Item -->
          <router-link
            v-else
            :to="item.path || ''"
            :aria-current="isActive(item.name) ? 'page' : undefined"
            :class="[
              'w-full flex items-center gap-3 px-4 py-2 rounded-sm transition-all duration-200',
              isActive(item.name)
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            ]"
          >
            <component :is="item.icon" :size="20" :stroke-width="2" />
            <span class="font-medium">{{ item.label }}</span>
          </router-link>
        </div>
      </nav>

      <!-- Logout -->
      <div class="p-4">
        <button
          @click="handleLogout"
          class="w-full flex text-white/70 items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
        >
          <LogOut :size="20" />
          <span class="font-medium">Logout</span>
        </button>
      </div>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-white z-10 font-sf-pro">
        <div class="flex items-center justify-between px-6 py-4">
          <div class="flex flex-col gap-1.5">
            <h1 class="text-2xl font-bold text-gray-900 leading-tight">{{ route.meta.title }}</h1>

            <!-- Breadcrumbs -->
            <nav class="flex items-center text-sm font-medium text-gray-500">
              <template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
                <router-link
                  v-if="index < breadcrumbs.length - 1"
                  :to="crumb.path"
                  class="hover:text-primary-600 transition-colors duration-200"
                >
                  {{ crumb.label }}
                </router-link>
                <span v-else class="text-gray-900">{{ crumb.label }}</span>

                <ChevronRight
                  v-if="index < breadcrumbs.length - 1"
                  class="w-4 h-4 mx-1.5 text-gray-400"
                />
              </template>
            </nav>
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
            <Motion
              v-if="showUserMenu"
              :initial="{ opacity: 0, y: -10, scale: 0.95 }"
              :animate="{ opacity: 1, y: 0, scale: 1 }"
              :exit="{ opacity: 0, y: -10, scale: 0.95 }"
              :transition="{ duration: 0.2 }"
              class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            >
              <div class="px-4 py-3 border-b border-gray-200">
                <div class="text-sm font-semibold text-gray-800">
                  {{ user?.username || 'User' }}
                </div>
                <div class="text-xs text-gray-500">{{ user?.email }}</div>
              </div>

              <!-- Role Switcher -->
              <div v-if="authStore.roles.length > 1" class="py-2 border-b border-gray-200">
                <div class="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Switch Role
                </div>
                <button
                  v-for="role in authStore.roles"
                  :key="role"
                  @click="(switchRole(role), (showUserMenu = false))"
                  :disabled="isSwitchingRole || authStore.activeRole === role"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 flex items-center justify-between transition-colors duration-150"
                  :class="[
                    authStore.activeRole === role
                      ? 'bg-primary-50 font-medium'
                      : 'hover:bg-gray-100',
                    isSwitchingRole ? 'opacity-50 cursor-not-allowed' : '',
                  ]"
                >
                  <span>{{ role }}</span>
                  <Check v-if="authStore.activeRole === role" :size="16" class="text-primary-600" />
                </button>
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
            </Motion>
          </div>
        </div>
      </header>

      <!-- Click outside to close user menu -->
      <div v-if="showUserMenu" @click="showUserMenu = false" class="fixed inset-0 z-40"></div>

      <main class="flex-1 overflow-y-auto bg-white font-sf-pro">
        <div class="p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
