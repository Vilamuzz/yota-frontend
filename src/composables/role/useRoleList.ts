import { ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { roleService } from '@/services/roleService'

export const useRoleList = () => {
  const roleListError = ref('')
  const roleListQuery = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      try {
        const response = await roleService.getRoles()
        return response
      } catch (err: unknown) {
        roleListError.value = err instanceof Error ? err.message : 'Failed to fetch roles'
        throw err
      }
    },
    retry: 1,
  })

  return {
    roleListError,
    roleListQuery,
  }
}
