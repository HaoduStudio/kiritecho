<template>
  <div class="ob-shell" style="animation: kt-fade .35s ease both">
    <div class="ob-body">
      <div class="ob-head">
        <div class="eyebrow">{{ t('shortcuts.shortTitle') }}</div>
        <h1 class="ob-title">{{ t('shortcuts.title') }}</h1>
        <p class="ob-sub">{{ t('shortcuts.description') }}</p>
      </div>
      <div class="ob-content">
        <div class="ob-list" style="max-width: 720px">
          <div class="hk-row">
            <span class="hk-ico"><KtIcon name="scissors" :size="20" /></span>
            <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0">
              <span style="font-weight: 700; font-size: 15.5px; color: var(--ui-text-highlighted)">{{ t('shortcuts.screenshotLabel') }}</span>
              <span style="font-size: 13px; color: var(--ui-text-muted)">{{ t('shortcuts.screenshotDescription') }}</span>
            </div>
            <button
              :class="['hk-keys', { rec: capturingShortcut === 'screenshot' }]"
              @click="handleShortcutFocus('screenshot')"
              @keydown="(e) => handleShortcutKeydown('screenshot', e)"
              @blur="handleShortcutBlur"
            >
              <template v-if="capturingShortcut === 'screenshot'">
                <span style="color: var(--ui-primary); font-weight: 600; font-size: 13px">{{ t('shortcuts.capturing') }}</span>
              </template>
              <template v-else>
                <template v-for="(k, i) in screenshotKeys" :key="i">
                  <span v-if="i > 0" class="hk-plus">+</span>
                  <kbd class="u-kbd">{{ k }}</kbd>
                </template>
              </template>
            </button>
          </div>

          <div class="hk-row">
            <span class="hk-ico"><KtIcon name="save" :size="20" /></span>
            <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0">
              <span style="font-weight: 700; font-size: 15.5px; color: var(--ui-text-highlighted)">{{ t('shortcuts.saveExcerptLabel') }}</span>
              <span style="font-size: 13px; color: var(--ui-text-muted)">{{ t('shortcuts.saveExcerptDescription') }}</span>
            </div>
            <button
              :class="['hk-keys', { rec: capturingShortcut === 'saveExcerpt' }]"
              @click="handleShortcutFocus('saveExcerpt')"
              @keydown="(e) => handleShortcutKeydown('saveExcerpt', e)"
              @blur="handleShortcutBlur"
            >
              <template v-if="capturingShortcut === 'saveExcerpt'">
                <span style="color: var(--ui-primary); font-weight: 600; font-size: 13px">{{ t('shortcuts.capturing') }}</span>
              </template>
              <template v-else>
                <template v-for="(k, i) in saveExcerptKeys" :key="i">
                  <span v-if="i > 0" class="hk-plus">+</span>
                  <kbd class="u-kbd">{{ k }}</kbd>
                </template>
              </template>
            </button>
          </div>

          <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 4px; color: var(--ui-text-dimmed); font-size: 12.5px">
            <KtIcon name="lock" :size="13" /> {{ t('shortcuts.ready') }}
          </div>
        </div>
      </div>
    </div>
    <div class="ob-footer">
      <div style="width: 180px; max-width: 30%">
        <div class="u-stepper">
          <span v-for="i in stepCount" :key="i" class="u-step-dot" :data-state="i - 1 < stepIndex ? 'done' : i - 1 === stepIndex ? 'active' : 'todo'" />
        </div>
      </div>
      <div style="display: flex; gap: 10px">
        <button class="u-btn" data-variant="subtle" data-color="neutral" data-size="lg" :disabled="isSaving" @click="handleBack">
          <KtIcon name="arrow-left" :size="17" />
          {{ t('setup.back') }}
        </button>
        <button class="u-btn" data-variant="solid" data-color="primary" data-size="lg" :disabled="!canSave" @click="handleNext">
          {{ t('shortcuts.finish') }}
          <KtIcon name="check" :size="17" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import KtIcon from '@/components/KtIcon.vue'
import { saveSetupConfig } from '@/config/setupConfig'

const props = defineProps({
  auth: { type: Object, default: null },
  account: { type: Object, default: null }
})

const emit = defineEmits(['back', 'next'])
const { t } = useI18n()

const stepIndex = 4
const stepCount = 5

const screenshotShortcut = ref('Ctrl+Alt+S')
const saveExcerptShortcut = ref('Ctrl+Alt+E')
const capturingShortcut = ref('')
const isSaving = ref(false)

const screenshotKeys = computed(() => screenshotShortcut.value.split('+'))
const saveExcerptKeys = computed(() => saveExcerptShortcut.value.split('+'))

const modifierKeys = new Set(['Control', 'Shift', 'Alt', 'Meta'])
const standaloneKeys = new Set(['PrintScreen'])
const keyAliases = { ' ': 'Space', Spacebar: 'Space', Escape: 'Esc', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right' }

const canSave = computed(() => Boolean(props.auth?.accessToken) && Boolean(screenshotShortcut.value) && Boolean(saveExcerptShortcut.value))

const getKeyLabel = (event) => {
  const key = event.key
  if (!key || modifierKeys.has(key)) return ''
  if (keyAliases[key]) return keyAliases[key]
  if (key.length === 1) return key.toUpperCase()
  return key
}

const getShortcutFromEvent = (event) => {
  const keyLabel = getKeyLabel(event)
  if (!keyLabel) return ''
  const parts = []
  if (event.ctrlKey) parts.push('Ctrl')
  if (event.altKey) parts.push('Alt')
  if (event.shiftKey) parts.push('Shift')
  if (event.metaKey) parts.push('Meta')
  if (!parts.length && !standaloneKeys.has(keyLabel) && !/^F\d{1,2}$/.test(keyLabel)) return ''
  return [...parts, keyLabel].join('+')
}

const handleShortcutFocus = (target) => { capturingShortcut.value = target }
const handleShortcutBlur = () => { capturingShortcut.value = '' }

const handleShortcutKeydown = (target, event) => {
  if (!event?.key) return
  event.preventDefault(); event.stopPropagation()
  if (event.key === 'Escape') { capturingShortcut.value = ''; return }
  const shortcut = getShortcutFromEvent(event)
  if (!shortcut) return
  if (target === 'screenshot') screenshotShortcut.value = shortcut
  else saveExcerptShortcut.value = shortcut
}

const handleBack = () => emit('back')

const handleNext = async () => {
  if (!canSave.value) return
  isSaving.value = true
  try {
    await saveSetupConfig({ auth: props.auth, account: props.account, shortcuts: { screenshot: screenshotShortcut.value, saveExcerpt: saveExcerptShortcut.value } })
    emit('next')
  } catch (error) { console.warn('Unable to save setup shortcuts:', error) }
  finally { isSaving.value = false }
}
</script>
