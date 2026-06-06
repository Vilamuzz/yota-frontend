<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Upload, X, Plus, Camera, GraduationCap, FileText, User, FileCheck } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useFosterChildrenCreate } from '@/composables/fosterChildren/useFosterChildrenCreate'
import { createFosterChildrenSchema } from '@/schemas/fosterChildren.schema'
import { Category, Gender } from '@/types/fosterChildren'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'

const router = useRouter()
const { createMutation, validationErrors } = useFosterChildrenCreate()
const { showToast } = useToast()

const genders = Object.values(Gender)
const categories = Object.values(Category)
const educationLevels = [
  { label: 'Kelas 1', value: 1 },
  { label: 'Kelas 2', value: 2 },
  { label: 'Kelas 3', value: 3 },
  { label: 'Kelas 4', value: 4 },
  { label: 'Kelas 5', value: 5 },
  { label: 'Kelas 6', value: 6 },
  { label: 'Kelas 7', value: 7 },
  { label: 'Kelas 8', value: 8 },
  { label: 'Kelas 9', value: 9 },
  { label: 'Kelas 10', value: 10 },
  { label: 'Kelas 11', value: 11 },
  { label: 'Kelas 12', value: 12 },
]

const errors = ref<Record<string, string>>({})
const form = reactive({
  name: '',
  birthPlace: '',
  birthDate: '',
  address: '',
  gender: '' as Gender | '',
  category: '' as Category | '',
  schoolName: '',
  educationLevel: undefined as number | undefined,
  isGraduated: false,
  achievementInput: '',
  achievementFile: null as File | null,
  achievements: [] as { title: string; file: File }[],
  profilePictureFile: null as File | null,
  profilePicturePreview: null as string | null,
  familyCardFile: null as File | null,
  sktmFile: null as File | null,
})

const isLoading = computed(() => createMutation.isPending.value)

watch(
  () => form,
  () => {
    if (Object.keys(errors.value).length > 0) {
      errors.value = {}
    }
    if (createMutation.isError.value) {
      createMutation.reset()
    }
  },
  { deep: true },
)

const handleProfilePictureChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    form.profilePictureFile = file
    form.profilePicturePreview = URL.createObjectURL(file)
  }
}

const handleFileChange = (event: Event, type: 'familyCard' | 'sktm' | 'achievement') => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (type === 'familyCard') form.familyCardFile = file
    else if (type === 'sktm') form.sktmFile = file
    else form.achievementFile = file
  }
}

const addAchievement = () => {
  if (form.achievementInput.trim() && form.achievementFile) {
    form.achievements.push({
      title: form.achievementInput.trim(),
      file: form.achievementFile,
    })
    form.achievementInput = ''
    form.achievementFile = null
  } else if (!form.achievementFile && form.achievementInput.trim()) {
    showToast('Harap pilih file sertifikat/piagam untuk prestasi ini', 'warning')
  }
}

const removeAchievement = (index: number) => {
  form.achievements.splice(index, 1)
}

