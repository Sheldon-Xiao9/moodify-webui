import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // Vue插件选项
      template: {
        compilerOptions: {
          // 编译器选项
          isCustomElement: (tag) => tag.startsWith('emoji-')
        }
      }
    })
  ],
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/components/views'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@composables': resolve(__dirname, 'src/composables'),
      '@utils': resolve(__dirname, 'src/utils')
    }
  },
  
  // CSS配置
  css: {
    preprocessorOptions: {
      scss: {
        // 全局SCSS变量
        additionalData: `
          @import "@/assets/styles/variables.scss";
          @import "@/assets/styles/mixins.scss";
        `
      }
    },
    // 模块化CSS
    modules: {
      localsConvention: 'camelCase'
    }
  },
  
  // 开发服务器配置
  server: {
    host: true, // 监听所有地址
    port: 3000,
    open: true, // 自动打开浏览器
    cors: true,
    // 代理配置（如果需要）
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 生成源码映射
    sourcemap: false,
    // 最小化
    minify: 'terser',
    // Terser选项
    terserOptions: {
      compress: {
        drop_console: true, // 移除console
        drop_debugger: true // 移除debugger
      }
    },
    // Rollup选项
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        // 代码分割
        manualChunks: {
          vendor: ['vue', 'pinia'],
          animations: ['gsap'],
          audio: ['howler']
        },
        // 资源命名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/media/[name]-[hash][extname]`
          }
          if (/\.(png|jpe?g|gif|svg|webp|avif)(\?.*)?$/i.test(assetInfo.name)) {
            return `assets/img/[name]-[hash][extname]`
          }
          if (ext === 'css') {
            return `assets/css/[name]-[hash][extname]`
          }
          return `assets/[ext]/[name]-[hash][extname]`
        }
      }
    },
    // 资源大小警告限制
    chunkSizeWarningLimit: 1000
  },
  
  // 依赖优化
  optimizeDeps: {
    include: [
      'vue',
      'pinia',
      'gsap',
      'howler'
    ],
    exclude: [
      // 排除不需要预构建的依赖
    ]
  },
  
  // 环境变量前缀
  envPrefix: 'VITE_',
  
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  },
  
  // 实验性功能
  experimental: {
    // 启用实验性功能
  },
  
  // 日志级别
  logLevel: 'info',
  
  // 清除屏幕
  clearScreen: false,
  
  // 定义全局常量
  define: {
    __VUE_OPTIONS_API__: false,
    __VUE_PROD_DEVTOOLS__: false,
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },
  
  // 工作线程配置
  worker: {
    format: 'es'
  }
})
