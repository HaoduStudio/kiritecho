const errorMessages = {
  'zh-CN': {
    auth_expired: '登录态已失效，请重新登录',
    missing_api_base_url: '请先配置 API 地址',
    missing_access_token: '缺少访问凭证，请登录后重试',
    network_error: '网络连接失败，请检查网络后重试',
    api_error: '请求失败，请稍后重试',
    unsupported_file_type: '暂不支持此文件类型',
    parse_failed: '文件解析失败，请稍后重试'
  },
  'zh-TW': {
    auth_expired: '登入態已失效，請重新登入',
    missing_api_base_url: '請先設定 API 位址',
    missing_access_token: '缺少存取憑證，請登入後重試',
    network_error: '網路連線失敗，請檢查網路後重試',
    api_error: '請求失敗，請稍後重試',
    unsupported_file_type: '暫不支援此檔案類型',
    parse_failed: '檔案解析失敗，請稍後重試'
  },
  'en-US': {
    auth_expired: 'Session expired. Please log in again.',
    missing_api_base_url: 'API base URL is not configured.',
    missing_access_token: 'Missing access token. Please log in.',
    network_error: 'Network error. Please check your connection.',
    api_error: 'Request failed. Please try again later.',
    unsupported_file_type: 'This file type is not supported.',
    parse_failed: 'File parsing failed. Please try again later.'
  }
}

export const getApiErrorMessage = (code, locale = 'zh-CN') => {
  const messages = errorMessages[locale] || errorMessages['zh-CN']

  return messages[code] || messages.api_error
}
