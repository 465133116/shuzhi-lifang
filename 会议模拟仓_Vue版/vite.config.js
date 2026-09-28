import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  test: {
    environment: 'jsdom',
    exclude: ['tests/e2e/**', 'node_modules/**']
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'main.js',
      name: 'SimulateRoomLib',
      fileName: () => 'simulate-room.iife.js',
      formats: ['iife']
    },
    rollupOptions: {
      // 确保将 vue 和 pinia 打包进最终文件
      external: [],
      output: {
        globals: {}
      }
    }
  }
})
