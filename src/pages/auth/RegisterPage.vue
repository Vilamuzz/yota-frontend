<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useRegister } from '@/composables/auth/useRegister'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { registerSchema } from '@/schemas/auth.schema'
import { getZodErrors } from '@/utils/zodError'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'

const router = useRouter()
const { registerMutation, validationErrors } = useRegister()
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const fieldErrors = ref<Record<string, string>>({})
const usernameError = computed(
  () => fieldErrors.value.username || validationErrors.value?.username || '',
)
const emailError = computed(() => fieldErrors.value.email || validationErrors.value?.email || '')
const passwordError = computed(
  () => fieldErrors.value.password || validationErrors.value?.password || '',
)
const confirmPasswordError = computed(
  () => fieldErrors.value.confirmPassword || validationErrors.value?.confirmPassword || '',
)

watch(
  form,
  () => {
    if (Object.keys(fieldErrors.value).length > 0) {
      fieldErrors.value = {}
    }
    if (registerMutation.isError.value) {
      registerMutation.reset()
    }
  },
  { deep: true },
)

const { showToast } = useToast()
const handleRegister = () => {
  const result = registerSchema.safeParse({
    username: form.username,
    email: form.email,
    password: form.password,
    confirmPassword: form.confirmPassword,
  })

  fieldErrors.value = getZodErrors(result)
  if (!result.success) return

  registerMutation.mutate(
    {
      username: result.data.username,
      email: result.data.email,
      password: result.data.password,
    },
    {
      onSuccess: (data) => {
        const registeredEmail = data.data?.email || form.email
        router.push({
          name: 'resend-verification',
          query: { email: registeredEmail },
        })
      },
      onError: (err) => {
        showToast(extractError(err, 'Registration failed. Please try again.'), 'error')
      },
    },
  )
}
</script>

<template>
  <AuthLayout title="Create Account" subtitle="Sign up to get started">
    <form @submit.prevent="handleRegister" class="space-y-4">
      <BaseInput
        id="username"
        v-model="form.username"
        type="text"
        label="Username"
        placeholder="johndoe"
        autocomplete="username"
        :error="usernameError"
      />

      <BaseInput
        id="email"
        v-model="form.email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        autocomplete="email"
        :error="emailError"
      />

      <BaseInput
        id="password"
        v-model="form.password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autocomplete="new-password"
        hint="Must be at least 8 characters"
        :show-password-toggle="true"
        :show-password-strength="true"
        :error="passwordError"
      />

      <BaseInput
        id="confirmPassword"
        v-model="form.confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="••••••••"
        autocomplete="new-password"
        :show-password-toggle="true"
        :error="confirmPasswordError"
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
        <RouterLink
          to="/login"
          class="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-200"
        >
          Sign in
        </RouterLink>
      </p>
    </template>
  </AuthLayout>
</template>
