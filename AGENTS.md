# AGENTS.md

本文件用于指导 Codex 或其他自动化编码代理在本仓库中协作。请遵守当前项目边界：不要假设、描述或实现尚未明确要求的产品功能；仓库目前只应按已有页面与基础设施继续演进。

## 项目基线

- 技术栈：Vue 3、Vite、Electron、TDesign Vue Next、vue-i18n。
- 前端入口在 `src/main.js`，根组件在 `src/App.vue`。
- Electron 主进程相关代码放在 `electron/`。
- 共享样式放在 `src/styles/`，主题逻辑放在 `src/theme.js`。
- 国际化配置放在 `src/i18n/`。
- 路径别名 `@` 指向 `src`。

## 工作原则

- 只实现用户明确要求的内容；不自行添加未规划的业务页面、产品说明、数据模型或后端接口。
- 修改前先阅读相关现有文件，优先沿用当前结构、命名和样式组织方式。
- 保持改动小而清晰，避免顺手重构无关代码。
- 不要删除或回滚他人已有改动，除非用户明确要求。
- 新增能力时先确认是否已有本地工具、组件、样式变量或 i18n 入口可复用。
- 不把临时调试代码、无用日志、生成产物或个人环境路径提交进仓库。

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

## TDesign Vue 使用规范

- 优先使用 TDesign Vue 组件构建交互控件，例如 `t-button`、`t-radio-group`、`t-radio`、`t-config-provider`。
- 不手写已有 TDesign 能提供的基础控件行为，例如按钮 loading、disabled、单选组状态等。
- TDesign 组件的视觉覆盖应通过局部 class 和 CSS 变量完成，避免大范围覆盖全局类。
- 组件状态要完整处理：默认、hover、active/checked、disabled、loading。
- 交互控件需要保留可访问性语义；图标按钮应提供 `aria-label`。
- TDesign 国际化配置应继续通过根部 `t-config-provider` 注入。

## 按需导入和构建约束

- 本项目为了控制构建产物体积，不使用 `app.use(TDesign)` 全量注册。
- 新增 TDesign 组件时，必须在 `src/main.js` 中从对应的 `tdesign-vue-next/es/...` 路径导入，并加入 `tdesignComponents` 数组。
- 不要重新引入 `tdesign-vue-next/es/style/index.css`，组件样式应随按需组件入口导入。
- 新增图标时，不要从 `tdesign-icons-vue-next` 根入口导入通用 `Icon` 组件。
- 图标应从具体文件导入，例如 `tdesign-icons-vue-next/esm/components/arrow-right.js`，并在模板中使用明确组件名，例如 `<ArrowRightIcon />`。
- 新增第三方依赖后要关注 `npm run build` 输出；如出现超过 500 kB 的 chunk 警告，优先按需导入或在 `vite.config.js` 的 `manualChunks` 中拆分稳定 vendor chunk。
- 不要为了隐藏警告而单纯调高 `chunkSizeWarningLimit`，除非已经确认包体拆分没有实际收益。

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
- TDesign 语言包映射应与应用 locale 保持一致。
- 修改中文文案时注意文件编码，避免出现乱码。
- 不在 i18n 文件中提前写入未实现功能的说明文案。

## 主题规范

- 主题偏好统一通过 `src/theme.js` 读写和应用。
- 支持值应保持在明确枚举内，并通过 normalize 函数兜底。
- 需要持久化用户偏好时，优先复用已有 storage key 与 helper。
- 主题相关 DOM 状态统一写到 `document.documentElement`。

## Electron 边界

- 渲染进程不要直接依赖 Node API。
- 渲染进程访问 Electron 能力时通过 preload 暴露的 `window.electronAPI`。
- 所有 Electron IPC channel 命名应清晰、稳定，并体现归属，例如 `app:minimize`。
- 主进程、preload、渲染进程职责分离：窗口控制和系统能力留在 Electron 层，UI 状态留在 Vue 层。

## 验证命令

- 本地开发：`npm run dev`
- Electron 开发：`npm run electron:dev`
- 生产构建：`npm run build`
- 预览构建：`npm run preview`

改动完成后至少运行与修改范围相关的命令。若无法运行，应在交付说明中说明原因。

## 文档约束

- 不在 `AGENTS.md`、README、注释或 UI 文案中描述尚未实现的功能。
- 不把开始页以外的设想写成既定事实。
- 只记录当前项目真实存在的技术约定、目录结构和协作规范。
