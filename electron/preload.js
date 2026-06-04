const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,

  i18n: {
    getLocale: () => ipcRenderer.invoke('i18n:get-locale'),
    setLocale: (locale) => ipcRenderer.invoke('i18n:set-locale', locale)
  },

  openExternal: (url) => ipcRenderer.invoke('app:open-external', url),

  config: {
    saveSetup: (payload) => ipcRenderer.invoke('config:save-setup', payload)
  },

  shortcut: {
    update: (shortcuts) => ipcRenderer.invoke('shortcut:update', shortcuts)
  },

  capture: {
    on: (event, callback) => {
      const validEvents = ['capture:screenshot', 'capture:save-excerpt']
      const channel = validEvents.includes(event) ? event : `capture:${event}`

      if (validEvents.includes(channel)) {
        ipcRenderer.on(channel, (e, ...args) => callback(...args))
      }
    },
    removeAllListeners: (event) => {
      const validEvents = ['capture:screenshot', 'capture:save-excerpt']
      const channel = validEvents.includes(event) ? event : `capture:${event}`

      if (validEvents.includes(channel)) {
        ipcRenderer.removeAllListeners(channel)
      }
    }
  },

  parse: {
    file: (filePath) => ipcRenderer.invoke('parse:file', filePath)
  },

  fs: {
    readTemp: (filePath) => ipcRenderer.invoke('fs:read-temp', filePath)
  },

  send: (channel, data) => {
    const validChannels = ['app:ready', 'app:minimize', 'app:close']

    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },

  on: (channel, callback) => {
    const validChannels = ['app:reply']

    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args))
    }
  },

  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  }
})
