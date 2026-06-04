const { ipcMain } = require('electron')
const path = require('path')
const { extractText: extractDocxText } = require('../parse/docx')
const { extractPdf } = require('../parse/pdf')
const { extractFromHTML } = require('../parse/web')

const supportedExtensions = new Set(['.docx', '.doc', '.pdf', '.html', '.htm'])

const getFileKind = (filePath) => {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.docx' || ext === '.doc') return 'docx'
  if (ext === '.pdf') return 'pdf'
  if (ext === '.html' || ext === '.htm') return 'web'

  return null
}

const parseFile = async (filePath) => {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('invalid_file_path')
  }

  const kind = getFileKind(filePath)

  if (!kind) {
    throw new Error(`unsupported_file_type: ${path.extname(filePath)}`)
  }

  if (kind === 'docx') {
    return extractDocxText(filePath)
  }

  if (kind === 'pdf') {
    return extractPdf(filePath)
  }

  if (kind === 'web') {
    const fs = require('fs')
    const html = fs.readFileSync(filePath, 'utf8')
    const result = extractFromHTML(html)

    return {
      kind: 'web',
      ...result
    }
  }
}

const registerParseHandlers = () => {
  ipcMain.handle('parse:file', async (event, filePath) => {
    try {
      return await parseFile(filePath)
    } catch (error) {
      console.warn('File parse failed:', error)
      throw error
    }
  })
}

module.exports = { registerParseHandlers }
