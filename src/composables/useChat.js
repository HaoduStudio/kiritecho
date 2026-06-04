import { computed, ref } from 'vue'
import { chatCompletions } from '@/services/api/conversations'

export const useChat = () => {
  const messages = ref([])
  const conversationId = ref(null)
  const isStreaming = ref(false)
  const streamError = ref(null)
  const lastTraceId = ref('')

  const normalizeMessages = (items = []) => (
    items
      .filter((message) => message?.role && typeof message?.content === 'string')
      .map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        status: 'complete',
        model: message.model,
        created_at: message.created_at
      }))
  )

  const chatListData = computed(() =>
    messages.value.map((message) => ({
      role: message.role,
      name: message.role === 'user' ? undefined : 'Kiritecho',
      content: [{ type: 'markdown', data: message.content }],
      status: message.status || 'complete'
    }))
  )

  const setConversation = (id, existingMessages = []) => {
    conversationId.value = id || null
    messages.value = normalizeMessages(existingMessages)
    streamError.value = null
    lastTraceId.value = ''
  }

  const sendMessage = async (params) => {
    isStreaming.value = true
    streamError.value = null

    const assistantMessage = { role: 'assistant', content: '', status: 'pending' }
    messages.value.push(assistantMessage)
    const messageIndex = messages.value.length - 1

    try {
      if (params.stream !== false) {
        await chatCompletions({ ...params, stream: true }, (event) => {
          if (event.done) {
            messages.value[messageIndex].status = 'complete'
            isStreaming.value = false
            return
          }

          const delta = event.data?.choices?.[0]?.delta?.content
          if (delta) {
            messages.value[messageIndex].content += delta
            messages.value[messageIndex].status = 'streaming'
          }
        }, (meta) => {
          if (meta?.conversationId) {
            conversationId.value = meta.conversationId
          }

          if (meta?.traceId) {
            lastTraceId.value = meta.traceId
          }
        })
      } else {
        const result = await chatCompletions({ ...params, stream: false })
        const content = result?.choices?.[0]?.message?.content || ''
        messages.value[messageIndex].content = content
        messages.value[messageIndex].status = 'complete'
        isStreaming.value = false
      }
    } catch (error) {
      console.warn('Chat completion failed:', error)
      messages.value[messageIndex].status = 'error'
      streamError.value = error
      isStreaming.value = false
    }
  }

  const sendUserMessage = async (content, model, options = {}) => {
    const trimmedContent = content.trim()

    if (!trimmedContent || !model) {
      return
    }

    const userMessage = { role: 'user', content: trimmedContent, status: 'complete' }
    messages.value.push(userMessage)

    const params = {
      conversation_id: conversationId.value || undefined,
      model: model.id,
      provider_id: model.provider_id,
      messages: messages.value.map((message) => ({
        role: message.role,
        content: message.content
      })),
      stream: model.supports_stream !== false,
      max_tokens: options.maxTokens || model.max_tokens || 4096
    }

    await sendMessage(params)
  }

  const clearMessages = () => {
    messages.value = []
    conversationId.value = null
    streamError.value = null
    lastTraceId.value = ''
  }

  return {
    messages,
    chatListData,
    conversationId,
    isStreaming,
    streamError,
    lastTraceId,
    setConversation,
    sendMessage,
    sendUserMessage,
    clearMessages
  }
}
