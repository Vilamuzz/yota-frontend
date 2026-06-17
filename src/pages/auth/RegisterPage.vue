<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useRegister } from '@/composables/auth/useRegister'
import AuthLayout from '@/layouts/AuthLayout.vue'
import AuthInput from '@/components/atoms/AuthInput.vue'
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
        showToast(extractError(err, 'Registrasi gagal. Silakan coba lagi.'), 'error')
      },
    },
  )
}
</script>

<template>
  <AuthLayout title="Buat Akun" subtitle="Daftar untuk memulai">
    <form @submit.prevent="handleRegister" class="space-y-4">
      <AuthInput
        id="username"
        v-model="form.username"
        type="text"
        label="Nama Pengguna"
        placeholder="johndoe"
        autocomplete="username"
        :error="usernameError"
      />

      <AuthInput
        id="email"
        v-model="form.email"
        type="email"
        label="Alamat Email"
        placeholder="anda@contoh.com"
        autocomplete="email"
        :error="emailError"
      />

      <AuthInput
        id="password"
        v-model="form.password"
        type="password"
        label="Kata Sandi"
        placeholder="••••••••"
        autocomplete="new-password"
        hint="Harus minimal 8 karakter"
        :show-password-toggle="true"
        :show-password-strength="true"
        :error="passwordError"
      />

      <AuthInput
        id="confirmPassword"
        v-model="form.confirmPassword"
        type="password"
        label="Konfirmasi Kata Sandi"
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
        <template #loading>Sedang membuat akun...</template>
        Buat Akun
      </BaseButton>
    </form>

    <template #footer>
      <p class="text-xs text-gray-600">
        Sudah punya akun?
        <RouterLink to="/login" class="text-primary-400 font-semibold hover:underline">
          Masuk
        </RouterLink>
      </p>
    </template>
  </AuthLayout>
</template>
