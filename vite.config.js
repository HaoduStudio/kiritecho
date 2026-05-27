import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const projectRoot = resolve(__dirname)

export default defineConfig({
  root: projectRoot,
  plugins: [vue()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/')

          if (
            normalizedId.includes('/node_modules/vue/') ||
            normalizedId.includes('/node_modules/@vue/') ||
            normalizedId.includes('/node_modules/vue-i18n/') ||
            normalizedId.includes('/node_modules/@intlify/')
          ) {
            return 'vue-vendor'
          }

          if (normalizedId.includes('/node_modules/tdesign-vue-next/')) {
            return 'tdesign-vendor'
          }

          if (normalizedId.includes('/node_modules/lodash-es/')) {
            return 'lodash-vendor'
          }

          if (normalizedId.includes('/node_modules/vue-country-flag-next/')) {
            return 'country-flag-vendor'
          }

          if (normalizedId.includes('/node_modules/')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
