<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseAlert from '@/components/atoms/BaseAlert.vue'

const router = useRouter()
const { registerMutation, resendVerificationMutation } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)
const registeredEmail = ref('')

const handleRegister = async () => {
  error.value = ''
  success.value = false

  if (!username.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters long'
    return
  }

  loading.value = true

  try {
    const result = await registerMutation.mutateAsync({
      username: username.value,
      email: email.value,
      password: password.value,
    })

    success.value = true
    registeredEmail.value = result.data?.email || email.value
  } catch (err: any) {
    error.value =
      err.response?.data?.message || err.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const handleResendVerification = async () => {
  error.value = ''
  loading.value = true

  try {
    await resendVerificationMutation.mutateAsync(registeredEmail.value)
  } catch (err: any) {
    error.value =
      err.response?.data?.message ||
      err.message ||
      'Failed to resend verification email. Please try again.'
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <AuthLayout v-if="!success" title="Create Account" subtitle="Sign up to get started">
    <form @submit.prevent="handleRegister" class="space-y-4">
      <BaseAlert v-if="error" type="error" dismissible @dismiss="error = ''">
        {{ error }}
      </BaseAlert>

      <BaseInput
        id="username"
        v-model="username"
        type="text"
        label="Username"
        placeholder="johndoe"
        autocomplete="username"
        required
      />

      <BaseInput
        id="email"
        v-model="email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        autocomplete="email"
        required
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
        required
      />

      <BaseInput
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="••••••••"
        autocomplete="new-password"
        :show-password-toggle="true"
        required
      />

      <BaseButton type="submit" variant="primary" full-width :loading="loading">
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

  <!-- Success State -->
  <AuthLayout v-else title="Registration Successful!" subtitle="">
    <div class="text-center">
      <div class="text-green-500 text-5xl mb-4">✓</div>

      <BaseAlert type="success" title="Please verify your email">
        <p>We've sent a verification link to:</p>
        <p class="font-mono text-xs mt-1">{{ registeredEmail }}</p>
      </BaseAlert>

      <p class="text-gray-600 text-sm my-6">
        Click the link in the email to activate your account. If you don't see it, check your spam
        folder.
      </p>

      <div class="space-y-3">
        <BaseButton variant="secondary" full-width @click="goToLogin"> Go to Login </BaseButton>

        <BaseButton
          variant="outline"
          full-width
          :loading="loading"
          @click="handleResendVerification"
        >
          <template #loading>Sending...</template>
          Resend Verification Email
        </BaseButton>
      </div>
    </div>
  </AuthLayout>
</template>
