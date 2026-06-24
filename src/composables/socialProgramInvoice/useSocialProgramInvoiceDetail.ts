import { useQuery } from '@tanstack/vue-query'
import { socialProgramInvoiceService } from '@/services/socialProgramInvoice.service'
import type { SocialProgramInvoiceResponse } from '@/types/socialProgramInvoice'
import type { ApiError } from '@/types/response'
import type { ComputedRef } from 'vue'

export const useSocialProgramInvoiceDetail = (id: ComputedRef<string> | string) => {
  const query = useQuery<SocialProgramInvoiceResponse, ApiError>({
    queryKey: ['social-program-invoice', id],
    queryFn: () => {
      const idValue = typeof id === 'string' ? id : id.value
      return socialProgramInvoiceService.getMyInvoiceDetail(idValue)
    },
    enabled: typeof id === 'string' ? !!id : !!id.value,
  })

  return {
    query,
    invoice: query.data,
    isLoading: query.isPending,
  }
}
