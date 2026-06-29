<script setup lang="ts">
import { Lock, LogIn, ArrowLeft } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

// Get redirect URL from query if present
const redirectQuery = computed(() => {
  return (route.query.redirect as string) || '/'
})

const handleLogin = () => {
  router.push({
    name: 'login',
    query: { redirect: redirectQuery.value },
  })
}
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 font-poppins transition-colors duration-300"
  >
    <div class="max-w-md w-full text-center">
      <!-- 401 Illustration/Icon -->
      <div class="relative mb-12 flex justify-center">
        <div class="relative">
          <!-- Background Glow -->
          <div
            class="absolute -inset-4 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-2xl animate-pulse"
          ></div>

          <!-- Main Icon Container -->
          <div
            class="relative w-32 md:w-40 h-40 bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 dark:border-gray-700 flex items-center justify-center transform hover:rotate-2 transition-all duration-500 group"
          >
            <Lock
              :size="64"
              class="text-primary-500 group-hover:scale-110 transition-transform duration-500"
            />

            <!-- Corner Accent -->
            <div
              class="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-12"
            >
              <span class="text-white font-black text-xs">?</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Text Content -->
      <div class="space-y-4 mb-10">
        <div
          class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider mb-2"
        >
          Error 401
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Login Diperlukan
        </h1>
        <p class="text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
          Maaf, Anda harus masuk ke akun Anda terlebih dahulu sebelum dapat mengakses halaman
          terbatas ini.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <BaseButton
          variant="outline"
          size="lg"
          @click="router.back()"
          class="flex items-center gap-2 group min-w-40"
        >
          <ArrowLeft
            :size="18"
            class="group-hover:-translate-x-1 transition-transform duration-300"
          />
          Kembali
        </BaseButton>
        <BaseButton
          variant="primary"
          size="lg"
          @click="handleLogin"
          class="flex items-center gap-2 shadow-lg shadow-primary-500/20 min-w-40"
        >
          <LogIn :size="18" />
          Masuk Sekarang
        </BaseButton>
      </div>

      <!-- Subtle Footer -->
      <p class="mt-12 text-gray-400 dark:text-gray-600 text-xs">
        Belum punya akun?
        <RouterLink
          :to="{ name: 'register', query: { redirect: redirectQuery } }"
          class="text-primary-600 dark:text-primary-400 hover:underline font-bold"
        >
          Daftar Sekarang
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.font-poppins {
  font-family: 'Poppins', sans-serif;
}
</style>
