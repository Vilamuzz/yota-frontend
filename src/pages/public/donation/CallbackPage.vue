<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/ui/useToast'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const isLoading = ref(true)

onMounted(async () => {
  const orderId = route.query.order_id as string
  const transactionStatus = route.query.transaction_status as string

  if (!orderId) {
    showToast('Invalid transaction', 'error')
    await router.push('/donation')
    return
  }

  // Verify transaction with backend
  try {
    // You can call your backend API to verify the transaction status
    // const response = await verifytransaction(orderId)

    // Show success or pending message based on transaction status
    if (transactionStatus === 'settlement') {
      showToast('Donasi Anda berhasil! Terima kasih.', 'success')
      await router.push('/donation')
    } else if (transactionStatus === 'pending') {
      showToast('Donasi Anda sedang diproses.', 'info')
      await router.push('/donation')
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel') {
      showToast('Transaksi dibatalkan.', 'error')
      await router.push('/donation')
    } else {
      // Default redirect
      await router.push('/donation')
    }
  } catch (error) {
    console.error('Transaction verification failed:', error)
    showToast('Terjadi kesalahan saat memverifikasi transaksi.', 'error')
    await router.push('/donation')
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div v-if="isLoading" class="text-center">
      <div class="mb-4">Loading...</div>
    </div>
  </div>
</template>
