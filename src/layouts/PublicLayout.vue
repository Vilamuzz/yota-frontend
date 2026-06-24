<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useFoundationProfileStore } from '@/stores/foundationProfile'

import BaseButton from '@/components/atoms/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useLogout } from '@/composables/auth/useLogout'
import { useRoleSwitch } from '@/composables/auth/useRoleSwitch'
import type { Role } from '@/types/auth'
import {
  LogOut,
  LayoutDashboard,
  Receipt,
  ChevronDown,
  History,
  User,
  CircleAlertIcon,
  Check,
  ArrowLeft,
  Loader2,
  Menu,
  X,
} from 'lucide-vue-next'
import { ROLES } from '@/const/roles'
import { formatPhoneWithDashes } from '@/utils/phone'

const router = useRouter()
const authStore = useAuthStore()
const foundationProfileStore = useFoundationProfileStore()
const { logout } = useLogout()
const { switchRole, isLoading: isSwitchingRole } = useRoleSwitch()
const isProfileMenuOpen = ref(false)
const isServicesMenuOpen = ref(false)
const isRoleSubmenuOpen = ref(false)
const isMobileMenuOpen = ref(false)
const switchingToRole = ref<Role | ''>('')
const profileMenuRef = ref<HTMLElement | null>(null)
const servicesMenuRef = ref<HTMLElement | null>(null)

watch(
  () => router.currentRoute.value.path,
  () => {
    isMobileMenuOpen.value = false
  },
)

