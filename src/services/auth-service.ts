import {
  browserLocalPersistence,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth'
import { readonly, ref } from 'vue'

import {
  firebaseConfigurationError,
  getFirebaseAuth,
  isFirebaseConfigured,
} from '@/services/firebase'

const currentUser = ref<User | null>(null)
const isAuthReady = ref(false)
let initializationPromise: Promise<void> | null = null

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export const initializeAuth = (): Promise<void> => {
  if (initializationPromise) {
    return initializationPromise
  }

  if (!isFirebaseConfigured) {
    isAuthReady.value = true
    initializationPromise = Promise.resolve()
    return initializationPromise
  }

  const auth = getFirebaseAuth()

  initializationPromise = setPersistence(auth, browserLocalPersistence)
    .then(
      () =>
        new Promise<void>((resolve) => {
          onAuthStateChanged(auth, (user) => {
            currentUser.value = user
            isAuthReady.value = true
            resolve()
          })
        }),
    )
    .catch(() => {
      isAuthReady.value = true
    })

  return initializationPromise
}

export const signIn = async (email: string, password: string): Promise<void> => {
  if (!isFirebaseConfigured) {
    throw new Error(firebaseConfigurationError ?? 'Firebase is not configured.')
  }

  try {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to sign in.'))
  }
}

export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!isFirebaseConfigured) {
    throw new Error(firebaseConfigurationError ?? 'Firebase is not configured.')
  }

  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email)
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to send the password reset email.'))
  }
}

export const signOutUser = async (): Promise<void> => {
  if (!isFirebaseConfigured) {
    return
  }

  await signOut(getFirebaseAuth())
}

export const useAuth = () => ({
  currentUser: readonly(currentUser),
  isAuthReady: readonly(isAuthReady),
})
