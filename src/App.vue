<template>
  <AppContainer>
    <!-- 主应用内容 -->
    <div class="app-content">
      <!-- 视图路由 -->
      <Transition :name="transitionName" mode="out-in">
        <!-- 首页视图 -->
        <HomeView
          v-if="currentView === 'home'"
          key="home"
          ref="homeViewRef"
          @emotion-submitted="handleEmotionSubmitted"
          @processing-complete="handleProcessingComplete"
        />
        
        <!-- 结果视图 -->
        <ResultsView
          v-else-if="currentView === 'results'"
          key="results"
          ref="resultsViewRef"
          :tracks="musicTracks"
          :is-loading="isLoadingTracks"
          :has-error="hasError"
          :error-message="errorMessage"
          @refresh="handleRefresh"
          @back="handleBack"
          @card-expand="handleCardExpand"
          @card-collapse="handleCardCollapse"
          @card-play="handleCardPlay"
          @card-pause="handleCardPause"
          @retry="handleRetry"
        />
      </Transition>
    </div>
    
    <!-- 全局加载遮罩 -->
    <Transition name="fade">
      <div class="global-loading" v-if="isGlobalLoading">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p class="loading-text">{{ loadingText }}</p>
        </div>
      </div>
    </Transition>
    
    <!-- 错误提示 -->
    <Transition name="slide-up">
      <div class="error-toast" v-if="showErrorToast">
        <div class="toast-content">
          <span class="toast-icon">⚠️</span>
          <span class="toast-message">{{ toastMessage }}</span>
          <button class="toast-close" @click="hideErrorToast">✕</button>
        </div>
      </div>
    </Transition>
  </AppContainer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAnimationStore } from '@/stores/animations'
import AppContainer from '@/components/layout/AppContainer.vue'
import HomeView from '@/components/views/HomeView.vue'
import ResultsView from '@/components/views/ResultsView.vue'

// 应用状态管理
const store = useAnimationStore()

// 组件引用
const homeViewRef = ref(null)
const resultsViewRef = ref(null)

// 响应式数据
const currentView = ref('home')
const isGlobalLoading = ref(false)
const loadingText = ref('')
const isLoadingTracks = ref(false)
const musicTracks = ref([])
const hasError = ref(false)
const errorMessage = ref('')
const showErrorToast = ref(false)
const toastMessage = ref('')
const currentEmotion = ref(null)

// 计算属性
const transitionName = computed(() => {
  if (currentView.value === 'home') {
    return 'slide-right'
  } else {
    return 'slide-left'
  }
})

// 生命周期
onMounted(() => {
  // 初始化应用
  initializeApp()
  
  // 监听窗口事件
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('error', handleGlobalError)
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('error', handleGlobalError)
})

// 监听store状态变化
watch(() => store.currentView, (newView) => {
  if (newView && newView !== currentView.value) {
    currentView.value = newView
  }
})

// 初始化应用
const initializeApp = async () => {
  try {
    // isGlobalLoading.value = true
    // loadingText.value = '初始化应用...'
    
    // // 模拟初始化延迟
    // await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 设置初始状态
    store.setCurrentView('home')
    currentView.value = 'home'
    
    console.log('Application initialized successfully')
  } catch (error) {
    console.error('Failed to initialize app:', error)
    showError('应用初始化失败，请刷新页面重试')
  } finally {
    isGlobalLoading.value = false
  }
}

// 处理情绪提交
const handleEmotionSubmitted = async (emotionData) => {
  currentEmotion.value = emotionData
  
  try {
    // 开始加载音乐推荐
    await fetchMusicRecommendations(emotionData)
  } catch (error) {
    console.error('Failed to fetch recommendations:', error)
    showError('获取音乐推荐失败，请重试')
    
    // 重置到首页
    setTimeout(() => {
      handleBack()
    }, 3000)
  }
}

// 处理处理完成
const handleProcessingComplete = () => {
  // 切换到结果视图
  currentView.value = 'results'
  store.setCurrentView('results')
}

// 获取音乐推荐
const fetchMusicRecommendations = async (emotionData) => {
  isLoadingTracks.value = true
  hasError.value = false
  
  try {
    // 模拟API调用
    await simulateMusicAPI(emotionData)
    
    console.log('Music recommendations fetched successfully')
  } catch (error) {
    hasError.value = true
    errorMessage.value = error.message || '获取推荐失败'
    throw error
  } finally {
    isLoadingTracks.value = false
  }
}

// 模拟音乐API调用
const simulateMusicAPI = async (emotionData) => {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 根据情绪生成模拟数据
  const mockTracks = generateMockTracks(emotionData)
  musicTracks.value = mockTracks
  
  // 模拟偶尔的API错误
  if (Math.random() < 0.1) { // 10% 概率失败
    throw new Error('网络连接超时，请稍后重试')
  }
}

