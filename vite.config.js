import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  base: '/tide-tool-ui/',  // the repo name, this is needed to deploy with GitHub pages
  plugins: [
    vue(),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importLess: true
        })
      ]
    })
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#002C45',
          'success-color': '#6ED56C',
          'error-color': '#E9433F',
          'info-color': '#002C45',
          'font-size-base': '14px',
          'text-color': '#545454',
          'font-family': 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
          'color-background': '#000000'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    cssCodeSplit: false
  }
})
