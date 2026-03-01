<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRegister } from '@/composables/auth/useRegister'
import { useResendVerification } from '@/composables/auth/useResendVerification'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseAlert from '@/components/atoms/BaseAlert.vue'
import ConfirmationModal from '@/components/molecules/ConfirmationModal.vue'
import { MailCheck } from 'lucide-vue-next'
import { registerSchema } from '@/schemas/auth.schema'
import { getZodErrors } from '@/utils/zodError'

const router = useRouter()
const { registerMutation, registerError } = useRegister()
const { resendVerificationMutation, resendError } = useResendVerification()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const fieldErrors = ref<Record<string, string>>({})
const showSuccessModal = ref(false)
const registeredEmail = ref('')

const handleRegister = async () => {
  // Client-side validation via Zod (includes confirmPassword match)
  const result = registerSchema.safeParse({
    username: username.value,
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
  })

  fieldErrors.value = getZodErrors(result)
  if (!result.success) return

  // Server call — onError in useAuth handles the error state; .catch() suppresses the re-throw
  const response = await registerMutation
    .mutateAsync({
      username: result.data.username,
      email: result.data.email,
      password: result.data.password,
    })
    .catch(() => null)

  if (response) {
    registeredEmail.value = response.data?.email || email.value
    showSuccessModal.value = true
  }
}

const handleResendVerification = async () => {
  await resendVerificationMutation.mutateAsync(registeredEmail.value).catch(() => {})
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
  <AuthLayout title="Create Account" subtitle="Sign up to get started">
    <form @submit.prevent="handleRegister" class="space-y-4">
      <BaseAlert v-if="registerError" type="error" dismissible @dismiss="registerError = ''">
        {{ registerError }}
      </BaseAlert>

      <BaseInput
        id="username"
        v-model="username"
        type="text"
        label="Username"
        placeholder="johndoe"
        autocomplete="username"
        :error="fieldErrors.username"
      />

      <BaseInput
        id="email"
        v-model="email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        autocomplete="email"
        :error="fieldErrors.email"
      />

      <BaseInput
        id="password"
        v-model="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autocomplete="new-password"
        hint="Must be at least 8 characters"
        :show-password-toggle="true"
        :show-password-strength="true"
        :error="fieldErrors.password"
      />

      <BaseInput
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="••••••••"
        autocomplete="new-password"
        :show-password-toggle="true"
        :error="fieldErrors.confirmPassword"
      />

      <BaseButton
        type="submit"
        variant="primary"
        full-width
        :loading="registerMutation.isPending.value"
      >
        <template #loading>Creating account...</template>
        Create Account
      </BaseButton>
    </form>

    <template #footer>
      <p class="text-xs text-gray-600">
        Already have an account?
        <button
          @click="goToLogin"
          class="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-200"
        >
          Sign in
        </button>
      </p>
    </template>
  </AuthLayout>

  <!-- Success Modal -->
  <ConfirmationModal
    :show="showSuccessModal"
    title="Registration Successful!"
    message="We've sent a verification email to your inbox. Click the link to activate your account. If you don't see it, check your spam folder."
    :icon="MailCheck"
    primary-button-text="Resend Verification Email"
    secondary-button-text="Go to Login"
    :primary-button-loading="resendVerificationMutation.isPending.value"
    @close="closeModal"
    @primary="handleResendVerification"
    @secondary="goToLogin"
  >
    <p class="text-sm text-gray-700 font-mono bg-gray-100 px-4 py-2 rounded-lg">
      {{ registeredEmail }}
    </p>

    <BaseAlert v-if="resendError" type="error" class="mt-2">
      {{ resendError }}
    </BaseAlert>
  </ConfirmationModal>
</template>
