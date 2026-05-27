import { createApp } from 'vue'
import TDesign from 'tdesign-vue-next'

import 'tdesign-vue-next/es/style/index.css'
import './styles/theme.css'
import './styles/window.css'
import './styles/splash.css'
import './styles/setup.css'

import App from './App.vue'
import { setupI18n } from './i18n'
import { applyThemePreference, getThemePreference, watchSystemTheme } from './theme'

applyThemePreference(getThemePreference())
watchSystemTheme()

const bootstrap = async () => {
  const app = createApp(App)
  const i18n = await setupI18n()

  app.use(i18n)
  app.use(TDesign)
  app.mount('#app')
}

bootstrap()
