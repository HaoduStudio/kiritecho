const { app } = require('electron')
const path = require('path')
const fs = require('fs')
const { createWorker } = require('tesseract.js')

const getTessdataPath = () => path.join(app.getPath('userData'), 'tessdata')

let worker = null

const ensureWorker = async (langs = 'chi_sim+eng') => {
  if (worker) {
    return worker
  }

  const langPath = getTessdataPath()
  fs.mkdirSync(langPath, { recursive: true })

  worker = await createWorker(langs, undefined, {
    cachePath: langPath
  })

  return worker
}

const recognizeImage = async (imagePath, langs = 'chi_sim+eng') => {
  const w = await ensureWorker(langs)
  const { data } = await w.recognize(imagePath)

  return {
    text: data.text || '',
    confidence: data.confidence || 0
  }
}

const terminateWorker = async () => {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}

module.exports = { recognizeImage, terminateWorker }
