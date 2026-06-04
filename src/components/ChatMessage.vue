<template>
  <article :class="['chat-message', `chat-message--${message.role}`]">
    <div class="chat-message__role">{{ roleLabel }}</div>
    <div class="chat-message__bubble">
      <p class="chat-message__content">
        {{ message.content }}<span v-if="isStreaming" class="chat-message__cursor" aria-hidden="true" />
      </p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isStreaming: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()

const roleLabel = computed(() => {
  if (props.message.role === 'user') {
    return t('ask.userRole')
  }

  if (props.message.role === 'system') {
    return t('ask.systemRole')
  }

  return t('ask.assistantRole')
})
</script>
