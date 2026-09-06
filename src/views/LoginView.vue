<template>
  <main class="flex min-h-screen items-center justify-center bg-base-200 px-6 py-12">
    <section class="w-full max-w-[21.125rem]" aria-labelledby="login-title">
      <header class="text-center">
        <h1 id="login-title" class="text-[1.625rem] leading-8 font-bold text-base-content">
          Welcome back!
        </h1>
        <p class="mt-2 text-sm text-base-content">Access your schedule and stay organized</p>
      </header>

      <div v-if="firebaseConfigurationError" class="alert alert-warning mt-6 text-sm">
        {{ firebaseConfigurationError }}
      </div>

      <AppForm
        class="mt-6 space-y-4"
        :disabled="isSubmitting || Boolean(firebaseConfigurationError)"
        @submit="handleSignIn"
      >
        <label class="form-control w-full gap-2">
          <span class="label-text text-sm">Email</span>
          <AppInput
            v-model="email"
            type="email"
            placeholder="Email"
            autocomplete="email"
            :error="emailError"
            required
            @update:model-value="emailError = ''"
          />
        </label>

        <div class="form-control mt-2 w-full gap-2">
          <span class="label-text text-sm">Password</span>
          <AppInput
            v-model="password"
            :type="passwordInputType"
            placeholder="Password"
            autocomplete="current-password"
            required
          />
        </div>

        <div class="flex items-center justify-between pt-0.5">
          <label class="flex cursor-pointer items-center gap-2 text-xs text-base-content">
            <input
              v-model="showPassword"
              type="checkbox"
              class="checkbox checkbox-xs rounded-[1px] border-base-content"
            />
            <span>Show Password</span>
          </label>
          <button
            type="button"
            class="text-xs text-primary transition hover:underline focus-visible:underline focus:outline-none"
          >
            Forgot password?
          </button>
        </div>

        <AppButton
          full-width
          :disabled="isSubmitting || Boolean(firebaseConfigurationError)"
          type="button"
          @click="handleSignIn"
        >
          {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
        </AppButton>
      </AppForm>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from '@/components/generic/AppButton.vue'
import AppForm from '@/components/generic/AppForm.vue'
import AppInput from '@/components/generic/AppInput.vue'
import { signIn } from '@/services/auth-service'
import { firebaseConfigurationError } from '@/services/firebase'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const emailError = ref('')

const passwordInputType = computed(() => (showPassword.value ? 'text' : 'password'))

const handleSignIn = async () => {
  isSubmitting.value = true
  emailError.value = ''

  try {
    await signIn(email.value, password.value)
    await router.replace({ name: 'onboarding' })
  } catch (error) {
    emailError.value = getSignInErrorMessage(error)
  } finally {
    isSubmitting.value = false
  }
}

const getSignInErrorMessage = (error: unknown): string => {
  const errorMessage = error instanceof Error ? error.message : ''

  if (errorMessage.includes('auth/invalid-email')) {
    return 'Enter a valid email address.'
  }

  if (errorMessage.includes('auth/user-disabled')) {
    return 'This account has been disabled. Please contact support.'
  }

  if (errorMessage.includes('auth/too-many-requests')) {
    return 'Too many sign-in attempts. Please try again later.'
  }

  return 'We couldn’t sign you in with that email and password. Please try again.'
}

</script>
