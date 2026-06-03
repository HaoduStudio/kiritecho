const defaultBasePath = '/api/auth'
const defaultApiBasePath = '/api/v1'
const deviceGrantType = 'urn:ietf:params:oauth:grant-type:device_code'
const authStorageKey = 'kiritecho.auth'

const normalizeBaseUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return ''
  }

  return value.replace(/\/+$/, '')
}

const getWebOrigin = (baseUrl) => {
  try {
    return new URL(baseUrl).origin
  } catch (error) {
    console.warn('Unable to parse Better Auth base URL:', error)
    return ''
  }
}

const getAuthBaseUrl = () => {
  const webBaseUrl = normalizeBaseUrl(import.meta.env.VITE_KIRITECHO_WEB_BASE_URL)
  const authBaseUrl = normalizeBaseUrl(import.meta.env.VITE_BETTER_AUTH_BASE_URL)
  const basePath = import.meta.env.VITE_BETTER_AUTH_BASE_PATH || defaultBasePath

  if (authBaseUrl) {
    return authBaseUrl
  }

  if (!webBaseUrl) {
    return ''
  }

  return `${webBaseUrl}${basePath.startsWith('/') ? basePath : `/${basePath}`}`
}

const appendBasePath = (baseUrl, basePath) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
  const normalizedBasePath = basePath.startsWith('/') ? basePath : `/${basePath}`

  if (!normalizedBaseUrl) {
    return ''
  }

  if (normalizedBaseUrl.endsWith(normalizedBasePath)) {
    return normalizedBaseUrl
  }

  return `${normalizedBaseUrl}${normalizedBasePath}`
}

const getApiBaseUrl = () => {
  const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_KIRITECHO_API_BASE_URL)
  const webBaseUrl = normalizeBaseUrl(import.meta.env.VITE_KIRITECHO_WEB_BASE_URL)
  const basePath = import.meta.env.VITE_KIRITECHO_API_BASE_PATH || defaultApiBasePath

  return appendBasePath(apiBaseUrl || webBaseUrl, basePath)
}

const getJson = async (response) => {
  const contentType = response.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) {
    return null
  }

  return response.json()
}

const requestAuth = async (path, body) => {
  const authBaseUrl = getAuthBaseUrl()

  if (!authBaseUrl) {
    throw Object.assign(new Error('missing_base_url'), { code: 'missing_base_url' })
  }

  const response = await fetch(`${authBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(body)
  })
  const payload = await getJson(response)

  if (!response.ok || payload?.error) {
    const error = new Error(payload?.error_description || payload?.message || response.statusText)
    error.code = payload?.error || payload?.code || `http_${response.status}`
    throw error
  }

  return payload
}

const getAuthorizationHeader = (tokenData) => {
  const accessToken = tokenData?.accessToken || tokenData?.access_token

  if (!accessToken) {
    return ''
  }

  const tokenType = tokenData?.tokenType || tokenData?.token_type || 'Bearer'

  return `${tokenType} ${accessToken}`
}

const requestApi = async (path, tokenData) => {
  const apiBaseUrl = getApiBaseUrl()
  const authorization = getAuthorizationHeader(tokenData)

  if (!apiBaseUrl) {
    throw Object.assign(new Error('missing_api_base_url'), { code: 'missing_api_base_url' })
  }

  if (!authorization) {
    throw Object.assign(new Error('missing_access_token'), { code: 'missing_access_token' })
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization
    },
    credentials: 'include'
  })
  const payload = await getJson(response)

  if (!response.ok || payload?.success === false) {
    const error = new Error(payload?.error || payload?.message || response.statusText)
    error.code = payload?.code || payload?.error || `http_${response.status}`
    throw error
  }

  return payload?.data ?? payload
}

export const authConfig = {
  get authBaseUrl() {
    return getAuthBaseUrl()
  },
  get apiBaseUrl() {
    return getApiBaseUrl()
  },
  get webBaseUrl() {
    return normalizeBaseUrl(import.meta.env.VITE_KIRITECHO_WEB_BASE_URL) || getWebOrigin(getAuthBaseUrl())
  },
  get clientId() {
    return import.meta.env.VITE_BETTER_AUTH_CLIENT_ID || 'kiritecho-app'
  },
  get scope() {
    return import.meta.env.VITE_BETTER_AUTH_SCOPE || 'openid profile email'
  }
}

export const getBrowserVerificationUrl = (deviceData) => {
  const verificationUrl = deviceData?.verification_uri_complete || deviceData?.verification_uri

  if (!verificationUrl) {
    return ''
  }

  try {
    return new URL(verificationUrl, authConfig.webBaseUrl || window.location.origin).toString()
  } catch (error) {
    console.warn('Unable to build device verification URL:', error)
    return verificationUrl
  }
}

export const requestDeviceCode = () => requestAuth('/device/code', {
  client_id: authConfig.clientId,
  scope: authConfig.scope
})

export const pollDeviceToken = (deviceCode) => requestAuth('/device/token', {
  grant_type: deviceGrantType,
  device_code: deviceCode,
  client_id: authConfig.clientId
})

export const normalizeAuthToken = (tokenData) => ({
  accessToken: tokenData?.access_token || tokenData?.accessToken || '',
  refreshToken: tokenData?.refresh_token || tokenData?.refreshToken || '',
  tokenType: tokenData?.token_type || tokenData?.tokenType || 'Bearer',
  expiresIn: Number(tokenData?.expires_in ?? tokenData?.expiresIn) || null,
  scope: tokenData?.scope || '',
  savedAt: tokenData?.savedAt || new Date().toISOString()
})

export const saveAuthToken = (tokenData) => {
  const authToken = normalizeAuthToken(tokenData)

  try {
    localStorage.setItem(authStorageKey, JSON.stringify(authToken))
  } catch (error) {
    console.warn('Unable to persist auth token:', error)
  }

  return authToken
}

export const clearAuthToken = () => {
  try {
    localStorage.removeItem(authStorageKey)
  } catch (error) {
    console.warn('Unable to clear auth token:', error)
  }
}

export const fetchCurrentUser = (tokenData) => requestApi('/auth/me', tokenData)
