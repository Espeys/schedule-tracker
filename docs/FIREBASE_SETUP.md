# Firebase setup

This app uses Firebase Authentication and Cloud Firestore directly from the Vue client.

1. In Firebase Console, register a **Web app** in the existing project.
2. Copy `.env.example` to `.env.local`, then fill each `VITE_FIREBASE_*` value from the Web app configuration. These are public client identifiers, not server secrets; `.env.local` remains ignored by Git.
3. In **Authentication → Sign-in method**, enable **Email/Password**. Create initial users in **Authentication → Users**.
4. Create the Firestore database in **Singapore (`asia-southeast1`)**.
5. Install the Firebase CLI, authenticate, then deploy the versioned rules with your explicit Firebase project ID. This avoids accidentally deploying rules to another project:

   ```powershell
   npx firebase-tools login
   npx firebase-tools deploy --only firestore:rules --project YOUR_FIREBASE_PROJECT_ID
   ```

The rules allow an authenticated user to access only `users/{uid}` and documents beneath it. The first signed-in session migrates valid local onboarding data into `users/{uid}`; future onboarding saves write there directly.
