<template>
  <div class="window-chrome">
    <div class="window-drag-region" />
    <div class="window-controls">
      <t-button
        variant="text"
        shape="square"
        class="window-control-btn"
        aria-label="Minimize"
        @click="minimizeWindow"
      >
        <Icon name="minus" />
      </t-button>
      <t-button
        variant="text"
        shape="square"
        class="window-control-btn window-control-btn--close"
        aria-label="Close"
        @click="closeWindow"
      >
        <Icon name="close" />
      </t-button>
    </div>
  </div>
</template>

<script setup>
import { Icon } from 'tdesign-icons-vue-next'

const minimizeWindow = () => {
  window.electronAPI?.send?.('app:minimize')
}

const closeWindow = () => {
  window.electronAPI?.send?.('app:close')
}
</script>
