<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseAlert from '@/components/atoms/BaseAlert.vue'
import AuthModal from '@/components/molecules/AuthModal.vue'
import { CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { resetPasswordMutation } = useAuth()

const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const showSuccessModal = ref(false)

onMounted(() => {
  token.value = route.query.token as string
  if (!token.value) {
    error.value = 'Invalid or missing reset token'
  }
})

const handleSubmit = async () => {
  error.value = ''
  showSuccessModal.value = false

  if (!password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    await resetPasswordMutation.mutateAsync({
      token: token.value,
      newPassword: password.value,
    })

    showSuccessModal.value = true
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || 'Failed to reset password. Please try again.'
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
</script>

<template>
  <AuthLayout title="Reset Password" subtitle="Enter your new password">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseAlert v-if="error" type="error" dismissible @dismiss="error = ''">
        {{ error }}
      </BaseAlert>

      <BaseInput
        id="password"
        v-model="password"
        type="password"
        label="New Password"
        placeholder="••••••••"
        autocomplete="new-password"
        :show-password-toggle="true"
        :show-password-strength="true"
        required
      />

      <BaseInput
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        label="Confirm New Password"
        placeholder="••••••••"
        autocomplete="new-password"
        :show-password-toggle="true"
        required
      />

      <BaseButton type="submit" variant="primary" full-width :loading="isLoading">
        <template #loading>Resetting...</template>
        Reset Password
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
    :show="!showSuccessModal"
    title="Password Reset Successful!"
    message="Your password has been successfully reset. You can now login with your new password."
    :icon="CheckCircle"
    primary-button-text="Login"
    secondary-button-text=""
    @close="closeModal"
    @primary="goToLogin"
  />
</template>
