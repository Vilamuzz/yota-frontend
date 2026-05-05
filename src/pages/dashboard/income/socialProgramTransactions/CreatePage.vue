<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Search, User, Check, X } from 'lucide-vue-next'
import { createSocialProgramTransactionSchema } from '@/schemas/socialProgramTransaction.schema'
import { useSocialProgramTransactionCreateOffline } from '@/composables/socialProgramTransaction/useSocialProgramTransactionCreateOffline'
import { useAccountList } from '@/composables/account/useAccountList'
import { useToast } from '@/composables/ui/useToast'
import { getZodErrors } from '@/utils/zodError'
import { extractError } from '@/utils/error'
import { formatCurrency } from '@/utils/format'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import type { Account } from '@/types/account'

const router = useRouter()
const route = useRoute()
const { createMutation } = useSocialProgramTransactionCreateOffline()
const { showToast } = useToast()

const socialProgramId = route.params.id as string
const grossAmount = ref('')
const errors = ref<Record<string, string>>({})

const accountSearch = ref('')
const selectedAccount = ref<{ id: string; name: string; email: string } | null>(null)
const accountQueryParams = reactive({
  search: '',
  limit: 5,
})

const { accounts, isLoading: isLoadingAccounts } = useAccountList(accountQueryParams)

let searchTimeout: ReturnType<typeof setTimeout>
watch(accountSearch, (val) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    accountQueryParams.search = val
  }, 400)
})

const isLoading = computed(() => createMutation.isPending.value)

const formatCurrencyPreview = computed(() => {
  const num = Number(grossAmount.value)
  if (!num || isNaN(num)) return ''
  return formatCurrency(num)
})

const selectAccount = (account: Account) => {
  selectedAccount.value = {
    id: account.id,
    name: account.userProfile.username,
    email: account.email,
  }
  accountSearch.value = ''
  accountQueryParams.search = ''
  delete errors.value.accountId
}

const removeAccount = () => {
  selectedAccount.value = null
}

const handleSubmit = () => {
  const result = createSocialProgramTransactionSchema.safeParse({
    grossAmount: Number(grossAmount.value),
    accountId: selectedAccount.value?.id || '',
  })

  const zodErrors = getZodErrors(result)
  errors.value = zodErrors
  if (!result.success) return

  createMutation.mutate(
    {
      id: socialProgramId,
      data: {
        grossAmount: Number(grossAmount.value),
        accountId: selectedAccount.value!.id,
      },
    },
    {
      onSuccess: () => {
        showToast('Transaksi offline berhasil dicatat!', 'success')
        router.push({
          name: 'dashboard-social-programs-transaction',
          params: { id: socialProgramId },
        })
      },
      onError: (err) => {
        showToast(extractError(err, 'Gagal mencatat transaksi offline'), 'error')
      },
    },
  )
}
</script>

<template>
  <DashboardLayout>
    <template #title>Tambah Transaksi Program Sosial</template>

    <div class="max-w-full mx-auto space-y-6">
      <!-- Form Card -->
      <form
        @submit.prevent="handleSubmit"
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="p-6 space-y-5">
            <!-- Amount -->
            <div>
              <label
                for="gross-amount"
                class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1"
              >
                Nominal Donasi (IDR) <span class="text-red-500">*</span>
              </label>
              <input
                id="gross-amount"
                v-model="grossAmount"
                type="number"
                min="1000"
                placeholder="mis. 100000"
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
              Detail ini akan dicatat sebagai transaksi offline langsung ke dalam sistem, melewati
              payment gateway.
            </p>
          </div>

          <!-- Account Search Section -->
          <div class="p-6 space-y-5 border-l border-gray-100 dark:border-gray-700">
            <div>
              <label class="block text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">
                Pilih Akun Donatur <span class="text-red-500">*</span>
              </label>

              <!-- Selected Account Display -->
              <div
                v-if="selectedAccount"
                class="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/30 rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400"
                  >
                    <User :size="16" />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900 dark:text-white">
                      {{ selectedAccount.name }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                      {{ selectedAccount.email }}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  @click="removeAccount"
                  class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X :size="16" class="text-gray-500" />
                </button>
              </div>

              <!-- Search Input -->
              <div v-else class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search :size="16" class="text-gray-400" />
                </div>
                <input
                  v-model="accountSearch"
                  type="text"
                  placeholder="Cari nama atau email akun..."
                  class="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-[#121212] dark:text-gray-100 focus:ring-2 focus:ring-primary-500"
                  :class="errors.accountId ? 'border-red-300' : ''"
                />

                <!-- Search Results Dropdown -->
                <div
                  v-if="accountSearch && accounts.length > 0"
                  class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden"
                >
                  <ul class="max-h-48 overflow-y-auto">
                    <li
                      v-for="account in accounts"
                      :key="account.id"
                      @click="selectAccount(account)"
                      class="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center justify-between group"
                    >
                      <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">
                          {{ account.userProfile.username }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ account.email }}</p>
                      </div>
                      <Check
                        :size="16"
                        class="text-primary-500 opacity-0 group-hover:opacity-100"
                      />
                    </li>
                  </ul>
                </div>

                <div
                  v-else-if="accountSearch && !isLoadingAccounts && accounts.length === 0"
                  class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center text-xs text-gray-500"
                >
                  Akun tidak ditemukan
                </div>
              </div>
              <p v-if="errors.accountId" class="mt-1 text-xs text-red-600">
                {{ errors.accountId }}
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div
          class="px-6 pb-4 flex items-center justify-between gap-3 border-t border-gray-200 dark:border-gray-700 pt-4 bg-gray-50 dark:bg-gray-800/50"
        >
          <BaseButton
            type="button"
            variant="danger"
            :to="{
              name: 'dashboard-social-programs-transaction',
              params: { id: socialProgramId },
            }"
            :disabled="isLoading"
          >
            Batal
          </BaseButton>
          <div class="flex items-center gap-3">
            <BaseButton type="submit" variant="primary" :loading="isLoading">
              <template #loading>Menyimpan…</template>
              Catat Transaksi
            </BaseButton>
          </div>
        </div>
      </form>
    </div>
  </DashboardLayout>
</template>
