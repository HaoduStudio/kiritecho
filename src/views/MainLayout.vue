<template>
  <div class="app-shell" style="animation: kt-fade .4s ease both">
    <aside class="sidebar">
      <div class="sb-brand"><KtLogo :size="20" /></div>
      <nav class="sb-nav">
        <div class="sb-section">{{ t('main.navigation') }}</div>
        <button class="nav-item" :data-active="activePage === 'ask' ? 'true' : undefined" @click="activePage = 'ask'">
          <KtIcon name="message" :size="18" />
          <span>{{ t('main.ask') }}</span>
        </button>
        <button class="nav-item" :data-active="activePage === 'settings' ? 'true' : undefined" @click="activePage = 'settings'">
          <KtIcon name="settings" :size="18" />
          <span>{{ t('main.settings') }}</span>
        </button>
      </nav>
      <div class="sb-foot">
        <button class="user-card">
          <span class="u-avatar" :style="{ width: '36px', height: '36px', fontSize: '14px', background: 'linear-gradient(140deg, var(--gold-400), var(--gold-600))', color: '#1a1407' }">
            {{ accountInitial }}
          </span>
          <div style="display: flex; flex-direction: column; gap: 1px; min-width: 0; text-align: left">
            <span style="font-weight: 600; font-size: 13.5px; color: var(--ui-text-highlighted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ accountName }}</span>
            <span style="font-size: 11.5px; color: var(--ui-text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ accountEmail }}</span>
          </div>
          <KtIcon name="chevrons-up-down" :size="14" style="color: var(--ui-text-dimmed); margin-left: auto" />
        </button>
      </div>
    </aside>
    <main class="app-main">
      <AskPage v-if="activePage === 'ask'" @conversation-created="handleConversationCreated" />
      <SettingsPage v-else :account="account" @logout="emit('logout')" />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import KtIcon from '@/components/KtIcon.vue'
import KtLogo from '@/components/KtLogo.vue'
import AskPage from './AskPage.vue'
import SettingsPage from './SettingsPage.vue'

const props = defineProps({
  auth: { type: Object, default: null },
  account: { type: Object, default: null }
})
const emit = defineEmits(['logout'])
const { t } = useI18n()

const activePage = ref('ask')
const activeConversationId = ref(null)

const accountName = computed(() => props.account?.name || t('account.unnamedUser'))
const accountEmail = computed(() => props.account?.email || t('account.noEmail'))
const accountInitial = computed(() => accountName.value.slice(0, 1).toUpperCase())

const handleConversationCreated = (id) => { activeConversationId.value = id }
</script>
