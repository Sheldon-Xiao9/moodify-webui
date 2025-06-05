import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { gsap } from 'gsap'
import App from './App.vue'
import router from './router'

// 导入全局样式
import './assets/styles/main.scss'
import './assets/styles/animations.scss'

// 配置GSAP
gsap.config({
  force3D: true,
  nullTargetWarn: false
})

// 创建应用实例
const app = createApp(App)

// 创建并使用Pinia状态管理
const pinia = createPinia()
app.use(pinia)

// 使用路由
app.use(router)

// 全局属性和方法
app.config.globalProperties.$gsap = gsap

// 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  console.error('Vue Error:', error)
  console.error('Component:', instance)
  console.error('Error Info:', info)
  
  // 在生产环境中可以发送错误到监控服务
  if (import.meta.env.PROD) {
    // 这里可以集成错误监控服务，如Sentry
    console.log('Production error detected, would send to monitoring service')
  }
}

// 全局警告处理
app.config.warnHandler = (msg, instance, trace) => {
  if (import.meta.env.DEV) {
    console.warn('Vue Warning:', msg)
    console.warn('Component:', instance)
    console.warn('Trace:', trace)
  }
}

// 性能监控（开发环境）
if (import.meta.env.DEV) {
  app.config.performance = true
}

// 挂载应用
app.mount('#app')

// 添加全局样式类到body
document.body.classList.add('vue-app')

// 禁用右键菜单（可选）
document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
})

// 禁用文本选择（可选）
document.addEventListener('selectstart', (e) => {
  e.preventDefault()
})

// 禁用拖拽（可选）
document.addEventListener('dragstart', (e) => {
  e.preventDefault()
})

// 监听设备方向变化
window.addEventListener('orientationchange', () => {
  // 延迟处理以等待视口调整完成
  setTimeout(() => {
    // 触发resize事件
    window.dispatchEvent(new Event('resize'))
  }, 100)
})

// 监听视口大小变化
let resizeTimer
window.addEventListener('resize', () => {
  // 防抖处理
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    // 更新CSS变量
    updateViewportVariables()
  }, 100)
})

// 更新视口CSS变量
function updateViewportVariables() {
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  
  document.documentElement.style.setProperty('--vw', `${vw}px`)
  document.documentElement.style.setProperty('--vh', `${vh}px`)
  document.documentElement.style.setProperty('--real-vh', `${vh}px`)
}

// 初始化视口变量
updateViewportVariables()

// 检测设备类型
function detectDevice() {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth > 768
  const isDesktop = !isMobile && !isTablet
  
  document.body.classList.toggle('is-mobile', isMobile)
  document.body.classList.toggle('is-tablet', isTablet)
  document.body.classList.toggle('is-desktop', isDesktop)
  
  // 设置CSS变量
  document.documentElement.style.setProperty('--is-mobile', isMobile ? '1' : '0')
  document.documentElement.style.setProperty('--is-tablet', isTablet ? '1' : '0')
  document.documentElement.style.setProperty('--is-desktop', isDesktop ? '1' : '0')
}

// 初始化设备检测
detectDevice()

// 检测浏览器支持
function checkBrowserSupport() {
  const features = {
    webgl: !!window.WebGLRenderingContext,
    canvas: !!document.createElement('canvas').getContext,
    audioContext: !!(window.AudioContext || window.webkitAudioContext),
    backdropFilter: CSS.supports('backdrop-filter', 'blur(10px)'),
    customProperties: CSS.supports('color', 'var(--test)')
  }
  
  // 添加特性检测类
  Object.entries(features).forEach(([feature, supported]) => {
    document.body.classList.toggle(`supports-${feature}`, supported)
    document.body.classList.toggle(`no-${feature}`, !supported)
  })
  
  // 显示不支持的特性警告
  const unsupportedFeatures = Object.entries(features)
    .filter(([, supported]) => !supported)
    .map(([feature]) => feature)
  
  if (unsupportedFeatures.length > 0) {
    console.warn('Unsupported browser features:', unsupportedFeatures)
  }
  
  return features
}

// 初始化浏览器支持检测
const browserSupport = checkBrowserSupport()

// 预加载关键资源
function preloadResources() {
  // 预加载字体
  const fontLink = document.createElement('link')
  fontLink.rel = 'preload'
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  fontLink.as = 'style'
  fontLink.onload = () => {
    fontLink.rel = 'stylesheet'
  }
  document.head.appendChild(fontLink)
  
  // 预加载图标
  const iconLink = document.createElement('link')
  iconLink.rel = 'preload'
  iconLink.href = '/favicon.ico'
  iconLink.as = 'image'
  document.head.appendChild(iconLink)
}

// 初始化预加载
preloadResources()

// 设置主题
function initializeTheme() {
  // 检测系统主题偏好
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  // 应用主题类
  document.body.classList.toggle('dark-theme', prefersDark)
  document.body.classList.toggle('high-contrast', prefersHighContrast)
  document.body.classList.toggle('reduced-motion', prefersReducedMotion)
  
  // 监听主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    document.body.classList.toggle('dark-theme', e.matches)
  })
  
  window.matchMedia('(prefers-contrast: high)').addEventListener('change', (e) => {
    document.body.classList.toggle('high-contrast', e.matches)
  })
  
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
    document.body.classList.toggle('reduced-motion', e.matches)
  })
}

// 初始化主题
initializeTheme()

// PWA支持
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration)
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}

// 性能监控
if (import.meta.env.DEV) {
  // 监控性能指标
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      console.log(`Performance: ${entry.name} - ${entry.duration}ms`)
    }
  })
  
  observer.observe({ entryTypes: ['measure', 'navigation'] })
  
  // 页面加载完成后的性能报告
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0]
      console.log('Page Load Performance:', {
        DNS: perfData.domainLookupEnd - perfData.domainLookupStart,
        TCP: perfData.connectEnd - perfData.connectStart,
        Request: perfData.responseStart - perfData.requestStart,
        Response: perfData.responseEnd - perfData.responseStart,
        DOM: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        Total: perfData.loadEventEnd - perfData.navigationStart
      })
    }, 0)
  })
}

// 导出应用实例（用于测试）
export default app

// 开发环境下的调试工具
if (import.meta.env.DEV) {
  window.__VUE_APP__ = app
  window.__GSAP__ = gsap
  
  // 添加全局调试方法
  window.debugApp = {
    app,
    gsap,
    browserSupport,
    getStores: () => app.config.globalProperties.$pinia,
    logPerformance: () => {
      console.table(performance.getEntriesByType('navigation')[0])
    }
  }
}
