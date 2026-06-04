<template>
  <div class="main-layout">
    <aside class="main-sidebar">
      <div class="main-sidebar__drag" />
      <div class="main-sidebar__brand">Kiritecho</div>
      <nav class="main-nav" :aria-label="t('main.navigation')">
        <button
          :class="['main-nav__item', { 'main-nav__item--active': activePage === 'ask' }]"
          type="button"
          @click="activePage = 'ask'"
        >
          <ChatIcon />
          <span>{{ t('main.ask') }}</span>
        </button>
        <button
          :class="['main-nav__item', { 'main-nav__item--active': activePage === 'settings' }]"
          type="button"
          @click="activePage = 'settings'"
        >
          <SettingIcon />
          <span>{{ t('main.settings') }}</span>
        </button>
      </nav>
      <div class="main-sidebar__account">
        <t-avatar :image="account?.image" size="36px">
          {{ accountInitial }}
        </t-avatar>
        <div>
          <div class="main-sidebar__name">{{ accountName }}</div>
          <div class="main-sidebar__email">{{ accountEmail }}</div>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <AskPage v-if="activePage === 'ask'" @conversation-created="handleConversationCreated" />
      <SettingsPage
        v-else
        :account="account"
        @logout="emit('logout')"
      />
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import ChatIcon from 'tdesign-icons-vue-next/esm/components/chat.js'
import SettingIcon from 'tdesign-icons-vue-next/esm/components/setting.js'
import AskPage from './AskPage.vue'
import SettingsPage from './SettingsPage.vue'

const props = defineProps({
  auth: {
    type: Object,
    default: null
  },
  account: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['logout'])

const { t } = useI18n()
const activePage = ref('ask')
const activeConversationId = ref(null)

const accountName = computed(() => props.account?.name || t('account.unnamedUser'))
const accountEmail = computed(() => props.account?.email || t('account.noEmail'))
const accountInitial = computed(() => accountName.value.slice(0, 1).toUpperCase())

const handleConversationCreated = (id) => {
  activeConversationId.value = id
}
</script>
