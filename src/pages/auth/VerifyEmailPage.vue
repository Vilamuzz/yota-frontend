<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { CircleCheck, CircleX } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const { verifyEmailMutation } = useAuth()

const token = ref('')
const isVerifying = ref(false)
const error = ref('')
const validationErrors = ref<Record<string, string>>({})
const success = ref('')

onMounted(async () => {
  token.value = route.query.token as string

  if (token.value) {
    await verifyEmail()
  } else {
    error.value = 'Invalid or missing verification token.'
  }
})

const verifyEmail = async () => {
  isVerifying.value = true
  error.value = ''
  validationErrors.value = {}
  success.value = ''

  try {
    const result = await verifyEmailMutation.mutateAsync(token.value)
    success.value = result.message || 'Email verified successfully!'
  } catch (err: any) {
    const responseData = err.response?.data

    // Set the main error message
    error.value = responseData?.message || err.message || 'Failed to verify email.'

    // Check if there are validation errors
    if (responseData?.validation) {
      validationErrors.value = responseData.validation
    }
  } finally {
    isVerifying.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 px-4"
  >
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <!-- Verifying State -->
        <div v-if="isVerifying" class="text-center">
          <svg
            class="animate-spin h-12 w-12 text-indigo-600 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">Verifying Your Email</h2>
          <p class="text-gray-600">Please wait...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="success" class="text-center flex flex-col items-center">
          <CircleCheck :stroke-width="1.5" :size="48" class="text-green-500 text-5xl mb-4" />
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
          <p class="text-gray-600 text-sm mb-6">
            Your email has been successfully verified. You can now log in to your account.
          </p>
          <div class="flex flex-row">
            <BaseButton variant="primary" full-width @click="goToLogin"> Login </BaseButton>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center flex flex-col items-center">
          <CircleX :stroke-width="1.5" :size="48" class="text-red-500 text-5xl mb-4" />
          <h2 class="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>

          <p class="text-gray-600 text-sm mb-6">
            The verification link may be invalid or expired. Please try again or contact support if
            the problem persists.
          </p>
          <div class="flex flex-row">
            <BaseButton variant="primary" full-width @click="goToLogin"> Login </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
