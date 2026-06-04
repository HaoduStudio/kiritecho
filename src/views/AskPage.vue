<template>
  <section class="ask-page">
    <header class="ask-header">
      <div>
        <p class="ask-eyebrow">{{ t('ask.eyebrow') }}</p>
        <h1>{{ t('ask.title') }}</h1>
      </div>
    </header>

    <t-alert
      v-if="modelsError"
      theme="error"
      class="ask-alert"
      :message="t('ask.modelsLoadFailed')"
    />
    <t-alert
      v-else-if="!isLoadingModels && !hasAvailableModels"
      theme="warning"
      class="ask-alert"
      :message="t('ask.noModels')"
    />
    <t-alert
      v-if="localizedStreamError"
      theme="error"
      class="ask-alert"
      :message="localizedStreamError"
    />

    <div v-if="!messages.length" class="ask-empty">
      <h2>{{ t('ask.welcome') }}</h2>
      <p>{{ t('ask.welcomeDescription') }}</p>
    </div>
    <ChatList
      v-else
      class="ask-chat-list"
      :data="chatListData"
      :is-stream-load="isStreaming"
      :text-loading="isStreaming"
      layout="both"
      :auto-scroll="true"
      :show-scroll-button="true"
      default-scroll-to="bottom"
      animation="moving"
    />

    <ChatSender
      v-model="draft"
      class="ask-chat-sender"
      :placeholder="inputPlaceholder"
      :disabled="isInputDisabled"
      :loading="isStreaming"
      @send="handleSend"
      @stop="handleStop"
    >
      <template #footer-prefix>
        <t-select
          v-if="modelOptions.length"
          v-model="internalModelKey"
          class="ask-model-select"
          size="small"
          borderless
          :disabled="isInputDisabled || isLoadingModels"
          :aria-label="t('ask.modelSelectLabel')"
        >
          <t-option
            v-for="model in modelOptions"
            :key="model.key"
            :label="model.label"
            :value="model.key"
          />
        </t-select>
        <span v-else-if="isLoadingModels" class="ask-model-hint">{{ t('ask.loadingModels') }}</span>
      </template>
    </ChatSender>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChatList, ChatSender } from '@tdesign-vue-next/chat'
import { createConversation } from '@/services/api/conversations'
import { getApiErrorMessage } from '@/services/api/errors'
import { getModelKey, useModels } from '@/composables/useModels'
import { useChat } from '@/composables/useChat'

const emit = defineEmits(['conversation-created'])
const { t, locale } = useI18n()

const draft = ref('')

const {
  availableModels,
  selectedModelKey,
  selectedModel,
  hasAvailableModels,
  isLoading: isLoadingModels,
  error: modelsError,
  loadModels,
  selectModelKey
} = useModels()

const {
  messages,
  chatListData,
  conversationId,
  isStreaming,
  streamError,
  setConversation,
  sendUserMessage
} = useChat()

const internalModelKey = computed({
  get: () => selectedModelKey.value,
  set: (value) => selectModelKey(value)
})

const modelOptions = computed(() => availableModels.value.map((model) => ({
  key: getModelKey(model),
  label: model.provider_name ? `${model.name} · ${model.provider_name}` : model.name
})))

const localizedStreamError = computed(() => {
  if (!streamError.value) {
    return ''
  }

  return getApiErrorMessage(streamError.value.code, locale.value)
})

const isInputDisabled = computed(() => (
  isLoadingModels.value ||
  isStreaming.value ||
  !hasAvailableModels.value
))

const inputPlaceholder = computed(() => {
  if (isLoadingModels.value) return t('ask.loadingModels')
  if (!hasAvailableModels.value) return t('ask.noModelsPlaceholder')
  return t('ask.inputPlaceholder')
})

const getConversationTitle = (content) => {
  const trimmed = content.trim().replace(/\s+/g, ' ')
  return trimmed.length > 24 ? `${trimmed.slice(0, 24)}...` : trimmed
}

const ensureConversation = async (content) => {
  if (conversationId.value) {
    return
  }

  try {
    const conversation = await createConversation(getConversationTitle(content))

    if (conversation?.id) {
      setConversation(conversation.id, messages.value)
      emit('conversation-created', conversation.id)
    }
  } catch (error) {
    console.warn('Unable to create conversation before chat completion:', error)
  }
}

const handleSend = async (value) => {
  const content = typeof value === 'string' ? value : draft.value
  if (!content?.trim() || !selectedModel.value) {
    return
  }

  draft.value = ''
  await ensureConversation(content)
  await sendUserMessage(content, selectedModel.value)

  if (conversationId.value) {
    emit('conversation-created', conversationId.value)
  }
}

const handleStop = () => {
  // TODO: implement abort when backend supports it
}

onMounted(loadModels)
</script>
