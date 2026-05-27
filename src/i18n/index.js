import { createI18n } from 'vue-i18n'
import { messages } from './messages'

export const fallbackLocale = 'zh-CN'

export const localeOptions = [
  {
    value: 'zh-CN',
    nativeName: '简体中文',
    country: 'cn'
  },
  {
    value: 'zh-TW',
    nativeName: '繁體中文',
    country: 'hk'
  },
  {
    value: 'en-US',
    nativeName: 'English',
    country: 'us'
  }
]

export const supportedLocales = localeOptions.map((option) => option.value)

const storageKey = 'kiritecho.locale'

export const normalizeLocale = (locale) => {
  if (!locale || typeof locale !== 'string') {
    return null
  }

  const normalized = locale.replace('_', '-').toLowerCase()

  if (normalized === 'zh-cn' || normalized === 'zh-hans' || normalized.startsWith('zh-hans-')) {
    return 'zh-CN'
  }

  if (
    normalized === 'zh-tw' ||
    normalized === 'zh-hant' ||
    normalized.startsWith('zh-hant-') ||
    normalized.startsWith('zh-hk') ||
    normalized.startsWith('zh-mo')
  ) {
    return 'zh-TW'
  }

  if (normalized.startsWith('zh')) {
    return 'zh-CN'
  }

  if (normalized.startsWith('en')) {
    return 'en-US'
  }

  return supportedLocales.includes(locale) ? locale : null
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: fallbackLocale,
  fallbackLocale,
  messages
})

const getBrowserLocale = () => {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language]

  for (const language of languages) {
    const normalized = normalizeLocale(language)
    if (normalized) return normalized
  }

  return fallbackLocale
}

const loadInitialLocale = async () => {
  try {
    const electronLocale = await window.electronAPI?.i18n?.getLocale?.()
    const normalizedElectronLocale = normalizeLocale(electronLocale)
    if (normalizedElectronLocale) return normalizedElectronLocale
  } catch (error) {
    console.warn('Unable to read Electron locale preference:', error)
  }

  try {
    const storedLocale = normalizeLocale(localStorage.getItem(storageKey))
    if (storedLocale) return storedLocale
  } catch (error) {
    console.warn('Unable to read browser locale preference:', error)
  }

  return getBrowserLocale()
}

export const setAppLocale = async (locale, options = {}) => {
  const { persist = true } = options
  const normalizedLocale = normalizeLocale(locale) || fallbackLocale

  i18n.global.locale.value = normalizedLocale
  document.documentElement.lang = normalizedLocale
  document.title = i18n.global.t('app.title')

  if (persist) {
    try {
      await window.electronAPI?.i18n?.setLocale?.(normalizedLocale)
    } catch (error) {
      console.warn('Unable to persist Electron locale preference:', error)
    }

    try {
      localStorage.setItem(storageKey, normalizedLocale)
    } catch (error) {
      console.warn('Unable to persist browser locale preference:', error)
    }
  }

  return normalizedLocale
}

export const setupI18n = async () => {
  const initialLocale = await loadInitialLocale()
  await setAppLocale(initialLocale, { persist: false })

  return i18n
}
