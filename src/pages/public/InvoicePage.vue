<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '@/composables/ui/useToast'
import PublicLayout from '@/layouts/PublicLayout.vue'
import {
  FileText,
  Clock,
  CheckCircle2,
  ChevronRight,
  Receipt,
  Wallet,
  Heart,
  Users,
  HandHeart,
} from 'lucide-vue-next'

import { useMyDonationProgramTransactions } from '@/composables/donationProgramTransaction/useMyDonationProgramTransactions'
import { useMyFosterChildrenTransactions } from '@/composables/fosterChildrenTransaction/useMyFosterChildrenTransactions'
import { useMySocialProgramInvoices } from '@/composables/socialProgramInvoice/useMySocialProgramInvoices'
import { TransactionStatus } from '@/types/donationProgramTransaction'
import { InvoiceStatus } from '@/types/socialProgramInvoice'
import { Loader2 } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const {
  transactions: donationTransactions,
  isLoading: isLoadingDonations,
  query: donationQuery,
} = useMyDonationProgramTransactions()
const {
  transactions: fosterTransactions,
  isLoading: isLoadingFoster,
  query: fosterQuery,
} = useMyFosterChildrenTransactions()
const {
  invoices: socialInvoices,
  isLoading: isLoadingSocial,
  query: socialQuery,
} = useMySocialProgramInvoices()

const isAnyLoading = computed(
  () => isLoadingDonations.value || isLoadingFoster.value || isLoadingSocial.value,
)

const handleSnapPayment = (token: string) => {
  if (window.snap) {
    window.snap.pay(token, {
      onSuccess: function () {
        showToast('Pembayaran berhasil', 'success')
        donationQuery.refetch()
        fosterQuery.refetch()
        socialQuery.refetch()
        router.replace({ path: '/invoices' })
      },
      onPending: function () {
        showToast('Menunggu pembayaran', 'warning')
        donationQuery.refetch()
        fosterQuery.refetch()
        socialQuery.refetch()
        router.replace({ path: '/invoices' })
      },
      onError: function () {
        showToast('Pembayaran gagal', 'error')
        donationQuery.refetch()
        fosterQuery.refetch()
        socialQuery.refetch()
        router.replace({ path: '/invoices' })
      },
      onClose: function () {
        router.replace({ path: '/invoices' })
      },
    })
  }
}

onMounted(() => {
  if (route.query.pay) {
    handleSnapPayment(route.query.pay as string)
  }
})

watch(
  () => route.query.pay,
  (newToken) => {
    if (newToken) {
      handleSnapPayment(newToken as string)
    }
  },
)

const handlePay = (invoice: any) => {
  if (invoice.type === 'Program Sosial') {
    if (invoice.snapToken) {
      handleSnapPayment(invoice.snapToken)
    } else {
      router.push({ name: 'social-program-invoice-pay', params: { id: invoice.id } })
    }
  } else if (invoice.snapToken) {
    handleSnapPayment(invoice.snapToken)
  }
}

const activeCategory = ref('Program Donasi')
const activeStatus = ref('WAITING')

const categories = [
  { name: 'Program Donasi', icon: Heart },
  { name: 'Program Sosial', icon: HandHeart },
  { name: 'Donasi Anak Asuh', icon: Users },
]

const invoices = computed(() => {
  const mappedDonations = donationTransactions.value.map((t) => ({
    id: t.orderId || t.id,
    programName: t.donationProgramTitle || 'Program Donasi',
    amount: t.grossAmount,
    date: t.createdAt,
    status: t.transactionStatus === TransactionStatus.SETTLEMENT ? 'PAID' : 'WAITING',
    paymentMethod: t.isOnline ? 'Online Payment' : 'Offline Payment',
    type: 'Program Donasi',
    snapToken: t.snapToken,
  }))

  const mappedFoster = fosterTransactions.value.map((t) => ({
    id: t.orderId || t.id,
    programName: t.fosterChildrenName || 'Donasi Anak Asuh',
    amount: t.grossAmount,
    date: t.createdAt,
    status: t.transactionStatus === 'settlement' ? 'PAID' : 'WAITING',
    paymentMethod: t.isOnline ? 'Online Payment' : 'Offline Payment',
    type: 'Donasi Anak Asuh',
    snapToken: t.snapToken,
  }))

  const mappedSocial = socialInvoices.value.map((i) => ({
    id: i.id,
    programName: i.socialProgramTitle || 'Program Sosial',
    amount: i.minimumAmount,
    date: i.createdAt,
    status: i.status === InvoiceStatus.PAID ? 'PAID' : 'WAITING',
    paymentMethod: 'Online Payment',
    type: 'Program Sosial',
    snapToken: i.snapToken,
  }))

  return [...mappedDonations, ...mappedFoster, ...mappedSocial]
})

