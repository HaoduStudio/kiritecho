<template>
  <section class="settings-page">
    <header class="settings-header">
      <p class="settings-eyebrow">{{ t('settings.eyebrow') }}</p>
      <h1>{{ t('settings.title') }}</h1>
    </header>

    <t-alert
      v-if="profileError"
      theme="error"
      class="settings-alert"
      :message="profileErrorMessage"
    />

    <section class="settings-section">
      <div class="settings-account">
        <t-avatar :image="profile?.user?.image || account?.image" size="48px">
          {{ accountInitial }}
        </t-avatar>
        <div>
          <h2>{{ accountName }}</h2>
          <p>{{ accountEmail }}</p>
        </div>
      </div>
    </section>

    <section class="settings-grid">
      <div class="settings-metric">
        <span>{{ t('settings.plan') }}</span>
        <strong>{{ planName }}</strong>
      </div>
      <div class="settings-metric">
        <span>{{ t('settings.quotaBalance') }}</span>
        <strong>{{ quotaBalance }}</strong>
      </div>
      <div class="settings-metric">
        <span>{{ t('settings.usage5h') }}</span>
        <strong>{{ usage5h }}</strong>
      </div>
      <div class="settings-metric">
        <span>{{ t('settings.usage7d') }}</span>
        <strong>{{ usage7d }}</strong>
      </div>
    </section>

    <footer class="settings-actions">
      <t-button theme="default" :loading="isLoadingProfile" @click="loadProfile">
        {{ t('settings.refreshProfile') }}
      </t-button>
      <t-button theme="danger" @click="emit('logout')">
        {{ t('settings.logout') }}
      </t-button>
    </footer>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchCurrentUser } from '@/services/api/auth'
import { getApiErrorMessage } from '@/services/api/errors'

const props = defineProps({
  account: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['logout'])
const { t, locale } = useI18n()
const profile = ref(null)
const isLoadingProfile = ref(false)
const profileError = ref(null)

const accountName = computed(() => (
  profile.value?.user?.name || props.account?.name || t('account.unnamedUser')
))

const accountEmail = computed(() => (
  profile.value?.user?.email || props.account?.email || t('account.noEmail')
))

const accountInitial = computed(() => accountName.value.slice(0, 1).toUpperCase())
const planName = computed(() => profile.value?.subscription?.plan?.name || t('settings.freePlan'))
const quotaBalance = computed(() => String(profile.value?.quota?.balance ?? 0))
const usage5h = computed(() => String(profile.value?.usage_5h ?? 0))
const usage7d = computed(() => String(profile.value?.usage_7d ?? 0))

const profileErrorMessage = computed(() => (
  getApiErrorMessage(profileError.value?.code, locale.value)
))

const loadProfile = async () => {
  isLoadingProfile.value = true
  profileError.value = null

  try {
    profile.value = await fetchCurrentUser()
  } catch (error) {
    console.warn('Unable to load current profile:', error)
    profileError.value = error
  } finally {
    isLoadingProfile.value = false
  }
}

onMounted(loadProfile)
</script>
