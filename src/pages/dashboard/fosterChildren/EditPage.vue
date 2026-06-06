<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Upload,
  X,
  Plus,
  Camera,
  GraduationCap,
  FileText,
  User,
  FileCheck,
  Loader2,
} from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useFosterChildrenUpdate } from '@/composables/fosterChildren/useFosterChildrenUpdate'
import { useFosterChildrenDetail } from '@/composables/fosterChildren/useFosterChildrenDetail'
import { updateFosterChildrenSchema } from '@/schemas/fosterChildren.schema'
import { Category, Gender, type Achievement } from '@/types/fosterChildren'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'

const route = useRoute()
const router = useRouter()
const fosterChildId = route.params.id as string

const { updateMutation, validationErrors } = useFosterChildrenUpdate()
const { detailQuery } = useFosterChildrenDetail(fosterChildId)
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
  gender: '' as Gender | '',
  category: '' as Category | '',
  birthPlace: '',
  birthDate: '',
  address: '',
  schoolName: '',
  educationLevel: undefined as number | undefined,
  isGraduated: false,
  achievementInput: '',
  achievementFile: null as File | null,
  achievements: [] as { title: string; file: File }[],
  existingAchievements: [] as Achievement[],
  profilePictureFile: null as File | null,
  profilePicturePreview: null as string | null,
  familyCardFile: null as File | null,
  familyCardPreview: null as string | null,
  sktmFile: null as File | null,
  sktmPreview: null as string | null,
})

const isFetching = computed(() => detailQuery.isPending.value)
const isLoading = computed(() => updateMutation.isPending.value)

// Hydrate form data
watch(
  () => detailQuery.data.value,
  (response) => {
    if (response?.data) {
      const child = response.data
      form.name = child.name
      form.gender = child.gender
      form.category = child.category
      form.birthPlace = child.birthPlace || ''
      form.birthDate = child.birthDate
      form.address = child.address || ''
      form.schoolName = child.schoolName || ''
      form.educationLevel = child.educationLevel || undefined
      form.isGraduated = child.isGraduated
      form.profilePicturePreview = child.profilePicture
      form.familyCardPreview = child.familyCard || null
      form.sktmPreview = child.sktm || null
      form.existingAchievements = child.achievements || []
    }
  },
  { immediate: true },
)

