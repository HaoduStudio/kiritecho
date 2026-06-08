import { computed, ref } from 'vue'
import { chatMessages } from '@/services/api/conversations'

export const useChat = (options = {}) => {
  const messages = ref([])
  const conversationId = ref(null)
  const isStreaming = ref(false)
  const streamError = ref(null)
  const lastTraceId = ref('')
  const lastMetadata = ref(null)
  const onDone = options.onDone || null
  const onMetadata = options.onMetadata || null

  const normalizeMessages = (items = []) => (
    items
      .filter((message) => message?.role && typeof message?.content === 'string')
      .map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        reasoning: message.reasoning || '',
        status: 'complete',
        model: message.model,
        created_at: message.created_at
      }))
  )

  const chatListData = computed(() =>
    messages.value.map((message) => {
      const items = []

      if (message.role === 'assistant' && message.reasoning) {
        items.push({ type: 'reasoning', data: [{ type: 'text', data: message.reasoning }] })
      }

      if (message.role === 'user') {
        items.push({ type: 'text', data: message.content })
      } else {
        items.push({ type: 'markdown', data: message.content })
      }

      return {
        role: message.role,
        name: message.role === 'user' ? undefined : 'Kiritecho',
        content: items,
        status: message.status || 'complete'
      }
    })
  )

  const setConversation = (id, existingMessages = []) => {
    conversationId.value = id || null
    messages.value = normalizeMessages(existingMessages)
    streamError.value = null
    lastTraceId.value = ''
  }

  const sendUserMessage = async (content, model, options = {}) => {
    const trimmedContent = content.trim()

    if (!trimmedContent || !model) {
      return
    }

    const userMessage = { role: 'user', content: trimmedContent, status: 'complete' }
    messages.value.push(userMessage)

    const assistantMessage = { role: 'assistant', content: '', reasoning: '', status: 'pending' }
    messages.value.push(assistantMessage)
    const assistantIndex = messages.value.length - 1

    isStreaming.value = true
    streamError.value = null

    const params = {
      conversation_id: conversationId.value || undefined,
      model: model.id,
      provider_id: model.provider_id,
      prompt: trimmedContent,
      stream: model.supports_stream !== false,
      max_tokens: options.maxTokens || model.max_tokens || 4096,
      thinking: options.thinking,
      reasoning_effort: options.reasoningEffort
    }

    try {
      if (params.stream) {
        await chatMessages(params, (event) => {
          if (event.event === 'metadata') {
            if (event.data?.conversation_id) {
              conversationId.value = event.data.conversation_id
            }
            lastMetadata.value = event.data
            onMetadata?.(event.data)
            return
          }

          if (event.event === 'message') {
            const chunk = event.data
            if (chunk?.data) {
              messages.value[assistantIndex].content += chunk.data
              messages.value[assistantIndex].status = 'streaming'
            }
            return
          }

          if (event.event === 'reasoning') {
            const chunk = event.data
            if (chunk?.data) {
              messages.value[assistantIndex].reasoning += chunk.data
              messages.value[assistantIndex].status = 'streaming'
            }
            return
          }

          if (event.event === 'done') {
            if (!messages.value[assistantIndex].reasoning && event.data?.reasoning) {
              messages.value[assistantIndex].reasoning = event.data.reasoning
            }
            messages.value[assistantIndex].status = 'complete'
            isStreaming.value = false
            onDone?.(event.data)
          }
        }, (meta) => {
          if (meta?.conversationId) {
            conversationId.value = meta.conversationId
          }
          if (meta?.traceId) {
            lastTraceId.value = meta.traceId
          }
        })

        if (messages.value[assistantIndex].status !== 'complete') {
          messages.value[assistantIndex].status = 'complete'
          isStreaming.value = false
        }
      } else {
        const result = await chatMessages(params)
        const data = result?.data ?? result

        if (data?.conversation?.id) {
          conversationId.value = data.conversation.id
        }

        messages.value[assistantIndex].content = data?.content || ''
        messages.value[assistantIndex].reasoning = data?.reasoning || ''
        messages.value[assistantIndex].status = 'complete'
        isStreaming.value = false
      }
    } catch (error) {
      console.warn('Chat message failed:', error)
      messages.value[assistantIndex].status = 'error'
      streamError.value = error
      isStreaming.value = false
    }
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
    lastMetadata,
    setConversation,
    sendUserMessage,
    clearMessages
  }
}
