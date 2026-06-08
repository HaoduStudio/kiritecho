import { ref, computed } from 'vue'
import { listConversations, deleteConversation, updateConversation } from '@/services/api/conversations'

export const useConversations = () => {
  const conversations = ref([])
  const isLoading = ref(false)
  const currentPage = ref(1)
  const totalPages = ref(1)
  const total = ref(0)
  const activeId = ref(null)

  let titlePollTimer = null

  const hasMore = computed(() => currentPage.value < totalPages.value)

  const load = async (page = 1) => {
    isLoading.value = true
    try {
      const res = await listConversations(page, 30)
      const data = res?.data ?? res
      if (page === 1) {
        conversations.value = data.items || []
      } else {
        const existing = new Set(conversations.value.map(c => c.id))
        const newItems = (data.items || []).filter(c => !existing.has(c.id))
        conversations.value = [...conversations.value, ...newItems]
      }
      currentPage.value = data.page || page
      totalPages.value = data.total_pages || 1
      total.value = data.total || 0
      scheduleTitlePoll()
    } catch (e) {
      console.warn('Failed to load conversations:', e)
    } finally {
      isLoading.value = false
    }
  }

  const loadMore = () => {
    if (hasMore.value && !isLoading.value) {
      load(currentPage.value + 1)
    }
  }

  const refresh = () => load(1)

  const addToTop = (conversation) => {
    const idx = conversations.value.findIndex(c => c.id === conversation.id)
    if (idx >= 0) {
      conversations.value.splice(idx, 1)
    }
    conversations.value.unshift(conversation)
    total.value = total.value + (idx >= 0 ? 0 : 1)
  }

  const updateItem = (id, patch) => {
    const idx = conversations.value.findIndex(c => c.id === id)
    if (idx >= 0) {
      conversations.value[idx] = { ...conversations.value[idx], ...patch }
    }
  }

  const removeItem = async (id) => {
    try {
      await deleteConversation(id)
      conversations.value = conversations.value.filter(c => c.id !== id)
      total.value = Math.max(0, total.value - 1)
      if (activeId.value === id) {
        activeId.value = null
      }
      return true
    } catch (e) {
      console.warn('Failed to delete conversation:', e)
      return false
    }
  }

  const renameItem = async (id, title) => {
    try {
      await updateConversation(id, title)
      updateItem(id, { title, title_status: 'manual' })
      return true
    } catch (e) {
      console.warn('Failed to rename conversation:', e)
      return false
    }
  }

  const hasPendingTitles = () =>
    conversations.value.some(c => c.title_status === 'pending' || c.title_status === 'generating')

  const scheduleTitlePoll = () => {
    stopTitlePoll()
    if (hasPendingTitles()) {
      titlePollTimer = setTimeout(async () => {
        try {
          const res = await listConversations(1, 30)
          const data = res?.data ?? res
          const freshMap = new Map((data.items || []).map(c => [c.id, c]))
          conversations.value = conversations.value.map(c => {
            const fresh = freshMap.get(c.id)
            if (fresh && (c.title_status === 'pending' || c.title_status === 'generating')) {
              return { ...c, title: fresh.title, title_status: fresh.title_status, title_updated_at: fresh.title_updated_at }
            }
            return c
          })
          scheduleTitlePoll()
        } catch {
          scheduleTitlePoll()
        }
      }, 3000)
    }
  }

  const stopTitlePoll = () => {
    if (titlePollTimer) {
      clearTimeout(titlePollTimer)
      titlePollTimer = null
    }
  }

  const setActive = (id) => {
    activeId.value = id
  }

  return {
    conversations,
    isLoading,
    hasMore,
    total,
    activeId,
    load,
    loadMore,
    refresh,
    addToTop,
    updateItem,
    removeItem,
    renameItem,
    setActive,
    stopTitlePoll,
    scheduleTitlePoll
  }
}
