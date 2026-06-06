import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { socialProgramInvoiceService } from '@/services/socialProgramInvoice.service'
import type {
  SocialProgramInvoiceQueryParams,
  SocialProgramInvoiceListResponse,
} from '@/types/socialProgramInvoice'
import type { ApiError } from '@/types/response'

export const useMySocialProgramInvoices = (
  params?: MaybeRefOrGetter<SocialProgramInvoiceQueryParams>,
  options?: { enabled?: MaybeRefOrGetter<boolean> },
) => {
  const query = useQuery<SocialProgramInvoiceListResponse, ApiError>({
    queryKey: ['my-social-program-invoices', params],
    queryFn: () => socialProgramInvoiceService.getMyInvoices(toValue(params) || {}),
    ...options,
  })

  const invoices = computed(() => query.data.value?.data?.invoices || [])

  return {
    query,
    invoices,
    isLoading: query.isPending,
  }
}
