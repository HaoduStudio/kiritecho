const mammoth = require('mammoth')

const extractText = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath })
  const text = result.value || ''

  const chunks = text
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)

  return {
    kind: 'docx',
    textChunks: chunks
  }
}

module.exports = { extractText }
