<template>
  <t-config-provider :global-config="tdesignLocale">
    <WindowChrome />
    <SplashScreen v-if="setupStep === 'splash'" @start="showLanguageSetup" />
    <LanguageSetup v-else-if="setupStep === 'language'" @back="showSplash" @next="showThemeSetup" />
    <ThemeSetup v-else-if="setupStep === 'theme'" @back="showLanguageSetup" @next="handleThemeNext" />
  </t-config-provider>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import zhCN from 'tdesign-vue-next/es/locale/zh_CN'
import zhTW from 'tdesign-vue-next/es/locale/zh_TW'
import enUS from 'tdesign-vue-next/es/locale/en_US'
import WindowChrome from './components/WindowChrome.vue'
import SplashScreen from './views/SplashScreen.vue'
import LanguageSetup from './views/LanguageSetup.vue'
import ThemeSetup from './views/ThemeSetup.vue'

const setupStep = ref('splash')
const { locale } = useI18n()

const tdesignLocales = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS
}

const tdesignLocale = computed(() => tdesignLocales[locale.value] || zhCN)

const showSplash = () => {
  setupStep.value = 'splash'
}

const showLanguageSetup = () => {
  setupStep.value = 'language'
}

const showThemeSetup = () => {
  setupStep.value = 'theme'
}

const handleThemeNext = () => {}
</script>
