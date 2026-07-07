import type { Response } from './response'

export interface FoundationProfile {
  id: string
  foundationName: string
  founderPicture: string
  founderName: string
  foundationAddress: string
  foundationPhone: string
  foundationEmail: string
  foundationInstagram: string | null
  foundationFacebook: string | null
  foundationTwitter: string | null
  embeddedAddress: string
  logo: string
  icon: string
  organizationStructure: string
  heroImageOne: string
  heroImageTwo: string
  heroImageThree: string
  heroImageFour: string
  ppnPercentage: number
  createdAt: string
  updatedAt: string
}

export interface CreateFoundationProfileRequest {
  foundationName: string
  founderPicture: File
  founderName: string
  foundationAddress: string
  foundationPhone: string
  foundationEmail: string
  foundationInstagram?: string
  foundationFacebook?: string
  foundationTwitter?: string
  embeddedAddress: string
  logo: File
  icon: File
  organizationStructure: File
  heroImageOne: File
  heroImageTwo: File
  heroImageThree: File
  heroImageFour: File
  ppnPercentage?: number
}

export interface UpdateFoundationProfileRequest {
  foundationName?: string
  founderPicture?: File
  founderName?: string
  foundationAddress?: string
  foundationPhone?: string
  foundationEmail?: string
  foundationInstagram?: string
  foundationFacebook?: string
  foundationTwitter?: string
  embeddedAddress?: string
  logo?: File
  icon?: File
  organizationStructure?: File
  heroImageOne?: File
  heroImageTwo?: File
  heroImageThree?: File
  heroImageFour?: File
  ppnPercentage?: number
}

export type FoundationProfileResponse = Response<FoundationProfile>
