<template>
  <div class="app-shell" style="animation: kt-fade .4s ease both">
    <aside class="sidebar">
      <div class="sb-brand"><KtLogo :size="20" /></div>
      <nav class="sb-nav kt-scroll">
        <!-- New chat button -->
        <button class="sb-new-chat" @click="startNewChat">
          <KtIcon name="square-pen" :size="17" />
          <span>{{ t('main.newChat') }}</span>
        </button>

        <div class="sb-separator" />

        <!-- Navigation -->
        <div class="sb-section">{{ t('main.navigation') }}</div>
        <button class="nav-item" :data-active="activePage === 'ask' ? 'true' : undefined" @click="activePage = 'ask'">
          <KtIcon name="message" :size="18" />
          <span>{{ t('main.ask') }}</span>
        </button>
        <button class="nav-item" :data-active="activePage === 'settings' ? 'true' : undefined" @click="activePage = 'settings'">
          <KtIcon name="settings" :size="18" />
          <span>{{ t('main.settings') }}</span>
        </button>

        <!-- Conversation history -->
        <template v-if="conversations.length || isLoadingConversations">
          <div class="sb-separator" />
          <div class="sb-section">{{ t('main.recentChats') }}</div>
          <div class="conv-list">
            <div
              v-for="conv in conversations"
              :key="conv.id"
              class="conv-item"
              :data-active="activeConversationId === conv.id ? 'true' : undefined"
            >
              <button class="conv-item-inner" @click="openConversation(conv.id)">
                <!-- Loading title state -->
                <span v-if="conv.title_status === 'pending' || conv.title_status === 'generating'" class="conv-title-loading">
                  <span>{{ t('main.titleGenerating') }}</span>
                  <span class="conv-dots"><span class="conv-dot" /><span class="conv-dot" /><span class="conv-dot" /></span>
                </span>
                <!-- Normal title -->
                <span v-else class="conv-title">{{ conv.title || t('main.newChat') }}</span>
              </button>

              <!-- Actions (show on hover) -->
              <div class="conv-actions">
                <button class="conv-action-btn danger" :title="t('main.deleteChat')" @click.stop="handleDelete(conv.id)">
                  <KtIcon name="trash" :size="14" />
                </button>
              </div>
            </div>
          </div>

          <!-- Load more -->
          <button v-if="hasMore" class="conv-load-more" @click="loadMoreConversations">
            {{ t('main.loadMore') }}
          </button>
        </template>
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
      <AskPage
        v-if="activePage === 'ask'"
        :account="account"
        :conversation-id="activeConversationId"
        @conversation-created="handleConversationCreated"
        @conversation-updated="handleConversationUpdated"
      />
      <SettingsPage v-else :account="account" @logout="emit('logout')" />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import KtIcon from '@/components/KtIcon.vue'
import KtLogo from '@/components/KtLogo.vue'
import AskPage from './AskPage.vue'
import SettingsPage from './SettingsPage.vue'
import { useConversations } from '@/composables/useConversations'

const props = defineProps({
  auth: { type: Object, default: null },
  account: { type: Object, default: null }
})
const emit = defineEmits(['logout'])
const { t } = useI18n()

const activePage = ref('ask')
const activeConversationId = ref(null)

const {
  conversations,
  isLoading: isLoadingConversations,
  hasMore,
  load: loadConversations,
  loadMore: loadMoreConversations,
  refresh: refreshConversations,
  addToTop,
  updateItem,
  removeItem,
  setActive,
  stopTitlePoll,
  scheduleTitlePoll
} = useConversations()

const accountName = computed(() => props.account?.name || t('account.unnamedUser'))
const accountEmail = computed(() => props.account?.email || t('account.noEmail'))
const accountInitial = computed(() => accountName.value.slice(0, 1).toUpperCase())

const startNewChat = () => {
  activeConversationId.value = null
  activePage.value = 'ask'
}

const openConversation = (id) => {
  activeConversationId.value = id
  activePage.value = 'ask'
  setActive(id)
}

const handleConversationCreated = (id, conversation) => {
  activeConversationId.value = id
  setActive(id)
  if (conversation) {
    addToTop(conversation)
  } else {
    addToTop({ id, title: '', title_status: 'pending', created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
  }
  scheduleTitlePoll()
}

const handleConversationUpdated = (id, patch) => {
  if (patch) {
    updateItem(id, patch)
    if (patch.title_status === 'pending' || patch.title_status === 'generating') {
      scheduleTitlePoll()
    }
  }
}

const handleDelete = async (id) => {
  const ok = await removeItem(id)
  if (ok && activeConversationId.value === id) {
    activeConversationId.value = null
  }
}

onMounted(() => {
  loadConversations()
})

onUnmounted(() => {
  stopTitlePoll()
})
</script>
