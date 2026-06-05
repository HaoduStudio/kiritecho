# AGENTS.md

本文件用于指导 Codex 或其他自动化编码代理在本仓库中协作。本仓库现阶段仍在打基础——除「项目架构与范围」章节明确列出的模块外，不要超前实现未明确请求的功能。

## 项目架构与范围

**产品定位**：碎片记忆 AI 整理桌面端（Kiritecho / 拾帖）。

### 端的划分

- **远程服务器**（接口契约见 `backend-api.md`）：账户与会员、订阅与兑换码、对话与聊天补全（含 SSE 流）、记忆/文件同步入云、语义搜索、管理后台。
- **本地 Electron 主进程**：全局快捷键、剪贴板与截屏、文件读取与本地解析（OCR、docx、PDF、网页文图分离），通过 IPC 把结构化的 capture payload 推给渲染进程。
- **渲染进程（Vue）**：UI、鉴权 token、与远程服务器的 HTTP / SSE 交互，把主进程推送的 payload 通过 `/api/v1/memories/sync`、`/api/v1/files/sync`、`/api/v1/chat/completions` 上行。

### 已实现

- splash → language → theme → account → shortcuts 五段 setup 流程。
- Device-code 鉴权（`src/auth/deviceAuthorization.js`）。
- 本地 i18n / theme / shortcuts 持久化。

### 规划中（预留目录，尚未实现）

- `src/services/api/`：远程 API 客户端封装。
- `src/services/capture/`：渲染侧捕获桥接（接收主进程 payload → 调 API 上传）。
- `src/composables/`：跨页面共享的 Vue 组合式逻辑。
- `electron/ipc/`：按能力拆分的 IPC 注册函数。
- `electron/capture/`：globalShortcut、剪贴板、截屏。
- `electron/parse/`：OCR、docx、PDF、网页文图分离。
- 主界面（setup 完成后的内容区）。

## 技术栈与目录约定

- 技术栈：Vue 3、Vite、Electron、Nuxt UI、vue-i18n。
- UI 层以 Nuxt UI 约定为准；仓库中残留的 TDesign 相关依赖、组件或历史代码只按兼容处理，不作为新增 UI 的技术约定。
- 前端入口在 `src/main.js`，根组件在 `src/App.vue`。
- 路径别名 `@` 指向 `src`。

### 渲染进程目录

| 目录 | 职责 |
|------|------|
| `src/views/` | 页面级组件（含 setup 页面与后续主界面） |
| `src/components/` | 可复用 UI 组件 |
| `src/composables/` | 跨页面共享的 Vue 组合式逻辑（如 `useCapture`、`useChat`） |
| `src/services/api/` | 远程 API 客户端，按资源拆分（`apiClient.js` + 端点文件） |
| `src/services/capture/` | 渲染侧"接收主进程 payload → 调 API 上传"的桥接逻辑 |
| `src/auth/` | Device-code 鉴权流程（已有） |
| `src/config/` | 偏好持久化（已有） |
| `src/i18n/` | 国际化配置（已有） |
| `src/styles/` | 共享样式（已有） |
| `src/theme.js` | 主题逻辑（已有） |

### Electron 目录

| 目录/文件 | 职责 |
|-----------|------|
| `electron/main.js` | 应用启动、窗口创建、统一调用各 IPC 注册函数 |
| `electron/preload.js` | 唯一 `contextBridge` 出口 |
| `electron/ipc/` | 每类能力一个 register 函数（i18n、config、window、external、shortcuts、capture、parse），由 `main.js` 统一调用 |
| `electron/capture/` | globalShortcut 绑定、剪贴板读取、截屏 |
| `electron/parse/` | `ocr.js`（Tesseract.js）、`docx.js`（mammoth）、`pdf.js`（pdfjs-dist）、`web.js`（HTML 文图分离） |

## 工作原则

- 只实现用户明确要求的内容；不自行添加未规划的业务页面、产品说明、数据模型或后端接口。
- 修改前先阅读相关现有文件，优先沿用当前结构、命名和样式组织方式。
- 保持改动小而清晰，避免顺手重构无关代码。
- 不要删除或回滚他人已有改动，除非用户明确要求。
- 新增能力时先确认是否已有本地工具、组件、样式变量或 i18n 入口可复用。
- 不把临时调试代码、无用日志、生成产物或个人环境路径提交进仓库。
- 新模块必须落到「技术栈与目录约定」中列出的目录之一；不要随手在 `src/` 或 `electron/` 根下加业务文件。
- 引入新依赖前，先确认是否已有等价实现（API 客户端复用 `requestApi` 模式、持久化复用 `readSettings/writeSettings`、双路写入复用 `saveSetupConfig` 模式）。
- 主进程和渲染进程之间禁止"反向"职责：渲染进程不直接调 Node API，主进程不持有 access token、不直接拼 `Authorization`。
- 新增 IPC channel 必须同步在 `electron/preload.js` 的白名单中注册，且命名要带归属前缀（见「Electron 主进程边界与 IPC 命名」）。

