<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { ArrowLeft, Upload, X } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const programId = route.params.id as string
const program = route.query.program ? JSON.parse(route.query.program as string) : null

// FORM
const name = ref('')
const description = ref('')
const minPayment = ref('')
const billingDate = ref('')
const mediaFiles = ref<File[]>([])
const previews = ref<string[]>([])

// STATUS (tetap pending & disabled)
const status = ref('pending')

// ERROR
const errors = ref<Record<string, string>>({})

// LOADING
const isFetching = ref(false)
const isLoading = ref(false)

// PREFILL DATA 🔥
onMounted(() => {
  if (program) {
    // Load data dari program yang dikirim
    name.value = program.name || ''
    description.value = program.description || ''
    minPayment.value = program.min_payment || ''
    billingDate.value = program.billing_date || ''
    status.value = program.status || 'pending'
  } else {
    // 🎭 dummy data jika tidak ada data dari route
    name.value = 'Program Beasiswa Anak Negeri'
    description.value = 'Program bantuan pendidikan untuk anak kurang mampu'
    minPayment.value = '50000'
    billingDate.value = '2026-04-10'
  }

  previews.value = program?.media || []
})

// FILE HANDLER
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  for (const file of Array.from(files)) {
    mediaFiles.value.push(file)
    previews.value.push(URL.createObjectURL(file))
  }
}

const removeFile = (index: number) => {
  mediaFiles.value.splice(index, 1)
  previews.value.splice(index, 1)
}

// VALIDASI
const validate = () => {
  const newErrors: Record<string, string> = {}

  if (!name.value.trim()) newErrors.name = 'Nama program wajib diisi'
  if (!description.value.trim()) newErrors.description = 'Detail program wajib diisi'
  if (!minPayment.value) newErrors.minPayment = 'Nominal wajib diisi'
  if (!billingDate.value) newErrors.billingDate = 'Tanggal wajib diisi'

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

// SUBMIT 🔥
const handleSubmit = async () => {
  if (!validate()) return

  console.log('UPDATE PROGRAM (DUMMY)', {
    id: programId,
    name: name.value,
    description: description.value,
    min_payment: Number(minPayment.value),
    billing_date: billingDate.value,
    media: mediaFiles.value,
    status: status.value,
  })

  // simulasi loading
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    router.push({ name: 'dashboard-social-program' })
  }, 800)
}

// CANCEL
const handleCancel = () => {
  router.push({ name: 'dashboard-social-program' })
}
</script>

<template>
  <DashboardLayout>
    <!-- HEADER -->
    <template #title>
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <ArrowLeft class="cursor-pointer" @click="handleCancel" />
        Data Program > Edit Program
      </div>
    </template>

    <!-- LOADING -->
    <div v-if="isFetching" class="p-6 bg-white rounded-xl">
      Loading...
    </div>

      <div v-else class="mt-6 bg-gray-50 p-5 rounded-2xl space-y-5">

        <!-- HEADER CARD -->
        <div class="bg-white rounded-xl border border-gray-200 px-6 py-4">
          <h2 class="text-lg font-semibold text-gray-800">
            Edit Program Sosial
          </h2>
        </div>

        <!-- FORM CARD -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-6">

          <!-- GRID -->
          <div class="grid grid-cols-2 gap-6">

          <!-- LEFT -->
          <div class="space-y-4">
            <div>
              <label class="text-xs text-gray-600">
                Nama Program <span class="text-red-500">*</span>
              </label>

              <BaseInput v-model="name" />

              <p v-if="errors.name" class="text-xs text-red-500 mt-1">
                {{ errors.name }}
              </p>
            </div>

            <div>
              <label class="text-xs text-gray-600">
                Detail Program <span class="text-red-500">*</span>
              </label>

              <textarea
                v-model="description"
                rows="4"
                class="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300"
              />

              <p v-if="errors.description" class="text-xs text-red-500 mt-1">
                {{ errors.description }}
              </p>
            </div>
          </div>

          <!-- RIGHT -->
          <div class="space-y-4">
            <div>
              <label class="text-xs text-gray-600">
                Nominal Minimal Pembayaran <span class="text-red-500">*</span>
              </label>

              <BaseInput />

              <p v-if="errors.minPayment" class="text-xs text-red-500 mt-1">
                {{ errors.minPayment }}
              </p>
            </div>

            <div>
              <label class="text-xs text-gray-600">
                Ditagihkan Setiap <span class="text-red-500">*</span>
              </label>

              <input
                type="date"
                v-model="billingDate"
                class="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300"
              />

              <p v-if="errors.billingDate" class="text-xs text-red-500 mt-1">
                {{ errors.billingDate }}
              </p>
            </div>

            <!-- STATUS -->
            <div>
                          <label class="text-xs text-gray-600">Status Program</label>
                          <div class="flex gap-6 mt-2 text-sm">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="active" v-model="status" />
                <span :class="status === 'active' ? 'text-green-600 font-medium' : 'text-gray-500'">
                  Berjalan
                </span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="pending" v-model="status" />
                <span :class="status === 'pending' ? 'text-yellow-600 font-medium' : 'text-gray-500'">
                  Pending
                </span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="completed" v-model="status" />
                <span :class="status === 'completed' ? 'text-red-600 font-medium' : 'text-gray-500'">
                  Selesai
                </span>
              </label>
            </div>
            </div>
          </div>
        </div>

        <!-- UPLOAD -->
        <div>
          <label class="text-xs text-gray-600">
            Unggah Foto & Video <span class="text-red-500">*</span>
          </label>

          <div
            @click="triggerFileInput"
            class="mt-2 border-2 border-dashed rounded-lg h-32 flex items-center justify-center cursor-pointer text-gray-400"
          >
            <Upload />
          </div>

          <input ref="fileInputRef" type="file" multiple class="hidden" @change="handleFileChange" />

          <div class="mt-3 space-y-2">
            <div
              v-for="(preview, index) in previews"
              :key="index"
              class="flex justify-between bg-gray-50 px-3 py-2 rounded-lg"
            >
              <span class="text-sm">{{ preview }}</span>
              <button @click="removeFile(index)">
                <X :size="16" class="text-red-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- BUTTON -->
        <div class="flex justify-end gap-3">
          <BaseButton variant="danger" @click="handleCancel">
            Batal
          </BaseButton>

          <BaseButton variant="primary" @click="handleSubmit" :loading="isLoading">
            Simpan Perubahan
          </BaseButton>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>
