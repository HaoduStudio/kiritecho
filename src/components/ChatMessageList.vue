<template>
  <section ref="listRef" class="chat-message-list" :aria-label="t('ask.messageListLabel')">
    <ChatMessage
      v-for="(message, index) in messages"
      :key="message.id || `${message.role}-${index}`"
      :message="message"
      :is-streaming="isStreaming && index === messages.length - 1 && message.role === 'assistant'"
    />
  </section>
</template>

<script setup>
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ChatMessage from './ChatMessage.vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  isStreaming: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const listRef = ref(null)

const scrollToBottom = async () => {
  await nextTick()

  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight
  }
}

watch(() => props.messages.length, scrollToBottom)
watch(() => props.messages.map((message) => message.content).join('\n'), scrollToBottom)
</script>
