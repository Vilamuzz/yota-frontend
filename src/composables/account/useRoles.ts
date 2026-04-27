import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { accountService } from '@/services/account.service'
import type { ApiError } from '@/types/response'
import type { RolesResponse } from '@/types/account'

export const useRoles = () => {
  const rolesQuery = useQuery<RolesResponse, ApiError>({
    queryKey: ['roles'],
    queryFn: () => accountService.getRoles(),
  })

  const roles = computed(() => rolesQuery.data.value?.data?.roles || [])

  return {
    rolesQuery,
    roles,
    isLoading: rolesQuery.isPending,
  }
}
