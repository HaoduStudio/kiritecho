const errorMessages = {
  'zh-CN': {
    auth_expired: '登录态已失效，请重新登录',
    missing_api_base_url: '请先配置 API 地址',
    missing_access_token: '缺少访问凭证，请登录后重试',
    quota_exceeded: '额度不足，请调整计划或稍后再试',
    model_not_available: '当前模型不可用，请切换模型后重试',
    provider_not_available: '当前模型服务不可用，请切换模型后重试',
    conversation_not_found: '未找到这个对话，请重新开始',
    validation_error: '请求内容有误，请检查后重试',
    network_error: '网络连接失败，请检查网络后重试',
    api_error: '请求失败，请稍后重试',
    unsupported_file_type: '暂不支持此文件类型',
    parse_failed: '文件解析失败，请稍后重试'
  },
  'zh-TW': {
    auth_expired: '登入態已失效，請重新登入',
    missing_api_base_url: '請先設定 API 位址',
    missing_access_token: '缺少存取憑證，請登入後重試',
    quota_exceeded: '額度不足，請調整方案或稍後再試',
    model_not_available: '目前模型不可用，請切換模型後重試',
    provider_not_available: '目前模型服務不可用，請切換模型後重試',
    conversation_not_found: '找不到這個對話，請重新開始',
    validation_error: '請求內容有誤，請檢查後重試',
    network_error: '網路連線失敗，請檢查網路後重試',
    api_error: '請求失敗，請稍後重試',
    unsupported_file_type: '暫不支援此檔案類型',
    parse_failed: '檔案解析失敗，請稍後重試'
  },
  'en-US': {
    auth_expired: 'Session expired. Please log in again.',
    missing_api_base_url: 'API base URL is not configured.',
    missing_access_token: 'Missing access token. Please log in.',
    quota_exceeded: 'Quota is not enough. Change your plan or try again later.',
    model_not_available: 'This model is not available. Choose another model and retry.',
    provider_not_available: 'This model provider is not available. Choose another model and retry.',
    conversation_not_found: 'Conversation not found. Start a new one.',
    validation_error: 'The request is invalid. Check it and try again.',
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
