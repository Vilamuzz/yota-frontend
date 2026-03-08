<script setup lang="ts">
import { useLogout } from '@/composables/auth/useLogout'
import { useMenuItems } from '@/composables/navigation/useMenuItems'
import { ChevronDown, LogOut } from 'lucide-vue-next'

const { logout } = useLogout()
const { menuItems, expandedMenus, toggleSubMenu, isActive, isSubMenuActive } = useMenuItems()

const handleLogout = async () => {
  await logout()
}
</script>

<template>
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
</template>
