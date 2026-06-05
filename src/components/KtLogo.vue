<template>
  <span style="display: inline-flex; align-items: center; gap: 9px">
    <span :style="{
      width: size + 'px', height: size + 'px', borderRadius: '7px', flexShrink: 0,
      background: 'linear-gradient(140deg, var(--gold-400), var(--gold-600))',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 1px 3px color-mix(in oklab, var(--gold-600) 50%, transparent)',
    }">
      <span :style="{ width: (size * 0.34) + 'px', height: (size * 0.34) + 'px', borderRadius: '50%', background: 'rgba(0,0,0,.78)' }" />
    </span>
    <span :style="{ fontWeight: 800, fontSize: (size * 0.82) + 'px', letterSpacing: '-0.02em', color: 'var(--ui-text-highlighted)' }">Kiritecho</span>
  </span>
</template>

<script setup>
defineProps({
  size: { type: Number, default: 22 }
})
</script>
