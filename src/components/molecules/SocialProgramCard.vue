<script setup lang="ts">
import { RouterLink } from "vue-router"

const props = defineProps<{
  program: {
    id: number
    title: string
    image: string
    minimum: number
  }
}>()

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID").format(value)
}
</script>

<template>
  <RouterLink
    :to="{ name: 'social-program-detail', params: { slug: program.id } }"
    class="
      bg-white
      overflow-hidden
      flex flex-col
      border-gray-200
      border
      rounded-xl
      hover:bg-gray-50
      transition-colors
      font-[var(--font-poppins)]
    "
  >
    <!-- Image -->
    <img
      :src="program.image"
      :alt="program.title"
      class="w-full h-40 object-cover"
    />

    <!-- Content -->
    <div class="p-4 space-y-3">

      <!-- Title -->
      <h2 class="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
        {{ program.title }}
      </h2>

      <!-- Minimum -->
      <div class="text-sm">
        <span class="text-gray-500">Minimal</span>
        <span class="text-[var(--color-primary-300)] font-bold ml-1">
          Rp {{ formatRupiah(program.minimum) }}
        </span>
      </div>

      <!-- Button -->
      <button
        class="
          bg-[var(--color-primary-300)]
          hover:bg-[var(--color-primary-400)]
          transition
          text-white
          text-sm
          font-medium
          py-2
          rounded-md
          w-full
        "
      >
        Konsisten Sedekah
      </button>

      <!-- Note -->
      <p class="text-xs text-gray-400">
        *Ditagihkan setiap tanggal 5
      </p>

    </div>
  </RouterLink>
</template>