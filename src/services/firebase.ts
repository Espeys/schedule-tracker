import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missingConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

export const isFirebaseConfigured = missingConfigKeys.length === 0

export const firebaseConfigurationError = isFirebaseConfigured
  ? null
  : `Firebase is not configured. Add ${missingConfigKeys.join(', ')} to .env.local.`

let firebaseApp: FirebaseApp | null = null

const getFirebaseApp = (): FirebaseApp => {
  if (!isFirebaseConfigured) {
    throw new Error(firebaseConfigurationError ?? 'Firebase is not configured.')
  }

  firebaseApp ??= getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

  return firebaseApp
}

export const getFirebaseAuth = (): Auth => getAuth(getFirebaseApp())

export const getFirebaseFirestore = (): Firestore => getFirestore(getFirebaseApp())
