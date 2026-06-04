const { ipcMain, shell } = require('electron')

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

module.exports = { registerExternalHandlers }
