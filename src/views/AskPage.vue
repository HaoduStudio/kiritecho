<template>
  <div class="chat-wrap">
    <div class="view-head">
      <div class="eyebrow">{{ t('ask.eyebrow') }}</div>
      <h2 class="view-title">{{ t('ask.title') }}</h2>
    </div>

    <!-- Empty state -->
    <div v-if="!messages.length" class="chat-empty kt-scroll">
      <h1 class="ce-title">{{ t('ask.welcome') }}</h1>
      <p class="ce-sub">{{ t('ask.welcomeDescription') }}</p>
      <div class="ce-grid">
        <button v-for="s in SUGGESTIONS" :key="s.t" class="ce-card" @click="handleSuggestion(s)">
          <span class="ce-ico"><KtIcon :name="s.icon" :size="17" /></span>
          <span style="display: flex; flex-direction: column; gap: 2px; text-align: left">
            <span style="font-weight: 600; font-size: 14px; color: var(--ui-text-highlighted)">{{ s.t }}</span>
            <span style="font-size: 12.5px; color: var(--ui-text-muted)">{{ s.d }}</span>
          </span>
        </button>
      </div>
    </div>

    <!-- Chat messages -->
    <div v-else ref="scrollRef" class="chat-scroll kt-scroll">
      <div class="chat-thread">
        <div v-for="(m, i) in messages" :key="i" :class="['msg', m.role === 'user' ? 'user' : 'ai']">
          <!-- User message -->
          <template v-if="m.role === 'user'">
            <div class="bubble user">{{ m.content }}</div>
            <span class="user-ava">{{ userInitial }}</span>
          </template>
          <!-- AI message -->
          <template v-else>
            <span class="ai-ava"><KtIcon name="sparkles" :size="15" /></span>
            <div style="min-width: 0; flex: 1">
              <div class="ai-name">
                {{ m.modelName || 'AI' }}
                <span v-if="m.status === 'streaming'" class="typing"><i /><i /><i /></span>
              </div>
              <!-- Pending: no content yet -->
              <div v-if="m.status === 'pending'" class="bubble ai">
                <div class="ai-loading">
                  <span class="ai-loading-dot" /><span class="ai-loading-dot" /><span class="ai-loading-dot" />
                </div>
              </div>
              <!-- Streaming / Complete: render markdown -->
              <div v-else-if="m.content" class="bubble ai md-content" v-html="renderMarkdown(m.content)" />
              <!-- Error -->
              <div v-if="m.status === 'error'" class="msg-error">
                <KtIcon name="alert-circle" :size="14" />
                <span>{{ t('ask.sendError') }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Composer -->
    <div class="composer-dock">
      <div :class="['composer', { big: !messages.length }]">
        <textarea
          v-model="draft"
          class="u-textarea kt-scroll"
          :rows="messages.length ? 1 : 3"
          :placeholder="inputPlaceholder"
          :disabled="isInputDisabled"
          @keydown="handleComposerKeydown"
        />
        <div class="composer-bar">
          <!-- Model selector -->
          <div ref="modelRef" style="position: relative">
            <button class="ms-trigger" @click="modelOpen = !modelOpen">
              <span class="ms-dot" />
              <span v-if="selectedModel" style="font-weight: 600; color: var(--ui-text-highlighted)">{{ selectedModelLabel }}</span>
              <span v-else style="color: var(--ui-text-muted)">{{ t('ask.loadingModels') }}</span>
              <KtIcon name="chevrons-up-down" :size="14" style="color: var(--ui-text-muted); margin-left: 2px" />
            </button>
            <div v-if="modelOpen" class="ms-menu" style="animation: kt-scale-in .12s ease both">
              <button
                v-for="m in modelOptions"
                :key="m.key"
                class="ms-item"
                :data-active="m.key === selectedModelKey ? 'true' : undefined"
                @click="selectModelKey(m.key); modelOpen = false"
              >
                <span class="ms-dot" />
                <span style="display: flex; flex-direction: column; line-height: 1.3">
                  <span style="font-weight: 600; color: var(--ui-text-highlighted)">{{ m.name }}</span>
                  <span style="font-size: 11.5px; color: var(--ui-text-muted)">{{ m.vendor }}</span>
                </span>
                <KtIcon v-if="m.key === selectedModelKey" name="check" :size="16" style="color: var(--ui-primary); margin-left: auto" />
              </button>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px">
            <button class="wc-icon" :title="t('ask.screenshot')"><KtIcon name="scissors" :size="16" /></button>
            <button
              class="u-btn"
              data-variant="solid"
              data-color="primary"
              data-size="md"
              data-square="true"
              :disabled="!draft.trim() || isInputDisabled"
              :title="t('ask.send')"
              @click="handleSend(draft)"
            >
              <KtIcon name="arrow-up" :size="18" :stroke-width="2.5" />
            </button>
          </div>
        </div>
      </div>
      <p class="composer-hint">{{ t('ask.composerHint') }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import KtIcon from '@/components/KtIcon.vue'
import { getModelKey, useModels } from '@/composables/useModels'
import { useChat } from '@/composables/useChat'

const props = defineProps({
  account: { type: Object, default: null }
})
const emit = defineEmits(['conversation-created'])
const { t } = useI18n()

const draft = ref('')
const modelOpen = ref(false)
const modelRef = ref(null)
const scrollRef = ref(null)

const SUGGESTIONS = [
  { icon: 'scissors', t: '截屏摘录', d: '框选屏幕，自动提炼要点' },
  { icon: 'sparkles', t: '总结长文', d: '粘贴文章，输出结构化摘要' },
  { icon: 'search', t: '资料问答', d: '基于你的摘录库提问' },
  { icon: 'save', t: '整理笔记', d: '把零散内容归档成卡片' },
]

marked.setOptions({
  breaks: true,
  gfm: true
})

const renderMarkdown = (content) => {
  if (!content) return ''
  return marked.parse(content)
}

const userInitial = computed(() => {
  const name = props.account?.name || props.account?.email || ''
  return name ? name.slice(0, 1).toUpperCase() : 'U'
})

const {
  availableModels,
  selectedModelKey,
  selectedModel,
  hasAvailableModels,
  isLoading: isLoadingModels,
  loadModels,
  selectModelKey
} = useModels()

const {
  messages,
  conversationId,
  isStreaming,
  sendUserMessage
} = useChat()

const modelOptions = computed(() => availableModels.value.map((model) => ({
  key: getModelKey(model),
  name: model.name,
  vendor: model.provider_name || '',
  label: model.provider_name ? `${model.name} · ${model.provider_name}` : model.name
})))

const selectedModelLabel = computed(() => {
  const m = modelOptions.value.find(o => o.key === selectedModelKey.value)
  return m ? m.name : ''
})

const isInputDisabled = computed(() => isLoadingModels.value || isStreaming.value || !hasAvailableModels.value)

const inputPlaceholder = computed(() => {
  if (isLoadingModels.value) return t('ask.loadingModels')
  if (!hasAvailableModels.value) return t('ask.noModelsPlaceholder')
  return t('ask.inputPlaceholder')
})

watch(messages, () => {
  nextTick(() => { if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight })
}, { deep: true })

const handleComposerKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(draft.value) }
}

const handleSuggestion = (s) => {
  handleSend(s.t + '：' + s.d)
}

const handleSend = async (value) => {
  const content = typeof value === 'string' ? value : draft.value
  if (!content?.trim() || !selectedModel.value) return
  const hadConversation = !!conversationId.value
  draft.value = ''
  await sendUserMessage(content, selectedModel.value)
  if (!hadConversation && conversationId.value) emit('conversation-created', conversationId.value)
}

onMounted(() => {
  loadModels()
  const handleClickOutside = (e) => { if (modelRef.value && !modelRef.value.contains(e.target)) modelOpen.value = false }
  document.addEventListener('mousedown', handleClickOutside)
})
</script>
