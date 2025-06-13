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
import { ref, provide, onMounted, onUnmounted, nextTick, computed } from 'vue'
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
const homeViewApiResults = ref(null); 
const emotionVector = ref(null);
const currentPageForRecommendations = ref(1);
const totalRecommendationsAvailable = ref(0);
const isLoadingMoreTracks = ref(false);

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

// 当用户提交输入时由 HomeView 调用
const handleUserInputChange = (text) => {
  console.log('App.vue: User input text received:', text);
  userInputText.value = text;
  currentEmotion.value = { text: text }; 
  musicTracks.value = [];
  extendedAiAnalysis.value = '';
  aiEmotionResult.value = ''; 
  homeViewApiResults.value = null;
  emotionVector.value = null;
  currentPageForRecommendations.value = 1;
  totalRecommendationsAvailable.value = 0;
  hasError.value = false; 
  isLoadingTracks.value = true; 
};

// 当 HomeView 完成 API 调用并返回结果时由 HomeView 调用
const handleHomeViewResults = (results) => {
  console.log('App.vue: Results received from HomeView:', results);
      musicTracks.value = (results.tracks || []).map(t => ({
        ...t,
        albumCover: t.album_cover,
        albumName: t.album_name,
        previewUrl: t.preview_url,
        spotifyUrl: t.spotify_url,
        duration: t.duration_ms,
        releaseDate: t.release_date
      }));
  extendedAiAnalysis.value = results.analysis || ''; 
  aiEmotionResult.value = results.emotionAI || '';
  userInputText.value = results.userInput || userInputText.value; 
  emotionVector.value = results.vector || null;
  totalRecommendationsAvailable.value = results.total || 0;
  currentPageForRecommendations.value = 1;
  homeViewApiResults.value = results;
  isLoadingTracks.value = false; 
  hasError.value = false; 
};

// 当 HomeView 发生错误时由 HomeView 调用
const handleHomeViewError = (message) => {
  console.error('App.vue: Error reported from HomeView:', message);
  showError(message || '处理过程中发生错误，请重试');
  isLoadingTracks.value = false;
  hasError.value = true; 
  musicTracks.value = []; 
  extendedAiAnalysis.value = '';
  emotionVector.value = null;
  currentPageForRecommendations.value = 1;
  totalRecommendationsAvailable.value = 0;
  setTimeout(() => {
     if (route.name !== 'home' && hasError.value) { 
         handleBack();
     }
  }, 5000); 
};

// 处理处理完成信号（由 HomeView 调用）
const handleProcessingComplete = () => {
  console.log('App.vue: Processing complete signal received.');

  if (hasError.value) {
    console.log('App.vue: Error flag is set, not navigating to results.');
    return; 
  }

  if (!isTestMode.value && (!homeViewApiResults.value || !emotionVector.value)) {
     console.warn('App.vue: No recommendation data or vector available at processing complete for non-test mode.');
     showError('未能获取推荐结果数据，请重试。');
     setTimeout(() => {
         if (route.name !== 'home') handleBack();
     }, 5000);
     return;
  }
  
  if (isTestMode.value && musicTracks.value.length > 0 && !homeViewApiResults.value) {
      console.log('App.vue: Test mode proceeding with locally generated mock tracks.');
      if (!aiEmotionResult.value) aiEmotionResult.value = '快乐'; 
      if (!extendedAiAnalysis.value) extendedAiAnalysis.value = generateMockAiAnalysis(aiEmotionResult.value);
      if (!userInputText.value && currentEmotion.value) userInputText.value = currentEmotion.value.text;
      // 测试模式下代码没有向量数据
      totalRecommendationsAvailable.value = musicTracks.value.length;
      currentPageForRecommendations.value = 1;
  }
  
  nextTick(() => {
    sessionStorage.setItem('moodify_emotion_data', JSON.stringify({
      emotion: userInputText.value,       
      aiResult: aiEmotionResult.value,    
      tracks: musicTracks.value,
      analysis: extendedAiAnalysis.value,
    }));
    
    router.push({ name: 'results' });
    console.log('App.vue: Navigated to results view.');
  });
};

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

