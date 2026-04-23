<script setup lang="ts">
import type { Child } from '@/types/fosterChildren'

defineProps<{
  children: Child
}>()

const emit = defineEmits(['view'])

const handleView = (child: Child) => {
  emit('view', child)
}

function calculateAge(birthDate: string): number {
  if (!birthDate) return 0

  // Format: DD-MM-YYYY
  const [dayStr, monthStr, yearStr] = birthDate.split('-')

  const day = Number(dayStr)
  const month = Number(monthStr)
  const year = Number(yearStr)

  if (!day || !month || !year) return 0

  const today = new Date()
  const birth = new Date(year, month - 1, day)

  let age = today.getFullYear() - birth.getFullYear()

  const isBeforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() < birth.getDate())

  if (isBeforeBirthday) {
    age--
  }

  return age
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
          <span class="font-normal px-1">{{ calculateAge(children.birth_date) }} Tahun</span>
    </div>

    </div>
  </div>
</template>
