<template>
  <div class="set-wrap kt-scroll">
    <div class="view-head">
      <div class="eyebrow">{{ t('settings.eyebrow') }}</div>
      <h2 class="view-title">{{ t('settings.title') }}</h2>
    </div>
    <div class="set-inner">
      <!-- Appearance -->
      <div class="set-group-label">{{ t('settings.appearance') }}</div>
      <div class="u-card set-card">
        <div class="set-row" style="border-bottom: none">
          <span class="set-ico"><KtIcon name="palette" :size="18" /></span>
          <div class="set-copy">
            <span style="font-weight: 600; font-size: 14.5px; color: var(--ui-text-highlighted)">{{ t('settings.themeMode') }}</span>
            <span style="font-size: 12.5px; color: var(--ui-text-muted)">{{ t('settings.themeModeDesc') }}</span>
          </div>
          <div style="flex-shrink: 0">
            <div class="seg">
              <button v-for="opt in themeOptions" :key="opt.id" class="seg-btn" :data-active="currentTheme === opt.id ? 'true' : undefined" @click="handleThemeChange(opt.id)">
                <KtIcon :name="opt.icon" :size="14" /> {{ opt.label }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Account -->
      <div class="set-group-label">{{ t('settings.accountSection') }}</div>
      <div class="u-card set-card">
        <div class="set-row" style="border-bottom: none">
          <span class="u-avatar" :style="{ width: '42px', height: '42px', fontSize: '17px', background: 'linear-gradient(140deg, var(--gold-400), var(--gold-600))', color: '#1a1407' }">
            {{ accountInitial }}
          </span>
          <div class="set-copy">
            <div class="set-inline-title">
              <span style="font-weight: 700; font-size: 15px; color: var(--ui-text-highlighted)">{{ accountName }}</span>
              <span class="u-badge" data-variant="subtle">
                <KtIcon name="sparkles" :size="10" />
                {{ planName }}
              </span>
            </div>
            <span style="font-size: 13px; color: var(--ui-text-muted)">{{ accountEmail }}</span>
          </div>
          <button class="u-btn" data-variant="subtle" data-color="neutral" data-size="sm" @click="emit('logout')">
            {{ t('settings.logout') }}
          </button>
        </div>
      </div>

      <!-- About -->
      <div class="set-group-label">{{ t('settings.about') }}</div>
      <div class="u-card set-card">
        <div class="set-row" style="border-bottom: none">
          <span class="set-ico"><KtIcon name="shield" :size="18" /></span>
          <div class="set-copy">
            <span style="font-weight: 600; font-size: 14.5px; color: var(--ui-text-highlighted)">Kiritecho {{ t('settings.appName') }}</span>
            <span style="font-size: 12.5px; color: var(--ui-text-muted)">{{ t('settings.version') }}</span>
          </div>
          <button class="u-btn" data-variant="link" data-color="primary" data-size="sm" @click="loadProfile">
            {{ t('settings.checkUpdate') }}
          </button>
        </div>
      </div>

      <div style="height: 24px" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import KtIcon from '@/components/KtIcon.vue'
import { fetchCurrentUser } from '@/services/api/auth'
import { getThemePreference, setThemePreference } from '@/theme'

const props = defineProps({
  account: { type: Object, default: null }
})
const emit = defineEmits(['logout'])
const { t } = useI18n()

const profile = ref(null)
const isLoadingProfile = ref(false)
const currentTheme = ref(getThemePreference())

const themeOptions = [
  { id: 'light', icon: 'sun', label: '日间' },
  { id: 'dark', icon: 'moon', label: '暗黑' },
  { id: 'system', icon: 'monitor', label: '系统' },
]

const accountName = computed(() => profile.value?.user?.name || props.account?.name || t('account.unnamedUser'))
const accountEmail = computed(() => profile.value?.user?.email || props.account?.email || t('account.noEmail'))
const accountInitial = computed(() => accountName.value.slice(0, 1).toUpperCase())
const planName = computed(() => profile.value?.subscription?.plan?.name || 'Free')

const handleThemeChange = (value) => {
  currentTheme.value = value
  setThemePreference(value)
}

const loadProfile = async () => {
  isLoadingProfile.value = true
  try { profile.value = await fetchCurrentUser() }
  catch (error) { console.warn('Unable to load profile:', error) }
  finally { isLoadingProfile.value = false }
}

onMounted(loadProfile)
</script>
