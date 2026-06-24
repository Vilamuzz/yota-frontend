<script setup lang="ts">
import { computed, ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

interface Props {
  modelValue: string | number
  id: string
  type?: string
  label?: string
  placeholder?: string
  required?: boolean
  autocomplete?: string
  disabled?: boolean
  error?: string
  hint?: string
  size?: 'sm' | 'md' | 'lg'
  showPasswordToggle?: boolean
  showPasswordStrength?: boolean
  min?: string | number
  max?: string | number
  inputClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  size: 'md',
  showPasswordToggle: false,
  showPasswordStrength: false,
  inputClass: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type === 'password' && props.showPasswordToggle) {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

// Password strength calculation
const passwordStrength = computed(() => {
  if (props.type !== 'password' || !props.showPasswordStrength || !props.modelValue) {
    return { level: 0, text: '', color: '' }
  }

  const password = String(props.modelValue)
  let strength = 0

  // Length check
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[^a-zA-Z0-9]/.test(password)) strength++

  // Cap at 4
  strength = Math.min(strength, 4)

  const levels = [
    { level: 0, text: '', color: '' },
    { level: 1, text: 'Weak', color: 'bg-red-500' },
    { level: 2, text: 'Fair', color: 'bg-orange-500' },
    { level: 3, text: 'Good', color: 'bg-yellow-500' },
    { level: 4, text: 'Strong', color: 'bg-green-500' },
  ]

  return levels[strength]
})

const inputClasses = computed(() => {
  const base =
    'w-full border rounded-lg focus:ring-2 focus:ring-primary-500 transition-all duration-200 outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#121212] border-gray-300 dark:border-gray-700'

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  }

  const errorClass = props.error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
  const paddingClass = props.showPasswordToggle && props.type === 'password' ? 'pr-10' : ''

  return `${base} ${sizes[props.size]} ${errorClass} ${paddingClass}`
})

const labelClasses = computed(() => {
  const sizes = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  }

  return `block font-medium text-gray-700 mb-1 dark:text-gray-200 ${sizes[props.size]}`
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="id" :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="relative">
      <!-- Prefix Slot -->
      <div
        v-if="$slots.prefix"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      >
        <slot name="prefix" />
      </div>

      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :min="min"
        :max="max"
        :class="[
          inputClasses,
          $slots.prefix ? (props.inputClass.includes('pl-') ? '' : 'pl-10') : '',
          $slots.suffix || (showPasswordToggle && type === 'password') ? 'pr-10' : '',
          props.inputClass,
        ]"
        @input="handleInput"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />

      <!-- Suffix Slot -->
      <div
        v-if="$slots.suffix"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      >
        <slot name="suffix" />
      </div>

      <!-- Password Toggle Button -->
      <button
        v-if="showPasswordToggle && type === 'password'"
        type="button"
        @click="togglePasswordVisibility"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
        :aria-label="showPassword ? 'Hide password' : 'Show password'"
      >
        <Eye v-if="!showPassword" :size="18" />
        <EyeOff v-else :size="18" />
      </button>
    </div>

    <!-- Password Strength Indicator -->
    <div
      v-if="showPasswordStrength && type === 'password' && modelValue && passwordStrength"
      class="mt-2 space-y-2"
    >
      <!-- Strength Bars -->
      <div class="flex gap-1.5">
        <div
          v-for="i in 4"
          :key="i"
          class="h-1.5 flex-1 rounded-full transition-all duration-300"
          :class="i <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'"
        ></div>
      </div>

      <!-- Strength Text -->
      <p
        v-if="passwordStrength.text"
        class="text-xs font-medium"
        :class="{
          'text-red-600': passwordStrength.level === 1,
          'text-orange-600': passwordStrength.level === 2,
          'text-yellow-600': passwordStrength.level === 3,
          'text-green-600': passwordStrength.level === 4,
        }"
      >
        Password Strength: {{ passwordStrength.text }}
      </p>
    </div>

    <div class="min-h-5 mt-1">
      <p v-if="error" class="text-xs text-red-600">
        {{ error }}
      </p>
      <p v-else-if="hint" class="text-xs text-gray-500">
        {{ hint }}
      </p>
    </div>
  </div>
</template>
