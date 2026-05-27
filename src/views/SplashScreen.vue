<template>
  <div class="splash-container">
    <div class="bg-animation">
      <div class="grid-layer" />
      <div class="scan-line" />
      <div class="paper-stack">
        <span class="paper-card paper-card-1" />
        <span class="paper-card paper-card-2" />
        <span class="paper-card paper-card-3" />
      </div>
      <div class="signal-lines" />
    </div>

    <header class="brand-logo">
      <span class="brand-mark">Kiritecho</span>
    </header>

    <section class="welcome-copy" aria-labelledby="welcome-title">
      <h1 id="welcome-title" class="welcome-title">{{ t('splash.title') }}</h1>
      <p class="welcome-description">{{ t('splash.description') }}</p>

      <t-checkbox v-model="hasAgreed" class="agreement-checkbox">
        <span class="agreement-text">
          {{ t('splash.agreementPrefix') }}
          <t-link theme="primary" hover="color" @click.stop.prevent>{{ t('splash.userAgreement') }}</t-link>、
          <t-link theme="primary" hover="color" @click.stop.prevent>{{ t('splash.privacyPolicy') }}</t-link>
          {{ t('splash.agreementJoiner') }}
          <t-link theme="primary" hover="color" @click.stop.prevent>{{ t('splash.modelAgreement') }}</t-link>
        </span>
      </t-checkbox>
    </section>

    <div class="start-action">
      <t-button
        theme="primary"
        size="large"
        class="start-btn"
        :disabled="!hasAgreed"
        @click="handleStart"
      >
        {{ t('splash.start') }}
        <template #suffix>
          <Icon name="arrow-right" />
        </template>
      </t-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from 'tdesign-icons-vue-next'

const emit = defineEmits(['start'])

const { t } = useI18n()
const hasAgreed = ref(false)

const handleStart = () => {
  if (!hasAgreed.value) return

  emit('start')
}
</script>
