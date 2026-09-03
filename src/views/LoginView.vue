<template>
  <main class="flex min-h-screen items-center justify-center bg-base-200 px-8 py-12">
    <section
      class="w-full max-w-md rounded-md bg-base-100 p-10 shadow-xl"
      aria-labelledby="login-title"
    >
      <p class="text-sm font-bold tracking-[0.22em] text-primary">CYCLE</p>
      <h1 id="login-title" class="mt-3 text-3xl font-bold text-base-content">Welcome back</h1>
      <p class="mt-2 text-sm text-base-content/65">Sign in to access your schedule.</p>

      <div v-if="firebaseConfigurationError" class="alert alert-warning mt-8 text-sm">
        {{ firebaseConfigurationError }}
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSignIn">
        <label class="form-control w-full gap-2">
          <span class="label-text font-semibold">Email address</span>
          <AppInput v-model="email" type="email" autocomplete="email" required />
        </label>

        <div class="form-control w-full gap-2">
          <span class="label-text font-semibold">Password</span>
          <AppInput
            v-model="password"
            :type="passwordInputType"
            autocomplete="current-password"
            required
          />
          <label class="label cursor-pointer justify-start gap-3 py-1">
            <input v-model="showPassword" type="checkbox" class="checkbox checkbox-sm" />
            <span class="label-text">Show password</span>
          </label>
        </div>

        <p v-if="message" class="text-sm" :class="messageToneClass" role="status">{{ message }}</p>

        <AppButton
          full-width
          :disabled="isSubmitting || Boolean(firebaseConfigurationError)"
          type="submit"
        >
          {{ isSubmitting ? 'Signing in…' : 'Sign in' }}
        </AppButton>
      </form>

      <button
        type="button"
        class="btn btn-ghost mt-4 w-full text-sm"
        :disabled="isSubmitting || Boolean(firebaseConfigurationError)"
        @click="handlePasswordReset"
      >
        Forgot your password?
      </button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import AppButton from '@/components/generic/AppButton.vue'
import AppInput from '@/components/generic/AppInput.vue'
import { sendPasswordReset, signIn } from '@/services/auth-service'
import { firebaseConfigurationError } from '@/services/firebase'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const message = ref('')
const isError = ref(false)

const messageToneClass = computed(() => (isError.value ? 'text-error' : 'text-success'))
const passwordInputType = computed(() => (showPassword.value ? 'text' : 'password'))

const handleSignIn = async () => {
  isSubmitting.value = true
  message.value = ''

  try {
    await signIn(email.value, password.value)
    await router.replace({ name: 'onboarding' })
  } catch (error) {
    isError.value = true
    message.value = error instanceof Error ? error.message : 'Unable to sign in.'
  } finally {
    isSubmitting.value = false
  }
}

const handlePasswordReset = async () => {
  if (!email.value) {
    isError.value = true
    message.value = 'Enter your email address first.'
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    await sendPasswordReset(email.value)
    isError.value = false
    message.value = 'If an account exists, a password reset email has been sent.'
  } catch (error) {
    isError.value = true
    message.value =
      error instanceof Error ? error.message : 'Unable to send the password reset email.'
  } finally {
    isSubmitting.value = false
  }
}
</script>
