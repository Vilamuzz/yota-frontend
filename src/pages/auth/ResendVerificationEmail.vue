<script setup lang="ts">
import { reactive, onMounted, watch, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useResendVerification } from '@/composables/auth/useResendVerification'
import { useToast } from '@/composables/ui/useToast'
import AuthLayout from '@/layouts/AuthLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { Mail, ArrowLeft, Send } from 'lucide-vue-next'
import { forgetPasswordSchema } from '@/schemas/auth.schema'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()
const { resendVerificationMutation, validationErrors } = useResendVerification()
const form = reactive({
  email: '',
})

const fieldErrors = ref<Record<string, string>>({})
const emailError = computed(() => fieldErrors.value.email || validationErrors.value?.email || '')
onMounted(() => {
  if (route.query.email) {
    form.email = route.query.email as string
  }
})

watch(
  form,
  () => {
    if (Object.keys(fieldErrors.value).length > 0) {
      fieldErrors.value = {}
    }
    if (resendVerificationMutation.isError.value) {
      resendVerificationMutation.reset()
    }
  },
  { deep: true },
)

const handleResend = () => {
  const result = forgetPasswordSchema.safeParse({ email: form.email })
  fieldErrors.value = getZodErrors(result)
  if (!result.success) return

  resendVerificationMutation.mutate(result.data.email, {
    onSuccess: () => {
      showToast('Verification email has been resent to your inbox.', 'success')
    },
    onError: (err) => {
      showToast(
        extractError(err, 'Failed to resend verification email. Please try again.'),
        'error',
      )
    },
  })
}
</script>

<template>
  <AuthLayout
    title="Verify your email"
    subtitle="We need to verify your email address to secure your account."
  >
    <div class="flex flex-col items-center mb-8">
      <div class="w-20 h-20 bg-primary-300/10 rounded-full flex items-center justify-center mb-4">
        <Mail class="w-10 h-10 text-primary-300" />
      </div>
      <p class="text-center text-gray-600 text-sm">
        Didn't receive the email? Check your spam folder or enter your email below to resend it.
      </p>
    </div>

    <form @submit.prevent="handleResend" class="space-y-6">
      <BaseInput
        id="email"
        v-model="form.email"
        type="email"
        label="Email Address"
        placeholder="you@example.com"
        autocomplete="email"
        :error="emailError"
      >
        <template #prefix>
          <Mail class="w-4 h-4 text-gray-400" />
        </template>
      </BaseInput>

      <BaseButton
        type="submit"
        variant="primary"
        full-width
        size="lg"
        :loading="resendVerificationMutation.isPending.value"
      >
        <template #loading>Sending...</template>
        <div class="flex items-center justify-center gap-2">
          <span>Resend Verification Email</span>
          <Send class="w-4 h-4" />
        </div>
      </BaseButton>

      <button
        type="button"
        @click="router.push('/login')"
        class="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-300 transition-colors duration-200"
      >
        <ArrowLeft class="w-4 h-4" />
        Back to Sign In
      </button>
    </form>

    <template #footer>
      <p class="text-xs text-gray-500">
        Already verified?
        <RouterLink to="/login" class="text-primary-300 font-semibold hover:underline">
          Sign in
        </RouterLink>
      </p>
    </template>
  </AuthLayout>
</template>
