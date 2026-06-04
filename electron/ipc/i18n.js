const { app, ipcMain } = require('electron')
const { readSettings, writeSettings } = require('./settings')

const fallbackLocale = 'zh-CN'
const supportedLocales = new Set(['zh-CN', 'zh-TW', 'en-US'])

const normalizeLocale = (locale) => {
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

  return supportedLocales.has(locale) ? locale : null
}

const getPreferredLocale = () => {
  const settingsLocale = normalizeLocale(readSettings().locale)

  return settingsLocale || normalizeLocale(app.getLocale()) || fallbackLocale
}

const saveLocale = (locale) => {
  const normalizedLocale = normalizeLocale(locale) || fallbackLocale
  const settings = readSettings()

  writeSettings({
    ...settings,
    locale: normalizedLocale
  })

  return normalizedLocale
}

const registerI18nHandlers = () => {
  ipcMain.handle('i18n:get-locale', () => getPreferredLocale())
  ipcMain.handle('i18n:set-locale', (event, locale) => saveLocale(locale))
}

module.exports = { registerI18nHandlers }
