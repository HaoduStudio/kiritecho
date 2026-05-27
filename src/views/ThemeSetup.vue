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

      <main class="setup-content setup-content--theme" aria-labelledby="theme-title">
        <section class="setup-panel theme-panel">
          <p class="setup-eyebrow">{{ t('theme.shortTitle') }}</p>
          <h1 id="theme-title" class="setup-title">{{ t('theme.title') }}</h1>

          <t-radio-group
            v-model="selectedTheme"
            class="theme-options"
            @change="handleThemeChange"
          >
            <t-radio
              v-for="option in themeOptions"
              :key="option.value"
              :value="option.value"
              class="theme-option"
            >
              <span class="theme-option-content">
                <span :class="['theme-preview', `theme-preview--${option.value}`]" aria-hidden="true">
                  <span class="theme-preview-celestial" />
                  <span class="theme-preview-window">
                    <span class="theme-preview-sidebar">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span class="theme-preview-main">
                      <span />
                      <span />
                      <span />
                    </span>
                  </span>
                </span>

                <span class="theme-option-caption">
                  <span class="theme-option-title">{{ t(option.labelKey) }}</span>
                  <span class="theme-option-check">
                    <Icon v-if="selectedTheme === option.value" name="check" />
                  </span>
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
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from 'tdesign-icons-vue-next'
import { getThemePreference, setThemePreference } from '@/theme'

const { t } = useI18n()
const emit = defineEmits(['back', 'next'])

const themeOptions = [
  {
    value: 'light',
    labelKey: 'theme.light'
  },
  {
    value: 'dark',
    labelKey: 'theme.dark'
  },
  {
    value: 'system',
    labelKey: 'theme.system'
  }
]

const selectedTheme = ref(getThemePreference())

const handleThemeChange = (value) => {
  selectedTheme.value = value
  setThemePreference(value)
}

const handleNext = () => {
  emit('next')
}

const handleBack = () => {
  emit('back')
}
</script>
