const { clipboard, nativeImage } = require('electron')

const readText = () => {
  try {
    return clipboard.readText() || ''
  } catch (error) {
    console.warn('Unable to read clipboard text:', error)
    return ''
  }
}

const readHTML = () => {
  try {
    return clipboard.readHTML() || ''
  } catch (error) {
    console.warn('Unable to read clipboard HTML:', error)
    return ''
  }
}

const readImage = () => {
  try {
    const image = clipboard.readImage()

    if (image.isEmpty()) {
      return null
    }

    return image
  } catch (error) {
    console.warn('Unable to read clipboard image:', error)
    return null
  }
}

const hasHTML = () => {
  try {
    const formats = clipboard.availableFormats()
    return formats.some((f) => f.includes('html'))
  } catch (error) {
    return false
  }
}

module.exports = { readText, readHTML, readImage, hasHTML }
