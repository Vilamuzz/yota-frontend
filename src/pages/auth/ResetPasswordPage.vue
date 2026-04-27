<script setup lang="ts">
import { reactive, computed, ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useResetPassword } from '@/composables/auth/useResetPassword'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
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
    initError.value = 'Invalid or missing reset token. Please request a new one.'
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
        showToast(extractError(err, 'Failed to reset password. Please try again.'), 'error')
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
  <AuthLayout title="Reset Password" subtitle="Enter your new password">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <BaseAlert v-if="initError" type="error">
        {{ initError }}
      </BaseAlert>
      <BaseInput
        id="password"
        v-model="form.password"
        type="password"
        label="New Password"
        placeholder="••••••••"
        autocomplete="new-password"
        :show-password-toggle="true"
        :show-password-strength="true"
        :error="passwordError"
      />

      <BaseInput
        id="confirmPassword"
        v-model="form.confirmPassword"
        type="password"
        label="Confirm New Password"
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
