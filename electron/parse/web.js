const { parse } = require('node-html-parser')

const extractFromHTML = (html) => {
  const root = parse(html, { blockTextElements: { pre: true, code: true } })

  const textChunks = []
  const imageChunks = []

  const textTags = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TD', 'TH', 'BLOCKQUOTE', 'PRE'])

  const walk = (node) => {
    if (!node.childNodes) return

    for (const child of node.childNodes) {
      if (child.tagName === 'IMG') {
        const src = child.getAttribute('src')

        if (src) {
          imageChunks.push({ src, alt: child.getAttribute('alt') || '' })
        }

        continue
      }

      if (textTags.has(child.tagName)) {
        const text = child.text?.trim()

        if (text) {
          textChunks.push(text)
        }
      }

      walk(child)
    }
  }

  walk(root)

  // 如果结构化提取为空，回退到全文
  if (!textChunks.length) {
    const fallbackText = root.text?.trim()

    if (fallbackText) {
      textChunks.push(fallbackText)
    }
  }

  return {
    textChunks,
    imageChunks
  }
}

module.exports = { extractFromHTML }
