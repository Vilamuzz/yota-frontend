<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'
import type { Child } from '@/types/fosterChildren'

const props = defineProps<{
  show: boolean
  child: Child | null
}>()

defineEmits(['close'])

const handleDonasi = () => {
  if (props.child) {
    console.log('Donasi untuk:', props.child.name)
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div
      v-if="child"
      class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-sm w-full relative">
      <button
        @click="$emit('close')"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 text-gray-500 hover:text-gray-700">
        <ArrowLeft :size="16" />
      </button>
      <div class="flex flex-col items-center text-center space-y-2">
        <img
          :src="child.image_url"
          :alt="child.name"
          class="w-28 h-28 rounded-full object-cover border-2 border-green-600"
        />
        <h2 class="bg-primary-300 text-white text-md px-3 py-1 rounded-full font-poppins text-lg">
          {{ child.name }}
        </h2>
        <div class="flex text-md divide-x">
          <span class="font-bold px-1">{{ child.category }}</span>
          <span class="font-normal px-1">{{ child.age }} Tahun</span>
        </div>
        <div
          v-if="child.achievements?.length"
          class="w-full mt-1">
          <h3 class="text-md font-semibold mb-2">
            Prestasi:
          </h3>
          <ol class="list-decimal list-inside text-left font-normal font-poppins text-sm">
            <li
              v-for="(achievement, index) in child.achievements"
              :key="index"
            >
              {{ achievement }}
            </li>
          </ol>
        </div>
        <p
          v-else
          class="text-sm text-gray-500 italic">
          Belum ada prestasi
        </p>
      </div>
      <BaseButton
        color="bg-primary-300 text-white"
        class="mt-6 w-full rounded-full font-poppins text-md"
        @click="handleDonasi"
      >
        Donasi
      </BaseButton>
    </div>
  </div>
</template>
