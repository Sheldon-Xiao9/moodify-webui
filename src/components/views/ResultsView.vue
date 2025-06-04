<template>
  <div class="results-view">
    <!-- 动态背景 -->
    <DynamicBackground variant="results" />
    
    <!-- AI情绪分析结果展示区域 -->
    <div class="emotion-analysis-wrapper" v-if="props.aiEmotionResult || (isTestMode && testData.userInput)">
      <div 
        class="emotion-analysis-card"
        :class="{ 
          'expanded': isAnalysisExpanded,
          'hover': isAnalysisHovering && !isAnalysisExpanded && !isAnalysisExpanding && !isAnalysisCollapsing,
          'expanding': isAnalysisExpanding,
          'collapsing': isAnalysisCollapsing
        }"
        @mouseenter="handleAnalysisMouseEnter"
        @mouseleave="handleAnalysisMouseLeave"
        @click="handleAnalysisCardClick"
        ref="analysisCardRef"
        :style="!isAnalysisExpanded ? {} : {}"
      >
        <!-- 默认卡片内容 -->
        <div class="analysis-content" v-if="!isAnalysisExpanded && !isAnalysisExpanding && props.extendedAiAnalysis">
          <div class="user-input-section">
            <span class="label">你的情绪描述：</span>
            <span class="user-text">"{{ displayUserInput }}"</span>
          </div>
          <div class="ai-result-section">
            <span class="label">AI识别情绪：</span>
            <span class="ai-emotion">{{ displayAiResult }}</span> |
            <span class="ex-analysis">{{ props.extendedAiAnalysis }}</span>
          </div>
          
          <!-- 展开按钮 -->
          <div class="expand-button" v-if="!isAnalysisExpanded && !isAnalysisExpanding">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 推荐结果网格 -->
    <div class="results-grid">
      <TransitionGroup name="card" appear>
        <MusicCard
          v-for="(track, index) in tracks"
          :key="track.id"
          :track="track"
          :index="index"
          @expand="handleCardExpand"
          @collapse="handleCardCollapse"
          @play="handleCardPlay"
          @pause="handleCardPause"
        />
      </TransitionGroup>
    </div>
    
    <!-- 底部控制区域 -->
    <div class="bottom-controls">
      <!-- 刷新按钮 -->
      <button 
        class="refresh-button btn-circular"
        @click="handleRefresh"
        :disabled="isRefreshing"
        :class="{ 'refreshing': isRefreshing }"
        title="重新推荐"
      >
        <svg class="refresh-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
      </button>
      
      <!-- 返回按钮 -->
      <button 
        class="back-button btn-circular"
        @click="handleBack"
        title="返回重新输入"
      >
        <svg class="back-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>
    </div>
    
    <!-- 加载状态 -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载音乐推荐...</p>
    </div>
    
    <!-- 错误状态 -->
    <div class="error-state" v-if="hasError">
      <div class="error-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h3 class="error-title">获取推荐失败</h3>
      <p class="error-message">{{ errorMessage }}</p>
      <button class="retry-button" @click="handleRetry">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
        重试
      </button>
    </div>
    
    <!-- 使用 Teleport 将展开的 AI 分析卡片渲染到 body 下，确保最高层级 -->
    <Teleport to="body">
      <!-- 背景遮罩 -->
      <div 
        class="analysis-backdrop" 
        v-if="isAnalysisExpanded || isAnalysisCollapsing"
        @click="handleAnalysisClose"
      ></div>
      
      <!-- 展开的AI分析卡片 -->
      <div 
        class="expanded-analysis-modal"
        v-if="isAnalysisExpanded || isAnalysisExpanding || isAnalysisCollapsing"
        :style="analysisCardStyles"
        :class="{ 'collapsing': isAnalysisCollapsing }"
      >
        <!-- 展开视图内容 -->
        <div class="expanded-analysis-content">
          <div class="expanded-header">
            <!-- 表情图标 -->
            <div class="emotion-emoji">
              <StaticEmoji 
                :mood="emojiMood" 
                size="large"
              />
            </div>
            <h2 class="expanded-title">AI 情绪分析结果</h2>
          </div>
          
          <div class="expanded-body">
            <!-- 用户输入完整显示 -->
            <div class="full-user-input">
              <h3 class="section-title">你的情绪描述</h3>
              <div class="input-content">
                <p>"{{ displayUserInput }}"</p>
              </div>
            </div>
            
            <!-- AI分析结果 -->
            <div class="full-ai-analysis">
              <h3 class="section-title">AI 分析结果</h3>
              <div class="analysis-result">
                <div class="emotion-result">
                  <span class="emotion-label">识别情绪：</span>
                  <span class="emotion-value">{{ displayAiResult }}</span>
                </div>
                
                <!-- 扩展的AI分析内容 -->
                <div class="ai-explanation" v-if="props.extendedAiAnalysis">
                  <h4 class="explanation-title">AI 的话</h4>
                  <p class="explanation-text">{{ props.extendedAiAnalysis }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 关闭按钮 -->
        <button 
          class="close-button" 
          v-if="!isAnalysisCollapsing"
          @click.stop="handleAnalysisClose"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useAnimationStore } from '@/stores/animations'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import MusicCard from '@/components/core/MusicCard.vue'
