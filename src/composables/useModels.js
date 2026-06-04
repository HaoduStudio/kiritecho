import { computed, ref } from 'vue'
import { listModels } from '@/services/api/models'

const modelKeySeparator = '::'

export const getModelKey = (model) => `${model.provider_id || ''}${modelKeySeparator}${model.id || ''}`

const normalizeModel = (model) => ({
  id: model?.id || '',
  name: model?.name || model?.id || '',
  provider_id: model?.provider_id || '',
  provider_name: model?.provider_name || '',
  max_tokens: Number(model?.max_tokens) || 4096,
  supports_stream: model?.supports_stream !== false,
  enabled: model?.enabled !== false
})

export const useModels = () => {
  const models = ref([])
  const defaultModelId = ref('')
  const selectedModelKey = ref('')
  const isLoading = ref(false)
  const error = ref(null)

  const availableModels = computed(() => (
    models.value.filter((model) => model.enabled && model.supports_stream)
  ))

  const selectedModel = computed(() => (
    availableModels.value.find((model) => getModelKey(model) === selectedModelKey.value) || null
  ))

  const hasAvailableModels = computed(() => availableModels.value.length > 0)

  const selectModel = (model) => {
    selectedModelKey.value = model ? getModelKey(model) : ''
  }

  const selectModelKey = (key) => {
    const model = availableModels.value.find((item) => getModelKey(item) === key)
    selectedModelKey.value = model ? key : ''
  }

  const loadModels = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await listModels()
      defaultModelId.value = data?.default_model || ''
      models.value = Array.isArray(data?.models) ? data.models.map(normalizeModel) : []

      const defaultModel = availableModels.value.find((model) => model.id === defaultModelId.value)
      selectModel(defaultModel || availableModels.value[0] || null)
    } catch (loadError) {
      console.warn('Unable to load available models:', loadError)
      models.value = []
      selectedModelKey.value = ''
      error.value = loadError
    } finally {
      isLoading.value = false
    }
  }

  return {
    models,
    availableModels,
    defaultModelId,
    selectedModelKey,
    selectedModel,
    hasAvailableModels,
    isLoading,
    error,
    loadModels,
    selectModelKey
  }
}
