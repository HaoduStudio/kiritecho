const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // 平台信息
  platform: process.platform,

  // IPC 通信接口（预留）
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
