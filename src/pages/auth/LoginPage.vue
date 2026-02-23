<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseAlert from '@/components/atoms/BaseAlert.vue'
import { loginSchema, getZodErrors } from '@/schemas/auth.schema'

const router = useRouter()
const { loginMutation, loginError } = useAuth()

const email = ref('')
const password = ref('')
const fieldErrors = ref<Record<string, string>>({})

const handleLogin = async () => {
  // Client-side validation via Zod
  const result = loginSchema.safeParse({ email: email.value, password: password.value })
  fieldErrors.value = getZodErrors(result)
  if (!result.success) return

  // Server call — onError in useAuth handles the error state; .catch() suppresses the re-throw
  await loginMutation.mutateAsync(result.data).catch(() => {})
}

const goToRegister = () => router.push('/register')
const goToForgotPassword = () => router.push('/forgot-password')
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8080/api/auth/oauth/google'
}
</script>

<template>
  <AuthLayout
    title="Welcome Back"
    subtitle="Sign in to your account"
    :show-o-auth="true"
    @google-login="handleGoogleLogin"
  >
    <form @submit.prevent="handleLogin" class="space-y-4">
      <BaseAlert v-if="loginError" type="error" dismissible @dismiss="loginError = ''">
        {{ loginError }}
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

      <BaseInput
        id="password"
        v-model="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autocomplete="current-password"
        :show-password-toggle="true"
        :error="fieldErrors.password"
      />

      <div class="flex items-center justify-end">
        <button
          type="button"
          @click="goToForgotPassword"
          class="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition duration-200"
        >
          Forgot password?
        </button>
      </div>

      <BaseButton type="submit" variant="primary" full-width :loading="loginMutation.isPending.value">
        <template #loading>Signing in...</template>
        Sign In
      </BaseButton>
    </form>

    <template #footer>
      <p class="text-xs text-gray-600">
        Don't have an account?
        <button
          @click="goToRegister"
          class="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-200"
        >
          Register now
        </button>
      </p>
    </template>
  </AuthLayout>
</template>
