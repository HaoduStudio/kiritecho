const { BrowserWindow, ipcMain } = require('electron')
const crypto = require('crypto')
const { updateShortcuts, unregisterAll } = require('../capture/shortcuts')
const { readText, readHTML, hasHTML } = require('../capture/clipboard')
const { captureScreen } = require('../capture/screenshot')
const { readSettings } = require('./settings')

const sendToRenderer = (channel, payload) => {
  const windows = BrowserWindow.getAllWindows()

  for (const win of windows) {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload)
    }
  }
}

const makePayloadId = () => `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`

const handleScreenshot = async () => {
  try {
    const result = await captureScreen()

    sendToRenderer('capture:screenshot', {
      id: makePayloadId(),
      type: 'image',
      source: 'screenshot',
      capturedAt: new Date().toISOString(),
      raw: result
    })
  } catch (error) {
    console.warn('Screenshot capture failed:', error)
  }
}

const handleSaveExcerpt = () => {
  try {
    const capturedAt = new Date().toISOString()
    const id = makePayloadId()

    if (hasHTML()) {
      const html = readHTML()

      if (html.trim()) {
        sendToRenderer('capture:save-excerpt', {
          id,
          type: 'web',
          source: 'clipboard-html',
          capturedAt,
          raw: { html }
        })
        return
      }
    }

    const text = readText()

    if (text.trim()) {
      sendToRenderer('capture:save-excerpt', {
        id,
        type: 'text',
        source: 'clipboard-text',
        capturedAt,
        raw: { text }
      })
    }
  } catch (error) {
    console.warn('Save excerpt capture failed:', error)
  }
}

const loadShortcutsFromSettings = () => {
  const settings = readSettings()
  const shortcuts = settings.setup?.shortcuts

  if (!shortcuts?.screenshot && !shortcuts?.saveExcerpt) {
    return
  }

  updateShortcuts(shortcuts, {
    onScreenshot: handleScreenshot,
    onSaveExcerpt: handleSaveExcerpt
  })
}

const registerCaptureHandlers = () => {
  ipcMain.handle('shortcut:update', (event, shortcuts) => {
    if (!shortcuts || typeof shortcuts !== 'object') {
      return false
    }

    updateShortcuts(shortcuts, {
      onScreenshot: handleScreenshot,
      onSaveExcerpt: handleSaveExcerpt
    })

    return true
  })

  loadShortcutsFromSettings()
}

const cleanupCapture = () => {
  unregisterAll()
}

module.exports = { registerCaptureHandlers, cleanupCapture }
