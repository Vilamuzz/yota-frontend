<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { UserRound } from 'lucide-vue-next'
import { useUserUpdate } from '@/composables/user/useUserUpdate'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useQueryClient } from '@tanstack/vue-query'
import type { User, Role } from '@/types/users'

interface Props {
  show: boolean
  user: User | null
  roles: Role[]
  mode?: 'view' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'view',
})

const emit = defineEmits<{
  close: []
  saved: []
}>()

const queryClient = useQueryClient()
const { updateUserMutation, updateUserError } = useUserUpdate()

// Local editable state
const localMode = ref<'view' | 'edit'>(props.mode)
const selectedRole = ref<number | undefined>(undefined)

// Sync when user or mode prop changes
watch(
  () => [props.user, props.show, props.mode],
  () => {
    if (props.user) {
      selectedRole.value = props.user.role.id
    }
    localMode.value = props.mode
    updateUserError.value = ''
  },
  { immediate: true },
)

const isEdit = computed(() => localMode.value === 'edit')

const isDirty = computed(() => {
  if (!props.user) return false
  return selectedRole.value !== props.user.role.id
})

const handleSave = async () => {
  if (!props.user) return
  await updateUserMutation.mutateAsync({
    userId: props.user.id,
    data: {
      role_id: selectedRole.value,
    },
  })
  queryClient.invalidateQueries({ queryKey: ['users'] })
  emit('saved')
  emit('close')
}

const handleClose = () => {
  updateUserError.value = ''
  emit('close')
}

const enterEditMode = () => {
  localMode.value = 'edit'
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show && user"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      @click.self="handleClose"
    >
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        enter-to-class="opacity-100 scale-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100 translate-y-0"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div
          v-if="show && user"
          class="bg-white rounded-sm shadow-2xl w-full max-w-md relative overflow-hidden"
        >
          <!-- Header -->
          <div class="flex flex-col items-center px-6 py-4">
            <h1 class="text-lg text-gray-900 font-sf-pro">Edit Peran Pengguna</h1>
            <p class="text-xs text-gray-500">
              {{
                isEdit
                  ? 'Atur peran pengguna sesuai dengan tanggung jawab yang diberikan.'
                  : 'User details'
              }}
            </p>
          </div>

          <!-- Body -->
          <div class="px-6 py-5 space-y-4 border border-gray-100 rounded-sm mx-6">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center">
                <UserRound :size="18" class="text-primary-600" />
              </div>
              <div>
                <h2 class="text-base font-semibold text-gray-900">{{ user.username }}</h2>
              </div>
            </div>

            <!-- Username (read-only) -->
            <div class="flex justify-between items-center gap-2">
              <label class="w-1/2 flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
                <p>Username</p>
                <p>:</p></label
              >
              <div
                class="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-500 cursor-not-allowed"
              >
                {{ user.username }}
              </div>
            </div>

            <!-- Email (read-only) -->
            <div class="flex justify-between items-center gap-2">
              <label class="w-1/2 flex justify-between text-xs font-semibold text-gray-600 mb-1.5">
                <p>Email</p>
                <p>:</p></label
              >
              <div
                class="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-500 cursor-not-allowed"
              >
                {{ user.email }}
              </div>
            </div>

            <!-- Role -->
            <div class="flex justify-between items-center gap-2">
              <label class="w-1/2 flex justify-between text-xs font-semibold text-gray-600 mb-1.5"
                ><p>Role</p>
                <p>:</p></label
              >
              <template v-if="isEdit">
                <select
                  v-model="selectedRole"
                  class="w-1/2 px-3 py-2 border border-gray-300 rounded-sm text-sm text-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-150"
                >
                  <option v-for="role in roles" :key="role.id" :value="role.id">
                    {{ role.role.charAt(0).toUpperCase() + role.role.slice(1) }}
                  </option>
                </select>
              </template>
              <template v-else>
                <div
                  class="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-700"
                >
                  {{ user.role.role.charAt(0).toUpperCase() + user.role.role.slice(1) }}
                </div>
              </template>
            </div>

            <!-- Status (read-only — change via ban/unban on the list) -->
            <div class="flex justify-between items-center gap-2">
              <label class="w-1/2 flex justify-between text-xs font-semibold text-gray-600 mb-1.5"
                ><p>Status</p>
                <p>:</p></label
              >
              <div class="flex w-1/2 justify-start items-center gap-2">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    user.status
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200',
                  ]"
                >
                  {{ user.status ? 'Active' : 'Banned' }}
                </span>
              </div>
            </div>

            <!-- Member since (view only) -->
            <div class="flex justify-between items-center gap-2" v-if="!isEdit">
              <label class="w-1/2 flex justify-between text-xs font-semibold text-gray-600 mb-1.5"
                ><p>Member Since</p>
                <p>:</p></label
              >
              <div
                class="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-700"
              >
                {{ formatDate(user.created_at) }}
              </div>
            </div>

            <!-- Error -->
            <p
              v-if="updateUserError"
              class="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2"
            >
              {{ updateUserError }}
            </p>
          </div>

          <!-- Footer Buttons -->
          <div class="px-6 py-4 flex justify-center gap-3">
            <!-- VIEW mode -->
            <template v-if="!isEdit">
              <BaseButton variant="outline" @click="handleClose"> Close </BaseButton>
              <BaseButton variant="primary" @click="enterEditMode" class="px-6"> Edit </BaseButton>
            </template>

            <!-- EDIT mode -->
            <template v-else>
              <BaseButton
                variant="outline"
                @click="handleClose"
                :disabled="updateUserMutation.isPending.value"
              >
                Batal
              </BaseButton>
              <BaseButton
                variant="primary"
                @click="handleSave"
                :loading="updateUserMutation.isPending.value"
                :disabled="updateUserMutation.isPending.value || !isDirty"
              >
                Simpan
              </BaseButton>
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
