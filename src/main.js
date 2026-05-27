import { createApp } from 'vue'
import TDesign from 'tdesign-vue-next'

import 'tdesign-vue-next/es/style/index.css'
import './styles/theme.css'
import './styles/window.css'
import './styles/splash.css'
import './styles/setup.css'

import App from './App.vue'
import { setupI18n } from './i18n'

const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)')

const applySystemTheme = () => {
  const themeMode = systemThemeQuery.matches ? 'dark' : 'light'

  document.documentElement.setAttribute('theme-mode', themeMode)
  document.documentElement.style.colorScheme = themeMode
}

applySystemTheme()
systemThemeQuery.addEventListener('change', applySystemTheme)

const bootstrap = async () => {
  const app = createApp(App)
  const i18n = await setupI18n()

  app.use(i18n)
  app.use(TDesign)
  app.mount('#app')
}

bootstrap()
