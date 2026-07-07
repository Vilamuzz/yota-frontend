<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import {
  Building2,
  Camera,
  ImageIcon,
  Loader2,
  Save,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Percent,
} from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useFoundationProfileDetail } from '@/composables/foundationProfile/useFoundationProfileDetail'
import { useFoundationProfileUpdate } from '@/composables/foundationProfile/useFoundationProfileUpdate'
import { useFoundationProfileStore } from '@/stores/foundationProfile'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'

const { foundationProfileDetailQuery } = useFoundationProfileDetail()
const { createFoundationProfileMutation, updateFoundationProfileMutation, validationErrors } =
  useFoundationProfileUpdate()
const foundationProfileStore = useFoundationProfileStore()
const { showToast } = useToast()

const profileId = ref<string | null>(null)
const hasInitialized = ref(false)

interface ImageField {
  file: File | null
  preview: string | null
}

const makeImageField = (): ImageField => ({ file: null, preview: null })

const form = reactive({
  foundationName: '',
  founderName: '',
  founderPicture: makeImageField(),
  foundationAddress: '',
  foundationPhone: '',
  foundationEmail: '',
  foundationInstagram: '',
  foundationFacebook: '',
  foundationTwitter: '',
  embeddedAddress: '',
  ppnPercentage: 11,
  logo: makeImageField(),
  icon: makeImageField(),
  organizationStructure: makeImageField(),
  heroImageOne: makeImageField(),
  heroImageTwo: makeImageField(),
  heroImageThree: makeImageField(),
  heroImageFour: makeImageField(),
})

const isFetching = computed(() => foundationProfileDetailQuery.isPending.value)
const isSubmitting = computed(
  () =>
    createFoundationProfileMutation.isPending.value ||
    updateFoundationProfileMutation.isPending.value,
)

watch(
  () => foundationProfileDetailQuery.data.value,
  (response) => {
    if (!response?.data || hasInitialized.value) return
    const data = response.data
    profileId.value = data.id
    form.foundationName = data.foundationName || ''
    form.founderName = data.founderName || ''
    form.founderPicture.preview = data.founderPicture || null
    form.foundationAddress = data.foundationAddress || ''
    form.foundationPhone = data.foundationPhone || ''
    form.foundationEmail = data.foundationEmail || ''
    form.foundationInstagram = data.foundationInstagram || ''
    form.foundationFacebook = data.foundationFacebook || ''
    form.foundationTwitter = data.foundationTwitter || ''
    form.embeddedAddress = data.embeddedAddress || ''
    form.ppnPercentage = data.ppnPercentage ?? 11
    form.logo.preview = data.logo || null
    form.icon.preview = data.icon || null
    form.organizationStructure.preview = data.organizationStructure || null
    form.heroImageOne.preview = data.heroImageOne || null
    form.heroImageTwo.preview = data.heroImageTwo || null
    form.heroImageThree.preview = data.heroImageThree || null
    form.heroImageFour.preview = data.heroImageFour || null
    hasInitialized.value = true
  },
  { immediate: true },
)

const handleImageChange = (field: ImageField, event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    field.file = file
    field.preview = URL.createObjectURL(file)
  }
}

const clearImage = (field: ImageField, inputId: string) => {
  field.file = null
  field.preview = null
  const input = document.getElementById(inputId) as HTMLInputElement | null
  if (input) input.value = ''
}

