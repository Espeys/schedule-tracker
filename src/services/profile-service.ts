import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { readonly, ref } from 'vue'

import { getFirebaseFirestore } from '@/services/firebase'
import { isValidOnboardingData } from '@/services/onboarding-data'
import type { OnboardingData } from '@/services/models/OnboardingData'
import { clearStoredOnboarding, readStoredOnboarding } from '@/services/onboarding-storage'

const PROFILE_SCHEMA_VERSION = 1
const onboardingProfile = ref<OnboardingData | null>(null)

const getProfileReference = (uid: string) => doc(getFirebaseFirestore(), 'users', uid)

export const loadOnboardingProfile = async (uid: string): Promise<OnboardingData | null> => {
  const snapshot = await getDoc(getProfileReference(uid))
  const data = snapshot.data()

  onboardingProfile.value = isValidOnboardingData(data) ? data : null

  return onboardingProfile.value
}

export const migrateStoredOnboarding = async (uid: string): Promise<OnboardingData | null> => {
  const storedOnboarding = readStoredOnboarding()
  const remoteOnboarding = await loadOnboardingProfile(uid)

  if (remoteOnboarding) {
    if (storedOnboarding) {
      clearStoredOnboarding()
    }

    return remoteOnboarding
  }

  if (!storedOnboarding) {
    return null
  }

  await setDoc(getProfileReference(uid), {
    ...storedOnboarding,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    schemaVersion: PROFILE_SCHEMA_VERSION,
  })

  onboardingProfile.value = storedOnboarding
  clearStoredOnboarding()

  return onboardingProfile.value
}

export const saveOnboardingProfile = async (
  uid: string,
  onboarding: OnboardingData,
): Promise<void> => {
  await setDoc(
    getProfileReference(uid),
    {
      ...onboarding,
      schemaVersion: PROFILE_SCHEMA_VERSION,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )

  onboardingProfile.value = onboarding
  clearStoredOnboarding()
}

export const useOnboardingProfile = () => readonly(onboardingProfile)
