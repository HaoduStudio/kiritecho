import { createApp } from 'vue'
import { Avatar } from 'tdesign-vue-next/es/avatar'
import { Alert } from 'tdesign-vue-next/es/alert'
import { Button } from 'tdesign-vue-next/es/button'
import { Checkbox } from 'tdesign-vue-next/es/checkbox'
import { ConfigProvider } from 'tdesign-vue-next/es/config-provider'
import { Input } from 'tdesign-vue-next/es/input'
import { Link } from 'tdesign-vue-next/es/link'
import { Radio, RadioGroup } from 'tdesign-vue-next/es/radio'
import { Select, Option } from 'tdesign-vue-next/es/select'
import { Tag } from 'tdesign-vue-next/es/tag'
import { Textarea } from 'tdesign-vue-next/es/textarea'
import TDesignChat from '@tdesign-vue-next/chat'

import './styles/base.css'
import './styles/theme.css'
import './styles/window.css'
import './styles/splash.css'
import './styles/setup.css'
import './styles/main.css'
import './styles/ask.css'

import App from './App.vue'
import { setupI18n } from './i18n'
import { applyThemePreference, getThemePreference, watchSystemTheme } from './theme'

const tdesignComponents = [
  Alert,
  Avatar,
  Button,
  Checkbox,
  ConfigProvider,
  Input,
  Link,
  Option,
  Radio,
  RadioGroup,
  Select,
  Tag,
  Textarea
]

applyThemePreference(getThemePreference())
watchSystemTheme()

const bootstrap = async () => {
  const app = createApp(App)
  const i18n = await setupI18n()

  app.use(i18n)
  app.use(TDesignChat)
  tdesignComponents.forEach((component) => {
    app.use(component)
  })
  app.mount('#app')
}

bootstrap()
