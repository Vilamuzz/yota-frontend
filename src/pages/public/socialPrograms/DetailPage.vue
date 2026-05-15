<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, Loader2, Share2, LogIn } from 'lucide-vue-next'
import { formatCurrency } from '@/utils/format'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/atoms/BaseButton.vue'
import PublicConfirmationModal from '@/components/molecules/PublicConfirmationModal.vue'
import SubscriptionInfo from '@/components/molecules/SubscriptionInfo.vue'
import { usePublishedSocialProgramDetail } from '@/composables/socialProgram/usePublishedSocialProgramDetail'
import { useSocialProgramSubscribe } from '@/composables/socialProgramSubscription/useSocialProgramSubscribe'
import { useSocialProgramUnsubscribe } from '@/composables/socialProgramSubscription/useSocialProgramUnsubscribe'
import { useToast } from '@/composables/ui/useToast'
import { useAuthStore } from '@/stores/auth'
import { extractError } from '@/utils/error'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const { detailQuery } = usePublishedSocialProgramDetail(slug)
const { subscribeMutation } = useSocialProgramSubscribe()
const { unsubscribeMutation } = useSocialProgramUnsubscribe()
const { showToast } = useToast()
const authStore = useAuthStore()

const showLoginModal = ref(false)
const showUnsubscribeModal = ref(false)
const program = computed(() => detailQuery.data.value?.data)

const handleSubscribeClick = () => {
  if (!program.value) return

  if (!authStore.isAuthenticated) {
    showLoginModal.value = true
    return
  }

  if (program.value.isSubscribed) {
    showUnsubscribeModal.value = true
    return
  }

  subscribeMutation.mutate(
    { id: program.value.id },
    {
      onSuccess: () => {
        showToast('Berhasil berlangganan program sosial!', 'success')
      },
      onError: (error) => {
        showToast(extractError(error) || 'Gagal berlangganan.', 'error')
      },
    },
  )
}

const handleUnsubscribe = () => {
  if (!program.value?.subscriptionId) return

  unsubscribeMutation.mutate(
    { id: program.value.subscriptionId },
    {
      onSuccess: () => {
        showUnsubscribeModal.value = false
        showToast('Berhasil berhenti berlangganan.', 'success')
      },
      onError: (error) => {
        showToast(extractError(error) || 'Gagal berhenti berlangganan.', 'error')
      },
    },
  )
}

const handleLogin = () => {
  showLoginModal.value = false
  router.push({
    path: '/login',
    query: { redirect: route.fullPath },
  })
}
</script>

<template>
  <!-- Loading State -->
  <div
    v-if="detailQuery.isPending.value"
    class="flex flex-col items-center justify-center min-h-screen py-24"
  >
    <Loader2 class="w-12 h-12 text-primary-500 animate-spin mb-4" />
    <p class="text-gray-500 font-medium animate-pulse">Memuat detail program...</p>
  </div>

  <!-- Error State -->
  <div
    v-else-if="detailQuery.isError.value"
    class="flex items-center justify-center min-h-screen text-red-500 text-center px-6"
  >
    {{ detailQuery.error.value?.message || 'Gagal memuat detail program.' }}
  </div>

  <!-- Content State -->
  <template v-else-if="program">
    <div
      class="sticky top-0 z-40 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 font-poppins"
    >
      <!-- Back Button -->
      <button
        class="flex items-center justify-center shrink-0 text-gray-700 hover:text-gray-900 transition"
        @click="$router.back()"
      >
        <ArrowLeft :size="28" />
      </button>

      <!-- Title -->
      <h1 class="text-lg md:text-xl font-bold text-primary-500 line-clamp-1">
        {{ program.title }}
      </h1>
    </div>

    <!-- Hero -->
    <div class="relative">
      <img :src="program.coverImage" class="w-full h-[55vh] object-cover" />
    </div>

    <!-- Content -->
    <div class="max-w-5xl mx-auto px-6 py-8 font-poppins">
      <!-- Title -->
      <h1 class="text-2xl font-bold text-primary-500 mb-6">
        {{ program.title }}
      </h1>

      <!-- Minimum -->
      <div class="mb-4">
        <span class="text-gray-500 text-sm">Minimal</span>
        <span class="text-primary-300 font-bold text-2xl ml-2">
          {{ formatCurrency(program.minimumAmount) }}
        </span>
      </div>

      <!-- Buttons -->
      <div class="flex gap-4 mb-2">
        <BaseButton variant="secondary" size="lg" class="flex-1">
          <Share2 :size="18" class="mr-2" />
          Bagikan
        </BaseButton>

        <BaseButton
          :variant="program.isSubscribed ? 'outline' : 'primary'"
          size="lg"
          class="flex-1"
          :loading="subscribeMutation.isPending.value || unsubscribeMutation.isPending.value"
          @click="handleSubscribeClick"
        >
          {{ program.isSubscribed ? 'Berhenti Berlangganan' : 'Berlangganan' }}
        </BaseButton>
      </div>

      <p class="text-xs text-gray-400 mb-8">*Tagihan akan muncul setiap tanggal 5</p>

      <!-- Deskripsi -->
      <div class="border-t pt-6">
        <h2 class="text-lg font-semibold mb-4">Deskripsi Program</h2>

        <div class="space-y-4 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
          {{ program.description }}
        </div>
      </div>

      <!-- Component Reusable -->
      <SubscriptionInfo />
    </div>

    <!-- Login Reminder Modal -->
    <PublicConfirmationModal
      :show="showLoginModal"
      title="Yuk, Masuk Dulu!"
      message="Untuk bisa berlangganan program sosial ini, kamu perlu masuk ke akunmu terlebih dahulu."
      primaryButtonText="Masuk Sekarang"
      secondaryButtonText="Nanti Saja"
      :icon="LogIn"
      @close="showLoginModal = false"
      @secondary="showLoginModal = false"
      @primary="handleLogin"
    />

    <!-- Unsubscribe Confirmation Modal -->
    <PublicConfirmationModal
      :show="showUnsubscribeModal"
      title="Berhenti Berlangganan?"
      message="Apakah kamu yakin ingin berhenti berlangganan program ini? Kamu tidak akan lagi menerima tagihan bulanan untuk program ini."
      primaryButtonText="Ya, Berhenti"
      secondaryButtonText="Batal"
      variant="danger"
      :loading="unsubscribeMutation.isPending.value"
      @close="showUnsubscribeModal = false"
      @secondary="showUnsubscribeModal = false"
      @primary="handleUnsubscribe"
    />

    />
  </template>
</template>
