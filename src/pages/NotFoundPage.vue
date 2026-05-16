<script setup lang="ts">
import { Home, ArrowLeft } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'
</script>

<template>
  <div
    class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6 font-poppins transition-colors duration-300"
  >
    <div class="max-w-md w-full text-center">
      <!-- 404 Illustration/Icon -->
      <div class="relative mb-12">
        <div
          class="text-[12rem] md:text-[15rem] font-bold text-gray-200 dark:text-gray-800 leading-none select-none animate-pulse"
        >
          404
        </div>
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 transform -rotate-3 hover:rotate-0 transition-transform duration-500"
          >
            <div
              class="text-primary-500 dark:text-primary-400 font-black text-3xl md:text-4xl tracking-tight"
            >
              Ups!
            </div>
          </div>
        </div>
      </div>

      <!-- Text -->
      <div class="space-y-4 mb-10">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Halaman Tidak Ditemukan
        </h1>
        <p class="text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
          Sepertinya halaman yang Anda cari telah dipindahkan atau memang tidak pernah ada. Jangan
          khawatir, mari kembali ke jalur yang benar.
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <BaseButton
          variant="outline"
          size="lg"
          @click="$router.back()"
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
          to="/"
          class="flex items-center gap-2 shadow-lg shadow-primary-500/20 min-w-40"
        >
          <Home :size="18" />
          Ke Beranda
        </BaseButton>
      </div>

      <!-- Decorative Elements -->
      <div class="mt-16 flex justify-center gap-2 opacity-20">
        <div class="w-2 h-2 rounded-full bg-primary-500 animate-bounce"></div>
        <div
          class="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.2s]"
        ></div>
        <div
          class="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.4s]"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-poppins {
  font-family: 'Poppins', sans-serif;
}
</style>
