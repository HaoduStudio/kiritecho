import { ref } from 'vue'
import { chatCompletions } from '@/services/api/conversations'

export const useChat = () => {
  const messages = ref([])
  const isStreaming = ref(false)
  const streamError = ref(null)

  const sendMessage = async (params) => {
    isStreaming.value = true
    streamError.value = null

    const assistantMessage = { role: 'assistant', content: '' }
    messages.value.push(assistantMessage)
    const messageIndex = messages.value.length - 1

    try {
      if (params.stream !== false) {
        await chatCompletions({ ...params, stream: true }, (event) => {
          if (event.done) {
            isStreaming.value = false
            return
          }

          const delta = event.data?.choices?.[0]?.delta?.content
          if (delta) {
            messages.value[messageIndex].content += delta
          }
        })
      } else {
        const result = await chatCompletions({ ...params, stream: false })
        const content = result?.choices?.[0]?.message?.content || ''
        messages.value[messageIndex].content = content
        isStreaming.value = false
      }
    } catch (error) {
      console.warn('Chat completion failed:', error)
      streamError.value = error
      isStreaming.value = false
    }
  }

  const clearMessages = () => {
    messages.value = []
    streamError.value = null
  }

  return {
    messages,
    isStreaming,
    streamError,
    sendMessage,
    clearMessages
  }
}
