<template>
  <div class="setup-container">
    <div class="setup-background">
      <div class="setup-grid" />
      <div class="setup-sheen" />
    </div>

    <div class="setup-shell">
      <header class="setup-header">
        <span class="setup-brand">{{ t('setup.brand') }}</span>
      </header>

      <main class="setup-content setup-content--compact" aria-labelledby="account-title">
        <section class="setup-panel setup-panel--narrow account-panel">
          <p class="setup-eyebrow">{{ t('account.shortTitle') }}</p>
          <h1 id="account-title" class="setup-title">{{ t('account.title') }}</h1>
          <p class="setup-description">{{ t('account.description') }}</p>

          <div class="account-device-card" aria-live="polite">
            <div v-if="isLoading" class="account-device-loading">
              <span class="account-pulse" aria-hidden="true" />
              <span>{{ t('account.requesting') }}</span>
            </div>

            <template v-else-if="deviceCode">
              <p class="account-code-label">{{ t('account.codeLabel') }}</p>
              <div
                class="account-code"
                role="button"
                tabindex="0"
                :aria-label="t('account.copyCode')"
                @click="handleCopyCode"
                @keydown.enter.prevent="handleCopyCode"
                @keydown.space.prevent="handleCopyCode"
              >
                {{ formattedUserCode }}
              </div>
              <p class="account-verify-url">{{ verificationUrlText }}</p>
              <p :class="['account-status', `account-status--${statusTone}`]">
                <span class="account-status-dot" aria-hidden="true" />
                {{ statusText }}
              </p>
            </template>

            <template v-else>
              <p class="account-status account-status--error">
                <span class="account-status-dot" aria-hidden="true" />
                {{ errorText || t('account.unavailable') }}
              </p>
            </template>
          </div>
        </section>
      </main>

      <footer class="setup-footer">
        <t-button
          theme="default"
          size="large"
          class="start-btn setup-back-btn"
          :disabled="isOpening"
          @click="handleBack"
        >
          <template #prefix>
            <ArrowLeftIcon />
          </template>
          {{ t('setup.back') }}
        </t-button>

        <t-button
          theme="primary"
          size="large"
          class="start-btn setup-next-btn"
          :disabled="!browserUrl || isLoading"
          :loading="isOpening"
          @click="handleOpenBrowser"
        >
          {{ t('account.openBrowser') }}
          <template #suffix>
            <ArrowRightIcon />
          </template>
        </t-button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessagePlugin } from 'tdesign-vue-next/es/message'
import ArrowLeftIcon from 'tdesign-icons-vue-next/esm/components/arrow-left.js'
import ArrowRightIcon from 'tdesign-icons-vue-next/esm/components/arrow-right.js'
import {
  authConfig,
  getBrowserVerificationUrl,
  pollDeviceToken,
  requestDeviceCode,
  saveAuthToken
} from '@/auth/deviceAuthorization'

const { t } = useI18n()
const emit = defineEmits(['back', 'authenticated'])

const isLoading = ref(true)
const isOpening = ref(false)
const deviceCode = ref('')
const userCode = ref('')
const browserUrl = ref('')
const verificationUrl = ref('')
const pollIntervalSeconds = ref(5)
const pollTimer = ref(null)
const errorText = ref('')
const authState = ref('requesting')

const formattedUserCode = computed(() => userCode.value.replace(/[-\s]/g, '').toUpperCase())

const verificationUrlText = computed(() => verificationUrl.value || browserUrl.value)

const statusTone = computed(() => {
  if (authState.value === 'approved') return 'success'
  if (authState.value === 'error') return 'error'
  return 'pending'
})

const statusText = computed(() => {
  if (authState.value === 'approved') return t('account.authorized')
  if (authState.value === 'error') return errorText.value || t('account.failed')
  return t('account.waiting')
})

const clearPollTimer = () => {
  if (!pollTimer.value) return

  window.clearTimeout(pollTimer.value)
  pollTimer.value = null
}

const schedulePoll = () => {
  clearPollTimer()
  pollTimer.value = window.setTimeout(handlePollToken, pollIntervalSeconds.value * 1000)
}

const getPollErrorText = (code) => {
  if (code === 'access_denied') return t('account.denied')
  if (code === 'expired_token') return t('account.expired')
  if (code === 'missing_base_url') return t('account.missingBaseUrl')

  return t('account.failed')
}

const writeClipboardText = async (value) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-999px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()

  try {
    const didCopy = document.execCommand('copy')

    if (!didCopy) {
      throw new Error('copy_failed')
    }
  } finally {
    document.body.removeChild(textarea)
  }
}

const handleCopyCode = async () => {
  if (!formattedUserCode.value) return

  try {
    await writeClipboardText(formattedUserCode.value)
    MessagePlugin.success({
      content: t('account.copied'),
      duration: 1800
    })
  } catch (error) {
    console.warn('Unable to copy device code:', error)
    MessagePlugin.error({
      content: t('account.copyFailed'),
      duration: 2200
    })
  }
}

const handlePollToken = async () => {
  if (!deviceCode.value || authState.value === 'approved') {
    return
  }

  try {
    const data = await pollDeviceToken(deviceCode.value)

    if (data?.access_token) {
      saveAuthToken(data)
      authState.value = 'approved'
      emit('authenticated', data)
      return
    }

    schedulePoll()
  } catch (error) {
    if (error.code === 'authorization_pending') {
      schedulePoll()
      return
    }

    if (error.code === 'slow_down') {
      pollIntervalSeconds.value += 5
      schedulePoll()
      return
    }

    authState.value = 'error'
    errorText.value = getPollErrorText(error.code)
  }
}

const startDeviceFlow = async () => {
  isLoading.value = true
  errorText.value = ''
  authState.value = 'requesting'
  clearPollTimer()

  try {
    if (!authConfig.authBaseUrl) {
      throw Object.assign(new Error('missing_base_url'), { code: 'missing_base_url' })
    }

    const data = await requestDeviceCode()

    deviceCode.value = data.device_code
    userCode.value = data.user_code
    verificationUrl.value = data.verification_uri
    browserUrl.value = getBrowserVerificationUrl(data)
    pollIntervalSeconds.value = Number(data.interval) || 5
    authState.value = 'pending'
    schedulePoll()
  } catch (error) {
    authState.value = 'error'
    errorText.value = getPollErrorText(error.code)
  } finally {
    isLoading.value = false
  }
}

const handleOpenBrowser = async () => {
  if (!browserUrl.value) return

  isOpening.value = true

  try {
    if (window.electronAPI?.openExternal) {
      const didOpen = await window.electronAPI.openExternal(browserUrl.value)

      if (!didOpen) {
        throw new Error('open_external_failed')
      }

      return
    }

    window.open(browserUrl.value, '_blank', 'noopener,noreferrer')
  } catch (error) {
    console.warn('Unable to open verification URL:', error)
    errorText.value = t('account.openFailed')
    authState.value = 'error'
  } finally {
    isOpening.value = false
  }
}

const handleBack = () => {
  clearPollTimer()
  emit('back')
}

onMounted(startDeviceFlow)
onBeforeUnmount(clearPollTimer)
</script>
