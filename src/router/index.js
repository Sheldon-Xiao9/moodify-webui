import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/components/views/HomeView.vue'
import ResultsView from '@/components/views/ResultsView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Moodify - 情绪音乐推荐',
      description: '通过AI分析您的情绪，为您推荐最适合的音乐'
    }
  },
  {
    path: '/results',
    name: 'results',
    component: ResultsView,
    meta: {
      title: 'Moodify - 推荐结果',
      description: '基于您的情绪为您量身定制的音乐推荐',
      requiresEmotion: true // 需要情绪数据才能访问
    }
  },
  // 404 页面 - 重定向到首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的滚动位置，恢复它
    if (savedPosition) {
      return savedPosition
    }
    // 否则滚动到顶部
    return { top: 0 }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  // 更新页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 更新meta描述
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description)
    }
  }
  
  // 检查是否需要情绪数据
  if (to.meta.requiresEmotion) {
    // 检查是否有情绪数据（可以从store或localStorage获取）
    const hasEmotionData = checkEmotionData()
    
    if (!hasEmotionData && from.name !== 'home') {
      // 如果没有情绪数据且不是从首页来的，重定向到首页
      console.warn('Redirecting to home: No emotion data found')
      next({ name: 'home' })
      return
    }
  }
  
  // 页面加载进度指示
  if (to.meta.showProgress !== false) {
    startPageProgress()
  }
  
  next()
})

// 全局后置钩子
router.afterEach((to, from) => {
  // 结束页面加载进度
  endPageProgress()
  
  // 页面访问统计（如果需要）
  if (import.meta.env.PROD) {
    // 这里可以添加页面访问统计逻辑
    console.log('Page view:', to.path)
  }
  
  // 页面切换动画完成后的回调
  setTimeout(() => {
    // 确保页面渲染完成后再执行某些操作
    if (to.name === 'results') {
      // 结果页加载完成，可以预加载音频等
      console.log('Results page loaded, ready for audio preload')
    }
  }, 100)
})

// 检查情绪数据是否存在
function checkEmotionData() {
  // 检查sessionStorage中是否有情绪数据
  const emotionData = sessionStorage.getItem('moodify_emotion_data')
  return !!emotionData
}

// 导出路由实例
export default router

// 导出路由相关的工具函数
export const navigateToResults = (emotionData) => {
  // 保存情绪数据到sessionStorage
  sessionStorage.setItem('moodify_emotion_data', JSON.stringify(emotionData))
  
  // 导航到结果页
  router.push({ name: 'results' })
}

export const navigateToHome = () => {
  // 清除情绪数据
  sessionStorage.removeItem('moodify_emotion_data')
  
  // 导航到首页
  router.push({ name: 'home' })
}

export const getEmotionData = () => {
  const data = sessionStorage.getItem('moodify_emotion_data')
  return data ? JSON.parse(data) : null
}

// 页面加载进度控制
let progressTimer = null

const startPageProgress = () => {
  // 简单的进度指示，可以配合全局加载组件使用
  if (typeof window !== 'undefined') {
    document.body.classList.add('page-loading')
  }
}

const endPageProgress = () => {
  // 延迟移除加载状态，确保页面渲染完成
  if (progressTimer) {
    clearTimeout(progressTimer)
  }
  
  progressTimer = setTimeout(() => {
    if (typeof window !== 'undefined') {
      document.body.classList.remove('page-loading')
    }
  }, 150)
}

// 路由错误处理
router.onError((error) => {
  console.error('Router error:', error)
  
  // 在开发环境显示详细错误
  if (import.meta.env.DEV) {
    console.error('Route error details:', {
      message: error.message,
      stack: error.stack
    })
  }
  
  // 生产环境重定向到首页
  if (import.meta.env.PROD) {
    router.push({ name: 'home' })
  }
})

// 检查是否支持History API
export const isHistorySupported = () => {
  return !!(window.history && window.history.pushState)
}

// 安全的路由导航（带错误处理）
export const safeNavigate = async (to, options = {}) => {
  try {
    await router.push(to)
    return true
  } catch (error) {
    console.error('Navigation failed:', error)
    
    // 如果导航失败，根据选项决定是否回退
    if (options.fallbackToHome) {
      await router.push({ name: 'home' })
    }
    
    return false
  }
}

// 检查当前路由是否需要网络连接
export const requiresNetwork = (routeName = null) => {
  const currentRoute = routeName || router.currentRoute.value.name
  
  // 结果页可能需要网络获取推荐
  return currentRoute === 'results'
}

// 预加载路由组件
export const preloadRoute = async (routeName) => {
  try {
    const route = routes.find(r => r.name === routeName)
    if (route && typeof route.component === 'function') {
      await route.component()
      console.log(`Route ${routeName} preloaded successfully`)
    }
  } catch (error) {
    console.warn(`Failed to preload route ${routeName}:`, error)
  }
}
