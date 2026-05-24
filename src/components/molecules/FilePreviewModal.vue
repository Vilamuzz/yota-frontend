<script setup lang="ts">
import { computed } from 'vue'
import { X, ExternalLink } from 'lucide-vue-next'

const props = defineProps<{
  show: boolean
  fileUrl: string | null
}>()

const emit = defineEmits<{
  close: []
}>()

const isPdf = computed(() => {
  if (!props.fileUrl) return false
  return (
    props.fileUrl.toLowerCase().endsWith('.pdf') ||
    props.fileUrl.toLowerCase().includes('.pdf?') ||
    props.fileUrl.toLowerCase().includes('application/pdf')
  )
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
      class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75"
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
        <div
          v-if="show && fileUrl"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-[90vh] overflow-hidden"
        >
          <!-- Header -->
          <div
            class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50"
          >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Pratinjau Berkas
              <a
                :href="fileUrl"
                target="_blank"
                title="Buka di tab baru"
                class="text-blue-500 hover:text-blue-600 transition-colors"
              >
                <ExternalLink :size="16" />
              </a>
            </h3>
            <button
              @click="emit('close')"
              class="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- Body -->
          <div
            class="flex-1 bg-gray-100 dark:bg-gray-900 overflow-hidden relative flex items-center justify-center"
          >
            <template v-if="isPdf">
              <iframe :src="fileUrl" class="w-full h-full border-none" title="Pratinjau PDF"></iframe>
            </template>
            <template v-else>
              <img
                :src="fileUrl"
                alt="Pratinjau Gambar"
                class="max-w-full max-h-full object-contain"
              />
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
