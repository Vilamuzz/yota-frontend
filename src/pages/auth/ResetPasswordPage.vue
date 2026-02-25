<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useResetPassword } from '@/composables/auth/useResetPassword'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseAlert from '@/components/atoms/BaseAlert.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { CheckCircle } from 'lucide-vue-next'
import { resetPasswordSchema, getZodErrors } from '@/schemas/auth.schema'

const router = useRouter()
const route = useRoute()
const { resetPasswordMutation, resetPasswordError } = useResetPassword()

const token = ref('')
const password = ref('')
const confirmPassword = ref('')
const fieldErrors = ref<Record<string, string>>({})
const showSuccessModal = ref(false)

onMounted(() => {
  token.value = route.query.token as string
  if (!token.value) {
    resetPasswordError.value = 'Invalid or missing reset token'
  }
})

const handleSubmit = async () => {
  showSuccessModal.value = false

  const result = resetPasswordSchema.safeParse({
    password: password.value,
    confirmPassword: confirmPassword.value,
  })
  fieldErrors.value = getZodErrors(result)
  if (!result.success) return

  const response = await resetPasswordMutation
    .mutateAsync({ token: token.value, newPassword: result.data.password })
    .catch(() => null)

  if (response) showSuccessModal.value = true
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
      <BaseAlert
        v-if="resetPasswordError"
        type="error"
        dismissible
        @dismiss="resetPasswordError = ''"
      >
        {{ resetPasswordError }}
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
        :error="fieldErrors.password"
      />

      <BaseInput
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        label="Confirm New Password"
        placeholder="••••••••"
        autocomplete="new-password"
        :show-password-toggle="true"
        :error="fieldErrors.confirmPassword"
      />

      <BaseButton
        type="submit"
        variant="primary"
        full-width
        :loading="resetPasswordMutation.isPending.value"
      >
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
  <ConfirmationModal
    :show="showSuccessModal"
    title="Password Reset Successful!"
    message="Your password has been successfully reset. You can now login with your new password."
    :icon="CheckCircle"
    primary-button-text="Login"
    secondary-button-text=""
    @close="closeModal"
    @primary="goToLogin"
  />
</template>
