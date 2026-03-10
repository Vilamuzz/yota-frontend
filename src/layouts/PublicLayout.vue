<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()

const handleRegister = () => {
  router.push('/register')
}

const handleLogin = () => {
  router.push('/login')
}

const navLinks = [
  { label: 'Beranda', to: '/' },
  { label: 'Tentang', to: '/about' },
  { label: 'Donasi', to: '/donation' },
  { label: 'Program Sosial', to: '/social-programs' },
  { label: 'Anak Asuh', to: '/sponsored-children' },
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
              <BaseButton variant="white" @click="handleLogin"> Login </BaseButton>
              <BaseButton variant="primary" @click="handleRegister"> Register </BaseButton>
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
            <p class="text-sm mt-2">123 Startup Lane<br />Jakarta, Indonesia 12345</p>
          </div>

          <div class="flex gap-12">
            <div>
              <h4 class="text-sm font-semibold mb-3">Contact</h4>
              <ul class="text-sm space-y-2">
                <li>
                  Email:
                  <a href="mailto:support@yota.example" class="hover:text-primary-300">
                    support@yota.example
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
