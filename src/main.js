import { createApp } from 'vue'
import TDesign from 'tdesign-vue-next'

import './styles/theme.css'
import 'tdesign-vue-next/es/style/index.css'
import './styles/splash.css'

import App from './App.vue'

createApp(App).use(TDesign).mount('#app')
