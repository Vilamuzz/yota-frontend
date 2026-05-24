<script setup lang="ts">
import type { FosterChildrenListItem } from '@/types/fosterChildren'
import { formatStatus } from '@/utils/format'

defineProps<{
  fosterChildren: FosterChildrenListItem
}>()

const emit = defineEmits(['view'])

const handleView = (fosterChildren: FosterChildrenListItem) => {
  emit('view', fosterChildren)
}

function calculateAge(birthDate: string): number {
  if (!birthDate) return 0

  // Expecting Format: YYYY-MM-DD
  const parts = birthDate.split('-')
  const [p1, p2, p3] = parts

  if (!p1 || !p2 || !p3) return 0

  let year: number, month: number, day: number

  if (p1.length === 4) {
    // YYYY-MM-DD
    year = Number(p1)
    month = Number(p2)
    day = Number(p3)
  } else {
    // DD-MM-YYYY (legacy or alternative)
    day = Number(p1)
    month = Number(p2)
    year = Number(p3)
  }

  if (!day || !month || !year) return 0

  const today = new Date()
  const birth = new Date(year, month - 1, day)

  let age = today.getFullYear() - birth.getFullYear()

  const isBeforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())

  if (isBeforeBirthday) {
    age--
  }

  return age
}
</script>

<template>
  <button
    class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 min-w-37.5 w-full text-left cursor-pointer hover:shadow-md hover:border-primary-300 transition-all duration-200 group"
    @click="handleView(fosterChildren)"
  >
    <div
      class="flex flex-col items-center text-center space-y-1 group-hover:scale-105 transition-transform duration-200"
    >
      <img
        :src="fosterChildren.profilePicture"
        :alt="fosterChildren.name"
        class="w-20 h-20 rounded-full object-cover border-2 border-green-600"
      />
      <span class="bg-primary-300 text-white text-md px-3 py-1 rounded-full font-medium">
        {{ fosterChildren.name }}
      </span>

      <div class="flex text-sm divide-x">
        <span class="font-bold px-1">{{ formatStatus(fosterChildren.category) }}</span>
        <span class="font-normal px-1">{{ calculateAge(fosterChildren.birthDate) }} Tahun</span>
      </div>
    </div>
  </button>
</template>