watch(
  () => form,
  () => {
    if (Object.keys(errors.value).length > 0) {
      errors.value = {}
    }
    if (updateMutation.isError.value) {
      updateMutation.reset()
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

const removeNewAchievement = (index: number) => {
  form.achievements.splice(index, 1)
}

const formatCategory = (cat: string) => {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

const handleSubmit = () => {
  const result = updateFosterChildrenSchema.safeParse({
    ...form,
    educationLevel: form.educationLevel !== undefined ? Number(form.educationLevel) : undefined,
    profilePicture: form.profilePictureFile || undefined,
    familyCard: form.familyCardFile || undefined,
    sktm: form.sktmFile || undefined,
    achievements: form.achievements.map((a) => a.file),
    achivementNotes: form.achievements.map((a) => a.title),
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors

  if (!result.success) {
    showToast('Mohon lengkapi semua field yang wajib diisi', 'error')
    return
  }

  updateMutation.mutate(
    {
      id: fosterChildId,
      data: result.data,
    },
    {
      onSuccess: () => {
        showToast('Data anak asuh berhasil diperbarui!', 'success')
        router.push({ name: 'dashboard-foster-children' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal memperbarui data anak asuh'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Edit Anak Asuh</template>

    <div v-if="isFetching" class="flex flex-col items-center justify-center py-24">
      <Loader2 class="w-12 h-12 text-primary-300 animate-spin mb-4" />
      <p class="text-gray-500 font-medium">Memuat data anak asuh...</p>
    </div>

    <div v-else class="max-w-full mx-auto space-y-6">
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
                  class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 uppercase tracking-wider"
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
                  class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 uppercase tracking-wider"
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
                  class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 uppercase tracking-wider"
                >
                  Tingkat Pendidikan <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="form.educationLevel"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500"
                  :class="{
                    'border-red-500': errors.educationLevel || validationErrors?.educationLevel,
                  }"
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
                  placeholder="Nama prestasi baru..."
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
                  Tambah Prestasi Baru
                </BaseButton>
              </div>

              <div class="space-y-2 max-h-75 overflow-y-auto pr-2">
                <!-- Existing Achievements -->
                <div v-if="form.existingAchievements.length > 0" class="space-y-2">
                  <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
                    Prestasi Saat Ini
                  </p>
                  <div
                    v-for="item in form.existingAchievements"
                    :key="item.id"
                    class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <FileCheck :size="16" class="text-primary-500 shrink-0" />
                      <div class="truncate">
                        <p class="text-xs font-bold text-gray-900 dark:text-white">
                          {{ item.title }}
                        </p>
                      </div>
                    </div>
                    <a
                      :href="item.url"
                      target="_blank"
                      class="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      <FileText :size="14" />
                    </a>
                  </div>
                </div>

                <!-- New Achievements -->
                <div v-if="form.achievements.length > 0" class="space-y-2 mt-4">
                  <p class="text-[10px] font-bold text-primary-500 uppercase tracking-widest px-1">
                    Tambahan Baru
                  </p>
                  <div
                    v-for="(item, index) in form.achievements"
                    :key="index"
                    class="flex items-center justify-between p-3 bg-primary-50/10 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900 shadow-sm group"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <Plus :size="16" class="text-green-500 shrink-0" />
                      <div class="truncate">
                        <p class="text-xs font-bold text-gray-900 dark:text-white">
                          {{ item.title }}
                        </p>
                        <p class="text-[10px] text-gray-500 truncate">{{ item.file.name }}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      @click="removeNewAchievement(index)"
                      class="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X :size="14" />
                    </button>
                  </div>
                </div>

                <div
                  v-if="form.existingAchievements.length === 0 && form.achievements.length === 0"
                  class="h-full border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 text-center p-4"
                >
                  <p class="text-[10px]">Belum ada prestasi yang ditambahkan</p>
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
                <div class="flex items-center justify-between">
                  <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest"
                    >Kartu Keluarga (KK)</label
                  >
                  <a
                    v-if="form.familyCardPreview && !form.familyCardFile"
                    :href="form.familyCardPreview"
                    target="_blank"
                    class="text-[10px] text-primary-300 hover:underline"
                    >Lihat Saat Ini</a
                  >
                </div>
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
                        :class="form.familyCardFile ? 'text-primary-300' : 'text-gray-400'"
                      />
                      <span class="text-xs text-gray-600 dark:text-gray-400 truncate">{{
                        form.familyCardFile ? form.familyCardFile.name : 'Ganti File KK'
                      }}</span>
                    </div>
                    <Upload v-if="!form.familyCardFile" :size="14" class="text-gray-400" />
                  </div>
                </div>
              </div>

              <!-- SKTM Upload -->
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-[10px] font-bold text-gray-500 uppercase tracking-widest"
                    >SKTM</label
                  >
                  <a
                    v-if="form.sktmPreview && !form.sktmFile"
                    :href="form.sktmPreview"
                    target="_blank"
                    class="text-[10px] text-primary-300 hover:underline"
                    >Lihat Saat Ini</a
                  >
                </div>
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
                        ? 'border-primary-300 bg-primary-50/10'
                        : 'border-gray-200 dark:border-gray-700'
                    "
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <FileText
                        :size="18"
                        :class="form.sktmFile ? 'text-primary-500' : 'text-gray-400'"
                      />
                      <span class="text-xs text-gray-600 dark:text-gray-400 truncate">{{
                        form.sktmFile ? form.sktmFile.name : 'Ganti File SKTM'
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
                Simpan Pembaruan
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
