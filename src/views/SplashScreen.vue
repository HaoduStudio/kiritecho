<template>
  <div class="splash-container">
    <div class="bg-animation">
      <div class="shape-orb orb-1" />
      <div class="shape-orb orb-2" />
      <div class="shape-orb orb-3" />
      <div class="particle-field" />
    </div>

    <div class="content">
      <h1 class="greeting">你好</h1>
      <p class="subtitle">欢迎来到 拾帖</p>
      <t-button
        theme="primary"
        size="large"
        shape="round"
        class="start-btn"
        @click="handleStart"
      >
        开始使用
        <template #suffix>
          <icon name="arrow-right" />
        </template>
      </t-button>
    </div>
  </div>
</template>

<script setup>
import { Icon } from 'tdesign-icons-vue-next'

const handleStart = () => {
  console.log('开始使用 拾帖')
  // TODO: 路由跳转至主界面
}
</script>
