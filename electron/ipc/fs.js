const { app, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')

const registerFsHandlers = () => {
  ipcMain.handle('fs:read-temp', async (event, filePath) => {
    if (!filePath || typeof filePath !== 'string') {
      throw new Error('invalid_file_path')
    }

    const tempDir = app.getPath('temp')
    const resolved = path.resolve(filePath)

    // 仅允许读取 temp 目录下的文件
    if (!resolved.startsWith(tempDir)) {
      throw new Error('access_denied: path outside temp directory')
    }

    if (!fs.existsSync(resolved)) {
      throw new Error('file_not_found')
    }

    const buffer = fs.readFileSync(resolved)

    return buffer.toString('base64')
  })
}

module.exports = { registerFsHandlers }
