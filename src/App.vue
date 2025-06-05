<template>
  <AppContainer>
    <!-- 主应用内容 -->
    <div class="app-content">
      <!-- 路由视图 -->
      <router-view v-slot="{ Component, route }">
        <Transition :name="getTransitionName(route)" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </router-view>
    </div>
    
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
import { ref, provide, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAnimationStore } from '@/stores/animations'
import AppContainer from '@/components/layout/AppContainer.vue'

// 路由
const router = useRouter()
const route = useRoute()

// 应用状态管理
const store = useAnimationStore()

// 响应式数据
const isLoadingTracks = ref(false)
const musicTracks = ref([])
const hasError = ref(false)
const errorMessage = ref('')
const showErrorToast = ref(false)
const toastMessage = ref('')
const currentEmotion = ref(null)
const aiEmotionResult = ref('')
const userInputText = ref('')
const extendedAiAnalysis = ref('')

// 测试模式检测
const isTestMode = ref(import.meta.env.DEV || !import.meta.env.VITE_API_BASE_URL)

// 获取过渡动画名称
const getTransitionName = (route) => {
  if (route.name === 'home') {
    return 'slide-right'
  } else if (route.name === 'results') {
    return 'slide-left'
  }
  return 'fade'
}

// 生命周期
onMounted(() => {
  // 初始化应用
  initializeApp()
  
  // 监听窗口事件
  window.addEventListener('beforeunload', handleBeforeUnload)
  window.addEventListener('error', handleGlobalError)
  document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  // 清理事件监听器
  window.removeEventListener('beforeunload', handleBeforeUnload)
  window.removeEventListener('error', handleGlobalError)
  document.removeEventListener('keydown', handleKeyPress)
})

// 初始化应用
const initializeApp = async () => {
  try {
    console.log('Application initialized successfully')
    if (isTestMode.value) {
      console.log('Running in test mode - using mock data')
    }
  } catch (error) {
    console.error('Failed to initialize app:', error)
    showError('应用初始化失败，请刷新页面重试')
  }
}

