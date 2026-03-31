<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { Motion } from 'motion-v'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useLogout } from '@/composables/auth/useLogout'
import { CircleAlert, LogOut } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const { logout } = useLogout()
const isProfileMenuOpen = ref(false)

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

const navLinks = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang', to: '/about' },
  { label: 'Donasi', to: '/donation' },
  { label: 'Program Sosial', to: '/social-programs' },
  { label: 'Anak Asuh', to: '/foster-children' },
  { label: 'Ambulans', to: '/ambulance' },
  { label: 'Berita', to: '/news' },
  { label: 'Laporan', to: '/reports' },
]
</script>

<template>
  <div class="min-h-screen bg-gray-100">
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
            </div>

            <div class="flex items-center gap-3">
              <template v-if="!authStore.isAuthenticated">
                <BaseButton variant="white" @click="handleLogin"> Login </BaseButton>
                <BaseButton variant="primary" @click="handleRegister"> Register </BaseButton>
              </template>

              <template v-else>
                <div class="relative">
                  <button
                    @click="isProfileMenuOpen = !isProfileMenuOpen"
                    class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary-400 transition"
                  >
                    <div
                      class="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary-500 font-bold"
                    >
                      {{ authStore.user?.username?.charAt(0).toUpperCase() || 'U' }}
                    </div>
                    <span class="text-white text-sm">{{ authStore.user?.username || 'User' }}</span>
                  </button>

                  <Motion
                    v-if="isProfileMenuOpen"
                    :initial="{ opacity: 0, y: -10, scale: 0.95 }"
                    :animate="{ opacity: 1, y: 0, scale: 1 }"
                    :exit="{ opacity: 0, y: -10, scale: 0.95 }"
                    :transition="{ duration: 0.2 }"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg overflow-hidden z-50 p-1"
                    @click.stop
                  >
                    <button
                      @click="handleProfileClick"
                      class="w-full p-2 rounded-md text-left text-sm text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
                    >
                      <CircleAlert class="w-4 h-4 text-gray-500" />
                      Profile
                    </button>

                    <div class="border-t border-gray-300 my-1"></div>

                    <button
                      @click="handleLogout"
                      class="w-full p-2 rounded-md text-left text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                    >
                      <LogOut class="w-4 h-4 text-red-600" />
                      Logout
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

    <footer class="bg-gray-800 mt-16 text-white font-poppins">
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
                  <router-link to="/donation" class="hover:text-primary-300">Donasi</router-link>
                </li>
                <li>
                  <router-link to="/social-programs" class="hover:text-primary-300"
                    >Program Sosial</router-link
                  >
                </li>
                <li>
                  <router-link to="/sponsored-child" class="hover:text-primary-300"
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
