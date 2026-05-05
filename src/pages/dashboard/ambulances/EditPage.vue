<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useAmbulanceDetail } from '@/composables/ambulance/useAmbulanceDetail'
import { useAmbulanceUpdate } from '@/composables/ambulance/useAmbulanceUpdate'
import { ambulanceSchema } from '@/schemas/ambulance.schema'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import { Ambulance as AmbulanceIcon, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const { showToast } = useToast()

const ambulanceId = route.params.id as string
const { detailQuery } = useAmbulanceDetail(ambulanceId)
const { updateMutation } = useAmbulanceUpdate()

const plateNumber = ref<string>('')
const model = ref<string>('')
const status = ref<string>('available')
const errors = ref<Record<string, string>>({})

const isFetching = computed(() => detailQuery.isPending.value)
const isLoading = computed(() => updateMutation.isPending.value)

const statuses = [
  { label: 'Tersedia', value: 'available' },
  { label: 'Sedang Digunakan', value: 'in_use' },
  { label: 'Pemeliharaan', value: 'maintenance' },
]

watch(
  () => detailQuery.data.value,
  (response) => {
    if (!response?.data) return
    const data = response.data
    plateNumber.value = data.plateNumber
    model.value = data.model
    status.value = data.status
  },
  { immediate: true },
)

const handleSubmit = () => {
  const result = ambulanceSchema.safeParse({
    plateNumber: plateNumber.value.trim(),
    model: model.value.trim(),
    status: status.value,
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors
  if (!result.success) return

  updateMutation.mutate(
    {
      id: ambulanceId,
      data: result.data,
    },
    {
      onSuccess: () => {
        showToast('Ambulans berhasil diperbarui!', 'success')
        router.push({ name: 'dashboard-ambulances' })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal memperbarui ambulans'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Edit Ambulans</template>

    <div class="max-w-4xl mx-auto">
      <div
        v-if="isFetching"
        class="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
      >
        <Loader2 class="w-10 h-10 text-primary-500 animate-spin mb-4" />
        <p class="text-gray-500 dark:text-gray-400 font-medium">Memuat data ambulans...</p>
      </div>

      <div
        v-else
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div
          class="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
        >
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-primary-500">
              <AmbulanceIcon :size="24" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white">Perbarui Data Armada</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Ubah informasi kendaraan ambulans di bawah ini.
              </p>
            </div>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BaseInput
              id="plateNumber"
              v-model="plateNumber"
              label="Nomor Plat"
              placeholder="mis. B 1234 XYZ"
              :error="errors.plateNumber"
              required
            />

            <BaseInput
              id="model"
              v-model="model"
              label="Model Kendaraan"
              placeholder="mis. Toyota Hiace"
              :error="errors.model"
              required
            />

            <div class="md:col-span-2">
              <label
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1.5 uppercase tracking-wider"
              >
                Status Kendaraan
              </label>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label
                  v-for="s in statuses"
                  :key="s.value"
                  class="relative flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200"
                  :class="[
                    status === s.value
                      ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 ring-1 ring-primary-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800',
                  ]"
                >
                  <input
                    type="radio"
                    name="status"
                    :value="s.value"
                    v-model="status"
                    class="sr-only"
                  />
                  <div class="flex items-center gap-3">
                    <div
                      class="w-4 h-4 rounded-full border flex items-center justify-center"
                      :class="[
                        status === s.value
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300 dark:border-gray-600',
                      ]"
                    >
                      <div
                        v-if="status === s.value"
                        class="w-1.5 h-1.5 rounded-full bg-white"
                      ></div>
                    </div>
                    <span
                      class="text-sm font-medium"
                      :class="[
                        status === s.value
                          ? 'text-primary-700 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300',
                      ]"
                    >
                      {{ s.label }}
                    </span>
                  </div>
                </label>
              </div>
              <p v-if="errors.status" class="mt-1 text-xs text-red-600">
                {{ errors.status }}
              </p>
            </div>
          </div>

          <div
            class="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-100 dark:border-yellow-900/30 flex gap-3"
          >
            <div class="text-yellow-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <p class="text-xs text-yellow-800 dark:text-yellow-300 leading-relaxed">
              Perubahan status akan langsung terlihat pada sistem pemesanan ambulans publik.
              Pastikan data yang Anda masukkan sudah valid.
            </p>
          </div>

          <!-- Action Buttons -->
          <div
            class="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <BaseButton
              type="button"
              variant="outline"
              :to="{ name: 'dashboard-ambulances' }"
              :disabled="isLoading"
            >
              Batal
            </BaseButton>
            <BaseButton type="submit" variant="primary" :loading="isLoading">
              <template #loading>Menyimpan…</template>
              Perbarui Ambulans
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>
