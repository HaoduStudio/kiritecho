const { globalShortcut } = require('electron')

let registeredShortcuts = {}

const unregisterAll = () => {
  for (const accelerator of Object.keys(registeredShortcuts)) {
    try {
      globalShortcut.unregister(accelerator)
    } catch (error) {
      console.warn(`Unable to unregister shortcut ${accelerator}:`, error)
    }
  }

  registeredShortcuts = {}
}

const register = (accelerator, callback) => {
  if (!accelerator || typeof accelerator !== 'string') {
    return false
  }

  try {
    const success = globalShortcut.register(accelerator, callback)

    if (success) {
      registeredShortcuts[accelerator] = callback
    }

    return success
  } catch (error) {
    console.warn(`Unable to register shortcut ${accelerator}:`, error)
    return false
  }
}

const updateShortcuts = (shortcuts, handlers) => {
  unregisterAll()

  if (shortcuts.screenshot && handlers.onScreenshot) {
    register(shortcuts.screenshot, handlers.onScreenshot)
  }

  if (shortcuts.saveExcerpt && handlers.onSaveExcerpt) {
    register(shortcuts.saveExcerpt, handlers.onSaveExcerpt)
  }
}

module.exports = { register, unregisterAll, updateShortcuts }
