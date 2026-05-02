<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useForgetPassword } from '@/composables/auth/useForgetPassword'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AuthInput from '@/components/atoms/AuthInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { MailCheck } from 'lucide-vue-next'
import { forgetPasswordSchema } from '@/schemas/auth.schema'
import { getZodErrors } from '@/utils/zodError'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'

const router = useRouter()
const { showToast } = useToast()
const { forgetPasswordMutation, validationErrors } = useForgetPassword()
const email = ref('')
const fieldErrors = ref<Record<string, string>>({})
const showSuccessModal = ref(false)
const emailError = computed(() => fieldErrors.value.email || validationErrors.value?.email || '')

watch(email, () => {
  if (fieldErrors.value.email) fieldErrors.value.email = ''
  if (forgetPasswordMutation.isError.value) forgetPasswordMutation.reset()
})

const handleSubmit = () => {
  showSuccessModal.value = false

  const result = forgetPasswordSchema.safeParse({ email: email.value })
  fieldErrors.value = getZodErrors(result)
  if (!result.success) return

  forgetPasswordMutation.mutate(result.data.email, {
    onSuccess: () => {
      showSuccessModal.value = true
    },
    onError: (err) => {
      showToast(extractError(err, 'Failed to forget password. Please try again.'), 'error')
    },
  })
}

const resendResetLink = () => {
  forgetPasswordMutation.mutate(email.value, {
    onSuccess: () => {
      showSuccessModal.value = true
    },
    onError: (err) => {
      showToast(extractError(err, 'Failed to forget password. Please try again.'), 'error')
    },
  })
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
  <AuthLayout
    title="Forgot Password?"
    subtitle="Enter your email address and we'll send you a link to reset your password"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <AuthInput
        id="email"
        v-model="email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        autocomplete="email"
        :error="emailError"
      />

      <BaseButton
        type="submit"
        variant="primary"
        full-width
        :loading="forgetPasswordMutation.isPending.value"
      >
        <template #loading>Sending...</template>
        Send Reset Link
      </BaseButton>
    </form>

    <template #footer>
      <button
        @click="goToLogin"
        class="text-xs text-primary-400 hover:text-primary-500 font-medium transition duration-200"
      >
        ← Back to login
      </button>
    </template>
  </AuthLayout>

  <!-- Success Modal -->
  <ConfirmationModal
    :show="showSuccessModal"
    title="Reset Link Sent!"
    message="We've sent a password reset link to your email. Click the link to reset your password. If you don't see it, check your spam folder."
    :icon="MailCheck"
    primary-button-text="Resend Reset Link"
    secondary-button-text="Back to Login"
    :primary-button-loading="forgetPasswordMutation.isPending.value"
    @close="closeModal"
    @primary="resendResetLink"
    @secondary="goToLogin"
  >
    <p class="text-sm text-gray-700 font-mono bg-gray-100 px-4 py-2 rounded-lg">
      {{ email }}
    </p>
  </ConfirmationModal>
</template>
