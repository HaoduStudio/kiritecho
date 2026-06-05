const defaultApiBasePath = '/api/v1'

const normalizeBaseUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return ''
  }

  return value.replace(/\/+$/, '')
}

const getApiBaseUrl = () => {
  const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_KIRITECHO_API_BASE_URL)
  const webBaseUrl = normalizeBaseUrl(import.meta.env.VITE_KIRITECHO_WEB_BASE_URL)
  const basePath = import.meta.env.VITE_KIRITECHO_API_BASE_PATH || defaultApiBasePath
  const base = apiBaseUrl || webBaseUrl

  if (!base) {
    return ''
  }

  const normalizedPath = basePath.startsWith('/') ? basePath : `/${basePath}`

  return base.endsWith(normalizedPath) ? base : `${base}${normalizedPath}`
}

let authTokenGetter = null

export const setAuthTokenGetter = (getter) => {
  authTokenGetter = getter
}

const getAuthorizationHeader = () => {
  const tokenData = authTokenGetter?.()

  if (!tokenData) {
    return ''
  }

  const accessToken = tokenData.accessToken || tokenData.access_token
  const tokenType = tokenData.tokenType || tokenData.token_type || 'Bearer'

  return accessToken ? `${tokenType} ${accessToken}` : ''
}

const getJson = async (response) => {
  const contentType = response.headers.get('content-type') || ''

  if (!contentType.includes('application/json')) {
    return null
  }

  return response.json()
}

const makeApiError = (code, message) => {
  const error = new Error(message)
  error.code = code
  return error
}

const handleResponse = async (response) => {
  const payload = await getJson(response)

  if (!response.ok) {
    const code = payload?.code || payload?.error || `http_${response.status}`
    const message = payload?.error || payload?.message || response.statusText

    if (response.status === 401) {
      throw makeApiError('auth_expired', message)
    }

    throw makeApiError(code, message)
  }

  if (payload?.success === false) {
    const code = payload.code || payload.error || 'api_error'

    if (code === 'auth_expired' || code === 'unauthorized') {
      throw makeApiError('auth_expired', payload.error || payload.message)
    }

    throw makeApiError(code, payload.error || payload.message || 'Request failed')
  }

  return payload?.data ?? payload
}

const request = async (method, path, options = {}) => {
  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    throw makeApiError('missing_api_base_url', 'API base URL is not configured')
  }

  const authorization = getAuthorizationHeader()
  const headers = {
    accept: 'application/json',
    ...options.headers
  }

  if (authorization) {
    headers.authorization = authorization
  }

  if (options.body && typeof options.body === 'object') {
    headers['content-type'] = 'application/json'
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  return handleResponse(response)
}

export const apiClient = {
  get: (path) => request('GET', path),

  post: (path, body) => request('POST', path, { body }),

  put: (path, body) => request('PUT', path, { body }),

  patch: (path, body) => request('PATCH', path, { body }),

  delete: (path) => request('DELETE', path),

  stream: async (path, body, onEvent, onMeta) => {
    const baseUrl = getApiBaseUrl()

    if (!baseUrl) {
      throw makeApiError('missing_api_base_url', 'API base URL is not configured')
    }

    const authorization = getAuthorizationHeader()
    const headers = {
      'content-type': 'application/json',
      accept: 'text/event-stream'
    }

    if (authorization) {
      headers.authorization = authorization
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const payload = await getJson(response)
      const code = payload?.code || payload?.error || `http_${response.status}`

      if (response.status === 401) {
        throw makeApiError('auth_expired', payload?.error || payload?.message || 'Unauthorized')
      }

      throw makeApiError(code, payload?.error || payload?.message || response.statusText)
    }

    onMeta?.({
      conversationId: response.headers.get('X-Conversation-ID') || '',
      traceId: response.headers.get('X-Trace-ID') || ''
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()

        if (!trimmed || trimmed.startsWith(':')) continue

        if (trimmed.startsWith('data: ')) {
          const data = trimmed.slice(6)

          if (data === '[DONE]') {
            onEvent({ done: true })
            return
          }

          try {
            onEvent({ done: false, data: JSON.parse(data) })
          } catch (error) {
            console.warn('Unable to parse SSE data:', error)
          }
        }
      }
    }

    onEvent({ done: true })
  },

  streamSSE: async (path, body, onEvent, onMeta) => {
    const baseUrl = getApiBaseUrl()

    if (!baseUrl) {
      throw makeApiError('missing_api_base_url', 'API base URL is not configured')
    }

    const authorization = getAuthorizationHeader()
    const headers = {
      'content-type': 'application/json',
      accept: 'text/event-stream'
    }

    if (authorization) {
      headers.authorization = authorization
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const payload = await getJson(response)
      const code = payload?.code || payload?.error || `http_${response.status}`

      if (response.status === 401) {
        throw makeApiError('auth_expired', payload?.error || payload?.message || 'Unauthorized')
      }

      throw makeApiError(code, payload?.error || payload?.message || response.statusText)
    }

    onMeta?.({
      conversationId: response.headers.get('X-Conversation-ID') || '',
      traceId: response.headers.get('X-Trace-ID') || ''
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let currentEvent = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()

        if (!trimmed) {
          currentEvent = ''
          continue
        }

        if (trimmed.startsWith(':')) continue

        if (trimmed.startsWith('event: ')) {
          currentEvent = trimmed.slice(7).trim()
          continue
        }

        if (trimmed.startsWith('data: ')) {
          const raw = trimmed.slice(6)

          try {
            const data = JSON.parse(raw)
            onEvent({ event: currentEvent || 'message', data })
          } catch (error) {
            console.warn('Unable to parse SSE data:', error)
          }
        }
      }
    }

    onEvent({ event: 'done', data: null })
  }
}
