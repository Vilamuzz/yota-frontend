import { DonationProgramStatusEnum } from '@/types/donationProgram'
import { TransactionStatus } from '@/types/donationProgramTransaction'
import { MediaStatus } from '@/types/media'
import { SocialProgramStatusEnum } from '@/types/socialProgram'
import { SocialProgramSubscriptionStatus } from '@/types/socialProgramSubscription'
import { AmbulanceStatus } from '@/types/ambulance'
import { FosterChildrenCandidateStatus } from '@/types/fosterChildrenCandidate'

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case DonationProgramStatusEnum.ACTIVE:
    case TransactionStatus.SETTLEMENT:
    case MediaStatus.PUBLISHED:
    case SocialProgramStatusEnum.ACTIVE:
    case SocialProgramSubscriptionStatus.ACTIVE:
    case AmbulanceStatus.Available:
    case FosterChildrenCandidateStatus.ACCEPTED:
    case FosterChildrenCandidateStatus.SOCIAL_MANAGER_ACCEPTED:
    case 'paid':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
    case DonationProgramStatusEnum.COMPLETED:
    case SocialProgramStatusEnum.COMPLETED:
    case AmbulanceStatus.InUse:
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
    case DonationProgramStatusEnum.DRAFT:
    case TransactionStatus.PENDING:
    case MediaStatus.DRAFT:
    case SocialProgramStatusEnum.PENDING:
    case SocialProgramSubscriptionStatus.PAUSED:
    case AmbulanceStatus.Maintenance:
    case FosterChildrenCandidateStatus.PENDING:
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
    case DonationProgramStatusEnum.EXPIRED:
    case TransactionStatus.CANCEL:
    case SocialProgramStatusEnum.REJECTED:
    case SocialProgramSubscriptionStatus.INACTIVE:
    case FosterChildrenCandidateStatus.REJECTED:
    case FosterChildrenCandidateStatus.CANCELED:
    case 'overdue':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    case DonationProgramStatusEnum.ARCHIVED:
    case TransactionStatus.EXPIRED:
    case MediaStatus.ARCHIVED:
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
  }
}

export const getAccountStatusColor = (isBanned: boolean) => {
  return isBanned
    ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
    : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
}
