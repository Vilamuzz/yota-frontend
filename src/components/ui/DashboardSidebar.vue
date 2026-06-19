<script lang="ts">
import { ref } from 'vue'

// Persist state across layout remounts
const openDropdowns = ref<Set<string>>(new Set())
const isInitialized = ref(false)
</script>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ChevronDown, LogOut, X } from 'lucide-vue-next'
import { Motion, AnimatePresence } from 'motion-v'
import { useLogout } from '@/composables/auth/useLogout'
import { useNavigation } from '@/composables/navigation/useNavigation'
import { useFoundationProfileStore } from '@/stores/foundationProfile'

const props = withDefaults(
  defineProps<{
    isOpen?: boolean
  }>(),
  {
    isOpen: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute()
const router = useRouter()
const { logout } = useLogout()
const { visibleMenu } = useNavigation()
const foundationProfileStore = useFoundationProfileStore()

// Close sidebar on mobile when route changes
watch(
  () => route.path,
  () => {
    emit('close')
  },
)

const isMenuActive = (menuRoute: string | undefined) => {
  if (!menuRoute) return false
  if (route.path === menuRoute) return true

  let currentActiveMenu = route.meta.activeMenu as string | undefined
  const visited = new Set<string>()

  while (currentActiveMenu && !visited.has(currentActiveMenu)) {
    visited.add(currentActiveMenu)
    try {
      const resolved = router.resolve({ name: currentActiveMenu })
      if (resolved && resolved.path === menuRoute) return true
      currentActiveMenu = resolved.meta.activeMenu as string | undefined
    } catch {
      break
    }
  }
  return false
}

const toggleDropdown = (label: string) => {
  if (openDropdowns.value.has(label)) {
    openDropdowns.value.delete(label)
  } else {
    openDropdowns.value.add(label)
  }
}
const isOpen = (label: string) => openDropdowns.value.has(label)

if (!isInitialized.value) {
  visibleMenu.value.forEach((item) => {
    if (item.children) {
      const isChildActive = item.children.some(
        (child) => child.route && (route.path.startsWith(child.route) || isMenuActive(child.route)),
      )
      if (isChildActive) {
        openDropdowns.value.add(item.label)
      }
    }
  })
  isInitialized.value = true
}

// Track which dropdowns were open at the exact moment this component mounted
const initiallyOpen = new Set(openDropdowns.value)
</script>

<template>
  <aside
    class="bg-primary-500 dark:bg-primary-300 text-white transition-all duration-300 flex flex-col w-64 font-poppins fixed md:relative inset-y-0 left-0 z-50 md:z-auto transform md:transform-none"
    :class="props.isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
  >
    <!-- Logo Section -->
    <div class="p-4 flex items-center justify-between border-b border-white/10">
      <div class="flex items-center gap-3">
        <img
          :src="foundationProfileStore.logo!"
          class="max-w-24"
          alt="Logo"
          v-if="foundationProfileStore.foundationName"
        />
        <div class="text-2xl font-bold" v-else>
          {{ foundationProfileStore.foundationName }}
        </div>
      </div>
      <button
        @click="emit('close')"
        class="md:hidden p-2 text-white/85 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Close sidebar"
      >
        <X :size="20" />
      </button>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
      <div v-for="item in visibleMenu" :key="item.label" class="menu-item">
        <!-- Direct Link Item -->
        <RouterLink v-if="!item.children" :to="item.route || ''" v-slot="{ isExactActive }">
          <div
            :class="[
              'w-full flex items-center gap-3 px-4 py-2 rounded-sm transition-all duration-200 cursor-pointer',
              isExactActive || isMenuActive(item.route)
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
            class="w-full flex items-center justify-between px-4 py-2 rounded-sm transition-all duration-200 text-white/70 hover:bg-white/10 hover:text-white"
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

          <AnimatePresence>
            <Motion
              v-if="isOpen(item.label)"
              :initial="initiallyOpen.has(item.label) ? false : { height: 0, opacity: 0 }"
              :animate="{ height: 'auto', opacity: 1 }"
              :exit="{ height: 0, opacity: 0 }"
              :transition="{ duration: 0.25, ease: 'easeOut' }"
              class="flex flex-col space-y-1 overflow-hidden"
            >
              <router-link
                v-for="child in item.children"
                :key="child.label"
                :to="child.route || ''"
                v-slot="{ isActive }"
              >
                <div
                  :class="[
                    'w-full flex items-center px-4 py-2 text-sm rounded-sm transition-all duration-200 text-left pl-11 cursor-pointer',
                    isActive || isMenuActive(child.route)
                      ? 'bg-white/20 text-white font-medium shadow-sm'
                      : 'text-white/60 hover:text-white hover:bg-white/5',
                  ]"
                >
                  {{ child.label }}
                </div>
              </router-link>
            </Motion>
          </AnimatePresence>
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