// 生成模拟音乐数据（仅测试模式使用, 如果没有从 HomeView 获取到数据时）)
const generateMockTracks = (emotionData) => { // emotionData 应为 { text: '...', mood: '...', aiResult: '...' }
  const mood = emotionData.aiResult || emotionData.mood || 'happy'
  const emotionText = emotionData.text || ''
  
  console.log('App.vue: Generating mock tracks for mood:', mood, 'emotion:', emotionText)
  
  const trackTemplates = {
    '快乐': [
      { name: 'Sunshine Melody', artist: 'Happy Vibes', genre: 'Pop', emotions: ['happy', 'energetic'] },
      { name: 'Dancing in Light', artist: 'Joy Collective', genre: 'Electronic', emotions: ['happy', 'excited'] },
    ],
    '悲伤': [
      { name: 'Rainy Reflections', artist: 'Melancholy Soul', genre: 'Indie Folk', emotions: ['sad', 'melancholy'] },
      { name: 'Tears in Time', artist: 'Emotional Depth', genre: 'Alternative', emotions: ['sad', 'emotional'] },
    ],
    '愤怒': [
      { name: 'Burning Rage', artist: 'Fury Band', genre: 'Metal', emotions: ['angry', 'intense'] },
      { name: 'Break the Chains', artist: 'Rebellion', genre: 'Rock', emotions: ['angry', 'powerful'] },
    ],
    '兴奋': [
      { name: 'Electric Energy', artist: 'High Voltage', genre: 'Electronic', emotions: ['excited', 'energetic'] },
      { name: 'Pump It Up', artist: 'Energy Boost', genre: 'Dance', emotions: ['excited', 'pumped'] },
    ],
    '烦躁': [
      { name: 'Restless Mind', artist: 'Anxiety Collective', genre: 'Alternative', emotions: ['annoyed', 'restless'] },
      { name: 'Frustration', artist: 'Tension Relief', genre: 'Post-Rock', emotions: ['annoyed', 'tense'] },
    ]
  }
  const templates = trackTemplates[mood] || trackTemplates['快乐']
  return templates.map((template, index) => ({
    id: `mock_track_${mood}_${index + 1}`,
    name: template.name,
    artist: template.artist,
    albumName: `${template.genre} Collection`,
    albumCover: `https://picsum.photos/300/300?random=${mood}_${index + 1}`,
    duration: 180 + Math.floor(Math.random() * 120), 
    previewUrl: `https://example.com/preview_${mood}_${index}.mp3`,
    spotifyUrl: `https://open.spotify.com/track/example_${mood}_${index}`,
    emotions: template.emotions,
    popularity: 60 + Math.floor(Math.random() * 40), 
    releaseDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
    genre: template.genre
  }))
}

