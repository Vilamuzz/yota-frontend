<script setup lang="ts">
import { reactive, computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useResetPassword } from '@/composables/auth/useResetPassword'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AuthInput from '@/components/atoms/AuthInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseAlert from '@/components/atoms/BaseAlert.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { CheckCircle } from 'lucide-vue-next'
import { resetPasswordSchema } from '@/schemas/auth.schema'
import { getZodErrors } from '@/utils/zodError'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()
const { resetPasswordMutation, validationErrors } = useResetPassword()
const token = ref('')
const form = reactive({
  password: '',
  confirmPassword: '',
})

const fieldErrors = ref<Record<string, string>>({})
const initError = ref('')
const showSuccessModal = ref(false)
const passwordError = computed(
  () => fieldErrors.value.password || validationErrors.value?.password || '',
)
const confirmPasswordError = computed(
  () => fieldErrors.value.confirmPassword || validationErrors.value?.confirmPassword || '',
)

onMounted(() => {
  token.value = route.query.token as string
  if (!token.value) {
    initError.value = 'Token atur ulang tidak valid atau hilang. Silakan minta yang baru.'
  }
})

watch(
  form,
  () => {
    if (Object.keys(fieldErrors.value).length > 0) {
      fieldErrors.value = {}
    }
    if (resetPasswordMutation.isError.value) {
      resetPasswordMutation.reset()
    }
  },
  { deep: true },
)

const handleSubmit = () => {
  showSuccessModal.value = false

  const result = resetPasswordSchema.safeParse({
    password: form.password,
    confirmPassword: form.confirmPassword,
  })
  fieldErrors.value = getZodErrors(result)
  if (!result.success) return

  resetPasswordMutation.mutate(
    {
      token: token.value,
      newPassword: result.data.password,
    },
    {
      onSuccess: () => {
        showSuccessModal.value = true
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal mengatur ulang kata sandi. Silakan coba lagi.'), 'error')
      },
    },
  )
}

const goToLogin = () => {
  showSuccessModal.value = false
  router.push('/login')
}

const closeModal = () => {
  showSuccessModal.value = false
  router.push('/login')
}
</script>

<template>
  <AuthLayout title="Atur Ulang Kata Sandi" subtitle="Masukkan kata sandi baru Anda">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseAlert v-if="initError" type="error">
        {{ initError }}
      </BaseAlert>
      <AuthInput
        id="password"
        v-model="form.password"
        type="password"
        label="Kata Sandi Baru"
        placeholder="••••••••"
        autocomplete="new-password"
        :show-password-toggle="true"
        :show-password-strength="true"
        :error="passwordError"
      />

      <AuthInput
        id="confirmPassword"
        v-model="form.confirmPassword"
        type="password"
        label="Konfirmasi Kata Sandi Baru"
        placeholder="••••••••"
        autocomplete="new-password"
        :show-password-toggle="true"
        :error="confirmPasswordError"
      />

      <BaseButton
        type="submit"
        variant="primary"
        full-width
        :loading="resetPasswordMutation.isPending.value"
      >
        <template #loading>Sedang mengatur ulang...</template>
        Atur Ulang Kata Sandi
      </BaseButton>
    </form>

    <template #footer>
      <button
        @click="goToLogin"
        class="text-xs text-primary-400 hover:text-primary-500 font-medium transition duration-200"
      >
        ← Kembali ke halaman masuk
      </button>
    </template>
  </AuthLayout>

  <!-- Success Modal -->
  <ConfirmationModal
    :show="showSuccessModal"
    title="Atur Ulang Kata Sandi Berhasil!"
    message="Kata sandi Anda telah berhasil diatur ulang. Anda sekarang dapat masuk dengan kata sandi baru Anda."
    :icon="CheckCircle"
    primary-button-text="Masuk"
    secondary-button-text=""
    @close="closeModal"
    @primary="goToLogin"
  />
</template>
