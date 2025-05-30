<template>
  <div class="results-view">
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
      <!-- 情绪分析摘要 -->
      <div class="emotion-summary" v-if="emotionAnalysis">
        {{ emotionAnalysis }}
      </div>
      
      <!-- 刷新按钮 -->
      <button 
        class="refresh-button btn-circular"
        @click="handleRefresh"
        :disabled="isRefreshing"
        :class="{ 'refreshing': isRefreshing }"
      >
        <span class="refresh-icon">🔄</span>
      </button>
      
      <!-- 返回按钮 -->
      <button 
        class="back-button btn-circular"
        @click="handleBack"
      >
        <span class="back-icon">←</span>
      </button>
    </div>
    
    <!-- 加载状态 -->
    <div class="loading-overlay" v-if="isLoading">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载音乐推荐...</p>
    </div>
    
    <!-- 错误状态 -->
    <div class="error-state" v-if="hasError">
      <div class="error-icon">😔</div>
      <h3 class="error-title">获取推荐失败</h3>
      <p class="error-message">{{ errorMessage }}</p>
      <button class="retry-button" @click="handleRetry">
        重试
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAnimationStore } from '@/stores/animations'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import MusicCard from '@/components/core/MusicCard.vue'

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
  }
})

const emit = defineEmits(['refresh', 'back', 'card-expand', 'card-collapse', 'card-play', 'card-pause', 'retry'])

const store = useAnimationStore()
const { stopAll } = useAudioPlayer()

// 响应式数据
const isRefreshing = ref(false)
const expandedCard = ref(null)

// 计算属性
const emotionAnalysis = computed(() => store.emotionAnalysis)
const hasRecommendations = computed(() => props.tracks.length > 0)

onMounted(() => {
  // 设置当前视图
  store.setCurrentView('results')
  
  // 预加载音频
  if (hasRecommendations.value) {
    // 这里可以预加载前几首歌的音频
    console.log('Preloading audio for tracks:', props.tracks.slice(0, 3))
  }
})

onUnmounted(() => {
  // 停止所有音频播放
  stopAll()
})

// 监听tracks变化
watch(() => props.tracks, (newTracks) => {
  if (newTracks.length > 0) {
    console.log('Tracks updated:', newTracks.length, 'tracks')
  }
}, { immediate: true })

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
  padding: 2rem;
  position: relative;
  
  @media (max-width: 767px) {
    padding: 1rem;
  }
}

.results-grid {
  flex: 1;
  display: grid;
  gap: 1.5rem;
  align-content: start;
  overflow-y: auto;
  padding-bottom: 2rem;
  
  // 桌面端：2列
  @media (min-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    justify-items: center;
  }
  
  // 移动端：1列
  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    justify-items: center;
  }
  
  // 平板端：1列（较宽）
  @media (min-width: 768px) and (max-width: 1023px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    justify-items: center;
  }
  
  // 隐藏滚动条
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.bottom-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  
  @media (max-width: 767px) {
    flex-direction: column;
    gap: 1rem;
  }
}

.emotion-summary {
  flex: 1;
  text-align: center;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
  
  @media (max-width: 767px) {
    font-size: 0.8rem;
    padding: 0.5rem 1rem;
  }
}

.refresh-button,
.back-button {
  flex-shrink: 0;
  
  &.refreshing {
    .refresh-icon {
      animation: spin 1s linear infinite;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.refresh-icon,
.back-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.refresh-button:hover:not(:disabled) .refresh-icon {
  transform: rotate(180deg);
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
  animation: spin 1s linear infinite;
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
  font-size: 4rem;
  margin-bottom: 1rem;
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
  
  .results-grid {
    gap: 1rem;
  }
  
  .bottom-controls {
    padding: 0.75rem 0;
  }
}

@media (max-height: 600px) {
  .results-view {
    padding: 0.5rem;
  }
  
  .results-grid {
    gap: 0.75rem;
    padding-bottom: 1rem;
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
  .emotion-summary {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.5);
    color: white;
  }
  
  .bottom-controls {
    border-top: 2px solid rgba(255, 255, 255, 0.3);
  }
}

// 深色模式优化
@media (prefers-color-scheme: dark) {
  .loading-overlay {
    background: rgba(0, 0, 0, 0.95);
  }
}
</style>
