const { ipcMain } = require('electron')
const { readSettings, writeSettings } = require('./settings')

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

const registerConfigHandlers = () => {
  ipcMain.handle('config:save-setup', (event, payload) => saveSetupConfig(payload))
}

module.exports = { registerConfigHandlers }
