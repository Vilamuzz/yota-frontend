<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Camera, Layout, Info, CreditCard, ArrowLeft, Loader2 } from 'lucide-vue-next'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useSocialProgramUpdate } from '@/composables/socialProgram/useSocialProgramUpdate'
import { useSocialProgramDetail } from '@/composables/socialProgram/useSocialProgramDetail'
import { updateSocialProgramSchema } from '@/schemas/socialProgram.schema'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()

const programId = route.params.id as string
const { detailQuery } = useSocialProgramDetail(programId)
const { updateMutation, validationErrors } = useSocialProgramUpdate()

const errors = ref<Record<string, string>>({})
const form = reactive({
  title: '',
  description: '',
  minimumAmount: '',
  billingDay: '',
  status: 'pending',
  coverImageFile: null as File | null,
  coverImagePreview: null as string | null,
})

const isFetching = computed(() => detailQuery.isPending.value)
const isLoading = computed(() => updateMutation.isPending.value)

// Hydrate form data
watch(
  () => detailQuery.data.value,
  (response) => {
    if (response?.data) {
      const program = response.data
      form.title = program.title
      form.description = program.description
      form.minimumAmount = String(program.minimumAmount)
      form.billingDay = String(program.billingDay)
      form.status = program.status
      form.coverImagePreview = program.coverImage
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

const handleCoverImageChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    form.coverImageFile = file
    form.coverImagePreview = URL.createObjectURL(file)
  }
}

const handleSubmit = () => {
  const result = updateSocialProgramSchema.safeParse({
    ...form,
    minimumAmount: form.minimumAmount === '' ? undefined : form.minimumAmount,
    billingDay: form.billingDay === '' ? undefined : form.billingDay,
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors

  if (!result.success) {
    showToast('Mohon lengkapi semua field yang wajib diisi', 'error')
    return
  }

  updateMutation.mutate(
    {
      id: programId,
      data: {
        ...result.data,
        coverImage: form.coverImageFile || undefined,
      },
    },
    {
      onSuccess: () => {
        showToast('Program sosial berhasil diperbarui!', 'success')
        router.push({ name: 'dashboard-social-programs' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal memperbarui program sosial'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Edit Program Sosial</template>

    <div v-if="isFetching" class="flex flex-col items-center justify-center py-24">
      <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
      <p class="text-gray-500 font-medium tracking-widest uppercase text-xs">Memuat data program...</p>
    </div>

    <div v-else class="max-w-full mx-auto space-y-6">
      <!-- Header Actions -->
      <div class="flex items-center justify-between">
        <BaseButton
          variant="outline"
          size="md"
          @click="router.push({ name: 'dashboard-social-programs' })"
          class="rounded-xl"
        >
          <ArrowLeft :size="18" class="mr-2" />
          KEMBALI
        </BaseButton>
      </div>

      <form @submit.prevent="handleSubmit" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Primary Information -->
        <div class="lg:col-span-2 space-y-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-500">
                <Layout :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Informasi Program
              </h3>
            </div>

            <BaseInput
              id="title"
              v-model="form.title"
              label="Judul Program"
              placeholder="Masukkan judul program sosial"
              :error="errors.title || validationErrors?.title"
              required
            />

            <div class="space-y-1.5">
              <label
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider"
              >
                Deskripsi Program <span class="text-red-500">*</span>
              </label>
              <textarea
                v-model="form.description"
                rows="6"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-[#121212] focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                :class="{ 'border-red-500': errors.description || validationErrors?.description }"
                placeholder="Jelaskan detail mengenai program sosial ini..."
              ></textarea>
              <p
                v-if="errors.description || validationErrors?.description"
                class="mt-1 text-xs text-red-600"
              >
                {{ errors.description || validationErrors?.description }}
              </p>
            </div>
          </div>

          <!-- Configuration Section -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6"
          >
            <div class="flex items-center gap-3 pb-4 border-b border-gray-50 dark:border-gray-700">
              <div class="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500">
                <CreditCard :size="20" />
              </div>
              <h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Konfigurasi Pembayaran
              </h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseInput
                id="minimumAmount"
                v-model="form.minimumAmount"
                type="number"
                label="Minimal Nominal (Rp)"
                placeholder="mis. 50000"
                :error="errors.minimumAmount || validationErrors?.minimumAmount"
                required
              />

              <BaseInput
                id="billingDay"
                v-model="form.billingDay"
                type="number"
                label="Hari Penagihan (1-31)"
                placeholder="mis. 5"
                min="1"
                max="31"
                :error="errors.billingDay || validationErrors?.billingDay"
                required
              />
            </div>

            <div
              class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex gap-3"
            >
              <Info :size="20" class="text-blue-500 shrink-0" />
              <p class="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Hari penagihan adalah tanggal dimana sistem akan secara otomatis mengirimkan
                notifikasi atau melakukan penagihan iuran kepada donatur setiap bulannya.
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column: Media & Actions -->
        <div class="space-y-6">
          <!-- Cover Image -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3
              class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider text-center"
            >
              Foto Sampul Program
            </h3>

            <div class="flex justify-center">
              <div
                class="relative w-full aspect-video rounded-xl border-4 border-dashed overflow-hidden transition-all duration-200 group bg-gray-50 dark:bg-gray-900/50"
                :class="[
                  form.coverImagePreview
                    ? 'border-primary-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400',
                ]"
              >
                <input
                  type="file"
                  accept="image/*"
                  class="absolute inset-0 opacity-0 cursor-pointer z-10"
                  @change="handleCoverImageChange"
                />

                <div
                  v-if="!form.coverImagePreview"
                  class="h-full flex flex-col items-center justify-center p-4 text-center"
                >
                  <Camera class="text-gray-300 mb-2" :size="32" />
                  <p class="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Pilih Foto Sampul</p>
                  <p class="text-[8px] text-gray-400 mt-1">Rekomendasi 16:9 (1280x720px)</p>
                </div>

                <template v-else>
                  <img :src="form.coverImagePreview" class="w-full h-full object-cover" />
                  <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Camera class="text-white" :size="24" />
                  </div>
                </template>
              </div>
            </div>
            <p v-if="errors.coverImage" class="text-center text-[10px] text-red-600">
              {{ errors.coverImage }}
            </p>
          </div>

          <!-- Status Selection -->
          <div
            class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-4"
          >
            <h3 class="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Status Program
            </h3>

            <div class="space-y-3">
              <label
                v-for="s in [
                  { value: 'active', label: 'Berjalan', desc: 'Program aktif dan dapat diikuti' },
                  { value: 'pending', label: 'Pending', desc: 'Program dalam masa persiapan' },
                  { value: 'completed', label: 'Selesai', desc: 'Program telah berakhir' },
                ]"
                :key="s.value"
                class="relative flex items-start p-3 cursor-pointer rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                :class="{ 'border-primary-500 bg-primary-50/10 shadow-sm shadow-primary-500/5': form.status === s.value }"
              >
                <input
                  type="radio"
                  name="status"
                  :value="s.value"
                  v-model="form.status"
                  class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div class="ml-3">
                  <span class="block text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest">{{
                    s.label
                  }}</span>
                  <span class="block text-[10px] text-gray-500 mt-0.5">{{ s.desc }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col gap-3">
            <BaseButton
              type="submit"
              variant="primary"
              :loading="isLoading"
              class="w-full py-4 rounded-xl font-bold tracking-[0.2em] shadow-lg shadow-primary-500/20"
            >
              PERBARUI PROGRAM
            </BaseButton>
            <BaseButton
              type="button"
              variant="outline"
              @click="router.push({ name: 'dashboard-social-programs' })"
              :disabled="isLoading"
              class="w-full rounded-xl uppercase tracking-widest text-xs"
            >
              Batal
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