// 处理情绪提交
const handleEmotionSubmitted = async (emotionData) => {
  console.log('Emotion submitted:', emotionData)
  currentEmotion.value = emotionData
  userInputText.value = emotionData.text || ''
  
  // 提交后立即开始生成音乐推荐数据
  try {
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
const handleProcessingComplete = (data) => {
  console.log('Processing complete:', data)
  
  // 设置AI分析结果
  aiEmotionResult.value = data.aiResult || '快乐'
  userInputText.value = data.emotion || userInputText.value
  
  // 生成AI分析说明，使用正确的情绪结果
  if (isTestMode.value) {
    extendedAiAnalysis.value = generateMockAiAnalysis(data.aiResult || '快乐')
  }
  
  // 确保有音乐数据再切换视图
  if (musicTracks.value.length === 0) {
    console.log('No tracks available, generating mock data...')
    // 如果没有音乐数据，生成默认数据
    const mockData = {
      text: data.emotion || '快乐',
      mood: data.mood || 'happy',
      aiResult: data.aiResult || '快乐'
    }
    musicTracks.value = generateMockTracks(mockData)
  }
  
  // 等待数据确认后再导航
  nextTick(() => {
    // 保存数据到sessionStorage并导航到结果页
    sessionStorage.setItem('moodify_emotion_data', JSON.stringify({
      emotion: data.emotion,
      aiResult: data.aiResult,
      tracks: musicTracks.value,
      analysis: extendedAiAnalysis.value
    }))
    
    // 导航到结果页
    router.push({ name: 'results' })
    
    console.log('Navigated to results view with tracks:', musicTracks.value.length)
    console.log('AI result:', aiEmotionResult.value, 'User input:', userInputText.value)
    console.log('Extended AI analysis:', extendedAiAnalysis.value)
  })
}

// 获取音乐推荐
const fetchMusicRecommendations = async (emotionData) => {
  isLoadingTracks.value = true
  hasError.value = false
  
  try {
    if (isTestMode.value) {
      // 测试模式：使用模拟数据
      await simulateMusicAPI(emotionData)
    } else {
      // 生产模式：调用真实API
      await fetchFromRealAPI(emotionData)
    }
    
    console.log('Music recommendations fetched successfully:', musicTracks.value.length, 'tracks')
  } catch (error) {
    hasError.value = true
    errorMessage.value = error.message || '获取推荐失败'
    console.error('Music API error:', error)
    throw error
  } finally {
    isLoadingTracks.value = false
  }
}

// 调用真实API
const fetchFromRealAPI = async (emotionData) => {
  try {
    // 实际的API调用逻辑
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN || ''}`
      },
      body: JSON.stringify({
        emotion: emotionData.text,
        mood: emotionData.mood,
        aiResult: emotionData.aiResult
      })
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // 设置API返回的数据
    musicTracks.value = data.tracks || []
    extendedAiAnalysis.value = data.aiAnalysis || '' // 从API获取AI分析
    
    console.log('Real API response:', data)
  } catch (error) {
    console.error('Real API call failed:', error)
    throw new Error('无法连接到推荐服务，请稍后重试')
  }
}

// 模拟音乐API调用（仅测试模式使用）
const simulateMusicAPI = async (emotionData) => {
  // 模拟网络延迟（在进度条运行期间完成）
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 根据情绪生成模拟数据
  const mockTracks = generateMockTracks(emotionData)
  musicTracks.value = mockTracks
  
  console.log('Generated mock tracks:', mockTracks.length)
  
  // 注意：不在这里生成AI分析，而是在handleProcessingComplete中生成
  // 这样可以确保使用正确的AI识别结果
}

// 生成模拟AI分析（仅测试模式使用）
const generateMockAiAnalysis = (emotion) => {
  const mockAnalysisTemplates = {
    '快乐': '从你充满活力的描述中，我感受到了满溢而出的积极能量！你对明媚阳光和动人旋律的强烈渴望，正是快乐情绪的鲜明写照。我精心挑选了一些节奏欢快跳跃、旋律明亮如阳光的歌曲，希望能延续这份美好的心境，让愉悦的涟漪在你心中持续荡漾！',
    '悲伤': '我深深理解此刻萦绕在你心头的低落感受，人生旅途中这样的时刻在所难免。请相信，音乐拥有抚慰心灵的独特魔力。我为你甄选了一些温柔细腻、饱含理解与共鸣的旋律，它们不会刻意驱散阴霾，而是像一位沉默的挚友，静静陪伴你穿越这段略显沉重的时光。',
    '愤怒': '你字里行间涌动的炽热与不满，我清晰地感受到了。愤怒往往是心灵对不公的正当呐喊，而音乐可以成为你安全宣泄的出口。这些推荐的歌曲，以其强劲有力的节奏和充满爆发力的演绎，旨在帮助你将心中翻腾的烈焰转化为有形的声浪，让情绪得到畅快淋漓的释放。',
    '兴奋': '你传递的兴奋之情极具感染力！这种按捺不住、跃跃欲试的昂扬状态充满了生命的活力。为了匹配你高涨的能量场，我特别推荐了节奏感爆棚、能量持续上扬的歌曲，它们澎湃的鼓点和昂扬的旋律，定能成为你此刻激昂心情最完美的背景音和助推器！',
    '烦躁': '感受到你内心的烦躁和不安。现代生活的压力确实容易让人心烦意乱。我为你选择了一些既能理解你的烦躁，又能帮助缓解紧张情绪的音乐，希望能为你带来一丝慰藉。'
  }
  
  return mockAnalysisTemplates[emotion] || mockAnalysisTemplates['快乐']
}

// 生成模拟音乐数据（仅测试模式使用）
const generateMockTracks = (emotionData) => {
  const mood = emotionData.aiResult || emotionData.mood || 'happy'
  const emotionText = emotionData.text || ''
  
  console.log('Generating tracks for mood:', mood, 'emotion:', emotionText)
  
  // 基础模板
  const trackTemplates = {
    '快乐': [
      { name: 'Sunshine Melody', artist: 'Happy Vibes', genre: 'Pop', emotions: ['happy', 'energetic'] },
      { name: 'Dancing in Light', artist: 'Joy Collective', genre: 'Electronic', emotions: ['happy', 'excited'] },
      { name: 'Bright Days Ahead', artist: 'Optimist Band', genre: 'Indie', emotions: ['happy', 'peaceful'] },
      { name: 'Golden Hour', artist: 'Cheerful Sounds', genre: 'Folk', emotions: ['happy', 'calm'] },
      { name: 'Celebration Time', artist: 'Party Makers', genre: 'Dance', emotions: ['happy', 'energetic'] },
      { name: 'Feel Good Vibes', artist: 'Good Mood Collective', genre: 'Pop', emotions: ['happy', 'uplifting'] }
    ],
    '悲伤': [
      { name: 'Rainy Reflections', artist: 'Melancholy Soul', genre: 'Indie Folk', emotions: ['sad', 'melancholy'] },
      { name: 'Tears in Time', artist: 'Emotional Depth', genre: 'Alternative', emotions: ['sad', 'emotional'] },
      { name: 'Silent Sorrow', artist: 'Deep Feelings', genre: 'Ambient', emotions: ['sad', 'peaceful'] },
      { name: 'Empty Rooms', artist: 'Lonely Hearts', genre: 'Indie', emotions: ['sad', 'lonely'] },
      { name: 'Fading Memories', artist: 'Nostalgic Echoes', genre: 'Singer-Songwriter', emotions: ['sad', 'nostalgic'] },
      { name: 'Heavy Heart', artist: 'Emotional Journey', genre: 'Alternative Rock', emotions: ['sad', 'heavy'] }
    ],
    '愤怒': [
      { name: 'Burning Rage', artist: 'Fury Band', genre: 'Metal', emotions: ['angry', 'intense'] },
      { name: 'Break the Chains', artist: 'Rebellion', genre: 'Rock', emotions: ['angry', 'powerful'] },
      { name: 'Storm Inside', artist: 'Tempest', genre: 'Hard Rock', emotions: ['angry', 'aggressive'] },
      { name: 'Fight Back', artist: 'Resistance', genre: 'Punk', emotions: ['angry', 'defiant'] },
      { name: 'Inner Fire', artist: 'Flame Throwers', genre: 'Alternative Metal', emotions: ['angry', 'fierce'] },
      { name: 'Shattered Glass', artist: 'Broken Silence', genre: 'Industrial', emotions: ['angry', 'destructive'] }
    ],
    '兴奋': [
      { name: 'Electric Energy', artist: 'High Voltage', genre: 'Electronic', emotions: ['excited', 'energetic'] },
      { name: 'Pump It Up', artist: 'Energy Boost', genre: 'Dance', emotions: ['excited', 'pumped'] },
      { name: 'Adrenaline Rush', artist: 'Excitement Inc', genre: 'EDM', emotions: ['excited', 'intense'] },
      { name: 'Sky High', artist: 'Elevation', genre: 'Trance', emotions: ['excited', 'euphoric'] },
      { name: 'Maximum Drive', artist: 'Turbo Charge', genre: 'Electronic Rock', emotions: ['excited', 'powerful'] },
      { name: 'Velocity', artist: 'Speed Demons', genre: 'Drum & Bass', emotions: ['excited', 'fast'] }
    ],
    '烦躁': [
      { name: 'Restless Mind', artist: 'Anxiety Collective', genre: 'Alternative', emotions: ['annoyed', 'restless'] },
      { name: 'Frustration', artist: 'Tension Relief', genre: 'Post-Rock', emotions: ['annoyed', 'tense'] },
      { name: 'Irritation', artist: 'Stressed Out', genre: 'Indie Rock', emotions: ['annoyed', 'irritated'] },
      { name: 'Edge of Patience', artist: 'Breaking Point', genre: 'Grunge', emotions: ['annoyed', 'edgy'] },
      { name: 'Noise in Head', artist: 'Mental Static', genre: 'Experimental', emotions: ['annoyed', 'chaotic'] },
      { name: 'Overwhelmed', artist: 'Pressure Cooker', genre: 'Math Rock', emotions: ['annoyed', 'complex'] }
    ]
  }
  
  // 默认使用快乐模板
  const templates = trackTemplates[mood] || trackTemplates['快乐']
  
  return templates.map((template, index) => ({
    id: `track_${mood}_${index + 1}`,
    name: template.name,
    artist: template.artist,
    albumName: `${template.genre} Collection`,
    albumCover: `https://picsum.photos/300/300?random=${mood}_${index + 1}`,
    duration: 180 + Math.floor(Math.random() * 120), // 3-5分钟
    previewUrl: `https://example.com/preview_${mood}_${index}.mp3`,
    spotifyUrl: `https://open.spotify.com/track/example_${mood}_${index}`,
    emotions: template.emotions,
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
  // 清除sessionStorage数据
  sessionStorage.removeItem('moodify_emotion_data')
  
  // 重置数据
  musicTracks.value = []
  currentEmotion.value = null
  aiEmotionResult.value = ''
  userInputText.value = ''
  extendedAiAnalysis.value = ''
  hasError.value = false
  isLoadingTracks.value = false
  
  // 导航回首页
  router.push({ name: 'home' })
  
  console.log('Returned to home view')
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
  if (isLoadingTracks.value) {
    event.preventDefault()
    event.returnValue = '正在处理中，确定要离开吗？'
  }
}

// 键盘事件处理
const handleKeyPress = (event) => {
  // ESC键返回
  if (event.key === 'Escape' && route.name === 'results') {
    handleBack()
  }
  
  // Enter键重试（在错误状态下）
  if (event.key === 'Enter' && hasError.value) {
    handleRetry()
  }
}

// 向子组件提供数据和方法
provide('appData', {
  // 使用 computed 或 getter 确保响应式
  get isLoadingTracks() { return isLoadingTracks.value },
  get musicTracks() { return musicTracks.value },
  get hasError() { return hasError.value },
  get errorMessage() { return errorMessage.value },
  get currentEmotion() { return currentEmotion.value },
  get aiEmotionResult() { return aiEmotionResult.value },
  get userInputText() { return userInputText.value },
  get extendedAiAnalysis() { return extendedAiAnalysis.value },
  get isTestMode() { return isTestMode.value },
  // 方法
  handleEmotionSubmitted,
  handleProcessingComplete,
  fetchMusicRecommendations,
  handleRefresh,
  handleBack,
  handleRetry,
  showError,
  // 卡片操作方法
  handleCardExpand,
  handleCardCollapse,
  handleCardPlay,
  handleCardPause
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

// 无障碍支持
@media (prefers-reduced-motion: reduce) {
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active,
  .slide-up-enter-active,
  .slide-up-leave-active {
    transition: none;
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .toast-content {
    background: #EF476F;
    border: 2px solid white;
  }
}
</style>
