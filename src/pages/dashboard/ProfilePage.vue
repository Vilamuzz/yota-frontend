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
import { useAuthStore } from '@/stores/auth'
import { ROLES } from '@/const/roles'

const {
  user,
  currentUserQuery,
  updateCurrentUserProfileMutation,
  updateCurrentUserPasswordMutation,
  profileValidationErrors,
  passwordValidationErrors,
} = useCurrentUser()

const authStore = useAuthStore()
const { roles, isLoading: rolesLoading } = useRoles()
const { showToast } = useToast()

const filteredRoles = computed(() => {
  return roles.value.filter((role) =>
    authStore.roles.some((userRole) => userRole.toLowerCase() === role.name.toLowerCase()),
  )
})

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
    return 'Konfirmasi kata sandi tidak cocok'
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
  const isEmailChanged = profileForm.email !== user.value?.email

  updateCurrentUserProfileMutation.mutate(
    {
      ...profileForm,
      phone: profileForm.phone || '',
      profilePicture: profilePictureFile.value as File,
    },
    {
      onSuccess: () => {
        if (isEmailChanged) {
          showToast(
            'Profil berhasil diperbarui! Silakan periksa email baru Anda untuk konfirmasi perubahan email.',
            'success',
            7000,
          )
        } else {
          showToast('Profil berhasil diperbarui!', 'success')
        }
        currentUserQuery.refetch()
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal memperbarui profil'), 'error')
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
        showToast('Kata sandi berhasil diperbarui!', 'success')
        passwordForm.currentPassword = ''
        passwordForm.newPassword = ''
        passwordForm.confirmPassword = ''
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal memperbarui kata sandi'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Pengaturan Akun</template>

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
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Informasi Pribadi</h2>
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
              <h3 class="font-semibold text-gray-900 dark:text-white">Foto Profil</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Perbarui foto profil Anda. Format JPG atau PNG diperbolehkan.
              </p>
            </div>
          </div>

          <!-- Form Fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseInput
              id="username"
              v-model="profileForm.username"
              label="Nama Pengguna"
              placeholder="Nama pengguna Anda"
              :error="usernameError"
              required
            >
              <template #prefix><User :size="16" /></template>
            </BaseInput>

            <BaseInput
              id="email"
              v-model="profileForm.email"
              label="Alamat Email"
              type="email"
              placeholder="nama@email.com"
              :error="emailError"
              :hint="
                profileForm.email !== user?.email
                  ? 'Mengubah email akan mengirimkan verifikasi ke email baru Anda.'
                  : ''
              "
              required
            >
              <template #prefix><Mail :size="16" /></template>
            </BaseInput>

            <BaseInput
              id="phone"
              v-model="profileForm.phone"
              label="Phone Number"
              placeholder="Masukkan nomor telepon (contoh: 08123456789)..."
              input-class="pl-20"
              :error="phoneError"
            >
              <template #prefix>
                <div class="flex items-center gap-1.5 text-gray-500 select-none">
                  <Phone :size="16" />
                  <span
                    class="text-sm font-medium border-r border-gray-300 dark:border-gray-700 pr-1.5"
                    >+62</span
                  >
                </div>
              </template>
            </BaseInput>

            <div v-if="!authStore.hasRole(ROLES.SUPERADMIN)">
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                Peran Utama (Default)
              </label>
              <select
                v-model="profileForm.defaultAccountRoleId"
                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                :disabled="rolesLoading"
              >
                <option :value="0" disabled>Pilih Peran Utama</option>
                <option v-for="role in filteredRoles" :key="role.id" :value="role.id">
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
                label="Alamat Lengkap"
                placeholder="Alamat domisili lengkap Anda"
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
              Simpan Perubahan
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
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Keamanan Akun</h2>
        </div>

        <form @submit.prevent="updatePassword" class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div class="md:col-span-2">
              <BaseInput
                id="current-password"
                v-model="passwordForm.currentPassword"
                label="Kata Sandi Saat Ini"
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
              label="Kata Sandi Baru"
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
              label="Konfirmasi Kata Sandi Baru"
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
              Perbarui Kata Sandi
            </BaseButton>
          </div>
        </form>
      </section>
    </div>
  </DashboardLayout>
</template>
