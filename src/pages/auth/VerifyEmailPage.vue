<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVerifyEmail } from '@/composables/auth/useVerifyEmail'
import { CheckCircle2, XCircle, Loader2, ArrowLeft, LogIn } from 'lucide-vue-next'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { extractError } from '@/utils/error'

const router = useRouter()
const route = useRoute()
const { verifyEmailMutation, validationErrors } = useVerifyEmail()
const success = ref('')
const error = ref('')

onMounted(() => {
  const token = route.query.token as string

  if (!token) {
    error.value = 'Token verifikasi tidak valid atau hilang.'
    return
  }

  verifyEmailMutation.mutate(token, {
    onSuccess: (data) => {
      success.value = data.message || 'Email berhasil diverifikasi!'
    },
    onError: (err) => {
      error.value = extractError(err, 'Gagal memverifikasi email. Silakan coba lagi.')
    },
  })
})

const title = computed(() => {
  if (verifyEmailMutation.isPending.value) return 'Memverifikasi Email'
  if (success.value) return 'Email Diverifikasi!'
  if (error.value) return 'Verifikasi Gagal'
  return 'Verifikasi Email'
})

const subtitle = computed(() => {
  if (verifyEmailMutation.isPending.value) return 'Harap tunggu sementara kami mengamankan akun Anda.'
  if (success.value) return 'Akun Anda sekarang siap digunakan.'
  if (error.value) return 'Kami mengalami masalah selama verifikasi.'
  return ''
})
</script>

<template>
  <AuthLayout :title="title" :subtitle="subtitle">
    <div class="flex flex-col items-center justify-center py-4">
      <!-- Loading State -->
      <div v-if="verifyEmailMutation.isPending.value" class="text-center">
        <div
          class="w-20 h-20 bg-primary-300/10 rounded-full flex items-center justify-center mb-6 mx-auto"
        >
          <Loader2 class="w-10 h-10 text-primary-300 animate-spin" />
        </div>
        <p class="text-gray-600">Menyelesaikan proses verifikasi...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="text-center w-full">
        <div
          class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto"
        >
          <CheckCircle2 class="w-10 h-10 text-green-600" />
        </div>
        <p class="text-gray-600 text-sm mb-8">Terima kasih telah memverifikasi email Anda.</p>
        <BaseButton variant="primary" full-width size="lg" to="/login">
          <div class="flex items-center justify-center gap-2">
            <span>Pergi ke Halaman Masuk</span>
            <LogIn class="w-4 h-4" />
          </div>
        </BaseButton>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center w-full">
        <div
          class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto"
        >
          <XCircle class="w-10 h-10 text-red-600" />
        </div>

        <!-- Validation Errors -->
        <div v-if="validationErrors" class="mb-6 text-center">
          <p
            v-for="(msg, key) in validationErrors"
            :key="key"
            class="text-xs text-red-500 font-semibold italic"
          >
            * {{ msg }}
          </p>
        </div>
        <div v-else class="mb-6 text-center">
          <p class="text-xs text-red-500 font-semibold italic">
            {{ error }}
          </p>
        </div>

        <p class="text-gray-600 text-sm mb-8">
          Tautan tersebut mungkin sudah kedaluwarsa atau sudah digunakan. Silakan coba minta email verifikasi baru.
        </p>

        <div class="space-y-4">
          <BaseButton
            variant="primary"
            full-width
            size="lg"
            @click="router.push('/resend-verification')"
          >
            Kirim Ulang Email Verifikasi
          </BaseButton>

          <RouterLink
            to="/login"
            class="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-300 transition-colors duration-200"
          >
            <ArrowLeft class="w-4 h-4" />
            Kembali ke Halaman Masuk
          </RouterLink>
        </div>
      </div>
    </div>

    <template #footer>
      <p class="text-xs text-gray-500">
        Butuh bantuan?
        <a href="#" class="text-primary-300 font-semibold hover:underline">Hubungi Dukungan</a>
      </p>
    </template>
  </AuthLayout>
</template>
