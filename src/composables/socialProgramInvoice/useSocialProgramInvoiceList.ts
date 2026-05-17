import { useQuery } from '@tanstack/vue-query'
import { computed } from 'vue'
import { socialProgramInvoiceService } from '@/services/socialProgramInvoice.service'
import type { SocialProgramInvoiceQueryParams } from '@/types/socialProgramInvoice'

export const useSocialProgramInvoiceList = (
  subscriptionId: string,
  params: SocialProgramInvoiceQueryParams,
) => {
  const listQuery = useQuery({
    queryKey: ['social-program-invoices', subscriptionId, params],
    queryFn: () => socialProgramInvoiceService.getSubscriptionInvoices(subscriptionId, params),
  })

  const invoices = computed(() => listQuery.data.value?.data.invoices || [])
  const pagination = computed(() => listQuery.data.value?.data.pagination)

  return {
    listQuery,
    invoices,
    pagination,
    isLoading: listQuery.isLoading,
  }
}
