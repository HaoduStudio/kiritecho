<template>
  <div class="kt-titlebar">
    <div style="display: flex; align-items: center; gap: 12px; min-width: 0">
      <KtLogo v-if="showBrand" :size="22" />
    </div>
    <div style="display: flex; align-items: center; gap: 4px; height: 100%; -webkit-app-region: no-drag">
      <button
        class="wc-icon"
        :title="t('window.toggleTheme')"
        style="margin-right: 6px"
        @click="toggleTheme"
      >
        <KtIcon :name="resolvedTheme === 'dark' ? 'sun' : 'moon'" :size="17" />
      </button>
      <button class="wc-win" title="Minimize" @click="minimizeWindow">
        <KtIcon name="minus" :size="16" />
      </button>
      <button class="wc-win" title="Maximize">
        <span style="display: inline-block; width: 11px; height: 11px; border: 1.5px solid currentColor; border-radius: 2px" />
      </button>
      <button class="wc-win wc-win-close" title="Close" @click="closeWindow">
        <KtIcon name="x" :size="16" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import KtIcon from './KtIcon.vue'
import KtLogo from './KtLogo.vue'
import { getThemePreference, resolveThemeMode, setThemePreference } from '@/theme'

const { t } = useI18n()

defineProps({
  showBrand: { type: Boolean, default: true }
})

const resolvedTheme = resolveThemeMode()

const toggleTheme = () => {
  const current = resolveThemeMode(getThemePreference())
  setThemePreference(current === 'dark' ? 'light' : 'dark')
  window.location.reload()
}

const minimizeWindow = () => {
  window.electronAPI?.send?.('app:minimize')
}

const closeWindow = () => {
  window.electronAPI?.send?.('app:close')
}
</script>
