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
          const n = id.replace(/\\/g, '/')

          if (
            n.includes('/node_modules/vue/') ||
            n.includes('/node_modules/@vue/') ||
            n.includes('/node_modules/vue-i18n/') ||
            n.includes('/node_modules/@intlify/')
          ) return 'vue-vendor'

          if (n.includes('/node_modules/pdfjs-dist/')) return 'pdf-vendor'

          if (
            n.includes('/node_modules/tesseract.js/') ||
            n.includes('/node_modules/tesseract.js-core/')
          ) return 'ocr-vendor'

          if (n.includes('/node_modules/mammoth/')) return 'doc-vendor'

          if (n.includes('/node_modules/lodash-es/')) return 'lodash-vendor'

          if (n.includes('/node_modules/vue-country-flag-next/')) return 'country-flag-vendor'

          if (n.includes('/node_modules/')) return 'vendor'
        }
      }
    }
  }
})
