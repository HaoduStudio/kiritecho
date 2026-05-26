import { createApp } from 'vue'
import TDesign from 'tdesign-vue-next'

import 'tdesign-vue-next/es/style/index.css'
import './styles/theme.css'
import './styles/splash.css'

import App from './App.vue'

const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

const applySystemTheme = () => {
  const themeMode = systemThemeQuery.matches ? 'dark' : 'light'

  document.documentElement.setAttribute('theme-mode', themeMode)
  document.documentElement.style.colorScheme = themeMode
}

applySystemTheme()
systemThemeQuery.addEventListener('change', applySystemTheme)

createApp(App).use(TDesign).mount('#app')
