import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramInvoiceService } from '@/services/socialProgramInvoice.service'
import type { SocialProgramInvoiceListResponse } from '@/types/socialProgramInvoice'
import type { ApiError } from '@/types/response'

export const useMySocialProgramInvoices = () => {
  const query = useQuery<SocialProgramInvoiceListResponse, ApiError>({
    queryKey: ['my-social-program-invoices'],
    queryFn: () => socialProgramInvoiceService.getMyInvoices({}),
  })

  const invoices = computed(() => query.data.value?.data?.invoices || [])

  return {
    query,
    invoices,
    isLoading: query.isPending,
  }
}
