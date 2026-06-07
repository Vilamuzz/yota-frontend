import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { donationProgramService } from '@/services/donationProgram.service'
import { donationProgramExpenseService } from '@/services/donationProgramExpense.service'
import { socialProgramService } from '@/services/socialProgram.service'
import { socialProgramExpenseService } from '@/services/socialProgramExpense.service'
import { fosterChildrenService } from '@/services/fosterChildren.service'
import { fosterChildrenExpenseService } from '@/services/fosterChildrenExpense.service'

export interface ReportDetail {
  title: string
  coverImage: string
  totalExpense: number
  fundTarget?: number
  collectedFund?: number
  totalSubscribers?: number
  category?: string
  meta: string
  accentColor: string
  isAvatar: boolean
  expenses: {
    id: string
    title: string
    amount: number
    expenseDate: string
    note?: string
  }[]
}

export const useReportDetail = (
  type: MaybeRefOrGetter<'donation' | 'social' | 'foster'>,
  slug: MaybeRefOrGetter<string>,
  expenseParams: MaybeRefOrGetter<any> = { limit: 100 },
) => {
  const donationDetailQuery = useQuery({
    queryKey: ['donationDetail', slug],
    queryFn: () => donationProgramService.getDonationProgramDetail(toValue(slug)),
    enabled: computed(() => toValue(type) === 'donation'),
  })

  const donationExpenseQuery = useQuery({
    queryKey: ['donationExpenses', slug, expenseParams],
    queryFn: () =>
      donationProgramExpenseService.getDonationProgramExpenses(toValue(slug), toValue(expenseParams)),
    enabled: computed(() => toValue(type) === 'donation'),
  })

  const socialDetailQuery = useQuery({
    queryKey: ['socialDetail', slug],
    queryFn: () => socialProgramService.getPublishedSocialProgramDetail(toValue(slug)),
    enabled: computed(() => toValue(type) === 'social'),
  })

  const socialExpenseQuery = useQuery({
    queryKey: ['socialExpenses', slug, expenseParams],
    queryFn: () =>
      socialProgramExpenseService.getSocialProgramExpenses(toValue(slug), toValue(expenseParams)),
    enabled: computed(() => toValue(type) === 'social'),
  })

  const fosterDetailQuery = useQuery({
    queryKey: ['fosterDetail', slug],
    queryFn: () => fosterChildrenService.getFosterChildrenDetail(toValue(slug)),
    enabled: computed(() => toValue(type) === 'foster'),
  })

  const fosterExpenseQuery = useQuery({
    queryKey: ['fosterExpenses', slug, expenseParams],
    queryFn: () =>
      fosterChildrenExpenseService.getFosterChildrenExpenses(toValue(slug), toValue(expenseParams)),
    enabled: computed(() => toValue(type) === 'foster'),
  })

  const detail = computed<ReportDetail | null>(() => {
    const currentType = toValue(type)

    if (currentType === 'donation') {
      const data = donationDetailQuery.data.value?.data
      const expenses = donationExpenseQuery.data.value?.data?.expenses || []
      if (!data) return null
      return {
        title: data.title,
        coverImage: data.coverImage,
        totalExpense: data.totalExpense || 0,
        fundTarget: data.fundTarget,
        collectedFund: data.collectedFund,
        meta: 'Program Donasi',
        accentColor: 'rose',
        isAvatar: false,
        expenses: expenses.map((e) => ({
          id: e.id,
          title: e.title,
          amount: e.amount,
          expenseDate: e.expenseDate,
          note: e.note,
        })),
      }
    }

    if (currentType === 'social') {
      const data = socialDetailQuery.data.value?.data
      const expenses = socialExpenseQuery.data.value?.data?.expenses || []
      if (!data) return null
      return {
        title: data.title,
        coverImage: data.coverImage,
        totalExpense: data.totalExpense || 0,
        totalSubscribers: data.totalSubscribers,
        meta: 'Program Sosial',
        accentColor: 'blue',
        isAvatar: false,
        expenses: expenses.map((e) => ({
          id: e.id,
          title: e.title,
          amount: e.amount,
          expenseDate: e.expenseDate,
          note: e.note,
        })),
      }
    }

    if (currentType === 'foster') {
      const data = fosterDetailQuery.data.value?.data
      const expenses = fosterExpenseQuery.data.value?.data?.expenses || []
      if (!data) return null
      return {
        title: data.name,
        coverImage: data.profilePicture,
        totalExpense: data.totalExpense || 0,
        category: data.category,
        meta: 'Anak Asuh',
        accentColor: 'emerald',
        isAvatar: true,
        expenses: expenses.map((e) => ({
          id: e.id,
          title: e.title,
          amount: e.amount,
          expenseDate: e.expenseDate,
          note: e.note,
        })),
      }
    }

    return null
  })

  const isLoading = computed(() => {
    const currentType = toValue(type)
    if (currentType === 'donation') return donationDetailQuery.isPending.value
    if (currentType === 'social') return socialDetailQuery.isPending.value
    if (currentType === 'foster') return fosterDetailQuery.isPending.value
    return false
  })

  const expensePagination = computed(() => {
    const currentType = toValue(type)
    if (currentType === 'donation') return donationExpenseQuery.data.value?.data?.pagination
    if (currentType === 'social') return socialExpenseQuery.data.value?.data?.pagination
    return fosterExpenseQuery.data.value?.data?.pagination
  })

  const isExpenseFetching = computed(() => {
    const currentType = toValue(type)
    if (currentType === 'donation') return donationExpenseQuery.isFetching.value
    if (currentType === 'social') return socialExpenseQuery.isFetching.value
    return fosterExpenseQuery.isFetching.value
  })

  const expenseData = computed(() => {
    const currentType = toValue(type)
    if (currentType === 'donation') return donationExpenseQuery.data.value?.data?.expenses || []
    if (currentType === 'social') return socialExpenseQuery.data.value?.data?.expenses || []
    return fosterExpenseQuery.data.value?.data?.expenses || []
  })

  const exportExpenses = async (params: { startDate: string; endDate: string }): Promise<Blob> => {
    const currentType = toValue(type)
    const currentSlug = toValue(slug)

    if (currentType === 'donation') {
      return donationProgramExpenseService.exportDonationProgramExpenseCSV(currentSlug, params)
    }
    if (currentType === 'social') {
      return socialProgramExpenseService.exportSocialProgramExpenseCSV(currentSlug, params)
    }
    if (currentType === 'foster') {
      return fosterChildrenExpenseService.exportFosterChildrenExpenseCSV(currentSlug, params)
    }
    throw new Error('Unsupported report type')
  }

  return {
    detail,
    isLoading,
    exportExpenses,
    expensePagination,
    isExpenseFetching,
    expenseData,
  }
}
