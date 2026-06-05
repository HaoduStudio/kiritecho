<template>
  <div class="wl-split" style="animation: kt-fade .4s ease both">
    <div class="wl-left">
      <span class="u-badge" data-variant="subtle" style="align-self: flex-start">
        <KtIcon name="sparkles" :size="12" />
        {{ t('splash.badge') }}
      </span>
      <h1 class="wl-hero">{{ t('splash.heroTitle') }}</h1>
      <p class="wl-sub">{{ t('splash.heroSub') }}</p>
      <div class="wl-actions">
        <label class="ob-agree">
          <button
            type="button"
            role="checkbox"
            :aria-checked="hasAgreed"
            class="u-check"
            :data-checked="hasAgreed ? 'true' : 'false'"
            @click="hasAgreed = !hasAgreed"
          >
            <KtIcon v-if="hasAgreed" name="check" :size="14" :stroke-width="3" />
          </button>
          <span class="ob-agree-text">
            {{ t('splash.agreementPrefix') }}
            <a class="u-link" @click.prevent>{{ t('splash.userAgreement') }}</a>、
            <a class="u-link" @click.prevent>{{ t('splash.privacyPolicy') }}</a>
            {{ t('splash.agreementJoiner') }}
            <a class="u-link" @click.prevent>{{ t('splash.modelAgreement') }}</a>
          </span>
        </label>
        <button
          class="u-btn"
          data-variant="solid"
          data-color="primary"
          data-size="xl"
          data-block="true"
          :disabled="!hasAgreed"
          @click="handleStart"
        >
          {{ t('splash.start') }}
          <KtIcon name="arrow-right" :size="18" />
        </button>
      </div>
    </div>
    <div class="wl-right">
      <div class="ws-wrap">
        <div class="ws-glow" />
        <div class="ws-card" :style="{ transform: 'translate(36px, -30px) rotate(6deg)', zIndex: 1, width: '250px' }">
          <div class="ws-bar" style="width: 46%" />
          <div class="ws-line" style="width: 80%" />
          <div class="ws-line" style="width: 64%" />
          <div class="ws-line" style="width: 70%" />
        </div>
        <div class="ws-card" :style="{ transform: 'translate(-26px, 34px) rotate(-4deg)', zIndex: 2, width: '270px' }">
          <div class="ws-bar" style="width: 46%" />
          <div class="ws-line" style="width: 86%" />
          <div class="ws-line" style="width: 58%" />
          <div class="ws-line" style="width: 74%" />
          <div class="ws-line" style="width: 48%" />
        </div>
        <div class="ws-card" :style="{ transform: 'translate(70px, 108px) rotate(9deg)', zIndex: 3, width: '230px' }">
          <div class="ws-bar" style="width: 46%" />
          <div class="ws-line" style="width: 72%" />
          <div class="ws-line" style="width: 66%" />
        </div>
        <div class="ws-chip" style="top: 22px; right: 40px">
          <KtIcon name="sparkles" :size="14" /> AI {{ t('splash.chipExtract') }}
        </div>
        <div class="ws-chip ws-chip-2" style="bottom: 28px; left: 24px">
          <KtIcon name="scissors" :size="13" /> {{ t('splash.chipScreenshot') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import KtIcon from '@/components/KtIcon.vue'

const emit = defineEmits(['start'])
const { t } = useI18n()
const hasAgreed = ref(false)

const handleStart = () => {
  if (!hasAgreed.value) return
  emit('start')
}
</script>
