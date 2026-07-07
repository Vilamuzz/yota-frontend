export interface PaymentMethod {
  id: string
  name: string
  feeType: PaymentMethodFeeType
  feeValue: number
  isActive: boolean
}

export enum PaymentMethodFeeType {
  Percentage = 'percentage',
  Flat = 'flat',
}
