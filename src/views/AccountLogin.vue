<template>
  <div class="ob-shell" style="animation: kt-fade .35s ease both">
    <div class="ob-body" :style="accountStage === 'confirm' ? { alignItems: 'center', textAlign: 'center' } : {}">
      <div class="ob-head" :style="accountStage === 'confirm' ? { alignItems: 'center' } : {}">
        <div class="eyebrow">{{ t('account.shortTitle') }}</div>
        <h1 class="ob-title">{{ titleText }}</h1>
        <p class="ob-sub">{{ descriptionText }}</p>
      </div>
      <div class="ob-content" :style="accountStage === 'confirm' ? { display: 'flex', justifyContent: 'center', alignItems: 'center' } : {}">
        <!-- Device code screen -->
        <div v-if="accountStage === 'device'" style="display: flex; justify-content: center">
          <div class="u-card" style="width: min(560px, 100%); padding: 32px 28px; text-align: center; background: var(--ui-bg-muted)">
            <div v-if="isLoading" style="display: flex; align-items: center; justify-content: center; gap: 12px; min-height: 160px; color: var(--ui-text-muted); font-size: 16px">
              <KtIcon name="loader" :size="14" class-name="u-spinner" />
              <span>{{ t('account.requesting') }}</span>
            </div>

            <template v-else-if="deviceCode">
              <div style="font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ui-text-muted); margin-bottom: 18px">
                {{ t('account.codeLabel') }}
              </div>
              <div class="dl-code-wrap">
                <button class="dl-code-button" type="button" :aria-label="t('account.copyCode')" @click="handleCopyCode">
                  {{ displayedUserCode }}
                </button>
              </div>
              <div v-if="copyFeedback" :class="['u-alert', copyFeedbackKind]" role="alert">
                <KtIcon :name="copyFeedbackKind === 'success' ? 'check' : 'x'" :size="15" :stroke-width="2.5" />
                <span>{{ copyFeedback }}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 16px; color: var(--ui-text-muted); font-size: 13px">
                <KtIcon name="globe" :size="14" />
                <span style="font-family: var(--ui-font-mono)">{{ verificationUrlText }}</span>
              </div>
              <div class="u-divider" style="margin: 20px 0 16px" />
              <div class="dl-status" :data-ok="authState === 'approved'">
                <template v-if="authState === 'approved'">
                  <KtIcon name="check" :size="15" :stroke-width="3" />
                  {{ t('account.authorized') }}
                </template>
                <template v-else-if="authState === 'error'">
                  <span>{{ errorText || t('account.failed') }}</span>
                </template>
                <template v-else>
                  <KtIcon name="loader" :size="14" class-name="u-spinner" />
                  {{ t('account.waiting') }}
                </template>
              </div>
            </template>

            <template v-else>
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 100px; color: var(--ui-text-muted)">
                {{ errorText || t('account.unavailable') }}
              </div>
            </template>
          </div>
        </div>

        <!-- Account confirm screen -->
        <div v-else class="u-card ac-card">
          <div v-if="isProfileLoading" style="display: flex; align-items: center; gap: 12px; color: var(--ui-text-muted)">
            <KtIcon name="loader" :size="14" class-name="u-spinner" />
            <span>{{ t('account.loadingProfile') }}</span>
          </div>
          <template v-else-if="accountProfile">
            <span class="u-avatar" :style="{ width: '56px', height: '56px', fontSize: '22px', background: 'linear-gradient(140deg, var(--gold-400), var(--gold-600))', color: '#1a1407' }">
              {{ avatarInitial }}
            </span>
            <div class="ac-profile">
              <div class="ac-profile-name">
                <span style="font-weight: 700; font-size: 19px; color: var(--ui-text-highlighted)">{{ accountName }}</span>
                <span class="u-badge" data-variant="subtle">
                  <KtIcon name="sparkles" :size="11" />
                  {{ accountPlanName }}
                </span>
              </div>
              <span style="font-size: 14px; color: var(--ui-text-muted)">{{ accountEmail }}</span>
            </div>
          </template>
          <template v-else>
            <span style="color: var(--ui-text-muted)">{{ profileErrorText || t('account.profileFailed') }}</span>
          </template>
        </div>
      </div>
    </div>
    <div class="ob-footer">
      <div style="width: 180px; max-width: 30%">
        <div class="u-stepper">
          <span v-for="i in stepCount" :key="i" class="u-step-dot" :data-state="i - 1 < stepIndex ? 'done' : i - 1 === stepIndex ? 'active' : 'todo'" />
        </div>
      </div>
      <div style="display: flex; gap: 10px">
        <template v-if="accountStage === 'device'">
          <button class="u-btn" data-variant="subtle" data-color="neutral" data-size="lg" :disabled="isOpening" @click="handleBack">
            <KtIcon name="arrow-left" :size="17" />
            {{ t('setup.back') }}
          </button>
          <button class="u-btn" data-variant="solid" data-color="primary" data-size="lg" :disabled="!browserUrl || isLoading" @click="handleOpenBrowser">
            {{ t('account.openBrowser') }}
            <KtIcon name="external" :size="17" />
          </button>
        </template>
        <template v-else>
          <button class="u-btn" data-variant="subtle" data-color="neutral" data-size="lg" :disabled="isConfirming || isProfileLoading" @click="handleRelogin">
            {{ t('account.relogin') }}
          </button>
          <button class="u-btn" data-variant="solid" data-color="primary" data-size="lg" :disabled="!accountProfile || isProfileLoading" @click="handleConfirmAccount">
            {{ t('account.confirmNext') }}
            <KtIcon name="arrow-right" :size="17" />
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import KtIcon from '@/components/KtIcon.vue'
import {
  authConfig,
  clearAuthToken,
  fetchCurrentUser,
  getBrowserVerificationUrl,
  pollDeviceToken,
  requestDeviceCode,
  saveAuthToken
} from '@/auth/deviceAuthorization'

