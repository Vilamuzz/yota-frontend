<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { UserRound, Loader2, ShieldPlus } from 'lucide-vue-next'
import { useAccountUpdate, useAccountDetail } from '@/composables/account'
import { useToast } from '@/composables/ui/useToast'
import type { AccountRole } from '@/types/account'
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useQueryClient } from '@tanstack/vue-query'
import type { Account, Role } from '@/types/account'
import { extractError } from '@/utils/error'
import type { ApiError } from '@/types/response'

interface Props {
  show: boolean
  user: Account | null
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
const { showToast } = useToast()
const { addRoleMutation, updateRoleMutation, updateBanStatusMutation } = useAccountUpdate()

const { accountDetailQuery } = useAccountDetail(computed(() => props.user?.id || ''))

const displayUser = computed(() => accountDetailQuery.data.value?.data || props.user)
const isDetailLoading = computed(() => accountDetailQuery.isLoading.value && props.show)

const localMode = ref<'view' | 'edit'>(props.mode)
const selectedRole = ref<number | undefined>(undefined)
const showAddRole = ref(false)
const newRoleId = ref<number | undefined>(undefined)

const availableRolesToAdd = computed(() => {
  if (!displayUser.value) return props.roles
  const existingRoleIds = displayUser.value.roles.map((r) => r.roleId)
  return props.roles.filter((r) => !existingRoleIds.includes(r.id))
})

watch(
  () => [displayUser.value, props.show, props.mode],
  () => {
    if (displayUser.value) {
      selectedRole.value = displayUser.value.roles.find((r) => r.isDefault)?.roleId
    }
    localMode.value = props.mode
    showAddRole.value = false
    newRoleId.value = undefined

    if (addRoleMutation.isError.value) addRoleMutation.reset()
    if (updateBanStatusMutation.isError.value) updateBanStatusMutation.reset()
    if (updateRoleMutation.isError.value) updateRoleMutation.reset()
  },
  { immediate: true },
)

const isEdit = computed(() => localMode.value === 'edit')

const handleToggleRole = (role: AccountRole) => {
  if (!displayUser.value) return

  updateRoleMutation.mutate(
    {
      accountId: displayUser.value.id,
      roleId: role.roleId,
      data: { isActive: !role.isActive },
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accountDetail', displayUser.value?.id] })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        showToast('Role status updated', 'success')
      },
      onError: (err) => {
        showToast(extractError(err as ApiError, 'Failed to update role status.'), 'error')
      },
    },
  )
}

const handleAddRole = () => {
  if (!displayUser.value || !newRoleId.value) return

  addRoleMutation.mutate(
    {
      accountId: displayUser.value.id,
      roleId: newRoleId.value,
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['accountDetail', displayUser.value?.id] })
        queryClient.invalidateQueries({ queryKey: ['accounts'] })
        showToast('New role added successfully', 'success')
        newRoleId.value = undefined
        showAddRole.value = false
      },
      onError: (err) => {
        showToast(extractError(err as ApiError, 'Failed to add role.'), 'error')
      },
    },
  )
}

