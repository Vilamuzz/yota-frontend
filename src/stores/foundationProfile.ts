import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { foundationProfileService } from '@/services/foundationProfile.service'
import type { FoundationProfile } from '@/types/foundationProfile'

export const useFoundationProfileStore = defineStore('foundationProfile', () => {
  const profile = ref<FoundationProfile | null>(null)
  const isLoading = ref(false)
  const hasFetched = ref(false)

  const foundationName = computed(() => profile.value?.foundationName ?? 'Yota')
  const logo = computed(() => profile.value?.logo ?? null)
  const icon = computed(() => profile.value?.icon ?? null)
  const organizationStructure = computed(() => profile.value?.organizationStructure)
  const heroImages = computed(
    () =>
      [
        profile.value?.heroImageOne,
        profile.value?.heroImageTwo,
        profile.value?.heroImageThree,
        profile.value?.heroImageFour,
      ].filter(Boolean) as string[],
  )

  const founderName = computed(() => profile.value?.founderName ?? '')
  const founderPicture = computed(() => profile.value?.founderPicture ?? null)
  const foundationAddress = computed(() => profile.value?.foundationAddress ?? '')
  const embeddedAddress = computed(() => profile.value?.embeddedAddress ?? '')
  const foundationPhone = computed(() => profile.value?.foundationPhone ?? '')
  const foundationEmail = computed(() => profile.value?.foundationEmail ?? '')
  const foundationInstagram = computed(() => profile.value?.foundationInstagram ?? null)
  const foundationFacebook = computed(() => profile.value?.foundationFacebook ?? null)
  const foundationTwitter = computed(() => profile.value?.foundationTwitter ?? null)

  const fetchProfile = async () => {
    if (hasFetched.value || isLoading.value) return
    isLoading.value = true
    try {
      const response = await foundationProfileService.getFoundationProfile()
      profile.value = response.data ?? null
      hasFetched.value = true
    } catch {
      // Profile may not exist yet — that's fine
    } finally {
      isLoading.value = false
    }
  }

  // Call this after a successful create/update to refresh the store
  const refresh = () => {
    hasFetched.value = false
    profile.value = null
    fetchProfile()
  }

  return {
    profile,
    isLoading,
    hasFetched,
    foundationName,
    logo,
    icon,
    organizationStructure,
    heroImages,
    founderName,
    founderPicture,
    foundationAddress,
    embeddedAddress,
    foundationPhone,
    foundationEmail,
    foundationInstagram,
    foundationFacebook,
    foundationTwitter,
    fetchProfile,
    refresh,
  }
})
