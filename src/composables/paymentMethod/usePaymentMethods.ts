import { computed } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { paymentMethodService, type UpdatePaymentMethodRequest } from '@/services/paymentMethod.service'

export function usePaymentMethods() {
  const queryClient = useQueryClient()

  // Fetch payment methods list
  const paymentMethodsQuery = useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => paymentMethodService.getAll(),
    retry: 1,
  })

  const paymentMethods = computed(() => paymentMethodsQuery.data.value?.data || [])

  // Update payment method
  const updatePaymentMethodMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: UpdatePaymentMethodRequest }) =>
      paymentMethodService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] })
    },
  })

  return {
    paymentMethods,
    paymentMethodsQuery,
    updatePaymentMethodMutation,
  }
}
