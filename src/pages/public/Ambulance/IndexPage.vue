<script setup lang="ts">
import PublicLayout from '@/layouts/PublicLayout.vue'
</script>
<template>
  <PublicLayout>
    <div class="bg-gray-100 h-3xl pt-36 pb-14 w-full">
      <div
        class="text-gray-600 bg-gray-300 mx-auto rounded-xl w-[70%] flex justify-between items-center"
      >
        <input
          type="text"
          placeholder="Cari bantuan ambulans"
          class="p-3 text-sm bg-transparent outline-none w-full placeholder-gray-600"
        />
        <Search class="mr-4 shrink-0" />
      </div>
    </div>
  </PublicLayout>
</template>