const filteredInvoices = computed(() => {
  return invoices.value.filter(
    (invoice) => invoice.type === activeCategory.value && invoice.status === activeStatus.value,
  )
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const getStatusLabel = (status: string) => {
  return status === 'PAID' ? 'Sudah Dibayar' : 'Menunggu Pembayaran'
}
</script>

<template>
  <PublicLayout>
    <div class="bg-gray-50 min-h-screen pt-28 pb-16 font-poppins">
      <div class="max-w-6xl mx-auto px-4 sm:px-6">
        <!-- Page Header -->
        <div class="mb-10 text-center md:text-left">
          <h1 class="text-4xl font-black text-gray-900 uppercase tracking-tight">
            Riwayat Invoice
          </h1>
          <p class="text-gray-500 mt-1 text-lg">
            Kelola dan pantau semua transaksi donasi dan bantuan Anda.
          </p>
        </div>

        <!-- Main Category Tabs -->
        <div class="flex flex-wrap justify-center md:justify-start gap-4 mb-8">
          <button
            v-for="cat in categories"
            :key="cat.name"
            @click="activeCategory = cat.name"
            class="flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-black transition-all duration-500 border-2"
            :class="
              activeCategory === cat.name
                ? 'bg-primary-400 border-primary-400 text-white shadow-xl shadow-primary-400/20 translate-y-1'
                : 'bg-white border-gray-100 text-gray-500 hover:border-primary-200 hover:text-primary-400'
            "
          >
            <component :is="cat.icon" :size="20" />
            {{ cat.name }}
          </button>
        </div>

        <!-- Sub Status Tabs -->
        <div
          class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm"
        >
          <div class="flex items-center gap-2">
            <div
              class="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400"
            >
              <Receipt :size="20" />
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Filter Status
              </p>
              <h3 class="text-sm font-black text-gray-900">{{ activeCategory }}</h3>
            </div>
          </div>

          <div class="flex p-1 bg-gray-100 rounded-2xl w-full md:w-fit">
            <button
              @click="activeStatus = 'WAITING'"
              class="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-wider"
              :class="
                activeStatus === 'WAITING'
                  ? 'bg-white text-primary-400 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              "
            >
              <Clock :size="14" />
              Menunggu
              <span
                v-if="
                  invoices.filter((i) => i.type === activeCategory && i.status === 'WAITING').length
                "
                class="ml-1 px-1.5 py-0.5 bg-primary-400 text-white text-[9px] rounded-full"
              >
                {{
                  invoices.filter((i) => i.type === activeCategory && i.status === 'WAITING').length
                }}
              </span>
            </button>
            <button
              @click="activeStatus = 'PAID'"
              class="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-xs font-black transition-all duration-300 uppercase tracking-wider"
              :class="
                activeStatus === 'PAID'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              "
            >
              <CheckCircle2 :size="14" />
              Sudah Bayar
            </button>
          </div>
        </div>

        <!-- Invoice List -->
        <div v-if="isAnyLoading" class="flex flex-col items-center justify-center py-24">
          <Loader2 class="w-12 h-12 text-primary-400 animate-spin mb-4" />
          <p class="text-gray-500 font-medium animate-pulse">Memuat data invoice...</p>
        </div>

        <div v-else-if="filteredInvoices.length > 0" class="grid grid-cols-1 gap-6">
          <div
            v-for="invoice in filteredInvoices"
            :key="invoice.id"
            class="group bg-white rounded-4xl border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8"
          >
            <!-- Background Decorative Element -->
            <div
              class="absolute top-0 left-0 w-2 h-full transition-all duration-500"
              :class="invoice.status === 'PAID' ? 'bg-green-500' : 'bg-primary-400'"
            ></div>

            <div class="flex items-start gap-6 relative z-10">
              <div
                class="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center transition-transform duration-500 group-hover:rotate-6"
                :class="
                  invoice.status === 'PAID'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-primary-50 text-primary-400'
                "
              >
                <Receipt :size="32" />
              </div>

              <div class="space-y-1.5">
                <div class="flex items-center gap-3">
                  <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{{
                    invoice.id
                  }}</span>
                  <div class="h-1 w-1 rounded-full bg-gray-200"></div>
                  <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{{
                    formatDate(invoice.date)
                  }}</span>
                </div>
                <h3
                  class="text-xl font-black text-gray-900 leading-tight group-hover:text-primary-400 transition-colors duration-300"
                >
                  {{ invoice.programName }}
                </h3>
                <div class="flex items-center gap-4 pt-1">
                  <div class="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Wallet :size="14" />
                    {{ invoice.paymentMethod }}
                  </div>
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-between md:justify-end gap-10 border-t md:border-t-0 pt-6 md:pt-0"
            >
              <div class="text-right">
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Total Tagihan
                </p>
                <p class="text-2xl font-black text-gray-900 tracking-tight">
                  {{ formatCurrency(invoice.amount) }}
                </p>
              </div>

              <button
                v-if="invoice.status === 'WAITING'"
                @click="handlePay(invoice)"
                class="w-14 h-14 bg-primary-50 text-primary-500 rounded-2xl flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all duration-500 shadow-sm group-hover:translate-x-2 cursor-pointer"
                title="Bayar Sekarang"
              >
                <ChevronRight :size="24" />
              </button>
              <div
                v-else
                class="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shadow-sm"
              >
                <CheckCircle2 :size="24" />
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="bg-white rounded-[3rem] border-2 border-dashed border-gray-100 p-24 text-center"
        >
          <div
            class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-300 animate-pulse"
          >
            <FileText :size="48" />
          </div>
          <h3 class="text-2xl font-black text-gray-900 mb-3">Tidak Ada Tagihan</h3>
          <p class="text-gray-500 max-w-sm mx-auto text-base leading-relaxed">
            Saat ini Anda tidak memiliki invoice di kategori
            <span class="font-bold text-gray-900">{{ activeCategory }}</span> dengan status
            <span class="font-bold text-primary-400">{{ getStatusLabel(activeStatus) }}</span
            >.
          </p>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
