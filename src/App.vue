<template>
  <div style="display: flex; flex-direction: column; height: 100%">
    <WindowChrome :show-brand="setupStep !== 'main'" />
    <div class="kt-scroll" style="flex: 1; min-height: 0; overflow: auto; position: relative">
      <SplashScreen v-if="setupStep === 'splash'" @start="showLanguageSetup" />
      <LanguageSetup v-else-if="setupStep === 'language'" @back="showSplash" @next="showThemeSetup" />
      <ThemeSetup v-else-if="setupStep === 'theme'" @back="showLanguageSetup" @next="handleThemeNext" />
      <AccountLogin
        v-else-if="setupStep === 'account'"
        :initial-auth="setupAuth"
        :initial-account="setupAccount"
        @back="showThemeSetup"
        @authenticated="handleAccountAuthenticated"
        @relogin="handleAccountRelogin"
      />
      <ShortcutSetup
        v-else-if="setupStep === 'shortcuts'"
        :auth="setupAuth"
        :account="setupAccount"
        @back="showAccountSetup"
        @next="handleShortcutNext"
      />
      <MainLayout
        v-else-if="setupStep === 'main'"
        :auth="setupAuth"
        :account="setupAccount"
        @logout="handleLogout"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import WindowChrome from './components/WindowChrome.vue'
import SplashScreen from './views/SplashScreen.vue'
import LanguageSetup from './views/LanguageSetup.vue'
import ThemeSetup from './views/ThemeSetup.vue'
import AccountLogin from './views/AccountLogin.vue'
import ShortcutSetup from './views/ShortcutSetup.vue'
import MainLayout from './views/MainLayout.vue'
import { clearAuthToken } from './auth/deviceAuthorization'
import { setAuthTokenGetter } from './services/api/apiClient'

const setupStep = ref('splash')
const setupAuth = ref(null)
const setupAccount = ref(null)

const showSplash = () => { setupStep.value = 'splash' }
const showLanguageSetup = () => { setupStep.value = 'language' }
const showThemeSetup = () => { setupStep.value = 'theme' }
const handleThemeNext = () => { setupStep.value = 'account' }
const showAccountSetup = () => { setupStep.value = 'account' }

const handleAccountAuthenticated = (payload) => {
  setupAuth.value = payload.auth
  setupAccount.value = payload.account
  setAuthTokenGetter(() => setupAuth.value)
  setupStep.value = 'shortcuts'
}

const handleAccountRelogin = () => {
  setupAuth.value = null
  setupAccount.value = null
  setAuthTokenGetter(null)
}

const handleShortcutNext = () => {
  setAuthTokenGetter(() => setupAuth.value)
  setupStep.value = 'main'
}

const handleLogout = () => {
  clearAuthToken()
  setAuthTokenGetter(null)
  setupAuth.value = null
  setupAccount.value = null
  setupStep.value = 'splash'
}
</script>