const handleClose = () => {
  if (addRoleMutation.isError.value) addRoleMutation.reset()
  if (updateBanStatusMutation.isError.value) updateBanStatusMutation.reset()
  if (updateRoleMutation.isError.value) updateRoleMutation.reset()
  emit('close')
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
      v-if="show && displayUser"
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
          v-if="show && displayUser"
          class="bg-white rounded-sm shadow-2xl w-full max-w-md relative overflow-hidden dark:bg-gray-900"
        >
          <!-- Header -->
          <div class="flex flex-col items-center px-6 py-4">
            <h1 class="text-lg text-gray-900 font-sf-pro dark:text-white">Edit Peran Pengguna</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{
                isEdit
                  ? 'Atur peran pengguna sesuai dengan tanggung jawab yang diberikan.'
                  : 'User details'
              }}
            </p>
          </div>

          <!-- Body -->
          <div
            class="px-6 py-5 space-y-4 border border-gray-100 rounded-sm mx-6 relative dark:border-gray-800"
          >
            <!-- Loading state -->
            <div
              v-if="isDetailLoading"
              class="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] dark:bg-gray-900/60"
            >
              <Loader2 class="w-6 h-6 animate-spin text-primary-600 dark:text-primary-400" />
            </div>
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center dark:bg-primary-900/20"
              >
                <UserRound :size="18" class="text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 class="text-base font-semibold text-gray-900 dark:text-white">
                  {{ displayUser.username }}
                </h2>
              </div>
            </div>

            <!-- Username (read-only) -->
            <div class="flex justify-between items-center gap-2">
              <label
                class="w-1/2 flex justify-between text-xs font-semibold text-gray-600 mb-1.5 dark:text-gray-400"
              >
                <p>Username</p>
                <p>:</p></label
              >
              <div
                class="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
              >
                {{ displayUser.username }}
              </div>
            </div>

            <!-- Email (read-only) -->
            <div class="flex justify-between items-center gap-2">
              <label
                class="w-1/2 flex justify-between text-xs font-semibold text-gray-600 mb-1.5 dark:text-gray-400"
              >
                <p>Email</p>
                <p>:</p></label
              >
              <div
                class="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
              >
                {{ displayUser.email }}
              </div>
            </div>

            <!-- Roles Management -->
            <div class="space-y-3 pt-2">
              <div class="flex justify-between items-center">
                <label
                  class="text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400"
                >
                  Roles ({{ displayUser.roles.length }})
                </label>
                <button
                  v-if="isEdit && availableRolesToAdd.length > 0"
                  @click="showAddRole = !showAddRole"
                  class="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1 transition-all duration-200 dark:text-primary-400"
                >
                  <ShieldPlus :size="14" />
                  {{ showAddRole ? 'Cancel' : 'Add Role' }}
                </button>
              </div>

              <!-- List of current roles -->
              <div class="space-y-2">
                <div
                  v-for="role in displayUser.roles"
                  :key="role.roleId"
                  class="flex justify-between items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm dark:bg-gray-800 dark:border-gray-700"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-700 capitalize dark:text-gray-200">
                      {{ role.roleName.replace(/_/g, ' ') }}
                    </span>
                    <span
                      v-if="role.isDefault"
                      class="px-1.5 py-0.5 bg-primary-100 text-primary-700 text-[10px] font-bold rounded uppercase dark:bg-primary-900/40 dark:text-primary-400"
                    >
                      Default
                    </span>
                  </div>

                  <div v-if="isEdit" class="flex items-center gap-3">
                    <span
                      :class="[
                        'text-[10px] font-semibold uppercase',
                        role.isActive ? 'text-green-600' : 'text-gray-400 dark:text-gray-500',
                      ]"
                    >
                      {{ role.isActive ? 'Active' : 'Inactive' }}
                    </span>
                    <!-- Toggle Switch -->
                    <button
                      @click="handleToggleRole(role)"
                      :disabled="updateRoleMutation.isPending.value"
                      class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                      :class="role.isActive ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'"
                    >
                      <span
                        :class="role.isActive ? 'translate-x-4' : 'translate-x-1'"
                        class="inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200"
                      />
                    </button>
                  </div>
                  <div v-else>
                    <span
                      :class="[
                        'text-xs font-medium',
                        role.isActive ? 'text-green-600' : 'text-red-500 dark:text-red-400',
                      ]"
                    >
                      {{ role.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Add Role Form -->
              <Transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 -translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div
                  v-if="isEdit && showAddRole"
                  class="p-3 bg-primary-50 border border-primary-100 rounded-sm space-y-3 dark:bg-gray-800 dark:border-gray-700"
                >
                  <p class="text-xs font-semibold text-primary-700 dark:text-primary-400">
                    Add New Role
                  </p>
                  <div class="flex gap-2">
                    <select
                      v-model="newRoleId"
                      class="flex-1 px-3 py-1.5 border border-gray-300 rounded-sm text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    >
                      <option :value="undefined" disabled>Select role...</option>
                      <option v-for="role in availableRolesToAdd" :key="role.id" :value="role.id">
                        {{ role.name.charAt(0).toUpperCase() + role.name.slice(1) }}
                      </option>
                    </select>
                    <BaseButton
                      variant="primary"
                      size="sm"
                      @click="handleAddRole"
                      :loading="addRoleMutation.isPending.value"
                      :disabled="!newRoleId"
                    >
                      Add
                    </BaseButton>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- Status (read-only — change via ban/unban on the list) -->
            <div class="flex justify-between items-center gap-2">
              <label
                class="w-1/2 flex justify-between text-xs font-semibold text-gray-600 mb-1.5 dark:text-gray-400"
                ><p>Status</p>
                <p>:</p></label
              >
              <div class="flex w-1/2 justify-start items-center gap-2">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                    !displayUser.isBanned
                      ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                      : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
                  ]"
                >
                  {{ !displayUser.isBanned ? 'Active' : 'Banned' }}
                </span>
              </div>
            </div>

            <!-- Member since (view only) -->
            <div class="flex justify-between items-center gap-2" v-if="!isEdit">
              <label
                class="w-1/2 flex justify-between text-xs font-semibold text-gray-600 mb-1.5 dark:text-gray-400"
                ><p>Member Since</p>
                <p>:</p></label
              >
              <div
                class="w-1/2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-sm text-sm text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              >
                {{ formatDate(displayUser.createdAt) }}
              </div>
            </div>
          </div>

          <!-- Footer Buttons -->
          <div class="px-6 py-4 flex justify-center gap-3">
            <!-- VIEW mode -->
            <template v-if="!isEdit">
              <BaseButton variant="outline" @click="handleClose"> Close </BaseButton>
            </template>

            <!-- EDIT mode -->
            <template v-else>
              <BaseButton
                variant="outline"
                @click="handleClose"
                :disabled="addRoleMutation.isPending.value"
              >
                Selesai
              </BaseButton>
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
