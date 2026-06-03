const { app, BrowserWindow, ipcMain, shell } = require('electron')
const fs = require('fs')
const path = require('path')

const NODE_ENV = process.env.NODE_ENV || 'production'
const isDev = NODE_ENV === 'development'
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

const getSettingsPath = () => path.join(app.getPath('userData'), 'settings.json')

const readSettings = () => {
  try {
    if (!fs.existsSync(getSettingsPath())) {
      return {}
    }

    return JSON.parse(fs.readFileSync(getSettingsPath(), 'utf8'))
  } catch (error) {
    console.error('Unable to read app settings:', error)
    return {}
  }
}

const writeSettings = (settings) => {
  try {
    fs.mkdirSync(app.getPath('userData'), { recursive: true })
    fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2), 'utf8')
  } catch (error) {
    console.error('Unable to write app settings:', error)
  }
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

const getStringValue = (value, maxLength = 2048) => {
  if (typeof value !== 'string') {
    return ''
  }

  return value.slice(0, maxLength)
}

const getNumberValue = (value) => {
  const parsedValue = Number(value)

  return Number.isFinite(parsedValue) ? parsedValue : null
}

const sanitizeAuthConfig = (auth) => {
  if (!auth || typeof auth !== 'object') {
    return null
  }

  return {
    accessToken: getStringValue(auth.accessToken),
    refreshToken: getStringValue(auth.refreshToken),
    tokenType: getStringValue(auth.tokenType, 64) || 'Bearer',
    expiresIn: getNumberValue(auth.expiresIn),
    scope: getStringValue(auth.scope, 512),
    savedAt: getStringValue(auth.savedAt, 64)
  }
}

const sanitizeAccountConfig = (account) => {
  if (!account || typeof account !== 'object') {
    return null
  }

  return {
    id: getStringValue(account.id, 128),
    name: getStringValue(account.name, 256),
    email: getStringValue(account.email, 256),
    image: getStringValue(account.image, 2048),
    planName: getStringValue(account.planName, 256) || 'Free'
  }
}

const sanitizeShortcutConfig = (shortcuts) => ({
  screenshot: getStringValue(shortcuts?.screenshot, 64),
  saveExcerpt: getStringValue(shortcuts?.saveExcerpt, 64)
})

const saveSetupConfig = (payload = {}) => {
  const settings = readSettings()
  const setupConfig = {
    auth: sanitizeAuthConfig(payload.auth),
    account: sanitizeAccountConfig(payload.account),
    shortcuts: sanitizeShortcutConfig(payload.shortcuts),
    updatedAt: getStringValue(payload.updatedAt, 64) || new Date().toISOString()
  }

  writeSettings({
    ...settings,
    setup: setupConfig
  })

  return setupConfig
}

const registerI18nHandlers = () => {
  ipcMain.handle('i18n:get-locale', () => getPreferredLocale())
  ipcMain.handle('i18n:set-locale', (event, locale) => saveLocale(locale))
}

const registerConfigHandlers = () => {
  ipcMain.handle('config:save-setup', (event, payload) => saveSetupConfig(payload))
}

const registerWindowHandlers = () => {
  ipcMain.on('app:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.on('app:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
}

const registerExternalHandlers = () => {
  ipcMain.handle('app:open-external', async (event, url) => {
    try {
      const parsedUrl = new URL(url)

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return false
      }

      await shell.openExternal(parsedUrl.toString())
      return true
    } catch (error) {
      console.warn('Unable to open external URL:', error)
      return false
    }
  })
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 980,
    height: 640,
    minWidth: 780,
    minHeight: 520,
    title: '拾帖 - Kiritecho',
    frame: false,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.setMenuBarVisibility(false)

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  return mainWindow
}

app.whenReady().then(() => {
  registerI18nHandlers()
  registerConfigHandlers()
  registerWindowHandlers()
  registerExternalHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