// 生成模拟音乐数据
const generateMockTracks = (emotionData) => {
  const { mood, emotions } = emotionData
  
  // 基础模板
  const trackTemplates = {
    happy: [
      { name: 'Sunshine Melody', artist: 'Happy Vibes', genre: 'Pop' },
      { name: 'Dancing in Light', artist: 'Joy Collective', genre: 'Electronic' },
      { name: 'Bright Days Ahead', artist: 'Optimist Band', genre: 'Indie' }
    ],
    sad: [
      { name: 'Rainy Reflections', artist: 'Melancholy Soul', genre: 'Indie Folk' },
      { name: 'Tears in Time', artist: 'Emotional Depth', genre: 'Alternative' },
      { name: 'Silent Sorrow', artist: 'Deep Feelings', genre: 'Ambient' }
    ],
    calm: [
      { name: 'Peaceful Waters', artist: 'Zen Masters', genre: 'Ambient' },
      { name: 'Gentle Breeze', artist: 'Nature Sounds', genre: 'New Age' },
      { name: 'Meditation Flow', artist: 'Calm Collective', genre: 'Instrumental' }
    ],
    excited: [
      { name: 'Electric Energy', artist: 'High Voltage', genre: 'Electronic' },
      { name: 'Pump It Up', artist: 'Energy Boost', genre: 'Dance' },
      { name: 'Adrenaline Rush', artist: 'Excitement Inc', genre: 'Rock' }
    ]
  }
  
  const templates = trackTemplates[mood] || trackTemplates.happy
  
  return templates.map((template, index) => ({
    id: `track_${mood}_${index + 1}`,
    name: template.name,
    artist: template.artist,
    albumName: `${template.genre} Collection`,
    albumCover: `https://picsum.photos/300/300?random=${mood}_${index}`,
    duration: 180 + Math.floor(Math.random() * 120), // 3-5分钟
    previewUrl: `https://example.com/preview_${mood}_${index}.mp3`,
    spotifyUrl: `https://open.spotify.com/track/example_${mood}_${index}`,
    emotions: emotions || [mood],
    popularity: 60 + Math.floor(Math.random() * 40), // 60-100
    releaseDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    genre: template.genre
  }))
}

// 处理刷新
const handleRefresh = async () => {
  if (!currentEmotion.value) return
  
  try {
    await fetchMusicRecommendations(currentEmotion.value)
  } catch (error) {
    showError('刷新失败，请稍后重试')
  }
}

// 处理返回
const handleBack = () => {
  currentView.value = 'home'
  store.setCurrentView('home')
  
  // 重置数据
  musicTracks.value = []
  currentEmotion.value = null
  hasError.value = false
  
  // 重置首页状态
  if (homeViewRef.value) {
    homeViewRef.value.resetView()
  }
}

// 处理重试
const handleRetry = async () => {
  if (!currentEmotion.value) {
    handleBack()
    return
  }
  
  try {
    await fetchMusicRecommendations(currentEmotion.value)
  } catch (error) {
    showError('重试失败，请检查网络连接')
  }
}

// 处理卡片操作
const handleCardExpand = (track) => {
  console.log('Card expanded:', track.name)
}

const handleCardCollapse = (track) => {
  console.log('Card collapsed:', track.name)
}

const handleCardPlay = (track) => {
  console.log('Playing track:', track.name)
}

const handleCardPause = (track) => {
  console.log('Paused track:', track.name)
}

// 错误处理
const showError = (message) => {
  toastMessage.value = message
  showErrorToast.value = true
  
  // 自动隐藏
  setTimeout(() => {
    hideErrorToast()
  }, 5000)
}

const hideErrorToast = () => {
  showErrorToast.value = false
}

// 全局错误处理
const handleGlobalError = (event) => {
  console.error('Global error:', event.error)
  showError('应用出现异常，请刷新页面')
}

// 页面卸载前处理
const handleBeforeUnload = (event) => {
  // 如果有正在进行的操作，提醒用户
  if (isGlobalLoading.value || isLoadingTracks.value) {
    event.preventDefault()
    event.returnValue = '正在处理中，确定要离开吗？'
  }
}

// 键盘事件处理
const handleKeyPress = (event) => {
  // ESC键返回
  if (event.key === 'Escape' && currentView.value === 'results') {
    handleBack()
  }
  
  // Enter键重试（在错误状态下）
  if (event.key === 'Enter' && hasError.value) {
    handleRetry()
  }
}

// 添加键盘事件监听
onMounted(() => {
  document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyPress)
})
</script>

<style lang="scss" scoped>
.app-content {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

// 视图过渡动画
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.5s ease-in-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

// 全局加载遮罩
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 18, 18, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #FFD166;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  text-align: center;
  margin: 0;
}

// 错误提示Toast
.error-toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  
  @media (max-width: 767px) {
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    transform: none;
  }
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: rgba(239, 71, 111, 0.95);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  min-width: 300px;
  
  @media (max-width: 767px) {
    min-width: auto;
    padding: 0.75rem 1rem;
  }
}

.toast-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.toast-message {
  flex: 1;
  font-size: 0.9rem;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
}

// Toast动画
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
  
  @media (max-width: 767px) {
    transform: translateY(100px);
  }
}

.slide-up-leave-to {
  transform: translateX(-50%) translateY(100px);
  opacity: 0;
  
  @media (max-width: 767px) {
    transform: translateY(100px);
  }
}

// 淡入淡出动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 无障碍支持
@media (prefers-reduced-motion: reduce) {
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active,
  .slide-up-enter-active,
  .slide-up-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
  
  .loading-spinner {
    animation: none;
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .toast-content {
    background: #EF476F;
    border: 2px solid white;
  }
  
  .global-loading {
    background: rgba(0, 0, 0, 0.98);
  }
}
</style>