// 处理刷新 - 获取下一页推荐
const handleRefresh = async () => {
  if (isLoadingMoreTracks.value) return; // 防止重复请求

  if (isTestMode.value) {
    console.log('App.vue: Refresh clicked in test mode. Displaying current mock tracks.');
    // 对于测试模式，直接使用当前的 mock 数据
    isLoadingMoreTracks.value = true;
    setTimeout(() => { // 模拟加载延迟
      isLoadingMoreTracks.value = false;
      showError('测试模式：刷新会显示相同的模拟歌曲。');
    }, 300);
    return;
  }

  if (!emotionVector.value) {
    showError('无法刷新：缺少情绪数据。');
    return;
  }

  isLoadingMoreTracks.value = true;
  hasError.value = false;

  let nextPage = currentPageForRecommendations.value + 1;
  const pageSize = 6; // 当前每页推荐的数量
  const topKForFaiss = 30; // 后端使用的 FAISS 候选池大小

  // 如果当前页数超过总推荐数，则循环回到第一页
  if ((currentPageForRecommendations.value * pageSize) >= totalRecommendationsAvailable.value && totalRecommendationsAvailable.value > 0) {
    nextPage = 1;
    console.log('App.vue: Refreshing, looping back to page 1');
  }
  
  console.log(`App.vue: Refreshing recommendations. Current page: ${currentPageForRecommendations.value}, Next page: ${nextPage}, Total available: ${totalRecommendationsAvailable.value}`);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN || ''}`
      },
      body: JSON.stringify({
        vector: emotionVector.value,
        top_k: topKForFaiss, // 后端利用 FAISS 获取的候选池大小
        page: nextPage,
        page_size: pageSize 
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: '刷新时发生未知错误' }));
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    }

    const data = await response.json();
    if (data.tracks && data.tracks.length > 0) {
        musicTracks.value = data.tracks.map(t => ({
          ...t,
          albumCover: t.album_cover,
          albumName: t.album_name,
          previewUrl: t.preview_url,
          spotifyUrl: t.spotify_url,
          duration: t.duration_ms,
          releaseDate: t.release_date
        }));
      currentPageForRecommendations.value = nextPage;
      totalRecommendationsAvailable.value = data.total; // 动态更新总推荐数
      // 更新 sessionStorage
      sessionStorage.setItem('moodify_emotion_data', JSON.stringify({
        emotion: userInputText.value,       
        aiResult: aiEmotionResult.value,    
        tracks: musicTracks.value, // 当前页的推荐曲目
        analysis: extendedAiAnalysis.value,
        // vector: emotionVector.value, // optional
        // currentPage: currentPageForRecommendations.value, // optional
        // totalAvailable: totalRecommendationsAvailable.value // optional
      }));
    } else {
      // 当没有更多推荐时，检查是否已经循环到第一页
      // 如果循环到第一页且仍然没有结果，则提示用户
      if (nextPage > 1 && currentPageForRecommendations.value !== 1) {
         console.log('App.vue: No more tracks to refresh. Looping to page 1.');
         currentPageForRecommendations.value = 0;
         await handleRefresh();
      } else {
        showError('没有更多推荐了。');
      }
    }
  } catch (error) {
    console.error('App.vue: Failed to refresh recommendations:', error);
    showError(error.message || '刷新推荐失败，请稍后重试。');
    hasError.value = true;
  } finally {
    isLoadingMoreTracks.value = false;
  }
};


// 处理返回 (兼做重试/重新开始)
const handleBack = () => {
  sessionStorage.removeItem('moodify_emotion_data')
  musicTracks.value = []
  currentEmotion.value = null
  aiEmotionResult.value = ''
  userInputText.value = ''
  extendedAiAnalysis.value = ''
  homeViewApiResults.value = null;
  emotionVector.value = null;
  currentPageForRecommendations.value = 1;
  totalRecommendationsAvailable.value = 0;
  hasError.value = false
  isLoadingTracks.value = false
  isLoadingMoreTracks.value = false;
  store.resetState(); 
  router.push({ name: 'home' })
  console.log('App.vue: Returned to home view, state reset.')
}

// 处理重试 - 现在只是返回首页
const handleRetry = () => {
  console.log("App.vue: Retry requested. Navigating to home.");
  handleBack(); 
}

// 处理卡片操作
const handleCardExpand = (track) => { console.log('Card expanded:', track.name) }
const handleCardCollapse = (track) => { console.log('Card collapsed:', track.name) }
const handleCardPlay = (track) => { console.log('Playing track:', track.name) }
const handleCardPause = (track) => { console.log('Paused track:', track.name) }

// 错误处理
const showError = (message) => {
  toastMessage.value = message
  showErrorToast.value = true
  setTimeout(() => { hideErrorToast() }, 5000)
}
const hideErrorToast = () => { showErrorToast.value = false }

// 全局错误处理
const handleGlobalError = (event) => {
  console.error('Global error:', event.error)
  showError('应用出现异常，请刷新页面')
}

// 页面卸载前处理
const handleBeforeUnload = (event) => {
  if (isLoadingTracks.value || isLoadingMoreTracks.value) {
    event.preventDefault()
    event.returnValue = '正在处理中，确定要离开吗？'
  }
}

// 键盘事件处理
const handleKeyPress = (event) => {
  if (event.key === 'Escape' && route.name === 'results') {
    handleBack()
  }
  if (event.key === 'Enter' && hasError.value && route.name !== 'home') {
    handleRetry();
  }
}

// 向子组件提供数据和方法
provide('appData', {
  get isLoadingTracks() { return isLoadingTracks.value },
  get isLoadingMoreTracks() { return isLoadingMoreTracks.value },
  get musicTracks() { return musicTracks.value },
  get hasError() { return hasError.value },
  get errorMessage() { return errorMessage.value },
  get currentEmotion() { return currentEmotion.value }, 
  get aiEmotionResult() { return aiEmotionResult.value },
  get userInputText() { return userInputText.value },
  get extendedAiAnalysis() { return extendedAiAnalysis.value },
  get isTestMode() { return isTestMode.value },
  // 方法
  get currentPage() { return currentPageForRecommendations.value },
  get totalAvailableTracks() { return totalRecommendationsAvailable.value },
  handleUserInputChange, 
  handleHomeViewResults, 
  handleHomeViewError, 
  handleProcessingComplete,
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