const handleSubmit = () => {
  if (!form.foundationName.trim()) {
    showToast('Nama yayasan wajib diisi', 'error')
    return
  }
  if (!form.founderName.trim()) {
    showToast('Nama pendiri wajib diisi', 'error')
    return
  }
  if (!form.foundationAddress.trim()) {
    showToast('Alamat yayasan wajib diisi', 'error')
    return
  }
  if (!form.embeddedAddress.trim()) {
    showToast('Link embed peta wajib diisi', 'error')
    return
  }
  if (!form.foundationPhone.trim()) {
    showToast('Nomor telepon yayasan wajib diisi', 'error')
    return
  }
  if (!form.foundationEmail.trim()) {
    showToast('Email yayasan wajib diisi', 'error')
    return
  }

  if (profileId.value) {
    // Update
    updateFoundationProfileMutation.mutate(
      {
        id: profileId.value,
        data: {
          foundationName: form.foundationName,
          founderName: form.founderName,
          foundationAddress: form.foundationAddress,
          foundationPhone: form.foundationPhone || '',
          foundationEmail: form.foundationEmail,
          foundationInstagram: form.foundationInstagram || undefined,
          foundationFacebook: form.foundationFacebook || undefined,
          foundationTwitter: form.foundationTwitter || undefined,
          embeddedAddress: form.embeddedAddress,
          ppnPercentage: Number(form.ppnPercentage),
          ...(form.founderPicture.file && { founderPicture: form.founderPicture.file }),
          ...(form.logo.file && { logo: form.logo.file }),
          ...(form.icon.file && { icon: form.icon.file }),
          ...(form.organizationStructure.file && {
            organizationStructure: form.organizationStructure.file,
          }),
          ...(form.heroImageOne.file && { heroImageOne: form.heroImageOne.file }),
          ...(form.heroImageTwo.file && { heroImageTwo: form.heroImageTwo.file }),
          ...(form.heroImageThree.file && { heroImageThree: form.heroImageThree.file }),
          ...(form.heroImageFour.file && { heroImageFour: form.heroImageFour.file }),
        },
      },
      {
        onSuccess: () => {
          showToast('Profil yayasan berhasil diperbarui!', 'success')
          hasInitialized.value = false
          foundationProfileDetailQuery.refetch()
          foundationProfileStore.refresh()
        },
        onError: (err) => {
          showToast(extractError(err, 'Gagal memperbarui profil yayasan'), 'error')
        },
      },
    )
  } else {
    // Create — all image fields required
    const missingFields = [
      !form.founderPicture.file && 'Foto Pendiri',
      !form.logo.file && 'Logo',
      !form.icon.file && 'Ikon',
      !form.organizationStructure.file && 'Struktur Organisasi',
      !form.heroImageOne.file && 'Hero Image 1',
      !form.heroImageTwo.file && 'Hero Image 2',
      !form.heroImageThree.file && 'Hero Image 3',
      !form.heroImageFour.file && 'Hero Image 4',
    ].filter(Boolean)

    if (missingFields.length > 0) {
      showToast(`Lengkapi field berikut: ${missingFields.join(', ')}`, 'error')
      return
    }

    createFoundationProfileMutation.mutate(
      {
        foundationName: form.foundationName,
        founderName: form.founderName,
        foundationAddress: form.foundationAddress,
        foundationPhone: form.foundationPhone,
        foundationEmail: form.foundationEmail,
        foundationInstagram: form.foundationInstagram || undefined,
        foundationFacebook: form.foundationFacebook || undefined,
        foundationTwitter: form.foundationTwitter || undefined,
        embeddedAddress: form.embeddedAddress,
        ppnPercentage: Number(form.ppnPercentage),
        founderPicture: form.founderPicture.file as File,
        logo: form.logo.file as File,
        icon: form.icon.file as File,
        organizationStructure: form.organizationStructure.file as File,
        heroImageOne: form.heroImageOne.file as File,
        heroImageTwo: form.heroImageTwo.file as File,
        heroImageThree: form.heroImageThree.file as File,
        heroImageFour: form.heroImageFour.file as File,
      },
      {
        onSuccess: () => {
          showToast('Profil yayasan berhasil dibuat!', 'success')
          hasInitialized.value = false
          foundationProfileDetailQuery.refetch()
          foundationProfileStore.refresh()
        },
        onError: (err) => {
          showToast(extractError(err, 'Gagal membuat profil yayasan'), 'error')
        },
      },
    )
  }
}
</script>

