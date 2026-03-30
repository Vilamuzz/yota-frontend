<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Child } from '@/types/child'

defineProps<{
  children: Child
}>()

</script>

<template>
<RouterLink
  :to="{ name: 'children-detail', params: { slug: children.slug } }"
  class="bg-white overflow-hidden flex space-x-6 flex-row p-8 border-gray-200 border-b-2 hover:bg-gray-50 transition-colors"
>
    <img
      :src="children.image_url"
      :alt="children.name"
      class="w-32 h-32 rounded-full object-cover"
    />
  <div class="w-40 space-y-3">
    <div class="bg-primary-700 text-white text-xl rounded-full w-fit">
      {{ children.name }}
    </div>
    <div class="flex text-sm divide-x">
      <span class="font-bold">{{ children.category }}</span>
      <span class="font-normal">{{ children.age }} Tahun</span>
    </div>
  </div>
</RouterLink>
</template>
