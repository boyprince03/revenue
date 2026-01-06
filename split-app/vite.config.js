import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite' // 新增這一行

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(),tailwindcss(),],
  
  build: {
    // 1. 調整警告門檻：將限制從預設 500kb 提高到 1000kb (1MB)
    // 這樣可以減少不必要的警告干擾
    chunkSizeWarningLimit: 1000,
    
    // 2. Rollup 打包設定
    rollupOptions: {
      output: {
        // 自定義分塊策略：將第三方套件拆開
        manualChunks(id) {
          // 檢查是否為 node_modules 中的套件
          if (id.includes('node_modules')) {
            
            // 獨立拆分 Firebase，因為它通常體積最大
            if (id.includes('firebase')) {
              return 'firebase';
            }
            
            // 將 Vue 核心生態系 (Vue, Router, Pinia, I18n) 打包在一起
            // 這些通常是頁面運作的基礎，適合放在同一包
            if (id.includes('vue') || id.includes('pinia') || id.includes('router') || id.includes('vue-i18n')) {
              return 'vue-libs';
            }
            
            // 其他所有剩餘的 node_modules 套件歸為 vendor
            return 'vendor';
          }
        },
      },
    },
  },
})