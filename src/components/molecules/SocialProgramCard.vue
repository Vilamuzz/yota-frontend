<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useSocialProgramSubscribe } from '@/composables/socialProgramSubscription/useSocialProgramSubscribe'
import { useSocialProgramUnsubscribe } from '@/composables/socialProgramSubscription/useSocialProgramUnsubscribe'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/ui/useToast'
import { extractError } from '@/utils/error'
import { type SocialProgram, SocialProgramStatusEnum } from '@/types/socialProgram'

const props = defineProps<{
  program: SocialProgram
}>()

const emit = defineEmits<{
  'require-login': []
}>()

const authStore = useAuthStore()
const { showToast } = useToast()
const { subscribeMutation } = useSocialProgramSubscribe()
const { unsubscribeMutation } = useSocialProgramUnsubscribe()

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID').format(value)
}

const handleSubscribeClick = () => {
  if (!authStore.isAuthenticated) {
    emit('require-login')
    return
  }

  if (props.program.isSubscribed) {
    handleUnsubscribe()
    return
  }

  subscribeMutation.mutate(
    { id: props.program.id },
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
  if (!props.program.subscriptionId) return

  unsubscribeMutation.mutate(
    { id: props.program.subscriptionId },
    {
      onSuccess: () => {
        showToast('Berhasil berhenti berlangganan.', 'success')
      },
      onError: (error) => {
        showToast(extractError(error) || 'Gagal berhenti berlangganan.', 'error')
      },
    },
  )
}
</script>

<template>
  <RouterLink
    :to="{ name: 'social-program-detail', params: { slug: program.slug } }"
    class="group bg-white overflow-hidden flex flex-col border border-gray-100 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:border-primary-100 font-poppins"
  >
    <!-- Image Wrapper -->
    <div class="relative w-full h-44 overflow-hidden">
      <img
        :src="program.coverImage"
        :alt="program.title"
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <!-- Overlay Gradient -->
      <div
        class="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      />
      <!-- Status Badge -->
      <div
        v-if="program.status === SocialProgramStatusEnum.COMPLETED"
        class="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm"
      >
        Selesai
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 flex flex-col flex-1 gap-4">
      <h2 class="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
        {{ program.title }}
      </h2>

      <!-- Minimum -->
      <div class="text-sm">
        <span class="text-gray-500">Minimal</span>
        <span class="text-primary-300 font-bold ml-1">
          Rp {{ formatRupiah(program.minimumAmount) }}
        </span>
      </div>

      <!-- Button -->
      <button
        v-if="program.status === SocialProgramStatusEnum.COMPLETED"
        class="bg-gray-100 border border-gray-200 text-gray-400 text-sm font-medium py-2 rounded-md w-full cursor-not-allowed"
        disabled
      >
        Program Selesai
      </button>
      <button
        v-else
        class="transition text-sm font-medium py-2 rounded-md w-full disabled:opacity-70 disabled:cursor-not-allowed"
        :class="[
          program.isSubscribed
            ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            : 'bg-primary-300 hover:bg-primary-400 text-white',
        ]"
        :disabled="subscribeMutation.isPending.value || unsubscribeMutation.isPending.value"
        @click.stop.prevent="handleSubscribeClick"
      >
        <span
          v-if="subscribeMutation.isPending.value || unsubscribeMutation.isPending.value"
          class="flex items-center justify-center gap-2"
        >
          <svg
            class="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Memproses...
        </span>
        <span v-else>
          {{ program.isSubscribed ? 'Berhenti Berlangganan' : 'Berlangganan' }}
        </span>
      </button>
    </div>
  </RouterLink>
</template>
