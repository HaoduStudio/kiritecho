const { BrowserWindow, ipcMain } = require('electron')

const registerWindowHandlers = () => {
  ipcMain.on('app:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.on('app:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
}

module.exports = { registerWindowHandlers }
