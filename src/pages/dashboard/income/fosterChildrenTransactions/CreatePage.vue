<script setup lang="ts">
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { ArrowLeft, Baby } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { ref, computed } from 'vue'
import { createFosterChildrenTransactionSchema } from '@/schemas/fosterChildrenTransaction.schema'
import { useFosterChildrenTransactionCreateOffline } from '@/composables/fosterChildrenTransaction/useFosterChildrenTransactionCreateOffline'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'

const router = useRouter()
const route = useRoute()
const { createMutation } = useFosterChildrenTransactionCreateOffline()
const { showToast } = useToast()

const fosterChildrenId = route.params.id as string

const donorName = ref('')
const donorEmail = ref('')
const grossAmount = ref('')

const errors = ref<Record<string, string>>({})

const isLoading = computed(() => createMutation.isPending.value)

const validate = () : boolean => {
  const result = createFosterChildrenTransactionSchema.safeParse({
    donorName: donorName.value.trim(),
    donorEmail: donorEmail.value.trim(),
    grossAmount: Number(grossAmount.value),
  })

  const zodErrors = getZodErrors(result as Parameters<typeof getZodErrors>[0])
  errors.value = zodErrors
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validate()) return

  await createMutation.mutateAsync({
    id: fosterChildrenId,
    data: {
      grossAmount: Number(grossAmount.value),
      donorName: donorName.value.trim() || undefined,
      donorEmail: donorEmail.value.trim() || undefined,
    },
  })

  if (createMutation.isSuccess.value) {
    showToast('Offline transaction created successfully!', 'success')
    router.push({ name: 'dashboard-foster-children-transaction', params: { id: fosterChildrenId } })
  }
}

const formatCurrencyPreview = computed(() => {
  const num = Number(grossAmount.value)
  if (!num || isNaN(num)) return ''
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num)
})

const handleCancel = () => {
  router.push({ name: 'dashboard-foster-children-donations-detail' })
}

</script>

<template>
  <DashboardLayout>
    <div class="max-w-full mx-auto space-y-6">
      <div class="flex items-center gap-4">
          <button
              @click="handleCancel"
              class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-500 hover:text-gray-700"
              title="Kembali ke detail riwayat donasi anak asuh"
          >
            <ArrowLeft :size="20" />
          </button>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-primary-50 rounded-lg">
              <Baby :size="24" class="text-primary-400" />
            </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Tambah Donasi Anak Asuh Baru</h2>
            <p class="text-sm text-gray-500">
                Lengkapi informasi berikut untuk menambahkan donasi anak asuh baru.
            </p>
          </div>
        </div>
      </div>

      <form
        @submit.prevent="handleSubmit"
        class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="p-6 space-y-5">
            <!-- Donor Name -->
            <BaseInput
              id="donor-name"
              v-model="donorName"
              label="Nama Donatur (Opsional)"
              placeholder="e.g. Hamba Allah"
              :error="errors.donorName"
            />

            <!-- Donor Email -->
            <BaseInput
              id="donor-email"
              v-model="donorEmail"
              label="Email Donatur (Opsional)"
              placeholder="e.g. email@example.com"
              :error="errors.donorEmail"
            />
          </div>

           <div class="p-6 space-y-5">
            <div>
              <label
                for="gross-amount"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Nominal Donasi <span class="text-red-500">*</span>
              </label>
              <input
                id="gross-amount"
                v-model="grossAmount"
                type="number"
                min="1000"
                placeholder="e.g. 100000"
                class="w-full px-3 py-2 text-sm border rounded-lg transition duration-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-[#121212] dark:text-gray-100"
                :class="
                  errors.grossAmount
                    ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500 dark:focus:ring-red-500/50'
                    : 'border-gray-300 dark:border-gray-700'
                "
              />
              <p v-if="formatCurrencyPreview" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ≈ {{ formatCurrencyPreview }}
              </p>
              <p v-if="errors.grossAmount" class="mt-1 text-xs text-red-600">
                {{ errors.grossAmount }}
              </p>
            </div>

            <p class="text-xs text-gray-500 dark:text-gray-400">
              These details will be recorded as an offline transaction directly into the system,
              bypassing payment gateways.
            </p>
          </div>
        </div>

        <div
          class="px-6 pb-4 flex justify-end gap-3"
        >
          <BaseButton
            type="button"
            variant="danger"
            :to="{ name: 'dashboard-foster-children-transaction', params: { id: fosterChildrenId } }"
            :disabled="isLoading"
          >
            Batal
          </BaseButton>
          <div class="flex items-center gap-3">
            <BaseButton type="submit" variant="primary" :loading="isLoading">
              <template #loading>Tambah…</template>
              Tambahkan Donasi Anak Asuh
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
