<template>
  <div class="setup-container">
    <div class="setup-background">
      <div class="setup-grid" />
      <div class="setup-sheen" />
    </div>

    <div class="setup-shell">
      <header class="setup-header">
        <span class="setup-brand">{{ t('setup.brand') }}</span>
      </header>

      <main class="setup-content setup-content--compact" aria-labelledby="shortcut-title">
        <section class="setup-panel shortcut-panel">
          <p class="setup-eyebrow">{{ t('shortcuts.shortTitle') }}</p>
          <h1 id="shortcut-title" class="setup-title">{{ t('shortcuts.title') }}</h1>
          <p class="setup-description">{{ t('shortcuts.description') }}</p>

          <div class="shortcut-options">
            <section
              :class="['shortcut-option', { 'shortcut-option--capturing': capturingShortcut === 'screenshot' }]"
              :aria-labelledby="screenshotTitleId"
            >
              <span class="shortcut-option-icon" aria-hidden="true">
                <ScreenshotIcon />
              </span>
              <div class="shortcut-option-copy">
                <h2 :id="screenshotTitleId">{{ t('shortcuts.screenshotLabel') }}</h2>
                <p>{{ t('shortcuts.screenshotDescription') }}</p>
              </div>
              <t-input
                v-model="screenshotShortcut"
                class="shortcut-input"
                size="large"
                readonly
                :aria-label="t('shortcuts.screenshotLabel')"
                :placeholder="t('shortcuts.placeholder')"
                :spell-check="false"
                :status="shortcutInputStatus"
                @focus="handleShortcutFocus('screenshot')"
                @blur="handleShortcutBlur"
                @keydown="(value, context) => handleShortcutKeydown('screenshot', value, context)"
              />
            </section>

            <section
              :class="['shortcut-option', { 'shortcut-option--capturing': capturingShortcut === 'saveExcerpt' }]"
              :aria-labelledby="saveExcerptTitleId"
            >
              <span class="shortcut-option-icon" aria-hidden="true">
                <SaveIcon />
              </span>
              <div class="shortcut-option-copy">
                <h2 :id="saveExcerptTitleId">{{ t('shortcuts.saveExcerptLabel') }}</h2>
                <p>{{ t('shortcuts.saveExcerptDescription') }}</p>
              </div>
              <t-input
                v-model="saveExcerptShortcut"
                class="shortcut-input"
                size="large"
                readonly
                :aria-label="t('shortcuts.saveExcerptLabel')"
                :placeholder="t('shortcuts.placeholder')"
                :spell-check="false"
                :status="shortcutInputStatus"
                @focus="handleShortcutFocus('saveExcerpt')"
                @blur="handleShortcutBlur"
                @keydown="(value, context) => handleShortcutKeydown('saveExcerpt', value, context)"
              />
            </section>
          </div>

          <p :class="['shortcut-status', { 'shortcut-status--error': hasShortcutError }]">
            {{ shortcutStatusText }}
          </p>
        </section>
      </main>

      <footer class="setup-footer">
        <t-button
          theme="default"
          size="large"
          class="start-btn setup-back-btn"
          :disabled="isSaving"
          @click="handleBack"
        >
          <template #prefix>
            <ArrowLeftIcon />
          </template>
          {{ t('setup.back') }}
        </t-button>

        <t-button
          theme="primary"
          size="large"
          class="start-btn setup-next-btn"
          :disabled="!canSave"
          :loading="isSaving"
          @click="handleNext"
        >
          {{ t('setup.next') }}
          <template #suffix>
            <ArrowRightIcon />
          </template>
        </t-button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { MessagePlugin } from 'tdesign-vue-next/es/message'
import ArrowLeftIcon from 'tdesign-icons-vue-next/esm/components/arrow-left.js'
import ArrowRightIcon from 'tdesign-icons-vue-next/esm/components/arrow-right.js'
import SaveIcon from 'tdesign-icons-vue-next/esm/components/save.js'
import ScreenshotIcon from 'tdesign-icons-vue-next/esm/components/screenshot.js'
import { saveSetupConfig } from '@/config/setupConfig'

