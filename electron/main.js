const { app, BrowserWindow } = require('electron')
const path = require('path')

const { registerI18nHandlers } = require('./ipc/i18n')
const { registerConfigHandlers } = require('./ipc/config')
const { registerWindowHandlers } = require('./ipc/window')
const { registerExternalHandlers } = require('./ipc/external')

const NODE_ENV = process.env.NODE_ENV || 'production'
const isDev = NODE_ENV === 'development'

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
