<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import BasePublicInput from '@/components/atoms/BasePublicInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useCurrentUser } from '@/composables/account/useCurrentUser'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'
import {
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Save,
  KeyRound,
  ShieldCheck,
} from 'lucide-vue-next'
import { formatPhoneWithDashes } from '@/utils/phone'

const {
  user,
  currentUserQuery,
  updateCurrentUserProfileMutation,
  updateCurrentUserPasswordMutation,
  profileValidationErrors,
  passwordValidationErrors,
} = useCurrentUser()

const { showToast } = useToast()

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

const userInitials = computed(() => {
  if (!user.value?.username) return 'U'
  const names = user.value.username.split(' ')
  if (names.length >= 2) return ((names[0]?.[0] ?? '') + (names[1]?.[0] ?? '')).toUpperCase()
  return user.value.username.substring(0, 2).toUpperCase()
})

// Errors
const usernameError = computed(() => profileValidationErrors.value?.username || '')
const emailError = computed(() => profileValidationErrors.value?.email || '')
const phoneError = computed(() => profileValidationErrors.value?.phone || '')
const addressError = computed(() => profileValidationErrors.value?.address || '')
const currentPasswordError = computed(() => passwordValidationErrors.value?.currentPassword || '')
const newPasswordError = computed(() => passwordValidationErrors.value?.newPassword || '')
const confirmPasswordError = computed(() => {
  if (passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword) {
    return 'Konfirmasi kata sandi tidak cocok'
  }
  return passwordValidationErrors.value?.confirmPassword || ''
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
      phone: profileForm.phone || '',
      profilePicture: profilePictureFile.value as File,
    },
    {
      onSuccess: () => {
        showToast('Profil berhasil diperbarui!', 'success')
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
    { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
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
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-16 font-poppins">
      <div class="max-w-5xl mx-auto px-4 sm:px-6">
        <!-- Page Header -->
        <div class="mb-10">
          <h1 class="text-3xl font-black text-gray-900 uppercase">Pengaturan Akun</h1>
          <p class="text-gray-500 mt-1">Kelola informasi profil dan keamanan akun Anda.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <!-- Sidebar: Avatar + Summary -->
          <div class="lg:col-span-4 space-y-6">
            <div
              class="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center relative group"
            >
              <!-- Avatar -->
              <div class="relative w-28 h-28 mx-auto mb-5">
                <div
                  class="w-full h-full rounded-full overflow-hidden bg-primary-400 flex items-center justify-center ring-4 ring-primary-50"
                >
                  <img
                    v-if="profilePicturePreview"
                    :src="profilePicturePreview"
                    alt="Avatar"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-white font-black text-3xl">{{ userInitials }}</span>
                </div>
                <!-- Upload Overlay -->
                <label
                  for="avatar-upload"
                  class="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity duration-200"
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

              <h2 class="text-xl font-black text-gray-900">{{ user?.username || 'Pengguna' }}</h2>
              <p class="text-sm text-gray-500 mt-1">{{ user?.email }}</p>

              <div
                class="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-400 rounded-full text-xs font-bold uppercase tracking-wider"
              >
                <ShieldCheck :size="12" />
                Orang Tua Asuh
              </div>

              <p class="text-[10px] text-gray-400 mt-6 leading-relaxed">
                Klik pada foto untuk mengubah gambar profil Anda.
              </p>
            </div>

            <!-- Quick Info -->
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h3 class="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Info Singkat
              </h3>
              <div v-if="user?.phone" class="flex items-center gap-3 text-sm text-gray-700">
                <Phone :size="15" class="text-gray-400 shrink-0" />
                <span>{{ formatPhoneWithDashes(user.phone) }}</span>
              </div>
              <div v-if="user?.address" class="flex items-start gap-3 text-sm text-gray-700">
                <MapPin :size="15" class="text-gray-400 shrink-0 mt-0.5" />
                <span class="leading-relaxed">{{ user.address }}</span>
              </div>
              <div
                v-if="!user?.phone && !user?.address"
                class="text-xs text-gray-400 italic text-center py-2"
              >
                Belum ada info kontak yang dilengkapi.
              </div>
            </div>
          </div>

          <!-- Main: Forms -->
          <div class="lg:col-span-8 space-y-6">
            <!-- Profile Form -->
            <section class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                class="px-4 sm:px-6 md:px-8 py-6 border-b border-gray-100 flex items-center gap-3"
              >
                <div class="p-2 bg-primary-50 rounded-xl text-primary-400">
                  <User :size="20" />
                </div>
                <div>
                  <h2 class="text-lg font-black text-gray-900">Informasi Pribadi</h2>
                  <p class="text-xs text-gray-400">Perbarui nama, email, dan kontak Anda</p>
                </div>
              </div>

              <form @submit.prevent="updateProfile" class="p-4 sm:p-6 md:p-8 space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BasePublicInput
                    id="username"
                    v-model="profileForm.username"
                    label="Nama Pengguna"
                    placeholder="Nama pengguna Anda"
                    :error="usernameError"
                    required
                  >
                    <template #prefix><User :size="16" /></template>
                  </BasePublicInput>

                  <BasePublicInput
                    id="email"
                    v-model="profileForm.email"
                    label="Alamat Email"
                    type="email"
                    placeholder="nama@email.com"
                    :error="emailError"
                    required
                  >
                    <template #prefix><Mail :size="16" /></template>
                  </BasePublicInput>

                  <BasePublicInput
                    id="phone"
                    v-model="profileForm.phone"
                    label="Nomor Telepon"
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
                  </BasePublicInput>

                  <div class="md:col-span-2">
                    <BasePublicInput
                      id="address"
                      v-model="profileForm.address"
                      label="Alamat Lengkap"
                      placeholder="Masukkan alamat domisili Anda"
                      :error="addressError"
                    >
                      <template #prefix><MapPin :size="16" /></template>
                    </BasePublicInput>
                  </div>
                </div>

                <div class="flex justify-end pt-4 border-t border-gray-50">
                  <BaseButton
                    type="submit"
                    variant="primary"
                    :loading="updateCurrentUserProfileMutation.isPending.value"
                    class="px-8"
                  >
                    <Save class="mr-2" :size="16" />
                    Simpan Perubahan
                  </BaseButton>
                </div>
              </form>
            </section>

            <!-- Password Form -->
            <section class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div
                class="px-4 sm:px-6 md:px-8 py-6 border-b border-gray-100 flex items-center gap-3"
              >
                <div class="p-2 bg-yellow-50 rounded-xl text-yellow-500">
                  <KeyRound :size="20" />
                </div>
                <div>
                  <h2 class="text-lg font-black text-gray-900">Keamanan Akun</h2>
                  <p class="text-xs text-gray-400">Ubah kata sandi akun Anda secara berkala</p>
                </div>
              </div>

              <form @submit.prevent="updatePassword" class="p-4 sm:p-6 md:p-8 space-y-6">
                <BasePublicInput
                  id="current-password"
                  v-model="passwordForm.currentPassword"
                  label="Kata Sandi Saat Ini"
                  type="password"
                  show-password-toggle
                  placeholder="Masukkan kata sandi lama"
                  :error="currentPasswordError"
                  required
                >
                  <template #prefix><Lock :size="16" /></template>
                </BasePublicInput>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <BasePublicInput
                    id="new-password"
                    v-model="passwordForm.newPassword"
                    label="Kata Sandi Baru"
                    type="password"
                    show-password-toggle
                    show-password-strength
                    placeholder="Buat kata sandi baru"
                    :error="newPasswordError"
                    required
                  >
                    <template #prefix><Lock :size="16" /></template>
                  </BasePublicInput>

                  <BasePublicInput
                    id="confirm-password"
                    v-model="passwordForm.confirmPassword"
                    label="Konfirmasi Kata Sandi"
                    type="password"
                    show-password-toggle
                    placeholder="Ulangi kata sandi baru"
                    :error="confirmPasswordError"
                    required
                  >
                    <template #prefix><Lock :size="16" /></template>
                  </BasePublicInput>
                </div>

                <div class="flex justify-end pt-4 border-t border-gray-50">
                  <BaseButton
                    type="submit"
                    variant="outline"
                    :loading="updateCurrentUserPasswordMutation.isPending.value"
                    :disabled="!!confirmPasswordError"
                    class="px-8"
                  >
                    <KeyRound class="mr-2" :size="16" />
                    Perbarui Kata Sandi
                  </BaseButton>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
