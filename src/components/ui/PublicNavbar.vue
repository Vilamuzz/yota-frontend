<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const handleRegister = () => {
  router.push('/register')
}

const handleLogin = () => {
  router.push('/login')
}

const navLinks = [
  { label: 'Beranda', href: '/' },
  { label: 'Tentang', href: '/about' },
  { label: 'Donasi', href: '/donation' },
  { label: 'Program Sosial', href: '/social-programs' },
  { label: 'Anak Asuh', href: '/foster-children' },
  { label: 'Ambulans', href: '/ambulance' },
  { label: 'Berita', href: '/news' },
  { label: 'Laporan', href: '/reports' },
]
</script>

<template>
  <nav class="fixed top-4 left-4 right-4 z-50 font-sf-pro">
    <div class="bg-primary-500 text-white rounded-xl shadow-lg px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center">
          <h1 class="text-2xl font-bold cursor-pointer" @click="router.push('/')">Yota</h1>
        </div>

        <!-- Menu Links & Profile -->
        <div class="flex items-center gap-8">
          <!-- Navigation Links -->
          <div class="hidden md:flex items-center gap-6">
            <a
              v-for="link in navLinks"
              :key="link.href"
              :href="link.href"
              class="hover:text-indigo-200 font-medium transition duration-200"
            >
              {{ link.label }}
            </a>
          </div>

          <!-- Profile/Auth Buttons -->
          <div class="flex items-center gap-3">
            <button
              @click="handleLogin"
              class="px-6 py-2 hover:text-indigo-700 transition duration-200"
            >
              Login
            </button>
            <button
              @click="handleRegister"
              class="px-6 py-2 bg-primary-300 rounded-lg hover:bg-indigo-700 transition duration-200"
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>
