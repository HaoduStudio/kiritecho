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
      <h1 id="welcome-title" class="welcome-title">欢迎！</h1>
      <p class="welcome-description">让 AI 来助力你的资料摘录体验。</p>

      <t-checkbox v-model="hasAgreed" class="agreement-checkbox">
        <span class="agreement-text">
          我已阅读并同意
          <t-link theme="primary" hover="color" @click.stop>《用户协议》</t-link>、
          <t-link theme="primary" hover="color" @click.stop>《隐私政策》</t-link>
          和
          <t-link theme="primary" hover="color" @click.stop>《第三方大模型使用协议》</t-link>
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
        开始使用
        <template #suffix>
          <Icon name="arrow-right" />
        </template>
      </t-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Icon } from 'tdesign-icons-vue-next'

const hasAgreed = ref(false)

const handleStart = () => {
  if (!hasAgreed.value) return

  console.log('开始使用 Kiritecho')
  // TODO: 路由跳转至主界面
}
</script>
