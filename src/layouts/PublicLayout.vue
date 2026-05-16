<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Motion } from 'motion-v'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useLogout } from '@/composables/auth/useLogout'
import { CircleAlert, LogOut, LayoutDashboard, Receipt, ChevronDown, History } from 'lucide-vue-next'
import { ROLES } from '@/const/roles'

const router = useRouter()
const authStore = useAuthStore()
const { logout } = useLogout()
const isProfileMenuOpen = ref(false)
const isServicesMenuOpen = ref(false)
const profileMenuRef = ref<HTMLElement | null>(null)
const servicesMenuRef = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (profileMenuRef.value && !profileMenuRef.value.contains(event.target as Node)) {
    isProfileMenuOpen.value = false
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

const handleRegister = () => {
  router.push('/register')
}

const handleLogin = () => {
  router.push('/login')
}

const handleLogout = async () => {
  await logout()
  isProfileMenuOpen.value = false
}

const handleProfileClick = () => {
  router.push('/profile')
  isProfileMenuOpen.value = false
}

const handleDashboardClick = () => {
  router.push('/dashboard')
  isProfileMenuOpen.value = false
}

const handleInvoiceClick = () => {
  router.push('/invoices')
  isProfileMenuOpen.value = false
}

const handleHistoryClick = () => {
  router.push({ name: 'foster-children-candidate-history' })
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
    <nav class="fixed top-4 left-4 right-4 z-50">
      <div class="bg-primary-500 text-white rounded-xl px-6 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <router-link to="/" class="text-2xl font-bold cursor-pointer">Yota</router-link>
          </div>

          <div class="flex items-center gap-8">
            <div class="hidden md:flex items-center gap-6 font-sf-pro">
              <router-link
                v-for="link in navLinks"
                :key="link.to"
                :to="link.to"
                class="hover:text-primary-300 transition duration-200"
              >
                {{ link.label }}
              </router-link>

              <!-- Services Dropdown -->
              <div class="relative" ref="servicesMenuRef">
                <button
                  @click="isServicesMenuOpen = !isServicesMenuOpen"
                  class="flex items-center gap-1 hover:text-primary-300 transition duration-200"
                >
                  Layanan
                  <ChevronDown
                    class="w-4 h-4 transition-transform duration-200"
                    :class="{ 'rotate-180': isServicesMenuOpen }"
                  />
                </button>

                <Motion
                  v-if="isServicesMenuOpen"
                  :initial="{ opacity: 0, y: -10, scale: 0.95 }"
                  :animate="{ opacity: 1, y: 0, scale: 1 }"
                  :exit="{ opacity: 0, y: -10, scale: 0.95 }"
                  :transition="{ duration: 0.2 }"
                  class="absolute left-0 mt-3 w-48 bg-white rounded-xl shadow-xl overflow-hidden z-50 p-1.5 border border-gray-100"
                >
                  <router-link
                    v-for="link in dropdownLinks"
                    :key="link.to"
                    :to="link.to"
                    class="block p-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition font-medium"
                    @click="isServicesMenuOpen = false"
                  >
                    {{ link.label }}
                  </router-link>
                </Motion>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <template v-if="!authStore.isAuthenticated">
                <BaseButton variant="white" @click="handleLogin"> Login </BaseButton>
                <BaseButton variant="primary" @click="handleRegister"> Register </BaseButton>
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

                  <Motion
                    v-if="isProfileMenuOpen"
                    :initial="{ opacity: 0, y: -10, scale: 0.95 }"
                    :animate="{ opacity: 1, y: 0, scale: 1 }"
                    :exit="{ opacity: 0, y: -10, scale: 0.95 }"
                    :transition="{ duration: 0.2 }"
                    class="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl overflow-hidden z-50 p-1.5 border border-gray-100"
                    @click.stop
                  >
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
                      @click="handleProfileClick"
                      class="w-full p-2.5 rounded-lg text-left text-sm text-gray-700 hover:bg-gray-200 transition flex items-center gap-3 font-medium"
                    >
                      <CircleAlert class="w-4.5 h-4.5 text-gray-400" />
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
                  </Motion>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="font-poppins">
      <slot />
    </main>

    <footer class="bg-gray-800 text-white font-poppins">
      <div class="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-10">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-primary-300">Yota</h3>
            <p class="text-sm mt-2">123 Startup Lane<br />Sukoharjo, Indonesia 12345</p>
          </div>

          <div class="flex gap-12">
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
                  <a href="tel:+6281234567890" class="hover:text-primary-300">+62 812-3456-7890</a>
                </li>
                <li class="flex items-center gap-3 mt-2">
                  <a href="#" class="hover:text-primary-300">Twitter</a>
                  <a href="#" class="hover:text-primary-300">LinkedIn</a>
                  <a href="#" class="hover:text-primary-300">Instagram</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 class="text-sm font-semibold mb-3">Layanan</h4>
              <ul class="text-sm space-y-2">
                <li>
                  <router-link to="/donation-programs" class="hover:text-primary-300"
                    >Donasi</router-link
                  >
                </li>
                <li>
                  <router-link to="/social-programs" class="hover:text-primary-300"
                    >Program Sosial</router-link
                  >
                </li>
                <li>
                  <router-link to="/foster-children" class="hover:text-primary-300"
                    >Anak Asuh</router-link
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
