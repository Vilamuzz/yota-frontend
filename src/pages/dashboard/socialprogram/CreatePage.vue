<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { ArrowLeft, Upload, X } from 'lucide-vue-next'

const router = useRouter()

// FORM STATE
const name = ref('')
const description = ref('')
const minPayment = ref('')
const billingDate = ref('')
const mediaFiles = ref<File[]>([])
const previews = ref<string[]>([])

// STATUS (LOCKED)
const status = ref('pending')

// ERROR
const errors = ref<Record<string, string>>({})

// IMAGE / VIDEO HANDLER
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

//VALIDASI
const validate = () => {
  const newErrors: Record<string, string> = {}

  if (!name.value.trim()) newErrors.name = 'Nama program wajib diisi'
  if (!description.value.trim()) newErrors.description = 'Detail program wajib diisi'
  if (!minPayment.value) newErrors.minPayment = 'Nominal wajib diisi'
  if (!billingDate.value) newErrors.billingDate = 'Tanggal wajib diisi'
  if (mediaFiles.value.length === 0) newErrors.media = 'Minimal upload 1 file'

  errors.value = newErrors

  return Object.keys(newErrors).length === 0
}

// SUBMIT
const handleSubmit = () => {
  if (!validate()) return

  console.log({
    name: name.value,
    description: description.value,
    min_payment: minPayment.value,
    billing_date: billingDate.value,
    media: mediaFiles.value,
    status: status.value
  })
  //NANTI SAMBUNG KE API
}

// CANCEL
const handleCancel = () => {
  router.push({ name: 'dashboard-socialprogram' })
}
</script>

<template>
  <DashboardLayout>
    <!-- HEADER -->
    <template #title>
      <div class="flex items-center gap-2 text-sm text-gray-500">
        <ArrowLeft class="cursor-pointer" @click="handleCancel" />
        Data Program > Tambah Program
      </div>
    </template>

    <!-- CONTAINER -->
    <div class="mt-6 bg-gray-50 p-5 rounded-2xl">
      <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-6">

        <h2 class="font-semibold text-gray-700">Data Program Sosial</h2>

        <!-- GRID -->
        <div class="grid grid-cols-2 gap-6">

          <!-- LEFT -->
            <div class="space-y-4">
            <div>
                <label class="text-xs text-gray-600">
                Nama Program <span class="text-red-500">*</span>
                </label>

                <BaseInput
                v-model="name"
                placeholder="Masukkan nama program"
                />

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
                class="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500"
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

            <BaseInput
                v-model="minPayment"
                placeholder="Rp500.000"
            />

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
                class="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                />
                <p v-if="errors.billingDate" class="text-xs text-red-500 mt-1">
                    {{ errors.billingDate }}
                </p>
                </div>

            <!-- STATUS (DISABLED) -->
            <div>
              <label class="text-xs text-gray-600">Status Program</label>
              <div class="flex gap-4 mt-2 text-sm text-gray-400">
                <label class="flex items-center gap-2">
                  <input type="radio" disabled /> Berjalan
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" disabled checked /> Pending
                </label>
                <label class="flex items-center gap-2">
                  <input type="radio" disabled /> Selesai
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
            <p v-if="errors.media" class="text-xs text-red-500 mt-1">
            {{ errors.media }}
            </p>
          <div
            @click="triggerFileInput"
            class="mt-2 border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer text-gray-400"
          >
            <Upload :size="24" />
            <p class="text-sm mt-1">Drop your files or click to upload</p>
          </div>

          <input
            ref="fileInputRef"
            type="file"
            multiple
            class="hidden"
            @change="handleFileChange"
          />

          <!-- PREVIEW -->
          <div class="mt-3 space-y-2">
            <div
              v-for="(file, index) in mediaFiles"
              :key="index"
              class="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
            >
              <span class="text-sm text-gray-600">{{ file.name }}</span>
              <button @click="removeFile(index)">
                <X size="16" class="text-red-500" />
              </button>
            </div>
          </div>
        </div>

        <!-- BUTTON -->
        <div class="flex justify-end gap-3">
          <BaseButton variant="danger" @click="handleCancel">
            Batal
          </BaseButton>

          <BaseButton variant="primary" @click="handleSubmit">
            Ajukan
          </BaseButton>
        </div>

      </div>
    </div>
  </DashboardLayout>
</template>