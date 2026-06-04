const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { app } = require('electron')

const LOW_CHAR_DENSITY_THRESHOLD = 20

const loadPdfDocument = async (filePath) => {
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')
  const data = new Uint8Array(fs.readFileSync(filePath))

  return pdfjsLib.getDocument({ data }).promise
}

const extractPageText = async (page) => {
  const textContent = await page.getTextContent()
  const text = textContent.items
    .map((item) => item.str)
    .join(' ')
    .trim()

  return text
}

const isLowCharDensity = (text, pageWidth, pageHeight) => {
  if (!text) return true

  const area = (pageWidth || 595) * (pageHeight || 842)
  const density = (text.length / area) * 10000

  return density < LOW_CHAR_DENSITY_THRESHOLD
}

const extractPdf = async (filePath) => {
  const doc = await loadPdfDocument(filePath)
  const numPages = doc.numPages
  const textChunks = []
  const imageChunks = []
  let needsCloudMultimodal = false

  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i)
    const viewport = page.getViewport({ scale: 1.0 })
    const text = await extractPageText(page)

    if (!isLowCharDensity(text, viewport.width, viewport.height)) {
      textChunks.push(text)
      continue
    }

    // 低字符密度页面：标记需要 OCR / 多模态处理
    // 实际的 OCR 调用和 PNG 渲染在集成阶段完成（需要 canvas 环境）
    needsCloudMultimodal = true

    if (text) {
      textChunks.push(text)
    }

    imageChunks.push({
      pageNumber: i,
      width: Math.round(viewport.width),
      height: Math.round(viewport.height)
    })
  }

  await doc.destroy()

  return {
    kind: 'pdf',
    textChunks,
    imageChunks,
    needsCloudMultimodal
  }
}

module.exports = { extractPdf }