const handleClickOutside = (event: MouseEvent) => {
  if (profileMenuRef.value && !profileMenuRef.value.contains(event.target as Node)) {
    isProfileMenuOpen.value = false
    setTimeout(() => {
      isRoleSubmenuOpen.value = false
      switchingToRole.value = ''
    }, 200)
  }
  if (servicesMenuRef.value && !servicesMenuRef.value.contains(event.target as Node)) {
    isServicesMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const userInitials = computed(() => {
  if (!authStore.user?.username) return 'U'
  const names = authStore.user.username.split(' ')
  if (names.length >= 2) {
    return ((names[0]?.[0] ?? '') + (names[1]?.[0] ?? '')).toUpperCase()
  }
  return (authStore.user.username[0] ?? 'U').toUpperCase()
})

const handleLogout = async () => {
  await logout()
  isProfileMenuOpen.value = false
  isRoleSubmenuOpen.value = false
  switchingToRole.value = ''
}

const formatRole = (role: string) => {
  if (!role) return ''
  return role
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

const handleSwitchRoleClick = () => {
  isRoleSubmenuOpen.value = true
}

const handleBackToMenu = () => {
  isRoleSubmenuOpen.value = false
}

const handleSelectRole = (role: string) => {
  if (authStore.activeRole === role) return
  switchingToRole.value = role as Role
  switchRole(role as Role, {
    onSuccess: () => {
      isProfileMenuOpen.value = false
      setTimeout(() => {
        isRoleSubmenuOpen.value = false
        switchingToRole.value = ''
      }, 200)
    },
    onError: () => {
      switchingToRole.value = ''
    },
  })
}

const handleProfileClick = () => {
  router.push('/profile')
  isProfileMenuOpen.value = false
}

const handleDashboardClick = () => {
  router.push('/dashboard')
  isProfileMenuOpen.value = false
  setTimeout(() => {
    isRoleSubmenuOpen.value = false
  }, 200)
}

const handleInvoiceClick = () => {
  router.push('/invoices')
  isProfileMenuOpen.value = false
}

const handleHistoryClick = () => {
  router.push('/submission-history')
  isProfileMenuOpen.value = false
}

const navLinks = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang', to: '/about' },
  { label: 'Program Donasi', to: '/donation-programs' },
  { label: 'Program Sosial', to: '/social-programs' },
  { label: 'Anak Asuh', to: '/foster-children' },
]

const dropdownLinks = [
  { label: 'Ambulans', to: '/ambulance' },
  { label: 'Berita', to: '/news' },
  { label: 'Galeri', to: '/gallery' },
  { label: 'Laporan', to: '/reports' },
]
</script>

<template>
  <div class="min-h-screen bg-white">
    <nav class="fixed top-4 left-4 right-4 z-60">
      <div class="bg-primary-500 text-white rounded-xl px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <RouterLink to="/" class="flex items-center gap-2 cursor-pointer">
              <img
                v-if="foundationProfileStore.logo"
                :src="foundationProfileStore.logo"
                :alt="foundationProfileStore.foundationName"
                class="h-9 w-auto object-contain"
              />
            </RouterLink>
          </div>

          <div class="flex items-center gap-8">
            <div class="hidden md:flex items-center gap-6 font-sf-pro">
              <RouterLink
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                class="hover:text-primary-300 transition duration-200"
              >
                {{ link.label }}
              </RouterLink>

              <!-- Services Dropdown -->
              <div
                class="relative flex items-center h-full"
                ref="servicesMenuRef"
                @mouseenter="isServicesMenuOpen = true"
                @mouseleave="isServicesMenuOpen = false"
              >
                <button
                  class="flex items-center gap-1 hover:text-primary-300 transition duration-200 py-3"
                >
                  Layanan
                  <ChevronDown
                    class="w-4 h-4 transition-transform duration-200"
                    :class="{ 'rotate-180': isServicesMenuOpen }"
                  />
                </button>

                <Transition
                  enter-active-class="transition-all duration-200 ease-out"
                  enter-from-class="opacity-0 -translate-y-2 scale-95"
                  enter-to-class="opacity-100 translate-y-0 scale-100"
                  leave-active-class="transition-all duration-150 ease-in"
                  leave-from-class="opacity-100 translate-y-0 scale-100"
                  leave-to-class="opacity-0 -translate-y-2 scale-95"
                >
                  <div
                    v-if="isServicesMenuOpen"
                    class="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-52 z-50"
                  >
                    <div
                      class="bg-white rounded-xl shadow-xl overflow-hidden p-1.5 border border-gray-100"
                    >
                      <RouterLink
                        v-for="link in dropdownLinks"
                        :key="link.to"
                        :to="link.to"
                        class="block p-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition font-medium"
                        @click="isServicesMenuOpen = false"
                      >
                        {{ link.label }}
                      </RouterLink>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <template v-if="!authStore.isAuthenticated">
                <div class="hidden sm:flex items-center gap-3">
                  <BaseButton variant="white" to="/login"> Login </BaseButton>
                  <BaseButton variant="primary" to="/register"> Register </BaseButton>
                </div>
              </template>

              <template v-else>
                <div class="relative" ref="profileMenuRef">
                  <button
                    @click="isProfileMenuOpen = !isProfileMenuOpen"
                    class="flex items-center gap-3 px-2 py-1.5 rounded-full hover:bg-primary-400/80 transition-all duration-200 border border-primary-400 group"
                  >
                    <!-- Avatar -->
                    <div
                      class="w-9 h-9 rounded-full overflow-hidden bg-white border-2 border-primary-300 flex items-center justify-center shrink-0 shadow-sm"
                    >
                      <img
                        v-if="authStore.user?.profilePicture"
                        :src="authStore.user.profilePicture"
                        alt="Avatar"
                        class="w-full h-full object-cover"
                      />
                      <span v-else class="text-primary-600 font-bold text-sm">
                        {{ userInitials }}
                      </span>
                    </div>

                    <!-- Name -->
                    <span class="text-white text-sm font-medium pr-2 hidden sm:inline-block">
                      {{ authStore.user?.username?.split(' ')[0] || 'User' }}
                    </span>
                  </button>

                  <Transition
                    enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-2 scale-95"
                    enter-to-class="opacity-100 translate-y-0 scale-100"
                    leave-active-class="transition-all duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0 scale-100"
                    leave-to-class="opacity-0 -translate-y-2 scale-95"
                  >
                    <div
                      v-if="isProfileMenuOpen"
                      class="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl overflow-hidden z-50 p-1.5 border border-gray-100 text-gray-800"
                      @click.stop
                    >
                      <div v-if="!isRoleSubmenuOpen">
                        <!-- User Info Header -->
                        <div class="px-4 py-3 border-b border-gray-50 mb-1">
                          <p class="text-sm font-bold text-gray-900 truncate">
                            {{ authStore.user?.username }}
                          </p>
                          <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
                        </div>

                        <button
                          v-if="authStore.activeRole !== ROLES.ORANG_TUA_ASUH"
                          @click="handleDashboardClick"
                          class="w-full p-2.5 rounded-lg text-left text-sm text-gray-700 hover:bg-gray-200 hover:text-primary-600 transition flex items-center gap-3 font-medium"
                        >
                          <LayoutDashboard class="w-4.5 h-4.5 text-gray-400" />
                          Dashboard
                        </button>

                        <button
                          v-if="authStore.roles.length > 1"
                          @click="handleSwitchRoleClick"
                          class="w-full p-2.5 rounded-lg text-left text-sm text-gray-700 hover:bg-gray-200 hover:text-primary-600 transition flex items-center gap-3 font-medium"
                        >
                          <CircleAlertIcon class="w-4.5 h-4.5 text-gray-400" />
                          Ganti Role
                        </button>

                        <button
                          @click="handleProfileClick"
                          class="w-full p-2.5 rounded-lg text-left text-sm text-gray-700 hover:bg-gray-200 transition flex items-center gap-3 font-medium"
                        >
                          <User class="w-4.5 h-4.5 text-gray-400" />
                          Profil Saya
                        </button>

                        <button
                          @click="handleInvoiceClick"
                          class="w-full p-2.5 rounded-lg text-left text-sm text-gray-700 hover:bg-gray-200 transition flex items-center gap-3 font-medium"
                        >
                          <Receipt class="w-4.5 h-4.5 text-gray-400" />
                          Invoice Saya
                        </button>

                        <button
                          @click="handleHistoryClick"
                          class="w-full p-2.5 rounded-lg text-left text-sm text-gray-700 hover:bg-gray-200 transition flex items-center gap-3 font-medium"
                        >
                          <History class="w-4.5 h-4.5 text-gray-400" />
                          Riwayat Pengajuan
                        </button>

                        <div class="border-t border-gray-100 my-1.5"></div>

                        <button
                          @click="handleLogout"
                          class="w-full p-2.5 rounded-lg text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-3 font-medium"
                        >
                          <LogOut class="w-4.5 h-4.5 text-red-500" />
                          Keluar
                        </button>
                      </div>

                      <div v-else>
                        <div class="px-2 py-2 flex items-center gap-2 border-b border-gray-50 mb-1">
                          <button
                            @click="handleBackToMenu"
                            class="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"
                          >
                            <ArrowLeft class="w-4 h-4" />
                          </button>
                          <p class="text-sm font-bold text-gray-900">Pilih Role</p>
                        </div>

                        <div class="max-h-60 overflow-y-auto p-1 space-y-1">
                          <button
                            v-for="role in authStore.roles"
                            :key="role"
                            @click="handleSelectRole(role)"
                            :disabled="isSwitchingRole"
                            class="w-full p-2.5 rounded-lg text-left text-sm transition flex items-center justify-between font-medium group"
                            :class="
                              authStore.activeRole === role
                                ? 'bg-primary-300 text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            "
                          >
                            <span class="truncate">{{ formatRole(role) }}</span>
                            <Loader2
                              v-if="isSwitchingRole && switchingToRole === role"
                              class="w-4 h-4 animate-spin text-gray-400"
                            />
                            <Check
                              v-else-if="authStore.activeRole === role"
                              class="w-4 h-4 text-primary-600"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </template>

              <!-- Hamburger Toggle Button -->
              <button
                @click="isMobileMenuOpen = !isMobileMenuOpen"
                class="md:hidden p-2 text-white hover:text-primary-200 transition-colors focus:outline-none"
                aria-label="Toggle mobile menu"
              >
                <Menu v-if="!isMobileMenuOpen" :size="24" />
                <X v-else :size="24" />
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <Transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 max-h-0 overflow-hidden"
          enter-to-class="opacity-100 max-h-[80vh] overflow-hidden"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 max-h-[80vh] overflow-hidden"
          leave-to-class="opacity-0 max-h-0 overflow-hidden"
        >
          <div
            v-if="isMobileMenuOpen"
            class="md:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-4 font-sf-pro"
          >
            <RouterLink
              v-for="link in navLinks"
              :key="link.to"
              :to="link.to"
              class="hover:text-primary-300 transition duration-200 py-1 font-semibold"
              @click="isMobileMenuOpen = false"
            >
              {{ link.label }}
            </RouterLink>

            <!-- Services Section -->
            <div class="border-t border-white/10 pt-3">
              <p class="text-xs font-bold uppercase tracking-widest text-primary-200 mb-2">
                Layanan
              </p>
              <div class="grid grid-cols-2 gap-3 pl-2">
                <RouterLink
                  v-for="link in dropdownLinks"
                  :key="link.to"
                  :to="link.to"
                  class="text-sm hover:text-primary-300 transition py-1"
                  @click="isMobileMenuOpen = false"
                >
                  {{ link.label }}
                </RouterLink>
              </div>
            </div>

            <!-- Mobile Auth Actions (visible only when not authenticated) -->
            <div
              v-if="!authStore.isAuthenticated"
              class="border-t border-white/10 pt-4 flex flex-col gap-2"
            >
              <BaseButton variant="white" to="/login" class="w-full justify-center">
                Login
              </BaseButton>
              <BaseButton
                variant="primary"
                to="/register"
                class="w-full justify-center border border-white/20"
              >
                Register
              </BaseButton>
            </div>
          </div>
        </Transition>
      </div>
    </nav>

    <main class="font-poppins">
      <slot />
    </main>

    <footer class="bg-gray-800 text-white font-poppins">
      <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-10">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <img
                v-if="foundationProfileStore.logo"
                :src="foundationProfileStore.logo"
                :alt="foundationProfileStore.foundationName"
                class="h-10 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p class="text-sm mt-2">{{ foundationProfileStore.foundationAddress }}</p>
          </div>

          <div class="flex flex-col sm:flex-row gap-8 sm:gap-12">
            <div>
              <h4 class="text-sm font-semibold mb-3">Contact</h4>
              <ul class="text-sm space-y-2">
                <li>
                  Email:
                  <a href="mailto:yota@gmail.com" class="hover:text-primary-300">
                    yota@gmail.com
                  </a>
                </li>
                <li>
                  Phone:
                  <a
                    v-if="foundationProfileStore.foundationPhone"
                    :href="`https://wa.me/+62${foundationProfileStore.foundationPhone}`"
                    target="_blank"
                    class="hover:text-primary-300"
                    >{{ formatPhoneWithDashes(foundationProfileStore.foundationPhone) }}</a
                  >
                </li>
                <li class="flex items-center gap-3 mt-2">
                  <a
                    v-if="foundationProfileStore.foundationFacebook"
                    :href="foundationProfileStore.foundationFacebook"
                    target="_blank"
                    class="hover:text-primary-300"
                    >Facebook</a
                  >
                  <a
                    v-if="foundationProfileStore.foundationInstagram"
                    :href="foundationProfileStore.foundationInstagram"
                    target="_blank"
                    class="hover:text-primary-300"
                    >Instagram</a
                  >
                  <a
                    v-if="foundationProfileStore.foundationTwitter"
                    :href="foundationProfileStore.foundationTwitter"
                    target="_blank"
                    class="hover:text-primary-300"
                    >Twitter</a
                  >
                </li>
              </ul>
            </div>

            <div>
              <h4 class="text-sm font-semibold mb-3">Layanan</h4>
              <ul class="text-sm space-y-2">
                <li>
                  <RouterLink to="/donation-programs" class="hover:text-primary-300"
                    >Program Donasi</RouterLink
                  >
                </li>
                <li>
                  <RouterLink to="/social-programs" class="hover:text-primary-300"
                    >Program Sosial</RouterLink
                  >
                </li>
                <li>
                  <RouterLink to="/foster-children" class="hover:text-primary-300"
                    >Anak Asuh</RouterLink
                  >
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
