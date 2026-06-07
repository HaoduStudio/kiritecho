import { createApp } from 'vue'

import './styles/base.css'
import './styles/components.css'
import './styles/theme.css'
import './styles/window.css'
import './styles/splash.css'
import './styles/setup.css'
import './styles/main.css'
import './styles/ask.css'

import App from './App.vue'
import { setupI18n } from './i18n'
import { applyThemePreference, getThemePreference, watchSystemTheme } from './theme'

applyThemePreference(getThemePreference())
watchSystemTheme()

const bootstrap = async () => {
  const app = createApp(App)
  const i18n = await setupI18n()

  app.use(i18n)
  app.mount('#app')
}

bootstrap()