const props = defineProps({
  auth: {
    type: Object,
    default: null
  },
  account: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['back', 'next'])
const { t } = useI18n()

const screenshotTitleId = 'shortcut-screenshot-title'
const saveExcerptTitleId = 'shortcut-save-excerpt-title'
const screenshotShortcut = ref('Ctrl+Alt+S')
const saveExcerptShortcut = ref('Ctrl+Alt+E')
const capturingShortcut = ref('')
const isSaving = ref(false)
const lastInvalidReason = ref('')

const modifierKeys = new Set(['Control', 'Shift', 'Alt', 'Meta'])
const standaloneKeys = new Set(['PrintScreen'])
const keyAliases = {
  ' ': 'Space',
  Spacebar: 'Space',
  Escape: 'Esc',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right'
}

const normalizedScreenshotShortcut = computed(() => screenshotShortcut.value.trim().toLowerCase())
const normalizedSaveExcerptShortcut = computed(() => saveExcerptShortcut.value.trim().toLowerCase())

const isShortcutDuplicate = computed(() => (
  normalizedScreenshotShortcut.value &&
  normalizedScreenshotShortcut.value === normalizedSaveExcerptShortcut.value
))

const hasShortcutError = computed(() => Boolean(isShortcutDuplicate.value || lastInvalidReason.value))

const shortcutInputStatus = computed(() => (hasShortcutError.value ? 'error' : 'default'))

const shortcutStatusText = computed(() => {
  if (isShortcutDuplicate.value) return t('shortcuts.duplicate')
  if (lastInvalidReason.value === 'modifier') return t('shortcuts.modifierRequired')
  if (capturingShortcut.value) return t('shortcuts.capturing')

  return t('shortcuts.ready')
})

const canSave = computed(() => (
  Boolean(props.auth?.accessToken) &&
  Boolean(screenshotShortcut.value) &&
  Boolean(saveExcerptShortcut.value) &&
  !isShortcutDuplicate.value
))

const getKeyLabel = (event) => {
  const key = event.key

  if (!key || modifierKeys.has(key)) {
    return ''
  }

  if (keyAliases[key]) {
    return keyAliases[key]
  }

  if (key.length === 1) {
    return key.toUpperCase()
  }

  return key
}

const getShortcutFromEvent = (event) => {
  const keyLabel = getKeyLabel(event)

  if (!keyLabel) {
    return ''
  }

  const parts = []
  if (event.ctrlKey) parts.push('Ctrl')
  if (event.altKey) parts.push('Alt')
  if (event.shiftKey) parts.push('Shift')
  if (event.metaKey) parts.push('Meta')

  if (!parts.length && !standaloneKeys.has(keyLabel) && !/^F\d{1,2}$/.test(keyLabel)) {
    lastInvalidReason.value = 'modifier'
    return ''
  }

  lastInvalidReason.value = ''

  return [...parts, keyLabel].join('+')
}

const getKeyboardEvent = (value, context) => context?.e || value?.e || value

const handleShortcutFocus = (target) => {
  capturingShortcut.value = target
  lastInvalidReason.value = ''
}

const handleShortcutBlur = () => {
  capturingShortcut.value = ''
}

const handleShortcutKeydown = (target, value, context) => {
  const event = getKeyboardEvent(value, context)

  if (!event?.key) {
    return
  }

  event.preventDefault()
  event.stopPropagation()

  if (event.key === 'Escape') {
    capturingShortcut.value = ''
    lastInvalidReason.value = ''
    return
  }

  const shortcut = getShortcutFromEvent(event)

  if (!shortcut) {
    return
  }

  if (target === 'screenshot') {
    screenshotShortcut.value = shortcut
  } else {
    saveExcerptShortcut.value = shortcut
  }
}

const handleBack = () => {
  emit('back')
}

const handleNext = async () => {
  if (!canSave.value) {
    return
  }

  isSaving.value = true

  try {
    await saveSetupConfig({
      auth: props.auth,
      account: props.account,
      shortcuts: {
        screenshot: screenshotShortcut.value,
        saveExcerpt: saveExcerptShortcut.value
      }
    })
    MessagePlugin.success({
      content: t('shortcuts.saved'),
      duration: 1800
    })
    emit('next')
  } catch (error) {
    console.warn('Unable to save setup shortcuts:', error)
    MessagePlugin.error({
      content: t('shortcuts.saveFailed'),
      duration: 2200
    })
  } finally {
    isSaving.value = false
  }
}
</script>
