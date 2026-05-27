import { createApp } from 'vue'
import { Button } from 'tdesign-vue-next/es/button'
import { Checkbox } from 'tdesign-vue-next/es/checkbox'
import { ConfigProvider } from 'tdesign-vue-next/es/config-provider'
import { Link } from 'tdesign-vue-next/es/link'
import { Radio, RadioGroup } from 'tdesign-vue-next/es/radio'

import './styles/base.css'
import './styles/theme.css'
import './styles/window.css'
import './styles/splash.css'
import './styles/setup.css'

import App from './App.vue'
import { setupI18n } from './i18n'
import { applyThemePreference, getThemePreference, watchSystemTheme } from './theme'

const tdesignComponents = [Button, Checkbox, ConfigProvider, Link, Radio, RadioGroup]

applyThemePreference(getThemePreference())
watchSystemTheme()

const bootstrap = async () => {
  const app = createApp(App)
  const i18n = await setupI18n()

  app.use(i18n)
  tdesignComponents.forEach((component) => {
    app.use(component)
  })
  app.mount('#app')
}

bootstrap()
