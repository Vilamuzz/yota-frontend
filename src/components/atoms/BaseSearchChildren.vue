<script setup lang="ts">
import { Search, Plus } from 'lucide-vue-next'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useRouter } from 'vue-router'

interface Props {
  modelValue: string
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Mau konsisten sedekah untuk siapa?',
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const router = useRouter()

const handleForm = () => {
  router.push({name: 'foster-children-submission',
              params: {
                slug: 'foster-children-submission' }})
}
</script>

<template>
  <div class="bg-gray-100 pt-36 pb-14 w-full">

    <!-- container search + button -->
    <div class="mx-auto w-[70%] flex items-center gap-4">

      <!-- search bar -->
      <div
        class="text-gray-600 bg-gray-300 rounded-xl flex justify-between items-center flex-1"
      >
        <input
          :value="modelValue"
          @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
          type="text"
          :placeholder="placeholder"
          class="p-3 text-sm bg-transparent outline-none w-full placeholder-gray-600"
        />

        <Search class="mr-4 shrink-0" :size="18" />
      </div>

      <!-- button -->
      <BaseButton color="primary" class="flex items-center gap-2" @click="handleForm">
        <Plus :size="16" />
        Ajukan Anak Asuh
      </BaseButton>

    </div>

  </div>
</template>