const { t } = useI18n()
const props = defineProps({
  initialAuth: { type: Object, default: null },
  initialAccount: { type: Object, default: null }
})
const emit = defineEmits(['back', 'authenticated', 'relogin'])

const stepIndex = 2
const stepCount = 5

const accountStage = ref('device')
const isLoading = ref(true)
const isOpening = ref(false)
const isProfileLoading = ref(false)
const isConfirming = ref(false)
const deviceCode = ref('')
const userCode = ref('')
const browserUrl = ref('')
const verificationUrl = ref('')
const pollIntervalSeconds = ref(5)
const pollTimer = ref(null)
const errorText = ref('')
const profileErrorText = ref('')
const authState = ref('requesting')
const authToken = ref(null)
const accountProfile = ref(null)
const copyFeedback = ref('')
const copyFeedbackKind = ref('success')
const copyFeedbackTimer = ref(null)

const titleText = computed(() => accountStage.value === 'confirm' ? t('account.confirmTitle') : t('account.title'))
const descriptionText = computed(() => accountStage.value === 'confirm' ? t('account.confirmDescription') : t('account.description'))
const formattedUserCode = computed(() => userCode.value.replace(/[-\s]/g, '').toUpperCase())
const displayedUserCode = computed(() => {
  const code = formattedUserCode.value
  return code.length > 4 ? code.replace(/(.{4})/g, '$1 ').trim() : code
})
const verificationUrlText = computed(() => verificationUrl.value || browserUrl.value)
const accountName = computed(() => accountProfile.value?.name || t('account.unnamedUser'))
const accountEmail = computed(() => accountProfile.value?.email || t('account.noEmail'))
const accountPlanName = computed(() => accountProfile.value?.planName || 'Free')
const avatarInitial = computed(() => Array.from(accountName.value.trim())[0]?.toUpperCase() || 'K')

const clearPollTimer = () => { if (pollTimer.value) { window.clearTimeout(pollTimer.value); pollTimer.value = null } }
const clearCopyFeedbackTimer = () => { if (copyFeedbackTimer.value) { window.clearTimeout(copyFeedbackTimer.value); copyFeedbackTimer.value = null } }
const schedulePoll = () => { clearPollTimer(); pollTimer.value = window.setTimeout(handlePollToken, pollIntervalSeconds.value * 1000) }

const showCopyFeedback = (message, kind = 'success') => {
  clearCopyFeedbackTimer()
  copyFeedback.value = message
  copyFeedbackKind.value = kind
  copyFeedbackTimer.value = window.setTimeout(() => {
    copyFeedback.value = ''
    copyFeedbackTimer.value = null
  }, 1800)
}

