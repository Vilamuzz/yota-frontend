import { z } from 'zod'
import { PaymentMethodFeeType } from '@/types/paymentMethod'

export const updatePaymentMethodSchema = z.object({
  feeType: z.nativeEnum(PaymentMethodFeeType, {
    required_error: 'Tipe biaya harus dipilih',
  }),
  feeValue: z.number({
    required_error: 'Nilai biaya harus diisi',
    invalid_type_error: 'Nilai biaya harus berupa angka',
  }).nonnegative('Nilai biaya tidak boleh negatif'),
  isActive: z.boolean(),
}).refine((data) => {
  if (data.feeType === PaymentMethodFeeType.Flat) {
    return data.feeValue <= 10000
  }
  if (data.feeType === PaymentMethodFeeType.Percentage) {
    return data.feeValue <= 0.05
  }
  return true
}, {
  message: 'Nilai biaya melebihi batas (Maks. 10.000 untuk flat, atau 5% / 0.05 untuk persentase)',
  path: ['feeValue'],
})

export type UpdatePaymentMethodSchema = z.infer<typeof updatePaymentMethodSchema>