## 编码规范

- Vue 单文件组件使用 `<script setup>`。
- JavaScript 使用 ES module 语法。
- 默认使用 `const`，只有需要重新赋值时使用 `let`。
- 函数命名使用动词开头，例如 `handleNext`、`setAppLocale`、`applyThemePreference`。
- 组件文件使用 PascalCase，例如 `WindowChrome.vue`。
- 普通工具模块使用 camelCase 或语义清晰的小写文件名，例如 `theme.js`。
- 模板中保持语义结构清晰，优先使用 `header`、`main`、`section`、`footer` 等语义标签。
- 不写没有信息量的注释；只有复杂逻辑、平台边界或非显然取舍才补充简短注释。
- 异步持久化或跨平台 API 调用需要用 `try/catch` 包住，并给出可诊断的 `console.warn`。

## Vue 组件规范

- 页面级组件放在 `src/views/`。
- 可复用 UI 或壳层组件放在 `src/components/`。
- 页面状态优先使用 `ref`、`computed` 和明确的事件处理函数。
- 子组件向父组件通信使用 `defineEmits`，事件名保持简短清晰，例如 `back`、`next`、`start`。
- 避免在组件中硬编码展示文案；展示文本优先走 i18n。
- 需要响应系统、窗口或浏览器能力时，先检查 API 是否存在，例如 `window.electronAPI?.send?.(...)`。
- 不在组件里直接堆叠复杂业务流程；可复用逻辑应抽到 `src/` 下的独立模块。
- 捕获/上传相关的业务逻辑放在 `src/composables/` 或 `src/services/`，组件里只做 UI 状态机和事件分发；不要在组件里直接调 `window.electronAPI` 拿原始 payload，统一从 composable 订阅。

## Nuxt UI 使用规范

- 优先使用 Nuxt UI 组件构建交互控件，例如 `UButton`、`UInput`、`UModal`、`UCheckbox`、`UTable`、`UCard`。
- 优先使用 Nuxt UI 内置 props、状态、slots、loading、disabled、icon、modal 等能力，不手写已有组件能提供的基础控件行为。
- Nuxt UI 组件的视觉覆盖应通过局部 class、`ui` 配置和 CSS 变量完成，避免大范围覆盖全局类。
- 组件状态要完整处理：默认、hover、active/checked、disabled、loading。
- 交互控件需要保留可访问性语义；图标按钮应提供 `aria-label`。
- 不确定 Nuxt UI 组件 API、props、slots 或版本差异时，先查询当前 Nuxt UI 文档或 MCP，再修改组件。
- 国旗必须使用 `vue-country-flag-next`；不要用 CSS、SVG、文本或手写图形绘制国旗，也不要切换到 Vue 2 版本的 `vue-country-flag`。

## 远程 API 客户端规范

- 所有客户端共享 `src/services/api/apiClient.js`：负责拼基址（`VITE_KIRITECHO_API_BASE_URL` + `VITE_KIRITECHO_API_BASE_PATH`）、注入 `Authorization` 头、解包 `APIResponse`（`{ success, message, error, data }`）、在 `success === false` 或 HTTP 非 2xx 时抛 `{ code, message }`。
- 流式接口（`POST /api/v1/chat/completions` 当 `stream: true`）走 `apiClient.stream()`：使用 `fetch` + `ReadableStream` 解 SSE，逐 `data:` 事件触发回调；遇到 `[DONE]` 结束；不要把流式响应套进 `APIResponse` 解包。
- 端点封装按 `backend-api.md` 分组：
  - `auth.js`：`fetchCurrentUser`（复用 `src/auth/deviceAuthorization.js` 中已有的 `requestApi`，不要复制）。
  - `plans.js`：`listPlans`、`subscribe`、`redeem`。
  - `conversations.js`：`listConversations`、`createConversation`、`fetchConversation`、`deleteConversation`、`chatCompletions`（含流式）。
  - `memories.js`：`syncMemories`（type: `text | image | web`）。
  - `files.js`：`syncFiles`。
  - `search.js`：`semanticSearch`。
