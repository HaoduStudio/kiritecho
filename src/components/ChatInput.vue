<template>
  <form class="chat-input" @submit.prevent="handleSubmit">
    <div class="chat-input__toolbar">
      <t-select
        v-if="modelOptions.length"
        v-model="selectedKey"
        class="chat-input__model"
        size="small"
        :disabled="disabled || isLoadingModels"
        :aria-label="t('ask.modelSelectLabel')"
      >
        <t-option
          v-for="model in modelOptions"
          :key="model.key"
          :label="model.label"
          :value="model.key"
        />
      </t-select>
      <span v-else class="chat-input__model-empty">{{ modelEmptyText }}</span>
    </div>

    <div class="chat-input__body">
      <t-textarea
        v-model="draft"
        class="chat-input__textarea"
        :autosize="{ minRows: 2, maxRows: 4 }"
        :disabled="disabled"
        :placeholder="placeholder"
        @keydown="handleKeydown"
      />
      <t-button
        theme="primary"
        shape="square"
        class="chat-input__send"
        :disabled="!canSend"
        :loading="isSending"
        :aria-label="t('ask.send')"
        @click="handleSubmit"
      >
        <SendIcon />
      </t-button>
    </div>
  </form>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import SendIcon from 'tdesign-icons-vue-next/esm/components/send.js'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  isSending: {
    type: Boolean,
    default: false
  },
  isLoadingModels: {
    type: Boolean,
    default: false
  },
  modelOptions: {
    type: Array,
    default: () => []
  },
  selectedModelKey: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  modelEmptyText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['send', 'update:selectedModelKey'])
const { t } = useI18n()
const draft = ref('')

const selectedKey = computed({
  get: () => props.selectedModelKey,
  set: (value) => emit('update:selectedModelKey', value)
})

const canSend = computed(() => (
  !props.disabled &&
  !props.isSending &&
  Boolean(props.selectedModelKey) &&
  Boolean(draft.value.trim())
))

const getKeyboardEvent = (value, context) => context?.e || value?.e || value

const handleSubmit = () => {
  if (!canSend.value) {
    return
  }

  emit('send', draft.value)
  draft.value = ''
}

const handleKeydown = (value, context) => {
  const event = getKeyboardEvent(value, context)

  if (event?.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}
</script>
