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

      <main class="setup-content" aria-labelledby="language-title">
        <section class="setup-panel language-panel">
          <p class="setup-eyebrow">{{ t('language.shortTitle') }}</p>
          <h1 id="language-title" class="setup-title">{{ t('language.title') }}</h1>

          <t-radio-group
            v-model="selectedLocale"
            class="language-options"
            @change="handleLocaleChange"
          >
            <t-radio
              v-for="option in localeOptions"
              :key="option.value"
              :value="option.value"
              class="language-option"
            >
              <span class="language-option-content">
                <span class="language-option-flag" aria-hidden="true">
                  <CountryFlag :country="option.country" size="big" rounded />
                </span>
                <span class="language-option-title">{{ option.nativeName }}</span>
                <span class="language-option-check">
                  <Icon v-if="selectedLocale === option.value" name="check" />
                </span>
              </span>
            </t-radio>
          </t-radio-group>
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
            <Icon name="arrow-left" />
          </template>
          {{ t('setup.back') }}
        </t-button>

        <t-button
          theme="primary"
          size="large"
          class="start-btn setup-next-btn"
          :loading="isSaving"
          @click="handleNext"
        >
          {{ t('setup.next') }}
          <template #suffix>
            <Icon name="arrow-right" />
          </template>
        </t-button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from 'tdesign-icons-vue-next'
import CountryFlag from 'vue-country-flag-next'
import { localeOptions, setAppLocale } from '@/i18n'

const { locale, t } = useI18n()
const emit = defineEmits(['back', 'next'])

const selectedLocale = ref(locale.value)
const isSaving = ref(false)

watch(locale, (value) => {
  selectedLocale.value = value
})

const saveLocale = async (value) => {
  isSaving.value = true

  try {
    await setAppLocale(value)
  } finally {
    isSaving.value = false
  }
}

const handleLocaleChange = async (value) => {
  await saveLocale(value)
}

const handleNext = async () => {
  await saveLocale(selectedLocale.value)
  emit('next')
}

const handleBack = () => {
  emit('back')
}
</script>
