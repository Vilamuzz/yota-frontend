<script setup lang="ts">
import type { Child } from '@/types/fosterChildren'

defineProps<{
  children: Child
}>()

const emit = defineEmits(['view'])

const handleView = (child: Child) => {
  emit('view', child)
}
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 min-w-37.5">
    <div
    class="flex flex-col items-center text-center space-y-1 hover:scale-105 transition"
    >
    <img
      :src="children.image_url"
      :alt="children.name"
      class="w-20 h-20 rounded-full object-cover border-2 border-green-600"
    />
    <button
      class="bg-primary-300 text-white text-md px-3 py-1 rounded-full font-medium"
      @click="handleView(children)"
    >
      {{ children.name }}
  </button>

    <div class="flex text-sm divide-x">
          <span class="font-bold px-1">{{ children.category }}</span>
          <span class="font-normal px-1">{{ children.age }} Tahun</span>
    </div>

    </div>
  </div>
</template>