import DynamicBackground from '@/components/core/DynamicBackground.vue'
import StaticEmoji from '@/components/core/StaticEmoji.vue'

const props = defineProps({
  tracks: {
    type: Array,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  hasError: {
    type: Boolean,
    default: false
  },
  errorMessage: {
    type: String,
    default: '网络连接错误，请稍后重试'
  },
  aiEmotionResult: {
    type: String,
    default: ''
  },
  userInput: {
    type: String,
    default: ''
  },
  extendedAiAnalysis: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['refresh', 'back', 'card-expand', 'card-collapse', 'card-play', 'card-pause', 'retry'])

const store = useAnimationStore()
const { stopAll } = useAudioPlayer()

// 测试模式开关 - 跟HomeView一样的逻辑
const isTestMode = ref(import.meta.env.DEV || !import.meta.env.VITE_API_URL)

// 测试数据 - 只在测试模式下使用
const testData = ref({
  userInput: '今天心情很好，阳光明媚，想听一些轻松愉快的音乐！我希望能找到一些让人感到温暖和充满活力的歌曲，最好是那种能让人想要起舞或者微笑的旋律。',
  aiResult: '快乐',
  // extendedAiAnalysis: '从你的描述中，我感受到了满满的正能量！你对阳光和音乐的渴望表现出典型的快乐情绪特征。我为你选择了一些节奏轻快、旋律明亮的歌曲来延续这种美好的心情，希望你能一直对生活保持热情！'
})

// 响应式数据
const isRefreshing = ref(false)
const expandedCard = ref(null)

// AI分析卡片相关状态
const analysisCardRef = ref(null)
const isAnalysisHovering = ref(false)
const isAnalysisExpanded = ref(false)
const isAnalysisExpanding = ref(false)
const isAnalysisCollapsing = ref(false)
const originalAnalysisRect = ref(null)
const analysisCardStyles = ref({})

// 计算属性
const hasRecommendations = computed(() => props.tracks.length > 0)

const displayUserInput = computed(() => {
  return props.userInput || (isTestMode.value ? testData.value.userInput : '')
})

const displayAiResult = computed(() => {
  return props.aiEmotionResult || (isTestMode.value ? testData.value.aiResult : '')
})

// 映射中文情绪到英文表情
const emojiMood = computed(() => {
  const aiResult = displayAiResult.value
  
  // 中文到英文的映射
  const moodMapping = {
    '快乐': 'happy',
    '开心': 'happy',
    '愉快': 'happy',
    '高兴': 'happy',
    '悲伤': 'sad',
    '难过': 'sad',
    '沮丧': 'sad',
    '忧郁': 'sad',
    '愤怒': 'angry',
    '生气': 'angry',
    '愤慨': 'angry',
    '恼怒': 'angry',
    '兴奋': 'excited',
    '激动': 'excited',
    '狂热': 'excited',
    '亢奋': 'excited',
    '烦躁': 'annoyed',
    '烦恼': 'annoyed',
    '不耐烦': 'annoyed',
    '厌烦': 'annoyed',
    '平静': 'happy', // 默认显示happy
    '冷静': 'happy',
    '安静': 'happy'
  }
  
  return moodMapping[aiResult] || 'happy'
})

// 扩展的AI分析内容 - 从props获取，测试模式使用测试数据
const extendedAiAnalysis = computed(() => {
  // 优先使用从API返回的AI分析说明
  if (props.extendedAiAnalysis) {
    return props.extendedAiAnalysis
  }
  
  // 测试模式使用测试数据
  if (isTestMode.value) {
    return '从你的描述中，我感受到了满满的正能量！你对阳光和音乐的渴望表现出典型的快乐情绪特征。建议你选择一些节奏轻快、旋律明亮的歌曲来延续这种美好的心情。'
  }
  
  // 如果没有API数据且不是测试模式，返回空字符串
  return ''
})

onMounted(() => {
  // 设置当前视图
  store.setCurrentView('results')
  
  // 测试模式日志
  if (isTestMode.value) {
    console.log('ResultsView: Running in test mode, showing test AI analysis data')
  }
  
  // 预加载音频
  if (hasRecommendations.value) {
    console.log('Preloading audio for tracks:', props.tracks.slice(0, 3))
  }
})

onUnmounted(() => {
  // 停止所有音频播放
  stopAll()
  
  // 恢复页面滚动
  document.body.style.overflow = ''
})

// 监听tracks变化
watch(() => props.tracks, (newTracks) => {
  if (newTracks.length > 0) {
    console.log('Tracks updated:', newTracks.length, 'tracks')
  }
}, { immediate: true })

// 监听分析卡片展开状态
watch(isAnalysisExpanded, (newValue) => {
  // 控制页面滚动
  if (newValue) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// AI分析卡片相关方法

// 保存分析卡片原始位置和尺寸
const saveOriginalAnalysisRect = () => {
  if (analysisCardRef.value) {
    const rect = analysisCardRef.value.getBoundingClientRect()
    originalAnalysisRect.value = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  }
}

// 处理分析卡片鼠标进入
const handleAnalysisMouseEnter = () => {
  if (!isAnalysisExpanded.value && !isAnalysisExpanding.value && !isAnalysisCollapsing.value) {
    isAnalysisHovering.value = true
  }
}

// 处理分析卡片鼠标离开
const handleAnalysisMouseLeave = () => {
  isAnalysisHovering.value = false
}

// 处理分析卡片点击 - 展开动画
const handleAnalysisCardClick = async () => {
  if (isAnalysisExpanded.value || isAnalysisExpanding.value) return
  
  // 清除悬停状态
  isAnalysisHovering.value = false
  
  // 保存原始位置
  saveOriginalAnalysisRect()
  
  isAnalysisExpanding.value = true
  
  // 设置初始位置
  if (originalAnalysisRect.value) {
    analysisCardStyles.value = {
      position: 'fixed',
      top: `${originalAnalysisRect.value.top}px`,
      left: `${originalAnalysisRect.value.left}px`,
      width: `${originalAnalysisRect.value.width}px`,
      height: `${originalAnalysisRect.value.height}px`,
      zIndex: 1010,
      transformOrigin: 'center center',
      transform: 'none'
    }
  }
  
  await nextTick()
  
  // 计算目标位置
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const targetWidth = Math.min(viewportWidth * 0.85, 900)
  const targetHeight = Math.min(viewportHeight * 0.8, 700)
  const centerX = viewportWidth / 2
  const centerY = viewportHeight / 2
  
  // 开始展开动画
  requestAnimationFrame(() => {
    analysisCardStyles.value = {
      ...analysisCardStyles.value,
      top: `${centerY - targetHeight / 2}px`,
      left: `${centerX - targetWidth / 2}px`,
      width: `${targetWidth}px`,
      height: `${targetHeight}px`,
      transform: 'none',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  })
  
  // 等待动画完成
  setTimeout(() => {
    isAnalysisExpanding.value = false
    isAnalysisExpanded.value = true
  }, 400)
}

// 处理分析卡片关闭 - 收缩动画
const handleAnalysisClose = async () => {
  if (!isAnalysisExpanded.value || isAnalysisCollapsing.value) return
  
  isAnalysisHovering.value = false
  isAnalysisCollapsing.value = true
  isAnalysisExpanded.value = false
  
  // 开始收缩动画
  if (originalAnalysisRect.value) {
    analysisCardStyles.value = {
      ...analysisCardStyles.value,
      top: `${originalAnalysisRect.value.top}px`,
      left: `${originalAnalysisRect.value.left}px`,
      width: `${originalAnalysisRect.value.width}px`,
      height: `${originalAnalysisRect.value.height}px`,
      transform: 'none',
      transformOrigin: 'center center',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
  
  // 等待动画完成后隐藏
  setTimeout(() => {
    isAnalysisCollapsing.value = false
    analysisCardStyles.value = {}
    originalAnalysisRect.value = null
  }, 300)
}

// 其他方法保持不变

// 处理卡片展开
const handleCardExpand = (track) => {
  expandedCard.value = track.id
  emit('card-expand', track)
  console.log('Card expanded:', track.name)
}

// 处理卡片收缩
const handleCardCollapse = (track) => {
  expandedCard.value = null
  emit('card-collapse', track)
  console.log('Card collapsed:', track.name)
}

// 处理卡片播放
const handleCardPlay = (track) => {
  emit('card-play', track)
  console.log('Card play:', track.name)
}

// 处理卡片暂停
const handleCardPause = (track) => {
  emit('card-pause', track)
  console.log('Card pause:', track.name)
}

// 处理刷新
const handleRefresh = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  
  // 停止所有音频
  stopAll()
  
  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // 模拟延迟
    emit('refresh')
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 1000)
  }
}

// 处理返回
const handleBack = () => {
  // 停止所有音频
  stopAll()
  
  // 重置状态
  store.setCurrentView('home')
  store.resetState()
  
  emit('back')
}

// 处理重试
const handleRetry = () => {
  emit('retry')
}

// 获取模拟音乐数据（开发用）
const getMockTracks = () => {
  return [
    {
      id: '1',
      name: 'Sunny Day',
      artist: 'Happy Band',
      albumName: 'Sunshine Album',
      albumCover: 'https://picsum.photos/300/300?random=1',
      duration: 210,
      previewUrl: 'https://example.com/preview1.mp3',
      spotifyUrl: 'https://open.spotify.com/track/example1',
      emotions: ['happy', 'energetic'],
      popularity: 85,
      releaseDate: '2023-06-15'
    },
    {
      id: '2',
      name: 'Moonlight Serenade',
      artist: 'Jazz Ensemble',
      albumName: 'Night Vibes',
      albumCover: 'https://picsum.photos/300/300?random=2',
      duration: 245,
      previewUrl: 'https://example.com/preview2.mp3',
      spotifyUrl: 'https://open.spotify.com/track/example2',
      emotions: ['calm', 'romantic'],
      popularity: 78,
      releaseDate: '2023-04-20'
    },
    {
      id: '3',
      name: 'Electric Dreams',
      artist: 'Synth Wave',
      albumName: 'Digital Future',
      albumCover: 'https://picsum.photos/300/300?random=3',
      duration: 195,
      previewUrl: 'https://example.com/preview3.mp3',
      spotifyUrl: 'https://open.spotify.com/track/example3',
      emotions: ['excited', 'energetic'],
      popularity: 92,
      releaseDate: '2023-08-10'
    },
    {
      id: '4',
      name: 'Rainy Thoughts',
      artist: 'Indie Folk',
      albumName: 'Quiet Moments',
      albumCover: 'https://picsum.photos/300/300?random=4',
      duration: 180,
      previewUrl: 'https://example.com/preview4.mp3',
      spotifyUrl: 'https://open.spotify.com/track/example4',
      emotions: ['melancholy', 'peaceful'],
      popularity: 67,
      releaseDate: '2023-03-12'
    },
    {
      id: '5',
      name: 'Dance Floor Anthem',
      artist: 'Electronic Beats',
      albumName: 'Club Nights',
      albumCover: 'https://picsum.photos/300/300?random=5',
      duration: 220,
      previewUrl: 'https://example.com/preview5.mp3',
      spotifyUrl: 'https://open.spotify.com/track/example5',
      emotions: ['excited', 'energetic'],
      popularity: 89,
      releaseDate: '2023-07-05'
    },
    {
      id: '6',
      name: 'Acoustic Soul',
      artist: 'Singer Songwriter',
      albumName: 'Bare Essence',
      albumCover: 'https://picsum.photos/300/300?random=6',
      duration: 165,
      previewUrl: 'https://example.com/preview6.mp3',
      spotifyUrl: 'https://open.spotify.com/track/example6',
      emotions: ['calm', 'peaceful'],
      popularity: 73,
      releaseDate: '2023-05-28'
    }
  ]
}

// 暴露方法给父组件
defineExpose({
  getMockTracks,
  refresh: handleRefresh,
  goBack: handleBack
})
</script>

<style lang="scss" scoped>
.results-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 2rem 5rem;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 767px) {
    padding: 1rem;
  }
  
  @media (min-width: 768px) and (max-width: 1023px) {
    padding: 1.5rem 3rem;
  }
}

// AI情绪分析卡片容器
.emotion-analysis-wrapper {
  position: relative;
  margin-left: 3rem;
  margin-right: 3rem;
  margin-bottom: 2rem;
  z-index: 2;
}

.emotion-analysis-card {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  padding: 2rem 2.5rem;
  min-height: 160px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  @media (max-width: 767px) {
    padding: 1.5rem 2rem;
    min-height: 280px;
  }
  
  // 悬停效果
  &.hover:not(.expanded):not(.expanding):not(.collapsing) {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(20px);
  }
  
  // 展开状态
  &.expanded {
    opacity: 0;
    pointer-events: none;
  }
  
  // 展开中状态
  &.expanding {
    opacity: 0;
    pointer-events: none;
  }
  
  // 收缩中状态
  &.collapsing {
    opacity: 1;
    pointer-events: none;
    transition: opacity 0.3s ease 0.1s;
  }
}

// 默认卡片内容
.analysis-content {
  display: block;
  position: relative;
}

.user-input-section,
.ai-result-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

.label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  flex-shrink: 0;
  
  @media (max-width: 767px) {
    font-size: 0.8rem;
  }
}

.user-text {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-style: italic;
  
  // 文字超出隐藏
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
  
  @media (max-width: 767px) {
    font-size: 0.9rem;
    max-width: 100%;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

.ai-emotion {
  font-size: 1.1rem;
  color: #FFD166;
  font-weight: 600;
  
  @media (max-width: 767px) {
    font-size: 1rem;
  }
}

.ex-analysis {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  
  @media (max-width: 767px) {
    font-size: 0.85rem;
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

// 展开按钮
.expand-button {
  position: absolute;
  bottom: -3rem;
  right: 50%;
  transform: translateX(50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 209, 102, 0.2);
  border-radius: 50%;
  border: 1px solid rgba(255, 209, 102, 0.4);
  color: #FFD166;
  transition: all 0.3s ease;
  
  svg {
    width: 18px;
    height: 18px;
    transform: rotate(180deg);
  }
  
  .emotion-analysis-card.hover & {
    background: rgba(255, 209, 102, 0.3);
    border-color: rgba(255, 209, 102, 0.6);
    transform: translateX(50%) scale(1.1);
  }
  
  @media (max-width: 767px) {
    bottom: -3rem;
    width: 28px;
    height: 28px;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
}

// 使用 Teleport 的模态框样式
.expanded-analysis-modal {
  position: fixed;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(15px);
  z-index: 9999;
  
  // 收缩动画状态
  &.collapsing {
    .expanded-analysis-content {
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }
}

// 展开视图内容
.expanded-analysis-content {
  height: 100%;
  position: relative;
  padding: 2rem;
  
  @media (max-width: 767px) {
    padding: 1.5rem;
  }
}

.expanded-header {
  text-align: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

// 表情图标样式
.emotion-emoji {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  
  // 为表情添加一个半透明的背景圆圈
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    height: 140px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    z-index: -1;
  }
}

.expanded-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin: 0;
  
  @media (max-width: 767px) {
    font-size: 1.4rem;
  }
}

.expanded-body {
  max-height: calc(100% - 200px);
  overflow-y: auto;
  padding-right: 1rem;
  
  // 隐藏滚动条
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

// 用户输入完整显示
.full-user-input {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1rem 0;
  
  @media (max-width: 767px) {
    font-size: 1.1rem;
  }
}

.input-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  p {
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.9);
    font-style: italic;
    line-height: 1.6;
    margin: 0;
    
    @media (max-width: 767px) {
      font-size: 0.9rem;
    }
  }
}

// AI分析结果

.analysis-result {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.emotion-result {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

.emotion-label {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.emotion-value {
  font-size: 1.3rem;
  color: #FFD166;
  font-weight: 700;
  
  @media (max-width: 767px) {
    font-size: 1.2rem;
  }
}

// AI说话内容
.ai-explanation {
  margin-bottom: 0;
}

.explanation-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.75rem 0;
}

.explanation-text {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin: 0;
  
  @media (max-width: 767px) {
    font-size: 0.9rem;
  }
}

// 关闭按钮
.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1012;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
}

// 背景遮罩 - 确保在模态框之下，其他内容之上
.analysis-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1009;
  backdrop-filter: blur(5px);
}

// 推荐结果网格
.results-grid {
  flex: 1;
  display: grid;
  gap: 1.5rem;
  align-content: start;
  overflow-y: auto;
  padding-top: 0.5rem;
  padding-bottom: 2rem;
  position: relative;
  z-index: 2;
  
  // 桌面端：2列
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    justify-items: center;
    column-gap: 1rem;
    row-gap: 2.5rem;
  }
  
  // 移动端：1列
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 0.8rem;
    justify-items: center;
  }
  
  // 平板端：1列（较宽）
  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: 0.9rem;
    justify-items: center;
  }
  
  // 隐藏滚动条
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

// 底部控制区域
.bottom-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 2;
  
  @media (max-width: 767px) {
    gap: 1.5rem;
  }
}

.refresh-button,
.back-button {
  flex-shrink: 0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  
  svg {
    width: 24px;
    height: 24px;
  }
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }
  
  &.refreshing {
    .refresh-icon {
      animation: refreshSpin 1s linear infinite;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@keyframes refreshSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.refresh-icon,
.back-icon {
  transition: transform 0.3s ease;
}

.refresh-button:hover:not(:disabled) .refresh-icon {
  transform: rotate(90deg);
}

.back-button:hover .back-icon {
  transform: translateX(-2px);
}

// 加载状态
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(18, 18, 18, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top: 4px solid #FFD166;
  border-radius: 50%;
  animation: refreshSpin 1s linear infinite;
  margin-bottom: 1rem;
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  text-align: center;
}

// 错误状态
.error-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 100;
}

.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem auto;
  
  svg {
    width: 100%;
    height: 100%;
    color: #EF476F;
  }
}

.error-title {
  font-size: 1.5rem;
  color: white;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.error-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 2rem 0;
  line-height: 1.5;
}

.retry-button {
  padding: 0.75rem 2rem;
  background: #FFD166;
  color: #121212;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    width: 18px;
    height: 18px;
  }
  
  &:hover {
    background: #FFA726;
    transform: scale(1.05);
  }
}

// 卡片过渡动画
.card-enter-active {
  transition: all 0.5s ease;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.card-move {
  transition: transform 0.5s ease;
}

// 为每个卡片添加延迟
.card-enter-active {
  transition-delay: calc(var(--index, 0) * 0.1s);
}

// 响应式调整
@media (max-height: 700px) {
  .results-view {
    padding: 1rem;
  }
  
  .emotion-analysis-wrapper {
    margin-bottom: 1.5rem;
  }
  
  .results-grid {
    gap: 1rem;
    
    @media (min-width: 1024px) {
      column-gap: 0.2rem;
      row-gap: 0.8rem;
    }
  }
  
  .bottom-controls {
    padding: 0.75rem 0;
  }
}

@media (max-height: 600px) {
  .results-view {
    padding: 0.5rem;
  }
  
  .emotion-analysis-wrapper {
    margin-bottom: 1rem;
  }
  
  .emotion-analysis-card {
    padding: 1.5rem 2rem;
    min-height: 120px; // 保持一定高度
  }
  
  .results-grid {
    gap: 0.5rem;
    padding-bottom: 1rem;
    
    @media (min-width: 1024px) {
      column-gap: 0.1rem;
      row-gap: 0.7rem;
    }
  }
}

// 无障碍支持
@media (prefers-reduced-motion: reduce) {
  .card-enter-active,
  .card-move {
    transition: none;
  }
  
  .loading-spinner,
  .refresh-icon {
    animation: none;
  }
}

// 高对比度模式
@media (prefers-contrast: high) {
  .emotion-analysis-card {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.5);
  }
  
  .ai-emotion {
    color: #FFA726;
  }
  
  .bottom-controls {
    border-top: 2px solid rgba(255, 255, 255, 0.3);
  }
  
  .refresh-button,
  .back-button {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.5);
  }
}

// 深色模式优化
@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background: rgba(0, 0, 0, 0.95);
  }
}
</style>
