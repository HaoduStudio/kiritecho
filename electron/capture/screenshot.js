const { desktopCapturer, screen } = require('electron')
const { app } = require('electron')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const captureScreen = async () => {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.size
  const scaleFactor = primaryDisplay.scaleFactor || 1

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: Math.round(width * scaleFactor),
      height: Math.round(height * scaleFactor)
    }
  })

  if (!sources.length) {
    throw new Error('no_screen_source')
  }

  const thumbnail = sources[0].thumbnail

  if (thumbnail.isEmpty()) {
    throw new Error('empty_screenshot')
  }

  const pngBuffer = thumbnail.toPNG()
  const fileName = `capture-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.png`
  const filePath = path.join(app.getPath('temp'), fileName)

  fs.writeFileSync(filePath, pngBuffer)

  return {
    filePath,
    width: thumbnail.getSize().width,
    height: thumbnail.getSize().height
  }
}

module.exports = { captureScreen }
