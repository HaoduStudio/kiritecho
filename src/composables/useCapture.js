import { onBeforeUnmount, onMounted, ref } from 'vue'
import { processCapture } from '@/services/capture'

export const useCapture = () => {
  const isProcessing = ref(false)
  const lastCapture = ref(null)
  const lastError = ref(null)

  const handleCapture = async (payload) => {
    isProcessing.value = true
    lastError.value = null
    lastCapture.value = payload

    try {
      await processCapture(payload)
    } catch (error) {
      console.warn('Capture processing failed:', error)
      lastError.value = error
    } finally {
      isProcessing.value = false
    }
  }

  onMounted(() => {
    window.electronAPI?.capture?.on('screenshot', handleCapture)
    window.electronAPI?.capture?.on('save-excerpt', handleCapture)
  })

  onBeforeUnmount(() => {
    window.electronAPI?.capture?.removeAllListeners('screenshot')
    window.electronAPI?.capture?.removeAllListeners('save-excerpt')
  })

  return {
    isProcessing,
    lastCapture,
    lastError
  }
}
