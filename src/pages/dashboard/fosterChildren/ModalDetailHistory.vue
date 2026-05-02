<script setup lang="ts">
import type { FosterChildrenTransaction } from '@/types/fosterChildrenTransaction'
import BaseButton from '@/components/atoms/BaseButton.vue'

const {show, transaction} = defineProps<{
  show:boolean
  transaction: FosterChildrenTransaction | null
}>()

const emit = defineEmits(['close'])
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
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      @click.self="emit('close')"
    >
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div v-if="show" class="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">

          <div class="text-left py-4">
            <h2 class="text-2xl text-center font-bold text-gray-900 mb-4">
              Detail Transaksi Dana Anak Asuh
            </h2>

            <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div class="p-4 space-y-3">
                <div class="grid grid-cols-[180px_auto] gap-y-3 gap-x-2 text-sm">
                  <div class="text-gray-500">ID Transaksi</div>
                  <div>: {{ transaction?.transactionId || transaction?.orderId }}</div>

                  <div class="text-gray-500">Nama Donatur</div>
                  <div>: {{ transaction?.donorName || '-' }}</div>

                  <div class="text-gray-500">Nominal Donasi</div>
                  <div>: Rp {{ Number(transaction?.grossAmount).toLocaleString('id-ID') }}</div>

                  <div class="text-gray-500">Tanggal Donasi</div>
                  <div>: {{ transaction?.paidAt || transaction?.createdAt }}</div>

                  <div class="text-gray-500">Metode Donasi</div>
                  <div>: {{ transaction?.isOnline ? 'Online' : 'Offline' }}</div>

                  <div class="text-gray-500">Status</div>
                  <div>
                    <span
                      :class="[
                        'px-3 py-1 text-xs rounded-full',
                        transaction?.transactionStatus === 'Berhasil'
                          ? 'bg-green-100 text-green-700'
                          : transaction?.transactionStatus === 'Menunggu Pembayaran'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      ]"
                    >
                      {{ transaction?.transactionStatus }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 flex justify-center">
              <BaseButton @click="emit('close')">
                Tutup
              </BaseButton>
            </div>
          </div>

        </div>
      </Transition>
    </div>
  </Transition>
</template>
