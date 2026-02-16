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

const router = useRouter()
const { forgetPasswordMutation } = useAuth()

const email = ref('')
const isLoading = ref(false)
const error = ref('')
const showSuccessModal = ref(false)

const handleSubmit = async () => {
  error.value = ''
  showSuccessModal.value = false

  if (!email.value) {
    error.value = 'Please enter your email address'
    return
  }

  isLoading.value = true

  try {
    await forgetPasswordMutation.mutateAsync(email.value)
    showSuccessModal.value = true
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || 'Failed to send reset link. Please try again.'
  } finally {
    isLoading.value = false
  }
}

const goToLogin = () => {
  showSuccessModal.value = false
  router.push('/login')
}

const closeModal = () => {
  showSuccessModal.value = false
  router.push('/login')
}

const resendResetLink = async () => {
  error.value = ''
  isLoading.value = true

  try {
    await forgetPasswordMutation.mutateAsync(email.value)
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || 'Failed to resend reset link. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AuthLayout
    title="Forgot Password?"
    subtitle="Enter your email address and we'll send you a link to reset your password"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseAlert v-if="error" type="error" dismissible @dismiss="error = ''">
        {{ error }}
      </BaseAlert>

      <BaseInput
        id="email"
        v-model="email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        autocomplete="email"
        required
      />

      <BaseButton type="submit" variant="primary" full-width :loading="isLoading">
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
    :primary-button-loading="isLoading"
    @close="closeModal"
    @primary="resendResetLink"
    @secondary="goToLogin"
  >
    <p class="text-sm text-gray-700 font-mono bg-gray-100 px-4 py-2 rounded-lg">
      {{ email }}
    </p>
  </AuthModal>
</template>
