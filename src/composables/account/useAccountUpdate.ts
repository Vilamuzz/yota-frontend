import { useMutation } from '@tanstack/vue-query'
import { accountService } from '@/services/account.service'
import type { UpdateAccountRoleRequest, SetAccountBanStatusRequest } from '@/types/account'

export const useAccountUpdate = () => {
  const addRoleMutation = useMutation({
    mutationFn: ({ accountId, roleId }: { accountId: string; roleId: number }) =>
      accountService.addAccountRole(accountId, roleId),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({
      accountId,
      roleId,
      data,
    }: {
      accountId: string
      roleId: number
      data: UpdateAccountRoleRequest
    }) => accountService.updateAccountRole(accountId, roleId, data),
  })

  const updateBanStatusMutation = useMutation({
    mutationFn: ({ accountId, data }: { accountId: string; data: SetAccountBanStatusRequest }) =>
      accountService.setAccountBanStatus(accountId, data),
  })

  return {
    addRoleMutation,
    updateRoleMutation,
    updateBanStatusMutation,
  }
}
