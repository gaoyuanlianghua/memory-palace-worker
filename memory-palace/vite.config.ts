import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

/**
 * 构建时将 VITE_API_ORIGINS（逗号分隔端点列表）注入到 public/console.html，
 * 实现多端点就近选择与故障切换。留空 = 同源模式。
 */
function injectApiOrigins(): Plugin {
  return {
    name: 'inject-api-origins',
    apply: 'build',
    closeBundle() {
      const outDir = path.resolve(__dirname, 'dist')
      const dest = path.join(outDir, 'console.html')
      const src = path.resolve(__dirname, 'public', 'console.html')
      try {
        const html = readFileSync(src, 'utf-8')
        const origins = (process.env.VITE_API_ORIGINS || '').trim()
        const injected = origins
          ? html.replace("(window.__API_ORIGINS__ || '')", "('" + origins.replace(/'/g, "\\'") + "')")
          : html
        mkdirSync(outDir, { recursive: true })
        writeFileSync(dest, injected)
        console.log('[inject-api-origins] console.html injected' + (origins ? ': ' + origins : ' (同源)'))
      } catch (e) {
        console.warn('[inject-api-origins] skipped:', (e as Error).message)
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), injectApiOrigins()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://gyuanpalace.xyz',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
