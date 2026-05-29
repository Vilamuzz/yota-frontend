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
) => {
  const donationDetailQuery = useQuery({
    queryKey: ['publicDonationDetail', slug],
    queryFn: () => donationProgramService.getPublishedDonationProgramDetail(toValue(slug)),
    enabled: computed(() => toValue(type) === 'donation'),
  })

  const donationExpenseQuery = useQuery({
    queryKey: ['publicDonationExpenses', slug],
    queryFn: () =>
      donationProgramExpenseService.getPublicDonationProgramExpenses(toValue(slug), { limit: 100 }),
    enabled: computed(() => toValue(type) === 'donation'),
  })

  const socialDetailQuery = useQuery({
    queryKey: ['publicSocialDetail', slug],
    queryFn: () => socialProgramService.getPublishedSocialProgramDetail(toValue(slug)),
    enabled: computed(() => toValue(type) === 'social'),
  })

  const socialExpenseQuery = useQuery({
    queryKey: ['publicSocialExpenses', slug],
    queryFn: () =>
      socialProgramExpenseService.getPublicSocialProgramExpenses(toValue(slug), { limit: 100 }),
    enabled: computed(() => toValue(type) === 'social'),
  })

  const fosterDetailQuery = useQuery({
    queryKey: ['publicFosterDetail', slug],
    queryFn: () => fosterChildrenService.getFosterChildrenDetail(toValue(slug)),
    enabled: computed(() => toValue(type) === 'foster'),
  })

  const fosterExpenseQuery = useQuery({
    queryKey: ['publicFosterExpenses', slug],
    queryFn: () =>
      fosterChildrenExpenseService.getFosterChildrenExpenses(toValue(slug), { limit: 100 }),
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
    if (currentType === 'donation') return donationDetailQuery.isPending.value || donationExpenseQuery.isPending.value
    if (currentType === 'social') return socialDetailQuery.isPending.value || socialExpenseQuery.isPending.value
    if (currentType === 'foster') return fosterDetailQuery.isPending.value || fosterExpenseQuery.isPending.value
    return false
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

  return { detail, isLoading, exportExpenses }
}

