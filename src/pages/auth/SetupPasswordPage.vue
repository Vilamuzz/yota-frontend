<script setup lang="ts">
import { reactive, computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCurrentUser } from '@/composables/account/useCurrentUser'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AuthInput from '@/components/atoms/AuthInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { CheckCircle } from 'lucide-vue-next'
import { setupPasswordSchema } from '@/schemas/auth.schema'
import { getZodErrors } from '@/utils/zodError'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'
import { ROLES } from '@/const/roles'

const router = useRouter()
const authStore = useAuthStore()
const { showToast } = useToast()
const { updateCurrentUserPasswordMutation, passwordValidationErrors } = useCurrentUser()

const form = reactive({
  password: '',
  confirmPassword: '',
})

const fieldErrors = ref<Record<string, string>>({})
const showSuccessModal = ref(false)

const passwordError = computed(
  () => fieldErrors.value.password || passwordValidationErrors.value?.newPassword || '',
)
const confirmPasswordError = computed(
  () => fieldErrors.value.confirmPassword || passwordValidationErrors.value?.confirmPassword || '',
)

watch(
  form,
  () => {
    if (Object.keys(fieldErrors.value).length > 0) {
      fieldErrors.value = {}
    }
    if (updateCurrentUserPasswordMutation.isError.value) {
      updateCurrentUserPasswordMutation.reset()
    }
  },
  { deep: true },
)

const handleSubmit = () => {
  showSuccessModal.value = false

  const result = setupPasswordSchema.safeParse({
    password: form.password,
    confirmPassword: form.confirmPassword,
  })
  fieldErrors.value = getZodErrors(result)
  if (!result.success) return

  updateCurrentUserPasswordMutation.mutate(
    {
      currentPassword: '',
      newPassword: result.data.password,
    },
    {
      onSuccess: () => {
        showSuccessModal.value = true
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal mengatur kata sandi. Silakan coba lagi.'), 'error')
      },
    },
  )
}

const handleSuccessRedirect = () => {
  showSuccessModal.value = false
  if (authStore.activeRole === ROLES.ORANG_TUA_ASUH) {
    router.push('/')
  } else {
    router.push('/dashboard')
  }
}
</script>

<template>
  <AuthLayout title="Atur Kata Sandi" subtitle="Atur kata sandi untuk mengamankan akun Anda">
    <form @submit.prevent="handleSubmit" class="space-y-4">
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
        :loading="updateCurrentUserPasswordMutation.isPending.value"
      >
        <template #loading>Sedang mengatur...</template>
        Simpan Kata Sandi
      </BaseButton>
    </form>
  </AuthLayout>

  <!-- Success Modal -->
  <ConfirmationModal
    :show="showSuccessModal"
    title="Kata Sandi Berhasil Diatur!"
    message="Kata sandi akun Anda telah berhasil dikonfigurasi. Anda sekarang dapat masuk menggunakan kata sandi ini di masa mendatang."
    :icon="CheckCircle"
    primary-button-text="Lanjutkan ke Dasbor"
    secondary-button-text=""
    @close="handleSuccessRedirect"
    @primary="handleSuccessRedirect"
  />
</template>