const getPollErrorText = (code) => {
  if (code === 'access_denied') return t('account.denied')
  if (code === 'expired_token') return t('account.expired')
  if (code === 'missing_base_url') return t('account.missingBaseUrl')
  return t('account.failed')
}

const getProfileErrorText = (code) => {
  if (code === 'missing_api_base_url') return t('account.missingApiBaseUrl')
  if (code === 'missing_access_token' || code === 'http_401') return t('account.profileUnauthorized')
  return t('account.profileFailed')
}

const normalizeAccountProfile = (data) => {
  const user = data?.user || {}
  return { id: user.id || '', name: user.name || '', email: user.email || '', image: user.image || '', planName: data?.subscription?.plan?.name || 'Free' }
}

const handleCopyCode = async () => {
  if (!formattedUserCode.value) return
  try {
    await navigator.clipboard.writeText(formattedUserCode.value)
    showCopyFeedback(t('account.copied'), 'success')
  } catch {
    showCopyFeedback(t('account.copyFailed'), 'error')
  }
}

const loadAccountProfile = async () => {
  isProfileLoading.value = true; profileErrorText.value = ''; accountProfile.value = null
  try { const data = await fetchCurrentUser(authToken.value); accountProfile.value = normalizeAccountProfile(data) }
  catch (error) { profileErrorText.value = getProfileErrorText(error.code) }
  finally { isProfileLoading.value = false }
}

const handlePollToken = async () => {
  if (!deviceCode.value || authState.value === 'approved') return
  try {
    const data = await pollDeviceToken(deviceCode.value)
    if (data?.access_token) { clearPollTimer(); authToken.value = saveAuthToken(data); authState.value = 'approved'; accountStage.value = 'confirm'; await loadAccountProfile(); return }
    schedulePoll()
  } catch (error) {
    if (error.code === 'authorization_pending') { schedulePoll(); return }
    if (error.code === 'slow_down') { pollIntervalSeconds.value += 5; schedulePoll(); return }
    authState.value = 'error'; errorText.value = getPollErrorText(error.code)
  }
}

const startDeviceFlow = async () => {
  accountStage.value = 'device'; isLoading.value = true; errorText.value = ''; profileErrorText.value = ''
  accountProfile.value = null; authToken.value = null; authState.value = 'requesting'
  deviceCode.value = ''; userCode.value = ''; browserUrl.value = ''; verificationUrl.value = ''; clearPollTimer()
  try {
    if (!authConfig.authBaseUrl) throw Object.assign(new Error('missing_base_url'), { code: 'missing_base_url' })
    const data = await requestDeviceCode()
    deviceCode.value = data.device_code; userCode.value = data.user_code; verificationUrl.value = data.verification_uri
    browserUrl.value = getBrowserVerificationUrl(data); pollIntervalSeconds.value = Number(data.interval) || 5
    authState.value = 'pending'; schedulePoll()
  } catch (error) { authState.value = 'error'; errorText.value = getPollErrorText(error.code) }
  finally { isLoading.value = false }
}

const handleOpenBrowser = async () => {
  if (!browserUrl.value) return; isOpening.value = true
  try {
    if (window.electronAPI?.openExternal) { await window.electronAPI.openExternal(browserUrl.value); return }
    window.open(browserUrl.value, '_blank', 'noopener,noreferrer')
  } catch { errorText.value = t('account.openFailed'); authState.value = 'error' }
  finally { isOpening.value = false }
}

const handleRelogin = async () => { clearAuthToken(); authToken.value = null; emit('relogin'); await startDeviceFlow() }

const handleConfirmAccount = () => {
  if (!authToken.value || !accountProfile.value) return
  isConfirming.value = true
  emit('authenticated', { auth: authToken.value, account: accountProfile.value })
}

const handleBack = () => { clearPollTimer(); emit('back') }

onMounted(() => {
  if (props.initialAuth && props.initialAccount) {
    authToken.value = props.initialAuth; accountProfile.value = props.initialAccount
    authState.value = 'approved'; accountStage.value = 'confirm'; isLoading.value = false; return
  }
  startDeviceFlow()
})
onBeforeUnmount(() => {
  clearPollTimer()
  clearCopyFeedbackTimer()
})
</script>
