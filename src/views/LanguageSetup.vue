<template>
  <div class="ob-shell" style="animation: kt-fade .35s ease both">
    <div class="ob-body">
      <div class="ob-head">
        <div class="eyebrow">{{ t('language.shortTitle') }}</div>
        <h1 class="ob-title">{{ t('language.title') }}</h1>
        <p class="ob-sub">{{ t('language.subtitle') }}</p>
      </div>
      <div class="ob-content">
        <div class="ob-list" style="max-width: 720px">
          <button
            v-for="lang in LANGS"
            :key="lang.id"
            class="u-select-row"
            :data-active="selectedLocale === lang.id ? 'true' : undefined"
            @click="handleLocaleChange(lang.id)"
          >
            <span class="flag-tile" aria-hidden="true">
              <CountryFlag :country="lang.flag" size="normal" rounded shadow />
            </span>
            <span style="display: flex; flex-direction: column; gap: 2px">
              <span style="font-weight: 700; font-size: 16px; color: var(--ui-text-highlighted)">{{ lang.label }}</span>
              <span style="font-size: 12.5px; color: var(--ui-text-muted); white-space: nowrap">{{ lang.note }}</span>
            </span>
            <span :style="{ marginLeft: 'auto', color: selectedLocale === lang.id ? 'var(--ui-primary)' : 'transparent' }">
              <KtIcon name="check" :size="20" :stroke-width="2.5" />
            </span>
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
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import CountryFlag from 'vue-country-flag-next'
import KtIcon from '@/components/KtIcon.vue'
import { localeOptions, setAppLocale } from '@/i18n'

const { locale, t } = useI18n()
const emit = defineEmits(['back', 'next'])

const stepIndex = 0
const stepCount = 5

const LANGS = [
  { id: 'zh-CN', label: '简体中文', flag: 'cn', note: 'Simplified Chinese' },
  { id: 'zh-TW', label: '繁體中文', flag: 'hk', note: 'Traditional Chinese' },
  { id: 'en-US', label: 'English', flag: 'us', note: 'English (US)' },
]

const selectedLocale = ref(locale.value)

watch(locale, (value) => {
  selectedLocale.value = value
})

const handleLocaleChange = async (value) => {
  selectedLocale.value = value
  await setAppLocale(value)
}

const handleNext = async () => {
  await setAppLocale(selectedLocale.value)
  emit('next')
}

const handleBack = () => {
  emit('back')
}

</script>

