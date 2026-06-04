import { syncMemories } from '@/services/api/memories'
import { syncFiles } from '@/services/api/files'

const readTempFileAsBase64 = async (filePath) => {
  if (!window.electronAPI?.fs?.readTemp) {
    throw new Error('fs:read-temp not available')
  }

  return window.electronAPI.fs.readTemp(filePath)
}

export const uploadTextCapture = async (payload) => {
  const { raw } = payload

  return syncMemories([{
    type: 'text',
    raw_content: raw.text
  }])
}

export const uploadImageCapture = async (payload) => {
  const { raw } = payload
  const base64 = await readTempFileAsBase64(raw.filePath)

  return syncMemories([{
    type: 'image',
    raw_content: base64
  }])
}

export const uploadWebCapture = async (payload) => {
  const { raw } = payload
  const results = []

  if (raw.textChunks?.length) {
    const textResult = await syncMemories(
      raw.textChunks.map((chunk) => ({
        type: 'text',
        raw_content: chunk
      }))
    )
    results.push(textResult)
  }

  if (raw.imageChunks?.length) {
    for (const img of raw.imageChunks) {
      if (img.base64) {
        const imageResult = await syncMemories([{
          type: 'image',
          raw_content: img.base64
        }])
        results.push(imageResult)
      }
    }
  }

  return results
}

export const uploadFileParseResult = async (result, fileName) => {
  const textContent = result.textChunks?.join('\n\n') || ''

  return syncFiles([{
    file_name: fileName,
    file_type: result.kind,
    text_content: textContent
  }])
}

export const processCapture = async (payload) => {
  if (payload.type === 'text') {
    return uploadTextCapture(payload)
  }

  if (payload.type === 'image') {
    return uploadImageCapture(payload)
  }

  if (payload.type === 'web') {
    return uploadWebCapture(payload)
  }

  console.warn('Unknown capture type:', payload.type)
}
