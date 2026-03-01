<script setup lang="ts">
import { ref } from 'vue'
import { Search, Filter } from 'lucide-vue-next'
import type { Component } from 'vue'

interface Props {
  modelValue: string
  searchPlaceholder?: string
  hasActiveFilters?: boolean
  showCreateButton?: boolean
  createButtonText?: string
  showCreateButtonText?: boolean
  createButtonIcon?: Component
}

withDefaults(defineProps<Props>(), {
  searchPlaceholder: 'Search...',
  hasActiveFilters: false,
  showCreateButton: false,
  createButtonText: 'Create',
})

defineEmits<{
  'update:modelValue': [value: string]
  create: []
}>()

const showFilterDropdown = ref(false)

const closeDropdown = () => {
  showFilterDropdown.value = false
}
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-3 justify-end items-start sm:items-center">
    <!-- Search Field -->
    <div class="relative w-full sm:w-auto flex-1 sm:flex-none max-w-md">
      <Search :size="18" class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="text"
        :placeholder="searchPlaceholder"
        class="pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm w-full sm:min-w-50"
      />
    </div>

    <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
      <!-- Filter Dropdown -->
      <div class="relative">
        <button
          @click="showFilterDropdown = !showFilterDropdown"
          class="flex items-center gap-2 p-2 border border-gray-300 rounded-sm bg-primary-300 hover:bg-primary-400 transition-colors duration-150 text-sm font-medium text-white h-9.5"
        >
          <Filter :size="18" />
        </button>

        <!-- Filter Dropdown Menu -->
        <div
          v-if="showFilterDropdown"
          class="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50 text-left"
        >
          <slot name="filters" :close-dropdown="closeDropdown"></slot>
        </div>
      </div>

      <!-- Create Button -->
      <button
        v-if="showCreateButton"
        @click="$emit('create')"
        class="flex items-center gap-2 p-2 bg-primary-300 text-white rounded-sm hover:bg-primary-400 transition-colors duration-150"
      >
        <component :is="createButtonIcon" v-if="createButtonIcon" :size="20" />
        <span v-if="showCreateButtonText !== false">{{ createButtonText }}</span>
      </button>
    </div>
  </div>
</template>
