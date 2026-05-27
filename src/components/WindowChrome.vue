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
        <MinusIcon />
      </t-button>
      <t-button
        variant="text"
        shape="square"
        class="window-control-btn window-control-btn--close"
        aria-label="Close"
        @click="closeWindow"
      >
        <CloseIcon />
      </t-button>
    </div>
  </div>
</template>

<script setup>
import MinusIcon from 'tdesign-icons-vue-next/esm/components/minus.js'
import CloseIcon from 'tdesign-icons-vue-next/esm/components/close.js'

const minimizeWindow = () => {
  window.electronAPI?.send?.('app:minimize')
}

const closeWindow = () => {
  window.electronAPI?.send?.('app:close')
}
</script>
