const electron = require('electron')
console.log('type:', typeof electron)
console.log('keys:', Object.keys(electron).slice(0, 10))
console.log('app:', typeof electron.app)
console.log('BrowserWindow:', typeof electron.BrowserWindow)

if (electron.app) {
  console.log('app is available')
  electron.app.whenReady().then(() => {
    console.log('ready!')
    electron.app.quit()
  })
} else {
  console.log('app is NOT available')
}
