<script setup lang="ts">
import { Lock } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useRouter, useRoute } from 'vue-router'

interface Props {
  show: boolean
  title?: string
  message?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Login Diperlukan',
  message: 'Silakan masuk ke akun Anda terlebih dahulu untuk mengakses fitur ini.',
})

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const route = useRoute()

const handleLogin = () => {
  emit('close')
  router.push({
    name: 'login',
    query: { redirect: route.fullPath },
  })
}

const handleRegister = () => {
  emit('close')
  router.push({
    name: 'register',
    query: { redirect: route.fullPath },
  })
}
</script>

<template>
  <!-- Modal Overlay -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs"
      @click.self="emit('close')"
    >
      <!-- Modal Content -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="show"
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden font-poppins border border-gray-100 dark:border-gray-700"
        >
          <!-- Background Decoration -->
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-primary-50 dark:bg-primary-950/20 rounded-full -mr-16 -mt-16 opacity-50 pointer-events-none"
          />

          <!-- Modal Content -->
          <div class="relative text-center py-2">
            <!-- Icon -->
            <div class="flex items-center justify-center mx-auto mb-6">
              <div
                class="w-20 h-20 bg-primary-50 dark:bg-primary-950/30 rounded-full flex items-center justify-center text-primary-500 dark:text-primary-400"
              >
                <Lock :size="36" />
              </div>
            </div>

            <!-- Title -->
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {{ title }}
            </h2>

            <!-- Message -->
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-8 text-center leading-relaxed">
              {{ message }}
            </p>

            <!-- Action Buttons -->
            <div class="flex flex-col gap-3">
              <BaseButton
                variant="primary"
                full-width
                size="lg"
                class="shadow-lg shadow-primary-500/20"
                @click="handleLogin"
              >
                Masuk Sekarang
              </BaseButton>

              <BaseButton
                variant="outline"
                full-width
                size="lg"
                class="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 border-gray-200 dark:border-gray-700"
                @click="handleRegister"
              >
                Daftar Akun Baru
              </BaseButton>

              <button
                class="w-full text-center py-2 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-1 font-semibold"
                @click="emit('close')"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
