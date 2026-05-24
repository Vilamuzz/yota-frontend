<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { X, Search, User } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import { useFosterParentAccountList } from '@/composables/account/useAccountList'
import type { CreateOfflineSocialProgramSubscriptionRequest } from '@/types/socialProgramSubscription'
import BaseIconButton from '../atoms/BaseIconButton.vue'

interface Props {
  show: boolean
  programId: string
  loading?: boolean
  errors?: Record<string, string> | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  submit: [payload: CreateOfflineSocialProgramSubscriptionRequest]
}>()

const form = reactive({
  accountId: '',
})

const accountSearch = ref('')
const selectedAccount = ref<any>(null)
const showAccountDropdown = ref(false)

const { accounts, isLoading: accountsLoading } = useFosterParentAccountList(
  computed(() => ({
    search: accountSearch.value || undefined,
    limit: 5,
  })),
)

const selectAccount = (account: any) => {
  form.accountId = account.id
  selectedAccount.value = account
  accountSearch.value = ''
  showAccountDropdown.value = false
}

const handleResetAccount = () => {
  selectedAccount.value = null
  form.accountId = ''
}

const handleSubmit = () => {
  if (!form.accountId) return
  emit('submit', {
    accountId: form.accountId,
  })
}

watch(accountSearch, (val) => {
  if (val) {
    showAccountDropdown.value = true
  }
})

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.accountId = ''
      accountSearch.value = ''
      selectedAccount.value = null
      showAccountDropdown.value = false
    }
  },
)

const canSubmit = computed(() => {
  return !!form.accountId
})
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="emit('close')"
    >
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95 translate-y-4"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-4"
      >
        <div
          v-if="show"
          class="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden relative font-poppins"
        >
          <!-- Header -->
          <div class="bg-primary-500 p-6 text-white relative">
            <BaseIconButton @click="emit('close')" variant="danger" class="absolute top-4 right-4">
              <X :size="20" />
            </BaseIconButton>
            <div class="flex items-center gap-3">
              <div class="bg-white/20 p-2 rounded-lg">
                <User :size="24" />
              </div>
              <h2 class="text-xl font-bold">Tambah Pelanggan Manual</h2>
            </div>
          </div>

          <!-- Body -->
          <div class="p-8 space-y-6">
            <!-- Account Selection -->
            <div class="space-y-2 relative">
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                Pilih Akun Pelanggan
              </label>

              <div
                v-if="selectedAccount"
                class="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-400"
                  >
                    <User :size="16" />
                  </div>
                  <div class="flex flex-col">
                    <span class="text-sm font-bold text-gray-900 dark:text-white">{{
                      selectedAccount.username
                    }}</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{
                      selectedAccount.email
                    }}</span>
                  </div>
                </div>
                <button @click="handleResetAccount" class="text-xs text-red-500 hover:underline">
                  Ganti
                </button>
              </div>
              <p v-if="errors?.accountId" class="mt-1 text-xs text-red-500 font-medium">
                {{ errors.accountId }}
              </p>

              <div v-else class="relative">
                <BaseInput
                  id="account-search"
                  v-model="accountSearch"
                  placeholder="Cari nama atau email..."
                  @focus="showAccountDropdown = true"
                  class="mb-0"
                  :error="errors?.accountId"
                >
                  <template #prefix>
                    <Search :size="18" />
                  </template>
                </BaseInput>

                <!-- Dropdown -->
                <div
                  v-if="showAccountDropdown && (accountSearch || accounts.length > 0)"
                  class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-xl max-h-60 overflow-y-auto"
                >
                  <div v-if="accountsLoading" class="p-4 text-center text-sm text-gray-500">
                    Mencari...
                  </div>
                  <div
                    v-else-if="accounts.length === 0"
                    class="p-4 text-center text-sm text-gray-500"
                  >
                    Tidak ada akun ditemukan
                  </div>
                  <div v-else>
                    <button
                      v-for="account in accounts"
                      :key="account.id"
                      @click="selectAccount(account)"
                      class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-left"
                    >
                      <div
                        class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400"
                      >
                        <User :size="16" />
                      </div>
                      <div class="flex flex-col">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">{{
                          account.username
                        }}</span>
                        <span class="text-xs text-gray-500 dark:text-gray-400">{{
                          account.email
                        }}</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="pt-4 flex flex-col gap-3">
              <BaseButton
                variant="primary"
                full-width
                size="lg"
                :loading="loading"
                :disabled="!canSubmit"
                @click="handleSubmit"
                class="rounded-2xl"
              >
                Simpan Pelanggan
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
