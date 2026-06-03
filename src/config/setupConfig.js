const setupStorageKey = 'kiritecho.setup'

export const saveSetupConfig = async (payload) => {
  const configPayload = {
    ...payload,
    updatedAt: new Date().toISOString()
  }

  try {
    const savedConfig = await window.electronAPI?.config?.saveSetup?.(configPayload)

    if (savedConfig) {
      return savedConfig
    }
  } catch (error) {
    console.warn('Unable to persist Electron setup config:', error)
  }

  try {
    localStorage.setItem(setupStorageKey, JSON.stringify(configPayload))
  } catch (error) {
    console.warn('Unable to persist browser setup config:', error)
  }

  return configPayload
}
