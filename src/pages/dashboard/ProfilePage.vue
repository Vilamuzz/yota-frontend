<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { useCurrentUser } from '@/composables/account/useCurrentUser'
import { useRoles } from '@/composables/account/useRoles'
import { useToast } from '@/composables/ui/useToast'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { Camera, User, Mail, Phone, MapPin, Lock, Save, KeyRound } from 'lucide-vue-next'
import { extractError } from '@/utils/error'

const {
  user,
  currentUserQuery,
  updateCurrentUserProfileMutation,
  updateCurrentUserPasswordMutation,
  profileValidationErrors,
  passwordValidationErrors,
} = useCurrentUser()

const { roles, isLoading: rolesLoading } = useRoles()
const { showToast } = useToast()

const errors = ref<Record<string, string>>({})
const profilePicturePreview = ref<string | null>(null)
const profilePictureFile = ref<File | null>(null)

const profileForm = reactive({
  username: '',
  email: '',
  phone: '',
  address: '',
  defaultAccountRoleId: 0,
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Profile Errors
const usernameError = computed(
  () => errors.value.username || profileValidationErrors.value?.username || '',
)
const emailError = computed(() => errors.value.email || profileValidationErrors.value?.email || '')
const phoneError = computed(() => errors.value.phone || profileValidationErrors.value?.phone || '')
const addressError = computed(
  () => errors.value.address || profileValidationErrors.value?.address || '',
)
const defaultRoleError = computed(
  () =>
    errors.value.defaultAccountRoleId || profileValidationErrors.value?.defaultAccountRoleId || '',
)

// Password Errors
const currentPasswordError = computed(
  () => errors.value.currentPassword || passwordValidationErrors.value?.currentPassword || '',
)
const newPasswordError = computed(
  () => errors.value.newPassword || passwordValidationErrors.value?.newPassword || '',
)
const confirmPasswordError = computed(() => {
  if (passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
    return 'Passwords do not match'
  }
  return errors.value.confirmPassword || passwordValidationErrors.value?.confirmPassword || ''
})

watch(
  () => currentUserQuery.data.value,
  (response) => {
    if (!response?.data) return
    const data = response.data
    profileForm.username = data.username || ''
    profileForm.email = data.email || ''
    profileForm.phone = data.phone || ''
    profileForm.address = data.address || ''
    profileForm.defaultAccountRoleId = data.roles.find((r) => r.isDefault)?.roleId || 0
    profilePicturePreview.value = data.profilePicture || null
  },
  { immediate: true },
)

// File change logic
const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    profilePictureFile.value = file
    profilePicturePreview.value = URL.createObjectURL(file)
  }
}

const updateProfile = () => {
  updateCurrentUserProfileMutation.mutate(
    {
      ...profileForm,
      profilePicture: profilePictureFile.value as File,
    },
    {
      onSuccess: () => {
        showToast('Profile updated successfully', 'success')
        currentUserQuery.refetch()
      },
      onError: (err) => {
        showToast(extractError(err, 'Failed to update profile'), 'error')
      },
    },
  )
}

const updatePassword = () => {
  if (confirmPasswordError.value) return

  updateCurrentUserPasswordMutation.mutate(
    {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    },
    {
      onSuccess: () => {
        showToast('Password updated successfully', 'success')
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      },
      onError: (err) => {
        showToast(extractError(err, 'Failed to update password'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Account Settings</template>

    <div
      v-if="currentUserQuery.isPending.value && !user"
      class="flex justify-center items-center h-64"
    >
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-300"></div>
    </div>

    <div v-else class="max-w-4xl space-y-8">
      <!-- Profile Section -->
      <section
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <User class="text-primary-300" :size="24" />
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
        </div>

        <form @submit.prevent="updateProfile" class="p-6 space-y-8">
          <!-- Avatar Upload -->
          <div class="flex flex-col sm:flex-row items-center gap-6">
            <div class="relative group">
              <div
                class="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-50 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
              >
                <img
                  v-if="profilePicturePreview"
                  :src="profilePicturePreview"
                  alt="Profile"
                  class="w-full h-full object-cover"
                />
                <User v-else class="text-gray-300" :size="48" />
              </div>
              <label
                for="avatar-upload"
                class="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
              >
                <Camera :size="24" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                class="hidden"
                accept="image/*"
                @change="onFileChange"
              />
            </div>
            <div class="text-center sm:text-left">
              <h3 class="font-semibold text-gray-900 dark:text-white">Profile Photo</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Update your avatar. JPG or PNG allowed.
              </p>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseInput
              id="username"
              v-model="profileForm.username"
              label="Username"
              placeholder="Your username"
              :error="usernameError"
              required
            >
              <template #prefix><User :size="16" /></template>
            </BaseInput>

            <BaseInput
              id="email"
              v-model="profileForm.email"
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              :error="emailError"
              required
            >
              <template #prefix><Mail :size="16" /></template>
            </BaseInput>

            <BaseInput
              id="phone"
              v-model="profileForm.phone"
              label="Phone Number"
              placeholder="+62..."
              :error="phoneError"
            >
              <template #prefix><Phone :size="16" /></template>
            </BaseInput>

            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                Default Role
              </label>
              <select
                v-model="profileForm.defaultAccountRoleId"
                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                :disabled="rolesLoading"
              >
                <option :value="0" disabled>Select Default Role</option>
                <option v-for="role in roles" :key="role.id" :value="role.id">
                  {{ role.name }}
                </option>
              </select>
              <p v-if="defaultRoleError" class="mt-1 text-xs text-red-600">
                {{ defaultRoleError }}
              </p>
            </div>

            <div class="md:col-span-2">
              <BaseInput
                id="address"
                v-model="profileForm.address"
                label="Address"
                placeholder="Full address"
                :error="addressError"
              >
                <template #prefix><MapPin :size="16" /></template>
              </BaseInput>
            </div>
          </div>

          <div class="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
            <BaseButton
              type="submit"
              variant="primary"
              :loading="updateCurrentUserProfileMutation.isPending.value"
            >
              <Save class="mr-2" :size="18" />
              Save Changes
            </BaseButton>
          </div>
        </form>
      </section>

      <!-- Password Section -->
      <section
        class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div class="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <KeyRound class="text-primary-300" :size="24" />
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Security</h2>
        </div>

        <form @submit.prevent="updatePassword" class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div class="md:col-span-2">
              <BaseInput
                id="current-password"
                v-model="passwordForm.currentPassword"
                label="Current Password"
                type="password"
                show-password-toggle
                :error="currentPasswordError"
                required
              >
                <template #prefix><Lock :size="16" /></template>
              </BaseInput>
            </div>

            <BaseInput
              id="new-password"
              v-model="passwordForm.newPassword"
              label="New Password"
              type="password"
              show-password-toggle
              show-password-strength
              :error="newPasswordError"
              required
            >
              <template #prefix><Lock :size="16" /></template>
            </BaseInput>

            <BaseInput
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              label="Confirm New Password"
              type="password"
              show-password-toggle
              :error="confirmPasswordError"
              required
            >
              <template #prefix><Lock :size="16" /></template>
            </BaseInput>
          </div>

          <div class="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
            <BaseButton
              type="submit"
              variant="secondary"
              :loading="updateCurrentUserPasswordMutation.isPending.value"
              :disabled="!!confirmPasswordError"
            >
              <KeyRound class="mr-2" :size="18" />
              Update Password
            </BaseButton>
          </div>
        </form>
      </section>
    </div>
  </DashboardLayout>
</template>
