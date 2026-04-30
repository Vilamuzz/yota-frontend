<script setup lang="ts">
import type { FosterChildren } from '@/types/fosterChildren'

const { child } = defineProps<{
  child: FosterChildren | null
}>()

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
  <div v-if="child" class="bg-white p-6 max-w-sm w-full">
    <div class="flex items-center text-center space-x-4">
      <img
        :src="child.profilePicture"
        :alt="child.name"
        class="w-28 h-28 rounded-full object-cover border-2 border-green-600"
      />
      <div class="flex flex-col items-center text-center space-y-2">
        <h2 class="bg-primary-300 text-white text-md px-3 py-1 rounded-full font-poppins text-lg">
          {{ child.name }}
        </h2>
        <div class="flex text-md divide-x">
          <span class="font-bold px-1">{{ child.category }}</span>
          <span class="font-normal px-1">{{ calculateAge(child.birthDate) }} Tahun</span>
        </div>
      </div>
    </div>
  </div>
</template>