const handleSubmit = () => {
  if (!form.familyCardFile || !form.sktmFile) {
    showToast('Kartu Keluarga dan SKTM wajib diunggah', 'error')
    return
  }

  const result = createFosterChildrenSchema.safeParse({
    ...form,
    educationLevel: form.educationLevel !== undefined ? Number(form.educationLevel) : undefined,
    profilePicture: form.profilePictureFile,
    familyCard: form.familyCardFile,
    sktm: form.sktmFile,
    achievements: form.achievements.map((a) => a.file),
    achivementNotes: form.achievements.map((a) => a.title),
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors

  if (!result.success) {
    showToast('Mohon lengkapi semua field yang wajib diisi', 'error')
    return
  }

  createMutation.mutate(result.data, {
    onSuccess: () => {
      showToast('Data anak asuh berhasil ditambahkan!', 'success')
      router.push({ name: 'dashboard-foster-children' })
    },
    onError: (err) => {
      showToast(extractError(err, 'Gagal menambahkan data anak asuh'), 'error')
    },
  })
}

const formatCategory = (cat: string) => {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}
</script>

<template>
  <DashboardLayout>
    <template #title>Tambah Anak Asuh</template>

    <div class="max-w-full mx-auto space-y-6">
      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Primary Information -->
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-300">
                <User :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Identitas Dasar
              </h3>
            </div>

            <BaseInput
              id="name"
              v-model="form.name"
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap anak"
              :error="errors.name || validationErrors?.name"
              required
            />

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 tracking-wider"
                >
                  Jenis Kelamin <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.gender"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500"
                  :class="{ 'border-red-500': errors.gender || validationErrors?.gender }"
                >
                  <option value="" disabled>Pilih Gender</option>
                  <option v-for="g in genders" :key="g" :value="g">
                    {{ formatCategory(g) }}
                  </option>
                </select>
                <p
                  v-if="errors.gender || validationErrors?.gender"
                  class="mt-1 text-xs text-red-600"
                >
                  {{ errors.gender || validationErrors?.gender }}
                </p>
              </div>

              <div>
                <label
                  class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 tracking-wider"
                >
                  Kategori <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.category"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500"
                  :class="{ 'border-red-500': errors.category || validationErrors?.category }"
                >
                  <option value="" disabled>Pilih Kategori</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">
                    {{ formatCategory(cat) }}
                  </option>
                </select>
                <p
                  v-if="errors.category || validationErrors?.category"
                  class="mt-1 text-xs text-red-600"
                >
                  {{ errors.category || validationErrors?.category }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInput
                id="birthPlace"
                v-model="form.birthPlace"
                label="Tempat Lahir"
                placeholder="mis. Sukoharjo"
                :error="errors.birthPlace || validationErrors?.birthPlace"
                required
              />
              <BaseInput
                id="birthDate"
                v-model="form.birthDate"
                type="date"
                label="Tanggal Lahir"
                :error="errors.birthDate || validationErrors?.birthDate"
                required
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInput
                id="schoolName"
                v-model="form.schoolName"
                label="Nama Sekolah"
                placeholder="Masukkan nama sekolah"
                :error="errors.schoolName || validationErrors?.schoolName"
                required
              />
              <div>
                <label
                  class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 tracking-wider"
                >
                  Tingkat Pendidikan <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.educationLevel"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500"
                  :class="{ 'border-red-500': errors.educationLevel || validationErrors?.educationLevel }"
                >
                  <option :value="undefined" disabled>Pilih Tingkat Pendidikan</option>
                  <option v-for="el in educationLevels" :key="el.value" :value="el.value">
                    {{ el.label }}
                  </option>
                </select>
                <p
                  v-if="errors.educationLevel || validationErrors?.educationLevel"
                  class="mt-1 text-xs text-red-600"
                >
                  {{ errors.educationLevel || validationErrors?.educationLevel }}
                </p>
              </div>
            </div>

            <BaseInput
              id="address"
              v-model="form.address"
              label="Alamat Lengkap"
              placeholder="Masukkan alamat domisili saat ini"
              :error="errors.address || validationErrors?.address"
              required
            />
          </div>

          <!-- Achievements Section -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <div class="flex items-center gap-3 pb-2">
              <div class="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600">
                <Plus :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Prestasi & Sertifikat
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-4">
                <input
                  v-model="form.achievementInput"
                  type="text"
                  placeholder="Nama prestasi..."
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500"
                />
                <div class="relative group">
                  <input
                    type="file"
                    class="absolute inset-0 opacity-0 cursor-pointer z-10"
                    @change="handleFileChange($event, 'achievement')"
                  />
                  <div
                    class="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:border-primary-400 transition-colors"
                  >
                    <Upload :size="14" />
                    <span>{{
                      form.achievementFile
                        ? form.achievementFile.name
                        : 'Pilih Sertifikat (PDF/JPG)'
                    }}</span>
                  </div>
                </div>
                <BaseButton
                  type="button"
                  variant="primary"
                  size="md"
                  class="w-full"
                  @click="addAchievement"
                >
                  TAMBAH PRESTASI
                </BaseButton>
              </div>

              <div class="space-y-2 max-h-45 overflow-y-auto pr-2">
                <div v-if="form.achievements.length > 0" class="space-y-2">
                  <div
                    v-for="(item, index) in form.achievements"
                    :key="index"
                    class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 group"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <FileCheck :size="16" class="text-green-500 shrink-0" />
                      <div class="truncate">
                        <p class="text-xs font-bold text-gray-900 dark:text-white">
                          {{ item.title }}
                        </p>
                        <p class="text-[10px] text-gray-500 truncate">{{ item.file.name }}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      @click="removeAchievement(index)"
                      class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X :size="14" />
                    </button>
                  </div>
                </div>
                <div
                  v-else
                  class="h-full border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 text-center p-4"
                >
                  <p class="text-[10px]">Daftar prestasi akan muncul di sini</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Media & Actions -->
        <div class="space-y-6">
          <!-- Profile Picture -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Foto Profil Anak
            </h3>

            <div class="flex justify-center">
              <div
                class="relative w-40 h-40 rounded-full border-4 border-dashed overflow-hidden transition-all duration-200 group bg-gray-50 dark:bg-gray-900/50"
                :class="[
                  form.profilePicturePreview
                    ? 'border-primary-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400',
                ]"
              >
                <input
                  type="file"
                  accept="image/*"
                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                  @change="handleProfilePictureChange"
                />

                <div
                  v-if="!form.profilePicturePreview"
                  class="h-full flex flex-col items-center justify-center p-4 text-center"
                >
                  <Camera class="text-gray-300 mb-2" :size="32" />
                  <p class="text-[10px] font-medium text-gray-500">PILIH FOTO</p>
                </div>

                <template v-else>
                  <img :src="form.profilePicturePreview" class="w-full h-full object-cover" />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Camera class="text-white" :size="24" />
                  </div>
                </template>
              </div>
            </div>
            <p v-if="errors.profilePicture" class="text-center text-[10px] text-red-600">
              {{ errors.profilePicture }}
            </p>
          </div>

          <!-- Documentation Status -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Dokumen Wajib
            </h3>

            <div class="space-y-4">
              <!-- Family Card Upload -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest"
                  >Kartu Keluarga (KK)</label
                >
                <div class="relative group">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="absolute inset-0 opacity-0 cursor-pointer z-10"
                    @change="handleFileChange($event, 'familyCard')"
                  />
                  <div
                    class="flex items-center justify-between p-3 border-2 border-dashed rounded-xl transition-colors"
                    :class="
                      form.familyCardFile
                        ? 'border-primary-500 bg-primary-50/10'
                        : 'border-gray-200 dark:border-gray-700'
                    "
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <FileText
                        :size="18"
                        :class="form.familyCardFile ? 'text-primary-500' : 'text-gray-400'"
                      />
                      <span class="text-xs text-gray-600 dark:text-gray-400 truncate">{{
                        form.familyCardFile ? form.familyCardFile.name : 'Pilih File KK'
                      }}</span>
                    </div>
                    <Upload v-if="!form.familyCardFile" :size="14" class="text-gray-400" />
                  </div>
                </div>
              </div>

              <!-- SKTM Upload -->
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest"
                  >SKTM</label
                >
                <div class="relative group">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    class="absolute inset-0 opacity-0 cursor-pointer z-10"
                    @change="handleFileChange($event, 'sktm')"
                  />
                  <div
                    class="flex items-center justify-between p-3 border-2 border-dashed rounded-xl transition-colors"
                    :class="
                      form.sktmFile
                        ? 'border-primary-500 bg-primary-50/10'
                        : 'border-gray-200 dark:border-gray-700'
                    "
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <FileText
                        :size="18"
                        :class="form.sktmFile ? 'text-primary-500' : 'text-gray-400'"
                      />
                      <span class="text-xs text-gray-600 dark:text-gray-400 truncate">{{
                        form.sktmFile ? form.sktmFile.name : 'Pilih File SKTM'
                      }}</span>
                    </div>
                    <Upload v-if="!form.sktmFile" :size="14" class="text-gray-400" />
                  </div>
                </div>
              </div>

              <!-- Graduation Toggle -->
              <div
                class="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 mt-2"
              >
                <div class="flex items-center gap-2">
                  <GraduationCap :size="18" class="text-primary-300" />
                  <span class="text-xs font-bold text-gray-700 dark:text-gray-300">LULUS</span>
                </div>
                <button
                  type="button"
                  @click="form.isGraduated = !form.isGraduated"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                  :class="form.isGraduated ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="form.isGraduated ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <div class="flex flex-col gap-3">
              <BaseButton type="submit" variant="primary" :loading="isLoading" class="w-full">
                Simpan
              </BaseButton>
              <BaseButton
                type="button"
                variant="danger"
                @click="router.push({ name: 'dashboard-foster-children' })"
                :disabled="isLoading"
                class="w-full"
              >
                Batal
              </BaseButton>
            </div>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
