import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), viteSingleFile()], base: './',
    server: { proxy: { '/api': { target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000', changeOrigin: true }, '/media': { target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000', changeOrigin: true } } },
    build: { cssCodeSplit: false, assetsInlineLimit: 100000000 },
  }
})
