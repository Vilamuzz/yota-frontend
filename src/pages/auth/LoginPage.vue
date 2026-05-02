<script setup lang="ts">
import { reactive, computed, watch, ref } from 'vue'
import { useLogin } from '@/composables/auth/useLogin'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AuthInput from '@/components/atoms/AuthInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useToast } from '@/composables/ui/useToast'
import { loginSchema } from '@/schemas/auth.schema'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'

const { loginMutation, validationErrors } = useLogin()
const form = reactive({
  email: '',
  password: '',
})

const fieldErrors = ref<Record<string, string>>({})
const emailError = computed(() => fieldErrors.value.email || validationErrors.value?.email || '')
const passwordError = computed(
  () => fieldErrors.value.password || validationErrors.value?.password || '',
)

watch(
  form,
  () => {
    if (Object.keys(fieldErrors.value).length > 0) {
      fieldErrors.value = {}
    }
    if (loginMutation.isError.value) {
      loginMutation.reset()
    }
  },
  { deep: true },
)

const { showToast } = useToast()
const handleLogin = () => {
  const response = loginSchema.safeParse({ email: form.email, password: form.password })
  fieldErrors.value = getZodErrors(response)
  if (!response.success) return
  loginMutation.mutate(response.data, {
    onError: (err) => {
      showToast(extractError(err, 'Login failed. Please try again.'), 'error')
    },
  })
}

const handleGoogleLogin = () => {
  window.location.href = '/api/auth/oauth/google'
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
      <AuthInput
        id="email"
        v-model="form.email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        autocomplete="email"
        :error="emailError"
      />

      <AuthInput
        id="password"
        v-model="form.password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autocomplete="current-password"
        :show-password-toggle="true"
        :error="passwordError"
      />

      <div class="flex items-center justify-start">
        <RouterLink
          to="/forgot-password"
          class="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition duration-200"
        >
          Forgot password?
        </RouterLink>
      </div>

      <BaseButton
        type="submit"
        variant="primary"
        full-width
        :loading="loginMutation.isPending.value"
      >
        <template #loading>Signing in...</template>
        Sign In
      </BaseButton>
    </form>

    <template #footer>
      <p class="text-xs text-gray-600">
        Don't have an account?
        <RouterLink to="/register" class="text-primary-400 font-semibold hover:underline">
          Register now
        </RouterLink>
      </p>
    </template>
  </AuthLayout>
</template>