- 鉴权失效（HTTP 401 或 auth 相关 code）统一抛 `auth_expired`；调用方负责清 token 并回到 account setup step。

## Electron 主进程边界与 IPC 命名

### IPC channel 命名规则

所有 channel 遵循 `<domain>:<action>` 格式，domain 白名单：

| 前缀 | 用途 | 示例 |
|------|------|------|
| `app:*` | 窗口/生命周期 | `app:minimize`、`app:close`、`app:open-external` |
| `i18n:*` | 语言偏好 | `i18n:get-locale`、`i18n:set-locale` |
| `config:*` | 设置持久化 | `config:save-setup` |
| `shortcut:*` | 快捷键管理 | `shortcut:update` |
| `capture:*` | 捕获事件推送 | `capture:screenshot`、`capture:save-excerpt` |
| `parse:*` | 文件解析 | `parse:file` |
| `fs:*` | 临时文件读取 | `fs:read-temp` |

### 职责边界

- 渲染进程不要直接依赖 Node API。
- 渲染进程访问 Electron 能力时通过 preload 暴露的 `window.electronAPI`。
- 所有 Electron IPC channel 命名应清晰、稳定，并体现归属。
- 主进程、preload、渲染进程职责分离：窗口控制和系统能力留在 Electron 层，UI 状态留在 Vue 层。
- 主进程禁止直接发起 HTTPS 请求到 Kiritecho 后端；它只产出 payload，由渲染进程上传。
- 注册 globalShortcut 统一封装在 `electron/capture/shortcuts.js`，应用退出时 `globalShortcut.unregisterAll()`。
- 触发截屏时优先使用 Electron 的 `desktopCapturer` + `nativeImage` 落盘到 `app.getPath('temp')`，回传 `{ filePath, width, height }`；不要在 IPC 里直接传超大 Buffer。

### preload 命名空间

`electron/preload.js` 按层级挂到 `window.electronAPI`：

```
electronAPI.i18n.getLocale()
electronAPI.i18n.setLocale(locale)
electronAPI.openExternal(url)
electronAPI.config.saveSetup(payload)
electronAPI.shortcut.update(shortcuts)
electronAPI.capture.on(event, callback)        // 'screenshot' | 'save-excerpt'
electronAPI.capture.removeAllListeners(event)
electronAPI.parse.file(filePath)
electronAPI.fs.readTemp(filePath)
electronAPI.send(channel, data)                // 窗口控制等
electronAPI.on(channel, callback)
electronAPI.removeAllListeners(channel)
```

## 捕获与处理流水线

**硬约束**：捕获 payload 必须先经主进程解析层产出结构化数据，再交给渲染进程上传；渲染进程不直接处理原始 buffer / OCR / PDF。

### text（文本摘录）

saveExcerpt 快捷键 → 主进程 `clipboard.readText()` → 包成 `{ type: 'text', raw_content }` 推到 renderer → renderer 调 `memories.syncMemories`。不做本地分词，分词在云端。

### image（截屏）

screenshot 快捷键 → 主进程截屏落盘临时文件 → `electron/parse/ocr.js` 本地 OCR → 推 `{ type: 'image', filePath, ocrText, dimensions }` 给 renderer → renderer 上传 OCR 文本 + 图片 Base64 给云端多模态。本地 OCR 仅是预提取，云端多模态是最终判定。

### web（网页摘录）

saveExcerpt 命中且剪贴板含 HTML → 主进程 `clipboard.readHTML()` → `electron/parse/web.js` 文图分离 → 文本按 paragraph 拆 chunk，图片 `<img src>` 抽到独立列表 → 推 `{ type: 'web', textChunks, imageChunks, sourceUrl }` 给 renderer → renderer 文本走 memories，图片走 image 路径。

### file — docx/doc

renderer invoke `parse:file` → 主进程 mammoth 抽纯文本 → 回传 `{ kind: 'docx', textChunks }` → renderer 走 `files.syncFiles`。

### file — PDF（三段降级）

1. `pdfjs-dist` 抽每页可选中文本；若为空白或字符密度极低 → 步骤 2。
2. 低字符密度页面渲染为 PNG → `electron/parse/ocr.js` 本地 OCR → 回填文本。
3. 含表格/图表特征页面标记 `needsCloudMultimodal=true`，附带页面 PNG 回传 renderer。

renderer 据此走 `files.syncFiles`（带 `text_content`）和/或 `memories.syncMemories` 的 image 路径。

## Nuxt UI 导入和构建约束

