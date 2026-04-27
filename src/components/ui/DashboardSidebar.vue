<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, LogOut } from 'lucide-vue-next'
import { useLogout } from '@/composables/auth/useLogout'
import { useNavigation } from '@/composables/navigation/useNavigation'

const { logout } = useLogout()
const { visibleMenu } = useNavigation()

const openDropdowns = ref<Set<string>>(new Set())
const toggleDropdown = (label: string) => {
  if (openDropdowns.value.has(label)) {
    openDropdowns.value.delete(label)
  } else {
    openDropdowns.value.add(label)
  }
}
const isOpen = (label: string) => openDropdowns.value.has(label)
</script>

<template>
  <aside
    class="bg-primary-500 dark:bg-primary-300 text-white transition-all duration-300 flex flex-col w-64 font-poppins"
  >
    <!-- Logo Section -->
    <div class="p-4 flex items-center justify-between border-b border-white/10">
      <div class="flex items-center gap-3">
        <div class="text-2xl font-bold">YOTA</div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
      <div v-for="item in visibleMenu" :key="item.label" class="menu-item">
        <!-- Direct Link Item -->
        <RouterLink v-if="!item.children" :to="item.route || ''" v-slot="{ isExactActive }">
          <div
            :class="[
              'w-full flex items-center gap-3 px-4 py-2 rounded-sm transition-all duration-200 cursor-pointer',
              isExactActive
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/70 hover:bg-white/10 hover:text-white',
            ]"
          >
            <component :is="item.icon" :size="20" :stroke-width="2" />
            <span class="font-medium">{{ item.label }}</span>
          </div>
        </RouterLink>

        <!-- Item with Dropdown -->
        <div v-else class="space-y-1">
          <button
            @click="toggleDropdown(item.label)"
            :class="[
              'w-full flex items-center justify-between px-4 py-2 rounded-sm transition-all duration-200',
              isOpen(item.label)
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
              :class="{ 'rotate-180': isOpen(item.label) }"
            />
          </button>

          <div v-show="isOpen(item.label)" class="flex flex-col space-y-1">
            <router-link
              v-for="child in item.children"
              :key="child.label"
              :to="child.route || ''"
              v-slot="{ isActive }"
            >
              <div
                :class="[
                  'w-full flex items-center px-4 py-2 text-sm rounded-sm transition-all duration-200 text-left pl-11 cursor-pointer',
                  isActive
                    ? 'bg-white/20 text-white font-medium shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/5',
                ]"
              >
                {{ child.label }}
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <div class="p-4">
      <button
        @click="logout"
        class="w-full flex text-white/70 items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 hover:text-white transition-all duration-200"
      >
        <LogOut :size="20" />
        <span class="font-medium">Logout</span>
      </button>
    </div>
  </aside>
</template>