<template>
  <DashboardLayout>
    <template #title>Profil Yayasan</template>

    <!-- Loading State -->
    <div v-if="isFetching" class="flex flex-col items-center justify-center py-24">
      <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
      <p class="text-gray-500 font-medium">Memuat profil yayasan...</p>
    </div>

    <div v-else class="max-w-5xl space-y-6">
      <form
        @submit.prevent="handleSubmit"
        class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"
      >
        <!-- Left: Main Info -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Informasi Yayasan -->
          <section
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-300">
                <Building2 :size="20" />
              </div>
              <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Informasi Yayasan
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BaseInput
                id="foundationName"
                v-model="form.foundationName"
                label="Nama Yayasan"
                placeholder="Masukkan nama yayasan..."
                :error="validationErrors?.foundationName"
                required
              >
                <template #prefix><Building2 :size="16" /></template>
              </BaseInput>

              <BaseInput
                id="foundationPhone"
                v-model="form.foundationPhone"
                label="Nomor Telepon"
                placeholder="Masukkan nomor telepon (contoh: 08123456789)..."
                input-class="pl-20"
                :error="validationErrors?.foundationPhone"
                required
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

              <BaseInput
                id="foundationEmail"
                v-model="form.foundationEmail"
                label="Email Yayasan"
                type="email"
                placeholder="Masukkan email yayasan..."
                :error="validationErrors?.foundationEmail"
                required
              >
                <template #prefix><Mail :size="16" /></template>
              </BaseInput>

              <BaseInput
                id="ppnPercentage"
                v-model="form.ppnPercentage"
                label="Persentase PPN (%)"
                type="number"
                step="0.1"
                placeholder="Masukkan persentase PPN..."
                :error="validationErrors?.ppnPercentage"
                required
              >
                <template #prefix><Percent :size="16" /></template>
              </BaseInput>

              <BaseInput
                id="foundationAddress"
                v-model="form.foundationAddress"
                label="Alamat Yayasan"
                placeholder="Masukkan alamat lengkap yayasan..."
                :error="validationErrors?.foundationAddress"
                required
                class="md:col-span-2"
              >
                <template #prefix><MapPin :size="16" /></template>
              </BaseInput>

              <BaseInput
                id="embeddedAddress"
                v-model="form.embeddedAddress"
                label="Link Embed Peta (Google Maps)"
                placeholder="Masukkan URL embed peta (src dari iframe Google Maps)..."
                :error="validationErrors?.embeddedAddress"
                required
                class="md:col-span-2"
              >
                <template #prefix><MapPin :size="16" /></template>
              </BaseInput>
            </div>
          </section>

          <!-- Informasi Pendiri & Media Sosial -->
          <section
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div class="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500">
                <User :size="20" />
              </div>
              <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Informasi Pendiri & Media Sosial
              </h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Founder Name -->
              <BaseInput
                id="founderName"
                v-model="form.founderName"
                label="Nama Pendiri"
                placeholder="Masukkan nama pendiri..."
                :error="validationErrors?.founderName"
                required
              >
                <template #prefix><User :size="16" /></template>
              </BaseInput>

              <!-- Instagram -->
              <BaseInput
                id="foundationInstagram"
                v-model="form.foundationInstagram"
                label="Instagram Yayasan (Opsional)"
                placeholder="https://instagram.com/..."
                :error="validationErrors?.foundationInstagram"
              >
                <template #prefix><Instagram :size="16" /></template>
              </BaseInput>

              <!-- Facebook -->
              <BaseInput
                id="foundationFacebook"
                v-model="form.foundationFacebook"
                label="Facebook Yayasan (Opsional)"
                placeholder="https://facebook.com/..."
                :error="validationErrors?.foundationFacebook"
              >
                <template #prefix><Facebook :size="16" /></template>
              </BaseInput>

              <!-- Twitter -->
              <BaseInput
                id="foundationTwitter"
                v-model="form.foundationTwitter"
                label="Twitter/X Yayasan (Opsional)"
                placeholder="https://twitter.com/..."
                :error="validationErrors?.foundationTwitter"
              >
                <template #prefix><Twitter :size="16" /></template>
              </BaseInput>
            </div>
          </section>

          <!-- Hero Images -->
          <section
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-5"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div class="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-500">
                <ImageIcon :size="20" />
              </div>
              <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Hero Images
              </h2>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <template
                v-for="{ key: fieldKey, label } in [
                  { key: 'heroImageOne', label: 'Bagian Selamat Datang' },
                  { key: 'heroImageTwo', label: 'Bagian Anak Asuh' },
                  { key: 'heroImageThree', label: 'Bagian Ambulans' },
                  { key: 'heroImageFour', label: 'Bagian Tentang Kita' },
                ] as const"
                :key="fieldKey"
              >
                <div class="space-y-2">
                  <label
                    class="block text-xs font-medium text-gray-700 dark:text-gray-300 tracking-wider"
                  >
                    {{ label }}
                    <span v-if="!profileId" class="text-red-500">*</span>
                  </label>
                  <div
                    class="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all duration-200 group bg-gray-50 dark:bg-gray-900/50"
                    :class="[
                      form[fieldKey].preview
                        ? 'border-primary-400'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-400',
                    ]"
                  >
                    <input
                      :id="`hero-${fieldKey}`"
                      type="file"
                      accept="image/*"
                      class="absolute inset-0 opacity-0 cursor-pointer z-10"
                      @change="handleImageChange(form[fieldKey], $event)"
                    />
                    <div
                      v-if="!form[fieldKey].preview"
                      class="h-full flex flex-col items-center justify-center p-4 text-center"
                    >
                      <Upload class="text-gray-300 mb-1" :size="28" />
                      <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Pilih Gambar
                      </span>
                    </div>
                    <template v-else>
                      <img :src="form[fieldKey].preview!" class="w-full h-full object-cover" />
                      <div
                        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <Camera class="text-white" :size="22" />
                      </div>
                    </template>
                  </div>
                  <button
                    v-if="form[fieldKey].file"
                    type="button"
                    class="text-[10px] text-red-500 hover:underline"
                    @click="clearImage(form[fieldKey], `hero-${fieldKey}`)"
                  >
                    Hapus pilihan
                  </button>
                </div>
              </template>
            </div>
          </section>
        </div>

        <!-- Right Sidebar -->
        <div class="space-y-6">
          <!-- Foto Pendiri -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Foto Pendiri <span v-if="!profileId" class="text-red-500">*</span>
            </h3>
            <div
              class="relative aspect-square w-40 mx-auto rounded-2xl overflow-hidden border-2 border-dashed transition-all duration-200 group bg-gray-50 dark:bg-gray-900/50"
              :class="[
                form.founderPicture.preview
                  ? 'border-primary-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-400',
              ]"
            >
              <input
                id="founder-picture-upload"
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer z-10"
                @change="handleImageChange(form.founderPicture, $event)"
              />
              <div
                v-if="!form.founderPicture.preview"
                class="h-full flex flex-col items-center justify-center p-4 text-center"
              >
                <Camera class="text-gray-300 mb-1" :size="28" />
                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Pilih Foto Pendiri
                </span>
              </div>
              <template v-else>
                <img :src="form.founderPicture.preview" class="w-full h-full object-cover" />
                <div
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera class="text-white" :size="22" />
                </div>
              </template>
            </div>
            <button
              v-if="form.founderPicture.file"
              type="button"
              class="block mx-auto text-[10px] text-red-500 hover:underline"
              @click="clearImage(form.founderPicture, 'founder-picture-upload')"
            >
              Hapus pilihan
            </button>
          </div>

          <!-- Logo -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Logo <span v-if="!profileId" class="text-red-500">*</span>
            </h3>
            <div
              class="relative aspect-square w-40 mx-auto rounded-2xl overflow-hidden border-2 border-dashed transition-all duration-200 group bg-gray-50 dark:bg-gray-900/50"
              :class="[
                form.logo.preview
                  ? 'border-primary-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-400',
              ]"
            >
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer z-10"
                @change="handleImageChange(form.logo, $event)"
              />
              <div
                v-if="!form.logo.preview"
                class="h-full flex flex-col items-center justify-center p-4 text-center"
              >
                <Camera class="text-gray-300 mb-1" :size="28" />
                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Pilih Logo
                </span>
              </div>
              <template v-else>
                <img :src="form.logo.preview" class="w-full h-full object-contain p-2" />
                <div
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera class="text-white" :size="22" />
                </div>
              </template>
            </div>
            <button
              v-if="form.logo.file"
              type="button"
              class="block mx-auto text-[10px] text-red-500 hover:underline"
              @click="clearImage(form.logo, 'logo-upload')"
            >
              Hapus pilihan
            </button>
          </div>

          <!-- Icon -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Ikon <span v-if="!profileId" class="text-red-500">*</span>
            </h3>
            <div
              class="relative aspect-square w-28 mx-auto rounded-2xl overflow-hidden border-2 border-dashed transition-all duration-200 group bg-gray-50 dark:bg-gray-900/50"
              :class="[
                form.icon.preview
                  ? 'border-primary-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-400',
              ]"
            >
              <input
                id="icon-upload"
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer z-10"
                @change="handleImageChange(form.icon, $event)"
              />
              <div
                v-if="!form.icon.preview"
                class="h-full flex flex-col items-center justify-center p-3 text-center"
              >
                <Camera class="text-gray-300 mb-1" :size="22" />
                <span class="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                  Pilih Ikon
                </span>
              </div>
              <template v-else>
                <img :src="form.icon.preview" class="w-full h-full object-contain p-2" />
                <div
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera class="text-white" :size="18" />
                </div>
              </template>
            </div>
            <button
              v-if="form.icon.file"
              type="button"
              class="block mx-auto text-[10px] text-red-500 hover:underline"
              @click="clearImage(form.icon, 'icon-upload')"
            >
              Hapus pilihan
            </button>
          </div>

          <!-- Organization Structure -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Struktur Organisasi <span v-if="!profileId" class="text-red-500">*</span>
            </h3>
            <div
              class="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all duration-200 group bg-gray-50 dark:bg-gray-900/50"
              :class="[
                form.organizationStructure.preview
                  ? 'border-primary-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-400',
              ]"
            >
              <input
                id="org-structure-upload"
                type="file"
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer z-10"
                @change="handleImageChange(form.organizationStructure, $event)"
              />
              <div
                v-if="!form.organizationStructure.preview"
                class="h-full flex flex-col items-center justify-center p-4 text-center"
              >
                <Upload class="text-gray-300 mb-1" :size="26" />
                <span class="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Pilih Gambar
                </span>
              </div>
              <template v-else>
                <img :src="form.organizationStructure.preview" class="w-full h-full object-cover" />
                <div
                  class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <Camera class="text-white" :size="22" />
                </div>
              </template>
            </div>
            <button
              v-if="form.organizationStructure.file"
              type="button"
              class="block mx-auto text-[10px] text-red-500 hover:underline"
              @click="clearImage(form.organizationStructure, 'org-structure-upload')"
            >
              Hapus pilihan
            </button>
          </div>

          <!-- Save Button -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
          >
            <BaseButton type="submit" variant="primary" :loading="isSubmitting" class="w-full">
              <Save class="mr-2" :size="18" />
              {{ profileId ? 'Simpan Perubahan' : 'Buat Profil' }}
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