- 新增 UI 控件时遵循 Nuxt / Nuxt UI 的自动导入、组件命名和图标约定，不再沿用旧 UI 框架的手动注册模式。
- 不要新增旧 UI 框架的手动注册、按路径组件导入或图标入口约定；这些属于旧实现痕迹，不应作为新代码参考。
- 新增图标时优先使用 Nuxt UI 支持的图标能力和项目已有图标约定，避免重新引入旧 UI 框架的图标入口。
- 新增第三方依赖后要关注 `npm run build` 输出；如出现超过 500 kB 的 chunk 警告，优先按需导入或在 `vite.config.js` 的 `manualChunks` 中拆分稳定 vendor chunk。
- 不要为了隐藏警告而单纯调高 `chunkSizeWarningLimit`，除非已经确认包体拆分没有实际收益。

### 主进程专属依赖

以下依赖仅在 Electron 主进程使用，**禁止在 `src/` 下引入**：

| 依赖 | 用途 | 备注 |
|------|------|------|
| `tesseract.js` | 本地 OCR | 语言包放 `app.getPath('userData')/tessdata/`，首次按需下载 |
| `mammoth` | docx 文本提取 | — |
| `pdfjs-dist` | PDF 文本/页面提取 | 仅用 `legacy/build/pdf.js`，禁用浏览器侧 |
| `node-html-parser` | HTML 文图分离 | 轻量，无 native 依赖 |

图像预处理推荐先用 Electron 内置 `nativeImage.resize()` + `toPNG()` 兜底，确有需要再引入 `sharp`。

### 渲染侧 chunk 拆分

`vite.config.js` 的 `manualChunks` 不需要为主进程依赖拆 chunk；但 SSE / chat composable 等渲染侧新增依赖应考虑单独 chunk 以避免主 bundle 膨胀。

## 样式规范

- 共享样式按用途拆分到 `src/styles/`。
- 页面专属样式使用清晰前缀，避免污染其它页面。
- 优先使用 CSS 变量管理主题色、文本色、边框、阴影和背景。
- 深色/浅色主题依赖 `:root[theme-mode="..."]` 这类根属性，不在组件里重复判断主题。
- 布局要兼顾窄屏和低高度窗口，新增界面时补充必要的 media query。
- 固定格式的控件、卡片和按钮要设置稳定尺寸或响应式约束，避免文本或状态变化导致布局跳动。
- 支持动效时同时考虑 `prefers-reduced-motion: reduce`。
- 卡片圆角保持克制，除非已有设计模式要求，否则优先使用 8px 左右。

## 国际化规范

- 所有面向用户的文案都放在 `src/i18n/messages.js`。
- 新增文案时同步维护所有已支持语言。
- locale 值沿用已有格式，例如 `zh-CN`、`zh-TW`、`en-US`。
- Nuxt UI 语言包或本地化配置应与应用 locale 保持一致。
- 修改中文文案时注意文件编码，避免出现乱码。
- 不在 i18n 文件中提前写入未实现功能的说明文案。
- 错误码到本地化文案的映射统一在 `src/services/api/errors.js`（或同等位置），不要在每个调用点重复写 `if (code === '...') return t('...')`。

## 主题规范

- 主题偏好统一通过 `src/theme.js` 读写和应用。
- 支持值应保持在明确枚举内，并通过 normalize 函数兜底。
- 需要持久化用户偏好时，优先复用已有 storage key 与 helper。
- 主题相关 DOM 状态统一写到 `document.documentElement`。

## 验证命令

- 本地开发：`npm run dev`
- Electron 开发：`npm run electron:dev`
- 生产构建：`npm run build`
- 预览构建：`npm run preview`
- 涉及主进程模块时，应在 `npm run electron:dev` 下手动触发对应快捷键/文件路径流程，并查看渲染进程控制台的上传日志确认 payload 形状。
- 涉及 API 客户端时，需要 `.env` 已配 `VITE_KIRITECHO_WEB_BASE_URL` / `VITE_KIRITECHO_API_BASE_URL`，否则只能跑构建但跑不通业务路径——应在交付说明中写明。

改动完成后至少运行与修改范围相关的命令。若无法运行，应在交付说明中说明原因。

## 文档约束

- AGENTS.md「项目架构与范围」章节允许描述已规划的模块，但不要把规划写成既成事实——用"规划中"、"预留目录"等表述。
- README、UI 文案、i18n messages 仍然只反映已实现的能力，不要提前写入。
- 不把临时调试脚本作为约定的一部分被引用。
- 只记录当前项目真实存在的技术约定、目录结构和协作规范。
