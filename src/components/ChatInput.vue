<template>
  <form class="chat-input" @submit.prevent="handleSubmit">
    <div class="chat-input__toolbar">
      <select
        v-if="modelOptions.length"
        v-model="selectedKey"
        class="u-input chat-input__model"
        :disabled="disabled || isLoadingModels"
        :aria-label="t('ask.modelSelectLabel')"
      >
        <option
          v-for="model in modelOptions"
          :key="model.key"
          :value="model.key"
        >{{ model.label }}</option>
      </select>
      <span v-else class="chat-input__model-empty">{{ modelEmptyText }}</span>
    </div>

    <div class="chat-input__body">
      <textarea
        v-model="draft"
        class="u-textarea chat-input__textarea"
        :disabled="disabled"
        :placeholder="placeholder"
        @keydown="handleKeydown"
      />
      <button
        type="button"
        class="u-btn chat-input__send"
        data-variant="solid"
        data-color="primary"
        data-size="md"
        data-square="true"
        :disabled="!canSend"
        :aria-label="t('ask.send')"
        @click="handleSubmit"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    </div>
  </form>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  isSending: { type: Boolean, default: false },
  isLoadingModels: { type: Boolean, default: false },
  modelOptions: { type: Array, default: () => [] },
  selectedModelKey: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  modelEmptyText: { type: String, default: '' }
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

const handleSubmit = () => {
  if (!canSend.value) return
  emit('send', draft.value)
  draft.value = ''
}

const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSubmit()
  }
}
</script>
