<template>
  <div class="ob-shell" style="animation: kt-fade .35s ease both">
    <div class="ob-body">
      <div class="ob-head">
        <div class="eyebrow">{{ t('theme.shortTitle') }}</div>
        <h1 class="ob-title">{{ t('theme.title') }}</h1>
        <p class="ob-sub">{{ t('theme.subtitle') }}</p>
      </div>
      <div class="ob-content">
        <div class="ob-grid3">
          <button
            v-for="theme in THEMES"
            :key="theme.id"
            class="u-select-card"
            :data-active="selectedTheme === theme.id ? 'true' : undefined"
            @click="handleThemeChange(theme.id)"
          >
            <div class="sc-preview">
              <div v-if="theme.id === 'system'" class="tp-split">
                <ThemePreview kind="light" />
                <ThemePreview kind="dark" />
              </div>
              <ThemePreview v-else :kind="theme.id" />
            </div>
            <div class="sc-foot">
              <div style="display: flex; flex-direction: column; gap: 2px">
                <span style="font-weight: 700; font-size: 15.5px; color: var(--ui-text-highlighted)">{{ t(theme.labelKey) }}</span>
                <span style="font-size: 12.5px; color: var(--ui-text-muted)">{{ t(theme.descKey) }}</span>
              </div>
              <span class="sc-check" :data-active="selectedTheme === theme.id ? 'true' : undefined">
                <KtIcon name="check" :size="16" :stroke-width="3" />
              </span>
            </div>
          </button>
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
        <button class="u-btn" data-variant="subtle" data-color="neutral" data-size="lg" @click="handleBack">
          <KtIcon name="arrow-left" :size="17" />
          {{ t('setup.back') }}
        </button>
        <button class="u-btn" data-variant="solid" data-color="primary" data-size="lg" @click="handleNext">
          {{ t('setup.next') }}
          <KtIcon name="arrow-right" :size="17" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, h } from 'vue'
import { useI18n } from 'vue-i18n'
import KtIcon from '@/components/KtIcon.vue'
import { getThemePreference, setThemePreference } from '@/theme'

const { t } = useI18n()
const emit = defineEmits(['back', 'next'])

const stepIndex = 1
const stepCount = 5

const THEMES = [
  { id: 'light', labelKey: 'theme.light', descKey: 'theme.lightDesc' },
  { id: 'dark', labelKey: 'theme.dark', descKey: 'theme.darkDesc' },
  { id: 'system', labelKey: 'theme.system', descKey: 'theme.systemDesc' },
]

const selectedTheme = ref(getThemePreference())

const handleThemeChange = (value) => {
  selectedTheme.value = value
  setThemePreference(value)
}

const handleNext = () => emit('next')
const handleBack = () => emit('back')

const ThemePreview = (props) => {
  const kind = props.kind
  return h('div', { class: `tp tp-${kind}` }, [
    h('div', { class: 'tp-row' }, [
      h('span', { class: 'tp-line a' }),
      h('span', { class: 'tp-line b' }),
    ]),
    h('div', { class: 'tp-row' }, [
      h('span', { class: 'tp-line a2' }),
      h('span', { class: 'tp-line b2' }),
    ]),
    h('div', { class: 'tp-row' }, [
      h('span', { class: 'tp-line a3' }),
      h('span', { class: 'tp-line b3' }),
    ]),
    h('span', { class: `tp-orb ${kind === 'dark' ? 'moon' : 'sun'}` }, [
      h(KtIcon, { name: kind === 'dark' ? 'moon' : 'sun', size: 16 }),
    ]),
  ])
}
ThemePreview.props = ['kind']
</script>
