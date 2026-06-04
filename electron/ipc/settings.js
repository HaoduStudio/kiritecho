const { app } = require('electron')
const fs = require('fs')
const path = require('path')

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

module.exports = { readSettings, writeSettings }
