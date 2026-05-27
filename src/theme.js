const storageKey = 'kiritecho.theme'
const defaultThemePreference = 'system'
const supportedThemePreferences = ['light', 'dark', 'system']
const systemThemeQuery =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

export const themePreferenceOptions = supportedThemePreferences

export const normalizeThemePreference = (preference) => {
  return supportedThemePreferences.includes(preference) ? preference : defaultThemePreference
}

export const getSystemThemeMode = () => {
  return systemThemeQuery?.matches ? 'dark' : 'light'
}

export const getThemePreference = () => {
  if (typeof localStorage === 'undefined') {
    return defaultThemePreference
  }

  try {
    return normalizeThemePreference(localStorage.getItem(storageKey))
  } catch (error) {
    console.warn('Unable to read theme preference:', error)
    return defaultThemePreference
  }
}

export const resolveThemeMode = (preference = getThemePreference()) => {
  const normalizedPreference = normalizeThemePreference(preference)

  return normalizedPreference === 'system' ? getSystemThemeMode() : normalizedPreference
}

export const applyThemePreference = (preference = getThemePreference()) => {
  const normalizedPreference = normalizeThemePreference(preference)
  const themeMode = resolveThemeMode(normalizedPreference)

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('theme-preference', normalizedPreference)
    document.documentElement.setAttribute('theme-mode', themeMode)
    document.documentElement.classList.toggle('dark', themeMode === 'dark')
    document.documentElement.style.colorScheme = themeMode
  }

  return {
    preference: normalizedPreference,
    themeMode
  }
}

export const setThemePreference = (preference) => {
  const normalizedPreference = normalizeThemePreference(preference)

  try {
    localStorage.setItem(storageKey, normalizedPreference)
  } catch (error) {
    console.warn('Unable to persist theme preference:', error)
  }

  return applyThemePreference(normalizedPreference)
}

export const watchSystemTheme = (callback) => {
  if (!systemThemeQuery) {
    return () => {}
  }

  const handleChange = () => {
    const appliedTheme = applyThemePreference(getThemePreference())
    callback?.(appliedTheme)
  }

  if (systemThemeQuery.addEventListener) {
    systemThemeQuery.addEventListener('change', handleChange)

    return () => {
      systemThemeQuery.removeEventListener('change', handleChange)
    }
  }

  systemThemeQuery.addListener?.(handleChange)

  return () => {
    systemThemeQuery.removeListener?.(handleChange)
  }
}
