<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseAlert from '@/components/atoms/BaseAlert.vue'
import AuthModal from '@/components/molecules/AuthModal.vue'
import { MailCheck } from 'lucide-vue-next'
import { forgetPasswordSchema, getZodErrors } from '@/schemas/auth.schema'

const router = useRouter()
const { forgetPasswordMutation, forgetPasswordError } = useAuth()

const email = ref('')
const fieldErrors = ref<Record<string, string>>({})
const showSuccessModal = ref(false)

const handleSubmit = async () => {
  showSuccessModal.value = false

  const result = forgetPasswordSchema.safeParse({ email: email.value })
  fieldErrors.value = getZodErrors(result)
  if (!result.success) return

  const response = await forgetPasswordMutation.mutateAsync(result.data.email).catch(() => null)
  if (response) showSuccessModal.value = true
}

const resendResetLink = async () => {
  await forgetPasswordMutation.mutateAsync(email.value).catch(() => {})
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
      <BaseAlert
        v-if="forgetPasswordError"
        type="error"
        dismissible
        @dismiss="forgetPasswordError = ''"
      >
        {{ forgetPasswordError }}
      </BaseAlert>

      <BaseInput
        id="email"
        v-model="email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        autocomplete="email"
        :error="fieldErrors.email"
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
        class="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition duration-200"
      >
        ← Back to login
      </button>
    </template>
  </AuthLayout>

  <!-- Success Modal -->
  <AuthModal
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
  </AuthModal>
</template>
